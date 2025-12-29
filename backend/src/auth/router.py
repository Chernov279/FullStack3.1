from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from backend.src.auth.repository import UserRepository
from backend.src.auth.schemas import UserRead, UserCreate, Token, RefreshTokenSchema, TokenSchema
from backend.src.auth.utils.jwt import create_refresh_token
from backend.src.auth.utils.security import hash_password, verify_password, create_access_token
from backend.src.core.config import settings
from backend.src.core.db import get_async_session

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=UserRead)
async def register(
    data: UserCreate,
    session: AsyncSession = Depends(get_async_session),
):
    repo = UserRepository(session)
    if await repo.get_by_email(data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await repo.create(
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    return user


@auth_router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    repo = UserRepository(session)

    user = await repo.get_by_email(form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    refresh_token = create_refresh_token(subject=user.email)
    return {"refresh_token": refresh_token}

from jose import jwt, JWTError


@auth_router.post("/refresh")
async def refresh_token(data: RefreshTokenSchema):
    try:
        payload = jwt.decode(
            data.refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Not a refresh token")

    email = payload.get("sub")
    return {
        "access_token": create_access_token(email),
        "token_type": "bearer",
    }


@auth_router.post("/verify")
async def refresh_token(data: TokenSchema):
    try:
        jwt.decode(
            data.token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return Response(status_code=status.HTTP_204_NO_CONTENT)