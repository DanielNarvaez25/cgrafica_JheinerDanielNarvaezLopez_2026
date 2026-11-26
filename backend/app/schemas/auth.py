from pydantic import BaseModel
from pydantic import Field

from app.schemas.usuario import UsuarioOut


class LoginRequest(BaseModel):
    identificacion: str = Field(
        ...,
        max_length=20
    )

    password: str = Field(
        ...,
        max_length=128
    )


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut