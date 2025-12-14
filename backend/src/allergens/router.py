from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import AllergenRepository
from ..schemas.allergens import AllergenMatrixOut
from ..core.db import get_async_session

allergen_router = APIRouter(prefix="/allergens", tags=["Allergens"])


@allergen_router.get("/matrix", response_model=AllergenMatrixOut)
async def allergens_matrix(
        dish_id: int,
        session: AsyncSession = Depends(get_async_session)
):
    repo = AllergenRepository(session)

    allergens = await repo.get_allergens_for_dish(dish_id)

    if allergens is None:
        raise HTTPException(status_code=404, detail="Dish not found")

    return AllergenMatrixOut(
        allergens=allergens
    )
