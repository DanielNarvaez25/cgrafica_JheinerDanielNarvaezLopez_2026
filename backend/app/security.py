from datetime import datetime
from datetime import timedelta
from datetime import timezone

import bcrypt
import jwt
from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from jwt import ExpiredSignatureError
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Usuario


bearer_scheme = HTTPBearer(
    auto_error=False
)


def hash_password(plain: str) -> str:
    hashed = bcrypt.hashpw(
        plain.encode("utf-8"),
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(
    plain: str,
    hashed: str
) -> bool:
    try:
        return bcrypt.checkpw(
            plain.encode("utf-8"),
            hashed.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(
    user_id: int
) -> str:
    payload = {
        "sub": str(user_id),
        "exp": (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=settings.JWT_EXPIRE_MINUTES
            )
        )
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def _unauthorized(detail: str):
    raise HTTPException(
        status_code=401,
        detail=detail,
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
) -> Usuario:
    if credentials is None:
        _unauthorized("No autenticado")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[
                settings.JWT_ALGORITHM
            ]
        )

        user_id = payload.get("sub")

        if not user_id:
            _unauthorized("No autenticado")

    except ExpiredSignatureError:
        _unauthorized("No autenticado")
    except InvalidTokenError:
        _unauthorized("No autenticado")
    except Exception:
        _unauthorized("No autenticado")

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == int(user_id))
        .first()
    )

    if usuario is None:
        _unauthorized("No autenticado")

    if usuario.estado != "Activado":
        raise HTTPException(
            status_code=401,
            detail="Cuenta desactivada",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    return usuario