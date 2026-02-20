"""meta_gastos_mes em usuarios e tabela receitas

Revision ID: 002
Revises: 001
Create Date: 2025-02-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("usuarios", sa.Column("meta_gastos_mes", sa.Numeric(12, 2), nullable=True))

    op.create_table(
        "receitas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("descricao", sa.String(255), nullable=False),
        sa.Column("valor", sa.Numeric(12, 2), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_receitas_usuario_id"), "receitas", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_receitas_data"), "receitas", ["data"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_receitas_data"), table_name="receitas")
    op.drop_index(op.f("ix_receitas_usuario_id"), table_name="receitas")
    op.drop_table("receitas")
    op.drop_column("usuarios", "meta_gastos_mes")
