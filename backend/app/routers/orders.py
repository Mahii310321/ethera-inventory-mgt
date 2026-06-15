import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.order import OrderStatus
from app.schemas.common import Page
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=Page[OrderRead])
def list_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    order_status: OrderStatus | None = Query(default=None, alias="status"),
    customer_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    return OrderService(db).list(page, size, order_status, customer_id)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    return OrderService(db).get(order_id)


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return OrderService(db).create(payload)

