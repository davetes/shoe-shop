# Shoe Shop Inventory and Sales

This is a lightweight Next.js + Express + PostgreSQL monorepo for three stores.

## Step 1: Database

Create a PostgreSQL database named `shoe_shop` and copy `backend/.env.example` to `backend/.env`. Set `OWNER_USERNAME` and a private value for `OWNER_PASSWORD` in `backend/.env`; these are the Owner's login credentials.

Run the database setup script from the backend folder. It creates a fresh schema or applies the pending migrations to an existing database:

```bash
cd backend
npm install
npm run setup:db
```

The schema seeds three cashier accounts. They sign in with these usernames:

- `cashier1`, `cashier2`, and `cashier3` / `cashier123`

## Step 2: Configure the Owner account and start the backend

```bash
cd backend
npm run dev
```

Starting the backend synchronizes the Owner account from `OWNER_USERNAME` and `OWNER_PASSWORD` in `backend/.env`. You can also run `npm run seed:owner` to apply those values without starting the server. Cashiers sign in with their usernames (the seeded accounts are `cashier1`, `cashier2`, and `cashier3`). Do not use the example password placeholder in production.

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
