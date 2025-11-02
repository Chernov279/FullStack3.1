from typing import List, Dict

import fastapi
from schemas import Dish, Allergen, Order, WriteOff

app = fastapi.APIRouter(prefix="/")


@app.get("/cost/calculate")
def calculate_cost(dish: Dish):
    """Калькулятор себестоимости блюда"""

    dish_ingridients = ...
    total_cost = sum(ing.quantity * ing.unit_cost for ing in dish.ingredients)
    return {"dish": dish.name, "total_cost": round(total_cost, 2)}


@app.post("/allergens/matrix")
def allergens_matrix(allergens: List[Allergen]):
    """Формирует матрицу аллергенов по блюдам"""

    matrix: Dict[str, Dict[str, bool]] = {}
    for allergen in allergens:
        for dish in allergen.contains:
            if dish not in matrix:
                matrix[dish] = {}
            matrix[dish][allergen.name] = True
    return {"matrix": matrix}


@app.post("/labels/print")
def print_labels(orders: List[Order]):
    """Список заказов для печати этикеток"""
    total_sum = sum(o.unit_price * o.quantity for o in orders)
    labels = [
        {"order_id": o.id, "dish": o.dish_name, "price": o.unit_price, "quantity": o.quantity}
        for o in orders
    ]
    return {"orders": labels, "total_sum": round(total_sum, 2)}


@app.post("/writeoff/register")
def register_writeoff(writeoffs: List[WriteOff]):
    """Учёт списаний"""

    total_items = len(writeoffs)
    total_quantity = sum(w.quantity for w in writeoffs)
    return {
        "status": "ok",
        "writeoffs_registered": total_items,
        "total_quantity": total_quantity
    }
