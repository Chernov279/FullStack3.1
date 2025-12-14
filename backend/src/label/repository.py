from typing import List

from fastapi import HTTPException
from sqlalchemy import insert, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.label.schemas import LabelCreate
from backend.src.models import Label


class LabelRepository:
    def __init__(self, session: AsyncSession):
        self.session = session


    async def create(self, data: LabelCreate) -> Label:
        total_sum = sum(i.unit_price * i.quantity for i in data.items)


        stmt = insert(Label).values(
        order_id=data.order_id,
        customer_name=data.customer_name,
        address=data.address,
        delivery_time=data.delivery_time,
        comment=data.comment,
        items=[i.dict() for i in data.items],
        total_sum=total_sum,
        ).returning(Label)


        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one()


    async def get(self, label_id: int) -> Label:
        stmt = select(Label).where(Label.id == label_id)
        result = await self.session.execute(stmt)
        label = result.scalar_one_or_none()
        if not label:
            raise HTTPException(status_code=404, detail="Label not found")
        return label


    async def delete(self, label_id: int):
        stmt = delete(Label).where(Label.id == label_id)
        await self.session.execute(stmt)
        await self.session.commit()


    async def list(self) -> List[Label]:
        stmt = select(Label).order_by(Label.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()