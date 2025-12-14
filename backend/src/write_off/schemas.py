from pydantic import BaseModel, Field
from typing import Optional

class WriteOffBase(BaseModel):
    ingredient: str = Field(..., description="Название списываемого ингредиента")
    quantity: float = Field(..., description="Количество списываемого ингредиента")
    reason: Optional[str] = Field(None, description="Причина списания")

class WriteOffCreate(WriteOffBase):
    pass

class WriteOffRead(WriteOffBase):
    id: int

    class Config:
        from_attributes = True

