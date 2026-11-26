from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import text

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    identificacion = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    cargo = Column(String(20), nullable=False)
    telefono = Column(String(20), nullable=False)
    nombre_usuario = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    estado = Column(String(20), nullable=False, default="Activado")
    fecha_creacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )