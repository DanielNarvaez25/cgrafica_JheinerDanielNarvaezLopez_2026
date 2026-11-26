from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.schemas import EstadoUpdate
from app.schemas import UsuarioCreate
from app.schemas import UsuarioOut
from app.schemas import UsuarioUpdate
from app.security import get_current_user
from app.security import hash_password


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
    dependencies=[Depends(get_current_user)]
)


def validar_unicos(
    db: Session,
    datos,
    excluir_id: int | None = None
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.identificacion == datos.identificacion)
        .first()
    )

    if usuario and usuario.id != excluir_id:
        raise HTTPException(
            status_code=409,
            detail="La identificación ya está registrada"
        )

    usuario = (
        db.query(Usuario)
        .filter(Usuario.email == datos.email)
        .first()
    )

    if usuario and usuario.id != excluir_id:
        raise HTTPException(
            status_code=409,
            detail="El correo electrónico ya está registrado"
        )

    usuario = (
        db.query(Usuario)
        .filter(Usuario.nombre_usuario == datos.nombre_usuario)
        .first()
    )

    if usuario and usuario.id != excluir_id:
        raise HTTPException(
            status_code=409,
            detail="El nombre de usuario ya está registrado"
        )


@router.get("/", response_model=list[UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db)
):
    return (
        db.query(Usuario)
        .order_by(Usuario.id.desc())
        .all()
    )


@router.get("/{id}", response_model=UsuarioOut)
def obtener_usuario(
    id: int,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return usuario


@router.post(
    "/",
    response_model=UsuarioOut,
    status_code=201
)
def crear_usuario(
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


@router.put(
    "/{id}",
    response_model=UsuarioOut
)
def actualizar_usuario(
    id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    validar_unicos(
        db,
        datos,
        excluir_id=usuario.id
    )

    usuario.identificacion = datos.identificacion
    usuario.nombre = datos.nombre
    usuario.apellido = datos.apellido
    usuario.email = datos.email
    usuario.cargo = datos.cargo
    usuario.telefono = datos.telefono
    usuario.nombre_usuario = datos.nombre_usuario

    if datos.password not in (None, ""):
        usuario.password_hash = hash_password(
            datos.password
        )

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con esa identificación, correo o nombre de usuario"
        )


@router.patch(
    "/{id}/estado",
    response_model=UsuarioOut
)
def cambiar_estado(
    id: int,
    datos: EstadoUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if (
        usuario_actual.id == id
        and datos.estado == "Desactivado"
    ):
        raise HTTPException(
            status_code=400,
            detail="No puede desactivar su propia cuenta"
        )

    usuario.estado = datos.estado

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con esa identificación, correo o nombre de usuario"
        )


@router.delete("/{id}")
def eliminar_usuario(
    id: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if usuario_actual.id == id:
        raise HTTPException(
            status_code=400,
            detail="No puede eliminar su propia cuenta"
        )

    try:
        db.delete(usuario)
        db.commit()

        return {
            "message": "Usuario eliminado"
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Ya existe un usuario con esa identificación, correo o nombre de usuario"
        )