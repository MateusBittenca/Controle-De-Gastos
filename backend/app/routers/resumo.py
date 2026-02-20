"""Endpoint de resumo do dashboard (totais do mês e últimos gastos)."""

from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.gasto import Gasto
from app.models.receita import Receita
from app.models.usuario import Usuario
from app.schemas.gasto import GastoResponse
from app.schemas.resumo import ResumoMesResponse

router = APIRouter()


@router.get("/", response_model=ResumoMesResponse)
def resumo_mes(
    mes: int = Query(..., ge=0, le=11, description="Mês (0=Janeiro, 11=Dezembro)"),
    ano: int = Query(..., ge=2000, le=2100, description="Ano"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Retorna o resumo financeiro do mês: totais de gastos e receitas,
    saldo, meta do usuário e os 5 últimos gastos do mês.
    Útil para o dashboard sem carregar todos os lançamentos.
    """
    uid = current_user.id
    q_gastos = (
        db.query(func.coalesce(func.sum(Gasto.valor), 0))
        .filter(Gasto.usuario_id == uid)
        .filter(extract("month", Gasto.data) == mes + 1)
        .filter(extract("year", Gasto.data) == ano)
    ).scalar()
    q_receitas = (
        db.query(func.coalesce(func.sum(Receita.valor), 0))
        .filter(Receita.usuario_id == uid)
        .filter(extract("month", Receita.data) == mes + 1)
        .filter(extract("year", Receita.data) == ano)
    ).scalar()
    total_gastos = Decimal(str(q_gastos))
    total_receitas = Decimal(str(q_receitas))
    saldo = total_receitas - total_gastos

    ultimos = (
        db.query(Gasto)
        .options(joinedload(Gasto.categoria))
        .filter(Gasto.usuario_id == uid)
        .filter(extract("month", Gasto.data) == mes + 1)
        .filter(extract("year", Gasto.data) == ano)
        .order_by(Gasto.data.desc())
        .limit(5)
        .all()
    )
    ultimos_resp = [
        GastoResponse(
            id=g.id,
            usuario_id=g.usuario_id,
            categoria_id=g.categoria_id,
            descricao=g.descricao,
            valor=g.valor,
            data=g.data,
            observacao=g.observacao,
            criado_em=g.criado_em,
            atualizado_em=g.atualizado_em,
            categoria_nome=g.categoria.nome if g.categoria else None,
        )
        for g in ultimos
    ]

    total_gastos_count = db.query(Gasto).filter(Gasto.usuario_id == uid).count()
    total_receitas_count = db.query(Receita).filter(Receita.usuario_id == uid).count()
    gastos_mes_count = (
        db.query(Gasto)
        .filter(Gasto.usuario_id == uid)
        .filter(extract("month", Gasto.data) == mes + 1)
        .filter(extract("year", Gasto.data) == ano)
        .count()
    )
    receitas_mes_count = (
        db.query(Receita)
        .filter(Receita.usuario_id == uid)
        .filter(extract("month", Receita.data) == mes + 1)
        .filter(extract("year", Receita.data) == ano)
        .count()
    )

    return ResumoMesResponse(
        total_gastos=total_gastos,
        total_receitas=total_receitas,
        saldo=saldo,
        meta_gastos_mes=current_user.meta_gastos_mes,
        ultimos_gastos=ultimos_resp,
        total_gastos_count=total_gastos_count,
        total_receitas_count=total_receitas_count,
        gastos_mes_count=gastos_mes_count,
        receitas_mes_count=receitas_mes_count,
    )
