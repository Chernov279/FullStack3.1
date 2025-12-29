from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete

from .schemas import DishCreate
from ..models.models import Dish, IngredientDish, Ingredient


class DishRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, dish_id: int):
        stmt = select(Dish).where(Dish.id == dish_id).options()
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self):
        stmt = select(Dish).order_by(Dish.name)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_dish_cost(self, dish_id: int):
        """
        Возвращает себестоимость блюда.
        """

        stmt = (
            select(
                IngredientDish.amount,
                Ingredient.quantity
            )
            .select_from(IngredientDish)
            .join(Ingredient, Ingredient.id == IngredientDish.id_ingredient)
            .where(IngredientDish.id_dish == dish_id)
        )

        result = await self.session.execute(stmt)
        rows = result.all()
        return rows
    async def create(self, data: DishCreate):
        stmt = select(Dish).where(Dish.name == data.name)
        result = await self.session.execute(stmt)
        existing_dish = result.scalar_one_or_none()

        if existing_dish:
            raise ValueError(f"Блюдо с названием '{data.name}' уже существует")
        stmt = insert(Dish).values(
            name=data.name,
        ).returning(Dish)

        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one()

    async def delete(self, dish_id: int):
        dish = await self.get_by_id(dish_id)
        if not dish:
            return False
        stmt = delete(Dish).where(Dish.id == dish_id)
        await self.session.execute(stmt)
        await self.session.commit()
        return True