import uuid

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, page: int, size: int, search: str | None = None) -> tuple[list[Product], int]:
        stmt: Select[tuple[Product]] = select(Product).order_by(Product.created_at.desc())
        count_stmt = select(func.count()).select_from(Product)
        if search:
            pattern = f"%{search}%"
            predicate = or_(Product.name.ilike(pattern), Product.sku.ilike(pattern))
            stmt = stmt.where(predicate)
            count_stmt = count_stmt.where(predicate)
        total = self.db.scalar(count_stmt) or 0
        items = self.db.scalars(stmt.offset((page - 1) * size).limit(size)).all()
        return list(items), total

    def get(self, product_id: uuid.UUID) -> Product | None:
        return self.db.get(Product, product_id)

    def get_by_sku(self, sku: str) -> Product | None:
        return self.db.scalar(select(Product).where(Product.sku == sku))

    def create(self, payload: ProductCreate) -> Product:
        product = Product(**payload.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product: Product, payload: ProductUpdate) -> Product:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()

