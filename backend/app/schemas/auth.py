from pydantic import BaseModel


class RegistroRequest(BaseModel):
    nome: str
    email: str
    senha: str


class LoginRequest(BaseModel):
    email: str
    senha: str


class UserInToken(BaseModel):
    id: int
    email: str
    nome: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInToken
