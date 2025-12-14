from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from .repository import DishRepository
from .schemas import DishOut, DishCreate
from ..schemas.dish import DishIn, DishCostOut
from ..core.db import get_async_session

dish_router = APIRouter(prefix="/dish", tags=["Dish"])



@dish_router.get("/calculate", response_model=DishCostOut)
async def calculate_cost(
        dish_id: int,
        session: AsyncSession = Depends(get_async_session)
):
    repo = DishRepository(session)
    rows = await repo.get_dish_cost(dish_id)

    if not rows:
        raise HTTPException(status_code=404, detail="Dish not found or no ingredients")

    total_cost = sum(
        amount * unit_cost for (amount, unit_cost) in rows
    )
    return DishCostOut(total_cost=round(total_cost, 2))


@dish_router.post("/", response_model=DishOut)
async def create_dish(data: DishCreate, session: AsyncSession = Depends(get_async_session)):
    repo = DishRepository(session)
    return await repo.create(data)


@dish_router.delete("/{dish_id}")
async def delete_dish(dish_id: int, session: AsyncSession = Depends(get_async_session)):
    repo = DishRepository(session)
    ok = await repo.delete(dish_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Dish not found")
    return Response(status_code=204)
