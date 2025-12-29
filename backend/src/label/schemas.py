import datetime
from typing import List, Optional
from pydantic import BaseModel

class LabelItem(BaseModel):
    dish_id: int
    dish_name: str
    qty: int

class LabelCreate(BaseModel):
    order_id: Optional[int] = None
    customer_name: Optional[str] = None
    address: Optional[str] = None
    delivery_time: Optional[datetime.datetime] = None
    comment: Optional[str] = None
    items: List[LabelItem]

class LabelOut(BaseModel):
    id: int
    order_id: Optional[int]
    customer_name: Optional[str]
    address: Optional[str]
    created_at: datetime.datetime
    delivery_time: Optional[datetime.datetime]
    comment: Optional[str]
    total_sum: float
    items: List[LabelItem]
    printed: bool

    model_config = {
        "arbitrary_types_allowed": True,
        "from_attributes": True
    }