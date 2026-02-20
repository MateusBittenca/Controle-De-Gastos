from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GastoRecorrente(Base):
    """Gasto recorrente que gera lançamentos automaticamente."""

    __tablename__ = "gastos_recorrentes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    categoria_id: Mapped[int | None] = mapped_column(
        ForeignKey("categorias.id", ondelete="SET NULL"), nullable=True, index=True
    )
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    dia_vencimento: Mapped[int] = mapped_column(nullable=False)  # 1-31
    frequencia: Mapped[str] = mapped_column(String(20), nullable=False)  # mensal, semanal, anual
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    proximo_lancamento: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="gastos_recorrentes")
    categoria: Mapped["Categoria | None"] = relationship("Categoria")

    @property
    def categoria_nome(self) -> str | None:
        return self.categoria.nome if self.categoria else None

    @property
    def categoria_cor(self) -> str | None:
        return self.categoria.cor if self.categoria else None

    @property
    def categoria_icone(self) -> str | None:
        return self.categoria.icone if self.categoria else None
