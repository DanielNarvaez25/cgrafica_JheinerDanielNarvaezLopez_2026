from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import models
from app.config import settings
from app.database import engine
from app.routers.auth import router as auth_router
from app.routers.usuarios import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        print("[OK] Conectado a MySQL")

    except Exception as ex:
        print(
            "\n[ERROR] No fue posible conectar con MySQL.\n"
            f"Usuario: {settings.DB_USER}\n"
            f"Host: {settings.DB_HOST}\n"
            f"Base de datos: {settings.DB_NAME}\n"
            "Revise backend/.env y que haya importado DB/schema.sql.\n"
            f"Detalle: {ex}\n"
        )

    yield


app = FastAPI(
    title="API Hospital - Gestión de usuarios",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(usuarios_router)