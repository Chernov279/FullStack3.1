from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Dish(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Numeric(10, 2))


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)


class IngredientDish(Base):
    __tablename__ = "ingredient_dish"

    id_ingredient = Column(
        Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False
    )
    id_dish = Column(
        Integer, ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(Numeric(10, 2), nullable=True)


class Allergen(Base):
    __tablename__ = "allergens"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


class AllergenDish(Base):
    """
    Таблица связи блюд и аллергенов.
    """
    __tablename__ = "allergen_dish"

    id = Column(Integer, primary_key=True, index=True)
    id_allergen = Column(
        Integer, ForeignKey("allergens.id", ondelete="CASCADE"), nullable=False
    )
    id_dish = Column(
        Integer, ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False
    )

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    dish_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)


class WriteOff(Base):
    __tablename__ = "writeoffs"

    id = Column(Integer, primary_key=True, index=True)
    ingredient = Column(String, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(String)