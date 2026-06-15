import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.schemas.common import Page
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def list(self, page: int, size: int, search: str | None) -> Page[ProductRead]:
        items, total = self.repo.list(page, size, search)
        return Page(items=items, total=total, page=page, size=size)

    def get(self, product_id: uuid.UUID):
        product = self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    def create(self, payload: ProductCreate):
        if self.repo.get_by_sku(payload.sku):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
        try:
            return self.repo.create(payload)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists") from exc

    def update(self, product_id: uuid.UUID, payload: ProductUpdate):
        product = self.get(product_id)
        if payload.sku and payload.sku != product.sku and self.repo.get_by_sku(payload.sku):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
        try:
            return self.repo.update(product, payload)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists") from exc

    def delete(self, product_id: uuid.UUID) -> None:
        self.repo.delete(self.get(product_id))

