from typing import Optional

from pydantic import BaseModel


class DishCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DishOut(BaseModel):
    id: int
    name: str
    description: Optional[str]

    model_config = {
        "arbitrary_types_allowed": True,
        "from_attributes": True
    }

class DishCostOut(BaseModel):
    total_cost: float