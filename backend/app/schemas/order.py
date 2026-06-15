import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus
from app.schemas.customer import CustomerRead
from app.schemas.product import ProductRead


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: uuid.UUID
    items: list[OrderItemCreate] = Field(..., min_length=1)
    status: OrderStatus = OrderStatus.PENDING


class OrderItemRead(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    price_at_purchase: Decimal
    product: ProductRead | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    customer: CustomerRead | None = None
    items: list[OrderItemRead] = []

    model_config = ConfigDict(from_attributes=True)

