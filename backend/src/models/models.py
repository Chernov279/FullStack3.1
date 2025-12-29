from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, JSON, Boolean, PrimaryKeyConstraint, func
from sqlalchemy.orm import declarative_base, Mapped, mapped_column

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str]


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
    __table_args__ = (
        PrimaryKeyConstraint('id_ingredient', 'id_dish', name='ingredient_dish_pk'),
    )

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


class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, nullable=True)
    customer_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivery_time = Column(DateTime, nullable=True)
    comment = Column(String, nullable=True)

    total_sum = Column(Numeric(10, 2), nullable=False)

    items = Column(JSON, nullable=False)  # [{dish_id, dish_name, qty}, ...]

    printed = Column(Boolean, default=False)