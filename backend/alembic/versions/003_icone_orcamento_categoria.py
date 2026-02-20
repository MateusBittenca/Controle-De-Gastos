"""Adiciona icone e orcamento_mensal em categorias

Revision ID: 003
Revises: 002
Create Date: 2025-02-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("categorias", sa.Column("icone", sa.String(10), nullable=True))
    op.add_column("categorias", sa.Column("orcamento_mensal", sa.Numeric(12, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("categorias", "orcamento_mensal")
    op.drop_column("categorias", "icone")
