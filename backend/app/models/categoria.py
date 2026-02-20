from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Categoria(Base):
    """Categoria de gasto (Alimentação, Transporte, etc.)."""

    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    cor: Mapped[str | None] = mapped_column(String(7), nullable=True)  # ex: #3498db
    icone: Mapped[str | None] = mapped_column(String(10), nullable=True)  # emoji ex: 🍔
    orcamento_mensal: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True, index=True
    )
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    usuario: Mapped["Usuario | None"] = relationship("Usuario", back_populates="categorias")
    gastos: Mapped[list["Gasto"]] = relationship("Gasto", back_populates="categoria")
