from typing import List

from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import Response

from backend.src.core.db import get_async_session
from backend.src.label.repository import LabelRepository
from backend.src.label.schemas import LabelOut, LabelCreate

labels_router = APIRouter(prefix="/labels", tags=["Labels"])

@labels_router.post("/create", response_model=LabelOut)
async def create_label(payload: LabelCreate, session: AsyncSession = Depends(get_async_session)):
    repo = LabelRepository(session)
    return await repo.create(payload)

@labels_router.get("/{label_id}", response_model=LabelOut)
async def get_label(label_id: int, session: AsyncSession = Depends(get_async_session)):
    repo = LabelRepository(session)
    return await repo.get(label_id)


@labels_router.delete("/{label_id}")
async def delete_label(label_id: int, session: AsyncSession = Depends(get_async_session)):
    repo = LabelRepository(session)
    await repo.delete(label_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@labels_router.get("/", response_model=List[LabelOut])
async def list_labels(session: AsyncSession = Depends(get_async_session)):
    repo = LabelRepository(session)
    return await repo.list()