from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import InventoryRead


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[InventoryRead]:
        products = self.db.scalars(select(Product).order_by(Product.name.asc())).all()
        return [
            InventoryRead(
                product_id=product.id,
                name=product.name,
                sku=product.sku,
                stock=product.stock_quantity,
                low_stock=product.stock_quantity < 10,
            )
            for product in products
        ]

