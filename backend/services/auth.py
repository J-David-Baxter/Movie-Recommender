from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings

bearer_scheme = HTTPBearer()


@dataclass
class AuthUser:
    id: str
    email: str | None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> AuthUser:
    token = credentials.credentials
    response = httpx.get(
        f"{settings.SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_ANON_KEY,
        },
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    data = response.json()
    return AuthUser(id=data["id"], email=data.get("email"))
