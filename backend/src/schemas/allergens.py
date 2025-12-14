from pydantic import BaseModel
from typing import List


class AllergenDishIn(BaseModel):
    dish_id: int


class AllergenIn(BaseModel):
    name: str
    dishes: List[int]  # IDs блюд


class AllergenMatrixOut(BaseModel):
    allergens: list[str]