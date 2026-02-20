from datetime import date
from dateutil.relativedelta import relativedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.gasto import Gasto
from app.models.gasto_recorrente import GastoRecorrente
from app.models.usuario import Usuario
from app.schemas.gasto_recorrente import (
    GastoRecorrenteCreate,
    GastoRecorrenteResponse,
    GastoRecorrenteUpdate,
)

router = APIRouter()


def _query_recorrentes(db: Session):
    return db.query(GastoRecorrente).options(joinedload(GastoRecorrente.categoria))


def _calcular_proximo_lancamento(dia: int, frequencia: str, base: date | None = None) -> date:
    """Calcula a próxima data de lançamento com base no dia e frequência."""
    hoje = base or date.today()
    
    if frequencia == "mensal":
        if hoje.day <= dia:
            try:
                return hoje.replace(day=dia)
            except ValueError:
                return (hoje.replace(day=1) + relativedelta(months=1)).replace(day=1) - relativedelta(days=1)
        else:
            proximo_mes = hoje + relativedelta(months=1)
            try:
                return proximo_mes.replace(day=dia)
            except ValueError:
                return (proximo_mes.replace(day=1) + relativedelta(months=1)).replace(day=1) - relativedelta(days=1)
    
    elif frequencia == "semanal":
        dias_ate_dia = (dia - hoje.isoweekday()) % 7
        if dias_ate_dia == 0:
            dias_ate_dia = 7
        return hoje + relativedelta(days=dias_ate_dia)
    
    elif frequencia == "anual":
        try:
            este_ano = hoje.replace(month=1, day=dia)
        except ValueError:
            este_ano = hoje.replace(month=1, day=28)
        
        if este_ano > hoje:
            return este_ano
        return este_ano + relativedelta(years=1)
    
    return hoje


@router.get("/", response_model=list[GastoRecorrenteResponse])
def listar_recorrentes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista gastos recorrentes do usuário."""
    return (
        _query_recorrentes(db)
        .filter(GastoRecorrente.usuario_id == current_user.id)
        .order_by(GastoRecorrente.proximo_lancamento)
        .all()
    )


@router.post("/", response_model=GastoRecorrenteResponse, status_code=201)
def criar_recorrente(
    payload: GastoRecorrenteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Cria um novo gasto recorrente."""
    data = payload.model_dump()
    data["usuario_id"] = current_user.id
    
    if not data.get("proximo_lancamento"):
        data["proximo_lancamento"] = _calcular_proximo_lancamento(
            data["dia_vencimento"], 
            data["frequencia"].value if hasattr(data["frequencia"], "value") else data["frequencia"]
        )
    
    if hasattr(data["frequencia"], "value"):
        data["frequencia"] = data["frequencia"].value
    
    db_recorrente = GastoRecorrente(**data)
    db.add(db_recorrente)
    db.commit()
    db.refresh(db_recorrente)
    return _query_recorrentes(db).filter(GastoRecorrente.id == db_recorrente.id).first()


@router.get("/{recorrente_id}", response_model=GastoRecorrenteResponse)
def obter_recorrente(
    recorrente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna um gasto recorrente pelo ID."""
    recorrente = _query_recorrentes(db).filter(GastoRecorrente.id == recorrente_id).first()
    if not recorrente or recorrente.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto recorrente não encontrado")
    return recorrente


@router.patch("/{recorrente_id}", response_model=GastoRecorrenteResponse)
def atualizar_recorrente(
    recorrente_id: int,
    payload: GastoRecorrenteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza um gasto recorrente."""
    recorrente = _query_recorrentes(db).filter(GastoRecorrente.id == recorrente_id).first()
    if not recorrente or recorrente.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto recorrente não encontrado")
    
    data = payload.model_dump(exclude_unset=True)
    
    if "frequencia" in data and hasattr(data["frequencia"], "value"):
        data["frequencia"] = data["frequencia"].value
    
    for key, value in data.items():
        setattr(recorrente, key, value)
    
    if "dia_vencimento" in data or "frequencia" in data:
        recorrente.proximo_lancamento = _calcular_proximo_lancamento(
            recorrente.dia_vencimento,
            recorrente.frequencia
        )
    
    db.commit()
    db.refresh(recorrente)
    return _query_recorrentes(db).filter(GastoRecorrente.id == recorrente_id).first()


@router.delete("/{recorrente_id}", status_code=204)
def excluir_recorrente(
    recorrente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Exclui um gasto recorrente."""
    recorrente = db.query(GastoRecorrente).filter(GastoRecorrente.id == recorrente_id).first()
    if not recorrente or recorrente.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto recorrente não encontrado")
    db.delete(recorrente)
    db.commit()
    return None


@router.post("/{recorrente_id}/gerar", response_model=dict, status_code=201)
def gerar_gasto_de_recorrente(
    recorrente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Gera um gasto a partir de um recorrente e atualiza o próximo lançamento."""
    recorrente = _query_recorrentes(db).filter(GastoRecorrente.id == recorrente_id).first()
    if not recorrente or recorrente.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto recorrente não encontrado")
    
    if not recorrente.ativo:
        raise HTTPException(status_code=400, detail="Gasto recorrente está inativo")
    
    novo_gasto = Gasto(
        usuario_id=current_user.id,
        categoria_id=recorrente.categoria_id,
        descricao=recorrente.descricao,
        valor=recorrente.valor,
        data=recorrente.proximo_lancamento,
        observacao=f"[Recorrente] {recorrente.observacao or ''}".strip(),
    )
    db.add(novo_gasto)
    
    recorrente.proximo_lancamento = _calcular_proximo_lancamento(
        recorrente.dia_vencimento,
        recorrente.frequencia,
        recorrente.proximo_lancamento
    )
    
    db.commit()
    
    return {
        "gasto_id": novo_gasto.id,
        "proximo_lancamento": recorrente.proximo_lancamento.isoformat(),
    }


@router.post("/processar-pendentes", response_model=dict)
def processar_recorrentes_pendentes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Processa todos os gastos recorrentes pendentes do usuário (vencidos até hoje)."""
    hoje = date.today()
    pendentes = (
        db.query(GastoRecorrente)
        .filter(
            GastoRecorrente.usuario_id == current_user.id,
            GastoRecorrente.ativo == True,
            GastoRecorrente.proximo_lancamento <= hoje,
        )
        .all()
    )
    
    gerados = []
    for rec in pendentes:
        while rec.proximo_lancamento <= hoje:
            novo_gasto = Gasto(
                usuario_id=current_user.id,
                categoria_id=rec.categoria_id,
                descricao=rec.descricao,
                valor=rec.valor,
                data=rec.proximo_lancamento,
                observacao=f"[Recorrente] {rec.observacao or ''}".strip(),
            )
            db.add(novo_gasto)
            gerados.append(rec.id)
            
            rec.proximo_lancamento = _calcular_proximo_lancamento(
                rec.dia_vencimento,
                rec.frequencia,
                rec.proximo_lancamento
            )
    
    db.commit()
    
    return {
        "processados": len(set(gerados)),
        "gastos_gerados": len(gerados),
    }
