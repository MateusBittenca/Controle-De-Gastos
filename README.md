# Controle de Gastos

Aplicação fullstack para controle de gastos e receitas, com dashboard, relatórios, metas mensais e autenticação.

## Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, MySQL, Alembic, JWT (python-jose), bcrypt
- **Frontend:** React 19, Vite 7, React Router 7

## Estrutura

```
Projeto_gastos/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── core/      # segurança (JWT, hash)
│   │   ├── models/    # SQLAlchemy
│   │   ├── routers/   # auth, gastos, receitas, categorias, resumo, usuarios
│   │   └── schemas/   # Pydantic
│   ├── alembic/       # migrations
│   └── requirements.txt
├── frontend/
│   └── gastos/        # app React (Vite)
└── iniciar.bat        # script para subir backend + frontend
```

## Como rodar

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Editar .env com MySQL (MYSQL_*, JWT_SECRET_KEY, DEBUG)
python create_db.py
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health e http://localhost:8000/health/ready (com checagem do banco)

### Frontend

```bash
cd frontend/gastos
npm install
npm run dev
```

Acesse a URL exibida no terminal (ex.: http://localhost:5173).

### Variáveis de ambiente

- **Backend** (`.env`): `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `JWT_SECRET_KEY`, `DEBUG` (opcional, default true).
- **Frontend** (`.env`): `VITE_API_URL` (opcional, default http://localhost:8000).

## Funcionalidades

- Cadastro e login com JWT
- CRUD de gastos e receitas (por usuário)
- Categorias de gastos (globais e por usuário)
- Dashboard com totais do mês, saldo e meta de gastos
- Resumo do mês via API (`/api/resumo/?mes=&ano=`) para performance
- Relatórios: por categoria, por mês, saldo, top 5 gastos, exportar CSV
- Perfil do usuário: nome e meta de gastos mensal
- Paginação opcional em gastos (`limit` e `offset`)
- Tema claro/escuro (frontend)
- Error Boundary no frontend

## Segurança

- Rotas de gastos, receitas, categorias e resumo exigem token JWT.
- Rotas de usuários (`/api/usuarios`) exigem autenticação; cada usuário só acessa/edita seus próprios dados.
- Senhas armazenadas com bcrypt; em produção use `DEBUG=false` e `JWT_SECRET_KEY` forte.

## Licença

Uso livre para fins educacionais e pessoais.
