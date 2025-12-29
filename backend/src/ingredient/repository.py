from typing import List

from sqlalchemy import insert, delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.ingredient.schemas import IngredientCreate, IngredientUpdate
from backend.src.models import Ingredient


class IngredientRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, ingredient_id: int):
        stmt = select(Ingredient).where(Ingredient.id == ingredient_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: IngredientCreate):
        stmt = insert(Ingredient).values(
            name=data.name,
            quantity=data.quantity
        ).returning(Ingredient)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one()

    async def update(self, ingredient_id: int, data: IngredientUpdate):
        stmt = update(Ingredient).where(Ingredient.id == ingredient_id).values(
            name=data.name,
            quantity=data.quantity
        ).returning(Ingredient)

        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one_or_none()

    async def delete(self, ingredient_id: int):
        ingredient = await self.get_by_id(ingredient_id)
        if not ingredient:
            return False
        stmt = delete(Ingredient).where(Ingredient.id == ingredient_id)
        await self.session.execute(stmt)
        await self.session.commit()
        return True

    async def list_all(self) -> List[Ingredient]:
        stmt = select(Ingredient).order_by(Ingredient.name)
        result = await self.session.execute(stmt)
        return result.scalars().all()