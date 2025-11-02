from typing import List

from pydantic import BaseModel, Field
from decimal import Decimal


class Ingredient(BaseModel):
    name: str
    quantity: Decimal = Field(..., description="Количество (в граммах, литрах и т.п.)")
    unit_cost: Decimal = Field(..., description="Себестоимость за единицу (руб/грамм и т.п.)")


class Dish(BaseModel):
    name: str
    ingredients: List[Ingredient]


class Allergen(BaseModel):
    name: str
    contains: List[str]


class Order(BaseModel):
    id: int
    dish_name: str
    quantity: int
    unit_price: Decimal = Field(..., description="Цена за единицу")


class WriteOff(BaseModel):
    ingredient: str
    quantity: Decimal
    reason: str