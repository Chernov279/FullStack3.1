from typing import Any, Coroutine, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Row, RowMapping
from ..models.models import Allergen, IngredientDish, AllergenDish


class AllergenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_by_ids(self, ids: list[int]):
        """
        Возвращает список всех аллергенов по ID.
        """
        stmt = select(Allergen).where(Allergen.id.in_(ids))
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_allergens_for_dish(self, dish_id: int):
        """
        Возвращает список уникальных аллергенов для конкретного блюда.
        """
        stmt = (
            select(Allergen.name)
            .select_from(IngredientDish)
            .join(
                AllergenDish,
                AllergenDish.id_dish == IngredientDish.id_dish,
            )
            .join(
                Allergen,
                Allergen.id == AllergenDish.id_allergen
            )
            .where(IngredientDish.id_dish == dish_id)
            .distinct()
        )

        result = await self.session.execute(stmt)
        return result.scalars().all()

