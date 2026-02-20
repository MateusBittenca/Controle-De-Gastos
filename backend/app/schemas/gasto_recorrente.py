from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Frequencia(str, Enum):
    MENSAL = "mensal"
    SEMANAL = "semanal"
    ANUAL = "anual"


class GastoRecorrenteBase(BaseModel):
    descricao: str = Field(..., min_length=1, max_length=255)
    valor: Decimal = Field(..., gt=0)
    categoria_id: int | None = None
    dia_vencimento: int = Field(..., ge=1, le=31)
    frequencia: Frequencia = Frequencia.MENSAL
    observacao: str | None = None


class GastoRecorrenteCreate(GastoRecorrenteBase):
    proximo_lancamento: date | None = None


class GastoRecorrenteUpdate(BaseModel):
    descricao: str | None = Field(None, min_length=1, max_length=255)
    valor: Decimal | None = Field(None, gt=0)
    categoria_id: int | None = None
    dia_vencimento: int | None = Field(None, ge=1, le=31)
    frequencia: Frequencia | None = None
    ativo: bool | None = None
    observacao: str | None = None


class GastoRecorrenteResponse(GastoRecorrenteBase):
    id: int
    usuario_id: int
    ativo: bool
    proximo_lancamento: date
    categoria_nome: str | None = None
    categoria_cor: str | None = None
    categoria_icone: str | None = None
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
