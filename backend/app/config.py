from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação (variáveis de ambiente)."""

    # MySQL
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "gastos"

    # JWT
    JWT_SECRET_KEY: str = "altere-em-producao-use-uma-chave-longa-e-segura"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias

    # Ambiente (em produção defina DEBUG=false e JWT_SECRET_KEY forte)
    DEBUG: bool = True

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
