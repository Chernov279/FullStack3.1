from pydantic import BaseModel


class IngredientCreate(BaseModel):
    name: str
    quantity: float

class IngredientOut(BaseModel):
    id: int
    name: str
    quantity: float

class IngredientUpdate(BaseModel):
    name: str
    quantity: float