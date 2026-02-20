from __future__ import annotations

from datetime import datetime

from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Usuario(Base):
    """Usuário do sistema (para login futuro e multi-usuário)."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    meta_gastos_mes: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    gastos: Mapped[list["Gasto"]] = relationship("Gasto", back_populates="usuario")
    categorias: Mapped[list["Categoria"]] = relationship("Categoria", back_populates="usuario")
    receitas: Mapped[list["Receita"]] = relationship("Receita", back_populates="usuario")
    gastos_recorrentes: Mapped[list["GastoRecorrente"]] = relationship("GastoRecorrente", back_populates="usuario")