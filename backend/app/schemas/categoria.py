from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CategoriaBase(BaseModel):
    nome: str
    cor: str | None = None
    icone: str | None = None
    orcamento_mensal: Decimal | None = None


class CategoriaCreate(CategoriaBase):
    usuario_id: int | None = None


class CategoriaUpdate(BaseModel):
    nome: str | None = None
    cor: str | None = None
    icone: str | None = None
    orcamento_mensal: Decimal | None = None


class CategoriaResponse(CategoriaBase):
    id: int
    usuario_id: int | None
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
