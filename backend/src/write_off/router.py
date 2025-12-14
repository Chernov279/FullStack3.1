from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.src.core.db import get_async_session
from backend.src.write_off.repository import WriteOffRepository
from backend.src.write_off.schemas import WriteOffCreate, WriteOffRead

writeoff_router = APIRouter(prefix="/writeoff", tags=["WriteOff"])
repo = WriteOffRepository()


@writeoff_router.post("/register", response_model=List[WriteOffRead])
async def register_writeoff(
    writeoffs: List[WriteOffCreate],
    session: AsyncSession = Depends(get_async_session),
):
    created = await repo.create_many(session, writeoffs)
    return created


@writeoff_router.get("/", response_model=List[WriteOffRead])
async def list_writeoffs(session: AsyncSession = Depends(get_async_session)):
    return await repo.get_all(session)
