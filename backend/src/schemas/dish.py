from pydantic import BaseModel
from typing import List


class IngredientIn(BaseModel):
    name: str
    quantity: float
    unit_cost: float


class DishIn(BaseModel):
    name: str
    ingredients: List[IngredientIn]


class DishCostOut(BaseModel):
    total_cost: float