import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.repositories.customer_repository import CustomerRepository
from app.schemas.common import Page
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def list(self, page: int, size: int) -> Page[CustomerRead]:
        items, total = self.repo.list(page, size)
        return Page(items=items, total=total, page=page, size=size)

    def get(self, customer_id: uuid.UUID):
        customer = self.repo.get(customer_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return customer

    def create(self, payload: CustomerCreate):
        if self.repo.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
        try:
            return self.repo.create(payload)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists") from exc

    def update(self, customer_id: uuid.UUID, payload: CustomerUpdate):
        customer = self.get(customer_id)
        if payload.email and payload.email != customer.email and self.repo.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
        try:
            return self.repo.update(customer, payload)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists") from exc

    def delete(self, customer_id: uuid.UUID) -> None:
        self.repo.delete(self.get(customer_id))

