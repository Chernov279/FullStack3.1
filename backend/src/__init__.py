from fastapi import APIRouter

from backend.src.allergens.router import allergen_router
from backend.src.auth.router import auth_router
from backend.src.dish.router import dish_router
from backend.src.ingredient.router import ingredient_router
from backend.src.label.router import labels_router
from backend.src.write_off.router import writeoff_router

api_router = APIRouter()
api_router.include_router(allergen_router)
api_router.include_router(dish_router)
api_router.include_router(ingredient_router)
api_router.include_router(labels_router)
api_router.include_router(writeoff_router)
api_router.include_router(auth_router)
