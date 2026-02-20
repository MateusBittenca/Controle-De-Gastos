"""Cria tabela gastos_recorrentes

Revision ID: 004
Revises: 003
Create Date: 2025-02-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "gastos_recorrentes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("categoria_id", sa.Integer(), nullable=True),
        sa.Column("descricao", sa.String(255), nullable=False),
        sa.Column("valor", sa.Numeric(12, 2), nullable=False),
        sa.Column("dia_vencimento", sa.Integer(), nullable=False),
        sa.Column("frequencia", sa.String(20), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("proximo_lancamento", sa.Date(), nullable=False),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_gastos_recorrentes_usuario_id", "gastos_recorrentes", ["usuario_id"])
    op.create_index("ix_gastos_recorrentes_proximo_lancamento", "gastos_recorrentes", ["proximo_lancamento"])


def downgrade() -> None:
    op.drop_index("ix_gastos_recorrentes_proximo_lancamento", "gastos_recorrentes")
    op.drop_index("ix_gastos_recorrentes_usuario_id", "gastos_recorrentes")
    op.drop_table("gastos_recorrentes")
