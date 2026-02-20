from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Gasto(Base):
    """Lançamento de gasto."""

    __tablename__ = "gastos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True, index=True
    )
    categoria_id: Mapped[int | None] = mapped_column(
        ForeignKey("categorias.id", ondelete="SET NULL"), nullable=True, index=True
    )
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    usuario: Mapped["Usuario | None"] = relationship("Usuario", back_populates="gastos")
    categoria: Mapped["Categoria | None"] = relationship("Categoria", back_populates="gastos")

    @property
    def categoria_nome(self) -> str | None:
        """Nome da categoria (para resposta da API)."""
        return self.categoria.nome if self.categoria else None

    @property
    def categoria_cor(self) -> str | None:
        """Cor da categoria."""
        return self.categoria.cor if self.categoria else None

    @property
    def categoria_icone(self) -> str | None:
        """Ícone da categoria."""
        return self.categoria.icone if self.categoria else None
