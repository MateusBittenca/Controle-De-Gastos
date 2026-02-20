from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_senha
from app.database import get_db
from app.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate

router = APIRouter()


@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista apenas o próprio usuário (compatibilidade; use GET /api/auth/me para perfil)."""
    return [current_user]


@router.post("/", response_model=UsuarioResponse, status_code=201)
def criar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Cria um novo usuário (senha com hash). Requer autenticação."""
    if db.query(Usuario).filter(Usuario.email == usuario.email.lower().strip()).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    db_usuario = Usuario(
        email=usuario.email.lower().strip(),
        nome=usuario.nome.strip(),
        senha_hash=hash_senha(usuario.senha),
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obter_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna um usuário pelo ID. Apenas o próprio usuário."""
    if usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user


@router.patch("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: int,
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza um usuário. Apenas o próprio usuário (prefira PATCH /api/auth/me)."""
    if usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/{usuario_id}", status_code=204)
def excluir_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Exclui a própria conta."""
    if usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    db.delete(current_user)
    db.commit()
    return None
