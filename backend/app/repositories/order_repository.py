import uuid

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem, OrderStatus


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        page: int,
        size: int,
        status: OrderStatus | None = None,
        customer_id: uuid.UUID | None = None,
    ) -> tuple[list[Order], int]:
        stmt: Select[tuple[Order]] = (
            select(Order)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
            .order_by(Order.created_at.desc())
        )
        count_stmt = select(func.count()).select_from(Order)
        if status:
            stmt = stmt.where(Order.status == status)
            count_stmt = count_stmt.where(Order.status == status)
        if customer_id:
            stmt = stmt.where(Order.customer_id == customer_id)
            count_stmt = count_stmt.where(Order.customer_id == customer_id)
        total = self.db.scalar(count_stmt) or 0
        items = self.db.scalars(stmt.offset((page - 1) * size).limit(size)).all()
        return list(items), total

    def get(self, order_id: uuid.UUID) -> Order | None:
        return self.db.scalar(
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
        )
