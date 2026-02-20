from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse, UserInToken
from app.schemas.auth import RegistroRequest
from app.schemas.usuario import UsuarioResponse, UsuarioUpdate
from app.core.security import hash_senha, verificar_senha, criar_token

router = APIRouter()


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    """Retorna os dados do usuário logado."""
    return current_user


@router.patch("/me", response_model=UsuarioResponse)
def atualizar_me(
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza nome (e ativo) do usuário logado."""
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/registro", response_model=TokenResponse)
def registro(payload: RegistroRequest, db: Session = Depends(get_db)):
    """Cadastra novo usuário e retorna token."""
    if db.query(Usuario).filter(Usuario.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    usuario = Usuario(
        email=payload.email.lower().strip(),
        nome=payload.nome.strip(),
        senha_hash=hash_senha(payload.senha),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    token = criar_token(usuario.id, usuario.email)
    return TokenResponse(
        access_token=token,
        user=UserInToken(id=usuario.id, email=usuario.email, nome=usuario.nome),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login com e-mail e senha. Retorna token JWT."""
    usuario = db.query(Usuario).filter(Usuario.email == payload.email.lower()).first()
    if not usuario or not verificar_senha(payload.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    if not usuario.ativo:
        raise HTTPException(status_code=401, detail="Usuário inativo")
    token = criar_token(usuario.id, usuario.email)
    return TokenResponse(
        access_token=token,
        user=UserInToken(id=usuario.id, email=usuario.email, nome=usuario.nome),
    )
