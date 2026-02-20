from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.gasto import Gasto
from app.models.usuario import Usuario
from app.schemas.gasto import GastoCreate, GastoResponse, GastoUpdate

router = APIRouter()


def _query_gastos(db: Session):
    """Query com categoria carregada (para categoria_nome na resposta)."""
    return db.query(Gasto).options(joinedload(Gasto.categoria))


@router.get("/", response_model=list[GastoResponse])
def listar_gastos(
    limit: int | None = Query(None, ge=1, le=500, description="Máximo de registros"),
    offset: int | None = Query(None, ge=0, description="Registros a pular"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista gastos do usuário logado (ordem: mais recentes primeiro). Paginação opcional com limit/offset."""
    q = (
        _query_gastos(db)
        .filter(Gasto.usuario_id == current_user.id)
        .order_by(Gasto.data.desc())
    )
    if limit is not None:
        q = q.limit(limit)
    if offset is not None:
        q = q.offset(offset)
    return q.all()


@router.post("/", response_model=GastoResponse, status_code=201)
def criar_gasto(
    gasto: GastoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Cria um novo gasto para o usuário logado."""
    data = gasto.model_dump()
    data["usuario_id"] = current_user.id
    db_gasto = Gasto(**data)
    db.add(db_gasto)
    db.commit()
    db.refresh(db_gasto)
    db_gasto = _query_gastos(db).filter(Gasto.id == db_gasto.id).first()
    return db_gasto


@router.get("/{gasto_id}", response_model=GastoResponse)
def obter_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna um gasto do usuário."""
    gasto = _query_gastos(db).filter(Gasto.id == gasto_id).first()
    if not gasto or gasto.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto não encontrado")
    return gasto


@router.patch("/{gasto_id}", response_model=GastoResponse)
def atualizar_gasto(
    gasto_id: int,
    payload: GastoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza um gasto do usuário."""
    gasto = _query_gastos(db).filter(Gasto.id == gasto_id).first()
    if not gasto or gasto.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto não encontrado")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(gasto, key, value)
    db.commit()
    db.refresh(gasto)
    gasto = _query_gastos(db).filter(Gasto.id == gasto_id).first()
    return gasto


@router.delete("/{gasto_id}", status_code=204)
def excluir_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Exclui um gasto do usuário."""
    gasto = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not gasto or gasto.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto não encontrado")
    db.delete(gasto)
    db.commit()
    return None
