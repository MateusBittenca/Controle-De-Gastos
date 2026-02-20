from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class UsuarioBase(BaseModel):
    email: str
    nome: str


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    ativo: bool | None = None
    meta_gastos_mes: Decimal | None = None


class UsuarioResponse(UsuarioBase):
    id: int
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime
    meta_gastos_mes: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
