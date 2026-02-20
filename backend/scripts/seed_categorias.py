"""
Insere categorias padrão no banco (opcional).
Rode a partir da pasta backend:  python -m scripts.seed_categorias
"""
import sys
from pathlib import Path

# Garante que o app está no path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models.categoria import Categoria

CATEGORIAS_PADRAO = [
    {"nome": "Alimentação", "cor": "#e74c3c"},
    {"nome": "Transporte", "cor": "#3498db"},
    {"nome": "Moradia", "cor": "#2ecc71"},
    {"nome": "Saúde", "cor": "#9b59b6"},
    {"nome": "Educação", "cor": "#f39c12"},
    {"nome": "Lazer", "cor": "#1abc9c"},
    {"nome": "Outros", "cor": "#95a5a6"},
]


def main():
    db = SessionLocal()
    try:
        existentes = {c.nome for c in db.query(Categoria).filter(Categoria.usuario_id.is_(None)).all()}
        for cat in CATEGORIAS_PADRAO:
            if cat["nome"] not in existentes:
                db.add(Categoria(nome=cat["nome"], cor=cat["cor"], usuario_id=None))
                existentes.add(cat["nome"])
        db.commit()
        print("Categorias padrão inseridas (ou já existiam).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
