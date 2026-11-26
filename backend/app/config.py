import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "db_DanielNarvaez2")

    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "cambie-este-texto-por-uno-largo-y-aleatorio"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_EXPIRE_MINUTES", "60")
    )


settings = Settings()

if (
    settings.JWT_SECRET == "cambie-este-texto-por-uno-largo-y-aleatorio"
    or len(settings.JWT_SECRET) < 16
):
    print(
        "ADVERTENCIA: JWT_SECRET usa el valor de ejemplo o tiene menos de "
        "16 caracteres. Cambie este valor en backend/.env."
    )