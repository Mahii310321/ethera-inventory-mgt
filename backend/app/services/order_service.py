import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.repositories.order_repository import OrderRepository
from app.schemas.common import Page
from app.schemas.order import OrderCreate, OrderRead


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)

    def list(self, page: int, size: int, order_status=None, customer_id: uuid.UUID | None = None) -> Page[OrderRead]:
        items, total = self.repo.list(page, size, order_status, customer_id)
        return Page(items=items, total=total, page=page, size=size)

    def get(self, order_id: uuid.UUID):
        order = self.repo.get(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        return order

    def create(self, payload: OrderCreate) -> Order:
        if not self.db.get(Customer, payload.customer_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

        requested: dict[uuid.UUID, int] = {}
        for item in payload.items:
            requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

        try:
            products = self.db.scalars(
                select(Product).where(Product.id.in_(requested.keys())).with_for_update()
            ).all()
            product_map = {product.id: product for product in products}

            missing_ids = set(requested) - set(product_map)
            if missing_ids:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

            for product_id, quantity in requested.items():
                product = product_map[product_id]
                if product.stock_quantity < quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={"error": "Insufficient stock", "product_id": str(product_id)},
                    )

            total = Decimal("0.00")
            order = Order(customer_id=payload.customer_id, total_amount=total, status=payload.status)
            self.db.add(order)
            self.db.flush()

            for product_id, quantity in requested.items():
                product = product_map[product_id]
                total += product.price * quantity
                product.stock_quantity -= quantity
                self.db.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=quantity,
                        price_at_purchase=product.price,
                    )
                )

            order.total_amount = total
            self.db.commit()
            return self._reload(order.id)
        except HTTPException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise

    def _reload(self, order_id: uuid.UUID) -> Order:
        return self.db.scalar(
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
        )

