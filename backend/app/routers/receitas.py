from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.receita import Receita
from app.models.usuario import Usuario
from app.schemas.receita import ReceitaCreate, ReceitaResponse, ReceitaUpdate

router = APIRouter()


@router.get("/", response_model=list[ReceitaResponse])
def listar_receitas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista receitas do usuário (mais recentes primeiro)."""
    return (
        db.query(Receita)
        .filter(Receita.usuario_id == current_user.id)
        .order_by(Receita.data.desc())
        .all()
    )


@router.post("/", response_model=ReceitaResponse, status_code=201)
def criar_receita(
    receita: ReceitaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Registra uma nova receita."""
    db_receita = Receita(usuario_id=current_user.id, **receita.model_dump())
    db.add(db_receita)
    db.commit()
    db.refresh(db_receita)
    return db_receita


@router.get("/{receita_id}", response_model=ReceitaResponse)
def obter_receita(
    receita_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna uma receita do usuário."""
    receita = db.query(Receita).filter(Receita.id == receita_id).first()
    if not receita or receita.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    return receita


@router.patch("/{receita_id}", response_model=ReceitaResponse)
def atualizar_receita(
    receita_id: int,
    payload: ReceitaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza uma receita do usuário."""
    receita = db.query(Receita).filter(Receita.id == receita_id).first()
    if not receita or receita.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(receita, key, value)
    db.commit()
    db.refresh(receita)
    return receita


@router.delete("/{receita_id}", status_code=204)
def excluir_receita(
    receita_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Exclui uma receita do usuário."""
    receita = db.query(Receita).filter(Receita.id == receita_id).first()
    if not receita or receita.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    db.delete(receita)
    db.commit()
    return None
