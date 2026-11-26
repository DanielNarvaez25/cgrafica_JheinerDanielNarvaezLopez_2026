from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.schemas import LoginRequest
from app.schemas import TokenOut
from app.schemas import UsuarioCreate
from app.schemas import UsuarioOut
from app.security import create_access_token
from app.security import get_current_user
from app.security import hash_password
from app.security import verify_password
from app.routers.usuarios import validar_unicos


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


@router.post(
    "/registro",
    response_model=UsuarioOut,
    status_code=201
)
def registro(
    datos: UsuarioCreate,
    db: Session = Depends(get_db)
):
    validar_unicos(db, datos)

    usuario = Usuario(
        identificacion=datos.identificacion,
        nombre=datos.nombre,
        apellido=datos.apellido,
        email=datos.email,
        cargo=datos.cargo,
        telefono=datos.telefono,
        nombre_usuario=datos.nombre_usuario,
        password_hash=hash_password(datos.password),
        estado="Activado"
    )

    try:
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        return usuario

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con esa identificación, correo o nombre de usuario"
        )


@router.post(
    "/login",
    response_model=TokenOut
)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(
            Usuario.identificacion == datos.identificacion
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña inválidos"
        )

    if not verify_password(
        datos.password,
        usuario.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña inválidos"
        )

    if usuario.estado == "Desactivado":
        raise HTTPException(
            status_code=403,
            detail="Su cuenta está desactivada. Comuníquese con el administrador"
        )

    return TokenOut(
        access_token=create_access_token(usuario.id),
        usuario=usuario
    )


@router.get(
    "/me",
    response_model=UsuarioOut
)
def obtener_usuario_actual(
    usuario: Usuario = Depends(get_current_user)
):
    return usuario