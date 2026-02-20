from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class GastoBase(BaseModel):
    descricao: str
    valor: Decimal
    data: date
    categoria_id: int | None = None
    observacao: str | None = None


class GastoCreate(GastoBase):
    usuario_id: int | None = None


class GastoUpdate(BaseModel):
    descricao: str | None = None
    valor: Decimal | None = None
    data: date | None = None
    categoria_id: int | None = None
    observacao: str | None = None


class GastoResponse(BaseModel):
    id: int
    usuario_id: int | None
    categoria_id: int | None
    descricao: str
    valor: Decimal
    data: date
    observacao: str | None
    criado_em: datetime
    atualizado_em: datetime
    categoria_nome: str | None = None
    categoria_cor: str | None = None
    categoria_icone: str | None = None

    model_config = ConfigDict(from_attributes=True)
