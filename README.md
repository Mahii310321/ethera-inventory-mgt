# Inventory & Order Management System

Production-ready full-stack inventory and order management app built with FastAPI, SQLAlchemy, PostgreSQL, Alembic, React, Vite, Axios, Docker, and Docker Compose.

## Architecture

- `backend/app/models`: SQLAlchemy ORM models and database constraints.
- `backend/app/schemas`: Pydantic request and response validation.
- `backend/app/repositories`: database access and pagination queries.
- `backend/app/services`: business rules, including atomic order placement and inventory reduction.
- `backend/app/routers`: FastAPI route handlers.
- `backend/alembic`: PostgreSQL schema migrations.
- `frontend/src/pages`: routed React screens for dashboard, products, customers, orders, and inventory.
- `frontend/src/api`: Axios client and API resource wrappers.

## Docker Run

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

The backend container runs `alembic upgrade head` before starting the API.

## Local Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Set `DATABASE_URL` in `backend/.env` to your PostgreSQL database.

## Local Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to the backend URL.

## API

Products:

- `GET /products?page=1&size=20&search=laptop`
- `GET /products/{id}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Customers:

- `GET /customers?page=1&size=20`
- `GET /customers/{id}`
- `POST /customers`
- `PUT /customers/{id}`
- `DELETE /customers/{id}`

Orders:

- `GET /orders?page=1&size=20&status=PENDING`
- `GET /orders/{id}`
- `POST /orders`

Inventory:

- `GET /inventory`

## Order Transaction Rules

`POST /orders` validates that the customer exists, every product exists, quantities are positive, and stock is available. Product rows are selected with `FOR UPDATE`, order rows and order items are created, inventory is reduced, and the database transaction is committed only after every step succeeds. If any step fails, the service rolls back the transaction.

Example insufficient stock response:

```json
{
  "detail": {
    "error": "Insufficient stock",
    "product_id": "..."
  }
}
```

## Deployment Notes

Render backend:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: `DATABASE_URL`, `CORS_ORIGINS`

Vercel frontend:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `VITE_API_URL`
