"""
Cria o banco de dados 'gastos' no MySQL se ainda não existir.
Rode a partir da pasta backend:  python create_db.py
"""
import pymysql

# Carrega .env da pasta backend
from app.config import settings

def main():
    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DATABASE}`")
        conn.commit()
        print(f"Banco '{settings.MYSQL_DATABASE}' pronto.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
