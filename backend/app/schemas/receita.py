from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ReceitaBase(BaseModel):
    descricao: str
    valor: Decimal
    data: date
    observacao: str | None = None


class ReceitaCreate(ReceitaBase):
    pass


class ReceitaUpdate(BaseModel):
    descricao: str | None = None
    valor: Decimal | None = None
    data: date | None = None
    observacao: str | None = None


class ReceitaResponse(ReceitaBase):
    id: int
    usuario_id: int
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
