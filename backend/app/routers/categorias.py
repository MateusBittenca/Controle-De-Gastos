from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse, CategoriaUpdate

router = APIRouter()


@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """Lista todas as categorias (globais e por usuário)."""
    return db.query(Categoria).order_by(Categoria.nome).all()


@router.post("/", response_model=CategoriaResponse, status_code=201)
def criar_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    """Cria uma nova categoria."""
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obter_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Retorna uma categoria pelo ID."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria


@router.patch("/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(
    categoria_id: int, payload: CategoriaUpdate, db: Session = Depends(get_db)
):
    """Atualiza uma categoria."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(categoria, key, value)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=204)
def excluir_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Exclui uma categoria."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    db.delete(categoria)
    db.commit()
    return None
