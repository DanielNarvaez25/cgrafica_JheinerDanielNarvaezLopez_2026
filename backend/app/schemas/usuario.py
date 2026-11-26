import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import field_validator


EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_REGEX = re.compile(r"^[A-Za-z0-9._-]{4,50}$")

CARGOS_VALIDOS = {
    "Doctor",
    "Especialista",
    "Administrativo"
}

ESTADOS_VALIDOS = {
    "Activado",
    "Desactivado"
}


class UsuarioBase(BaseModel):
    identificacion: str
    nombre: str
    apellido: str
    email: str
    cargo: str
    telefono: str
    nombre_usuario: str

    @field_validator("identificacion")
    @classmethod
    def validar_identificacion(cls, v: str) -> str:
        v = v.strip()

        if not v.isdigit():
            raise ValueError(
                "La identificación solo puede contener dígitos"
            )

        if len(v) < 5 or len(v) > 20:
            raise ValueError(
                "La identificación debe tener entre 5 y 20 dígitos"
            )

        return v

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_nombre_apellido(cls, v: str) -> str:
        v = v.strip()

        if not v:
            raise ValueError("Este campo es obligatorio")

        if len(v) > 100:
            raise ValueError(
                "El valor no puede superar 100 caracteres"
            )

        return v

    @field_validator("email")
    @classmethod
    def validar_email(cls, v: str) -> str:
        v = v.strip().lower()

        if len(v) > 150:
            raise ValueError(
                "El correo no puede superar 150 caracteres"
            )

        if not EMAIL_REGEX.match(v):
            raise ValueError(
                "Correo electrónico inválido"
            )

        return v

    @field_validator("cargo")
    @classmethod
    def validar_cargo(cls, v: str) -> str:
        if v not in CARGOS_VALIDOS:
            raise ValueError("Cargo inválido")

        return v

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v: str) -> str:
        v = v.strip()

        if not v.isdigit():
            raise ValueError(
                "El teléfono solo puede contener dígitos"
            )

        if len(v) < 7 or len(v) > 20:
            raise ValueError(
                "El teléfono debe tener entre 7 y 20 dígitos"
            )

        return v

    @field_validator("nombre_usuario")
    @classmethod
    def validar_nombre_usuario(cls, v: str) -> str:
        v = v.strip()

        if not USERNAME_REGEX.match(v):
            raise ValueError(
                "Nombre de usuario inválido"
            )

        return v


class UsuarioCreate(UsuarioBase):
    password: str

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError(
                "La contraseña debe tener al menos 8 caracteres"
            )

        if len(v.encode("utf-8")) > 72:
            raise ValueError(
                "La contraseña no puede superar 72 bytes en UTF-8"
            )

        if not re.search(r"[A-Za-z]", v):
            raise ValueError(
                "La contraseña debe contener al menos una letra"
            )

        if not re.search(r"\d", v):
            raise ValueError(
                "La contraseña debe contener al menos un número"
            )

        return v


class UsuarioUpdate(UsuarioBase):
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validar_password(
        cls,
        v: Optional[str]
    ) -> Optional[str]:
        if v is None:
            return None

        if v == "":
            return ""

        if len(v) < 8:
            raise ValueError(
                "La contraseña debe tener al menos 8 caracteres"
            )

        if len(v.encode("utf-8")) > 72:
            raise ValueError(
                "La contraseña no puede superar 72 bytes en UTF-8"
            )

        if not re.search(r"[A-Za-z]", v):
            raise ValueError(
                "La contraseña debe contener al menos una letra"
            )

        if not re.search(r"\d", v):
            raise ValueError(
                "La contraseña debe contener al menos un número"
            )

        return v


class EstadoUpdate(BaseModel):
    estado: str

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v: str) -> str:
        if v not in ESTADOS_VALIDOS:
            raise ValueError("Estado inválido")

        return v


class UsuarioOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    identificacion: str
    nombre: str
    apellido: str
    email: str
    cargo: str
    telefono: str
    nombre_usuario: str
    estado: str
    fecha_creacion: datetime
