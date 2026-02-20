# Backend – Controle de Gastos (Python + FastAPI + MySQL)

## Requisitos

- Python 3.11+
- MySQL 8 (ou compatível)

## Instalação

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

## Configuração

1. Copie o arquivo de exemplo e ajuste com seus dados do MySQL:

   ```bash
   copy .env.example .env   # Windows
   # cp .env.example .env   # Linux/macOS
   ```

2. Edite `.env`: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

3. Crie o banco (se ainda não existir):

   ```bash
   python create_db.py
   ```

## Banco de dados (migrations)

As tabelas são criadas e alteradas com **Alembic**. Não use `create_all` em produção.

1. Aplicar todas as migrations (criar tabelas):

   ```bash
   alembic upgrade head
   ```

2. (Opcional) Inserir categorias padrão:

   ```bash
   python -m scripts.seed_categorias
   ```

3. Para criar uma nova migration depois de alterar modelos:

   ```bash
   alembic revision --autogenerate -m "descricao_da_mudanca"
   alembic upgrade head
   ```

### Estrutura das tabelas

| Tabela      | Descrição |
|------------|-----------|
| **usuarios** | Usuários (login). Campos: id, email, nome, senha_hash, ativo, meta_gastos_mes, criado_em, atualizado_em. |
| **categorias** | Categorias de gasto. Campos: id, nome, cor, usuario_id (null = global), criado_em. |
| **gastos** | Lançamentos de gasto. Campos: id, usuario_id, categoria_id, descricao, valor, data, observacao, criado_em, atualizado_em. |
| **receitas** | Lançamentos de receita. Campos: id, usuario_id, descricao, valor, data, observacao, criado_em, atualizado_em. |

Relacionamentos: `usuarios` 1:N `gastos`, `receitas` e `categorias`; `categorias` 1:N `gastos`.

## Executar a API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Documentação (Swagger): http://localhost:8000/docs  
- Health: http://localhost:8000/health  
- Health (com DB): http://localhost:8000/health/ready  

## Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/registro | Cadastro (retorna token) |
| POST | /api/auth/login | Login (retorna token) |
| GET/PATCH | /api/auth/me | Perfil do usuário logado |
| GET/POST | /api/gastos/ | Lista / Cria gastos (paginação: limit, offset) |
| GET/PATCH/DELETE | /api/gastos/{id} | Um gasto |
| GET | /api/resumo/?mes=&ano= | Resumo do mês (dashboard) |
| GET/POST | /api/receitas/ | Lista / Cria receitas |
| GET/POST | /api/categorias/ | Lista / Cria categorias |
| GET/POST | /api/usuarios/ | Lista (próprio) / Cria usuário (autenticado) |
| GET/PATCH/DELETE | /api/usuarios/{id} | Apenas o próprio usuário |

Todas as rotas de gastos, receitas, categorias, resumo e usuarios requerem `Authorization: Bearer <token>`.
