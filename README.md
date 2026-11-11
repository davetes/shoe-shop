# Shoe Shop Inventory and Sales

This is a lightweight Next.js + Express + PostgreSQL monorepo for three stores.

## Step 1: Database

Create a PostgreSQL database named `shoe_shop`, copy `backend/.env.example` to `backend/.env`, then run:

```bash
psql "$DATABASE_URL" -f backend/schema.sql
```

The seed credentials are:

- Owner: `owner@shoeshop.local` / `owner123`
- Cashiers: `cashier1@shoeshop.local`, `cashier2@shoeshop.local`, `cashier3@shoeshop.local` / `cashier123`

## Step 2: Backend

```bash
cd backend
npm install
npm run dev
```

Key endpoints are `POST /api/auth/login`, owner-only `GET/POST /api/products`, `GET/POST /api/inventory`, `GET/POST /api/sales`, and owner-only `GET /api/reports/dashboard`.

## Step 3: Frontend

Copy `frontend/.env.local.example` to `frontend/.env.local`, then:

```bash
cd frontend
npm install
npm run dev
```

The owner dashboard shows daily payment totals, cashier totals, and low-stock alerts. Cashiers can register sales from `/cashier/sales`; the backend scopes all cashier inventory and sales operations to their assigned store.

Owners can add shoes and their initial stock at `/dashboard/inventory`, or add more stock to an existing shoe and selected store at `/dashboard/import`. Once stock is added to a store, that shoe appears in the assigned cashier's sales dropdown.
