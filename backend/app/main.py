from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.routers import auth, categorias, gastos, gastos_recorrentes, receitas, resumo, usuarios

# Headers CORS para incluir em todas as respostas (incluindo erros)
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers": "*",
}


async def exception_handler_global(request: Request, exc: Exception) -> JSONResponse:
    """Garante que respostas de erro tenham headers CORS. Em produção não expõe detalhes internos."""
    from app.config import settings
    detail = str(exc) if settings.DEBUG else "Erro interno do servidor"
    return JSONResponse(
        status_code=500,
        content={"detail": detail or "Erro interno do servidor"},
        headers=CORS_HEADERS,
    )


class CORSAllResponsesMiddleware(BaseHTTPMiddleware):
    """Responde ao preflight OPTIONS e injeta CORS em toda resposta."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Preflight: responder OPTIONS com 200 e headers CORS (evita 405 sem CORS)
        if request.method == "OPTIONS":
            return Response(status_code=200, headers=CORS_HEADERS)
        response = await call_next(request)
        for key, value in CORS_HEADERS.items():
            response.headers[key] = value
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle da aplicação (tabelas são criadas via Alembic)."""
    yield


app = FastAPI(
    title="Controle de Gastos API",
    description="API do projeto Controle de Gastos",
    version="0.1.0",
    lifespan=lifespan,
)

# Exception handler global: erros não tratados retornam JSON com CORS
app.add_exception_handler(Exception, exception_handler_global)

# Middleware que adiciona CORS em TODA resposta (registrado por último = mais externo)
app.add_middleware(CORSAllResponsesMiddleware)

# CORS: permitir frontend em localhost (auth usa token no header, não cookie)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gastos.router, prefix="/api/gastos", tags=["gastos"])
app.include_router(gastos_recorrentes.router, prefix="/api/gastos-recorrentes", tags=["gastos-recorrentes"])
app.include_router(categorias.router, prefix="/api/categorias", tags=["categorias"])
app.include_router(receitas.router, prefix="/api/receitas", tags=["receitas"])
app.include_router(resumo.router, prefix="/api/resumo", tags=["resumo"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["usuarios"])


@app.get("/")
def root():
    return {"message": "Controle de Gastos API", "docs": "/docs"}


@app.get("/health")
def health():
    """Health check básico."""
    return {"status": "ok"}


@app.get("/health/ready")
def health_ready():
    """Health check com verificação de banco (útil para Kubernetes/load balancer)."""
    from sqlalchemy import text
    from app.database import engine
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "detail": "Database unavailable"},
            headers=CORS_HEADERS,
        )
    return {"status": "ok"}
