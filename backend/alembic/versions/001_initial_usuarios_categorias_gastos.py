"""initial: usuarios, categorias, gastos

Revision ID: 001
Revises:
Create Date: 2025-02-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("nome", sa.String(255), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_usuarios_email"), "usuarios", ["email"], unique=True)

    op.create_table(
        "categorias",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("cor", sa.String(7), nullable=True),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_categorias_nome"), "categorias", ["nome"], unique=False)
    op.create_index(op.f("ix_categorias_usuario_id"), "categorias", ["usuario_id"], unique=False)

    op.create_table(
        "gastos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("categoria_id", sa.Integer(), nullable=True),
        sa.Column("descricao", sa.String(255), nullable=False),
        sa.Column("valor", sa.Numeric(12, 2), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gastos_data"), "gastos", ["data"], unique=False)
    op.create_index(op.f("ix_gastos_categoria_id"), "gastos", ["categoria_id"], unique=False)
    op.create_index(op.f("ix_gastos_usuario_id"), "gastos", ["usuario_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_gastos_usuario_id"), table_name="gastos")
    op.drop_index(op.f("ix_gastos_categoria_id"), table_name="gastos")
    op.drop_index(op.f("ix_gastos_data"), table_name="gastos")
    op.drop_table("gastos")
    op.drop_index(op.f("ix_categorias_usuario_id"), table_name="categorias")
    op.drop_index(op.f("ix_categorias_nome"), table_name="categorias")
    op.drop_table("categorias")
    op.drop_index(op.f("ix_usuarios_email"), table_name="usuarios")
    op.drop_table("usuarios")
