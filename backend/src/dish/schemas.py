from typing import Optional

from pydantic import BaseModel


class DishCreate(BaseModel):
    name: str

class DishOut(BaseModel):
    id: int
    name: str

    model_config = {
        "arbitrary_types_allowed": True,
        "from_attributes": True
    }

class DishListOut(BaseModel):
    id: int
    name: str

class DishCostOut(BaseModel):
    total_cost: float