"""Schemas para o endpoint de resumo do dashboard."""

from decimal import Decimal

from pydantic import BaseModel

from app.schemas.gasto import GastoResponse


class ResumoMesResponse(BaseModel):
    """Resumo financeiro de um mês para o dashboard."""

    total_gastos: Decimal
    total_receitas: Decimal
    saldo: Decimal
    meta_gastos_mes: Decimal | None
    ultimos_gastos: list[GastoResponse]
    total_gastos_count: int = 0
    total_receitas_count: int = 0
    gastos_mes_count: int = 0
    receitas_mes_count: int = 0
