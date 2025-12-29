from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from backend.src.core.db import get_async_session
from backend.src.ingredient.repository import IngredientRepository
from backend.src.ingredient.schemas import IngredientOut, IngredientCreate, IngredientUpdate

ingredient_router = APIRouter(prefix="/ingredients", tags=["Ingredients"])


@ingredient_router.post("/", response_model=IngredientOut)
async def create_ingredient(data: IngredientCreate, session: AsyncSession = Depends(get_async_session)):
    repo = IngredientRepository(session)
    return await repo.create(data)


@ingredient_router.put("/{ingredient_id}", response_model=IngredientOut)
async def update_ingredient(
        ingredient_id: int,
        data: IngredientUpdate,
        session: AsyncSession = Depends(get_async_session)
):
    repo = IngredientRepository(session)

    existing_ingredient = await repo.get_by_id(ingredient_id)
    if not existing_ingredient:
        raise HTTPException(status_code=404, detail="Ингредиент не найден")

    updated_ingredient = await repo.update(ingredient_id, data)
    if not updated_ingredient:
        raise HTTPException(status_code=500, detail="Ошибка при обновлении ингредиента")

    return updated_ingredient

@ingredient_router.delete("/{ingredient_id}")
async def delete_ingredient(ingredient_id: int, session: AsyncSession = Depends(get_async_session)):
    repo = IngredientRepository(session)
    ok = await repo.delete(ingredient_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return Response(status_code=204)


@ingredient_router.get("/", response_model=List[IngredientOut])
async def list_ingredients(session: AsyncSession = Depends(get_async_session)):
    repo = IngredientRepository(session)
    return await repo.list_all()


@ingredient_router.get("/{ingredient_id}", response_model=IngredientOut)
async def get_ingredient(ingredient_id: int, session: AsyncSession = Depends(get_async_session)):
    repo = IngredientRepository(session)
    ingredient = await repo.get_by_id(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient