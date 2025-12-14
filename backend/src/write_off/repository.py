from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend.src.models import WriteOff
from backend.src.write_off.schemas import WriteOffCreate


class WriteOffRepository:
    async def create_many(self, session: AsyncSession, writeoffs: List[WriteOffCreate]) -> List[WriteOff]:
        objs = [WriteOff(**wo.model_dump()) for wo in writeoffs]
        session.add_all(objs)
        await session.commit()
        for obj in objs:
            await session.refresh(obj)
        return objs

    async def get_all(self, session: AsyncSession) -> List[WriteOff]:
        stmt = select(WriteOff)
        result = await session.execute(stmt)
        return result.scalars().all()
