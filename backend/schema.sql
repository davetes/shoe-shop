CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'CASHIER')),
  store_id INTEGER REFERENCES stores(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT cashier_must_have_store CHECK (role = 'OWNER' OR store_id IS NOT NULL),
  CONSTRAINT owner_must_not_have_store CHECK (role = 'CASHIER' OR store_id IS NULL)
);

CREATE UNIQUE INDEX users_username_lower_unique ON users (LOWER(username));

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  size VARCHAR(30) NOT NULL,
  color VARCHAR(60) NOT NULL,
  cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
  selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX products_variant_price_unique
  ON products (name, size, color, cost_price, selling_price);

CREATE TABLE inventory (
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (store_id, product_id)
);

CREATE TABLE inventory_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IMPORT', 'EXPORT', 'SALE')),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  from_store_id INTEGER REFERENCES stores(id),
  to_store_id INTEGER REFERENCES stores(id),
  sale_id BIGINT,
  performed_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT import_destination CHECK (transaction_type <> 'IMPORT' OR (to_store_id IS NOT NULL AND from_store_id IS NULL)),
  CONSTRAINT export_stores CHECK (transaction_type <> 'EXPORT' OR (to_store_id IS NOT NULL AND from_store_id IS NOT NULL AND to_store_id <> from_store_id)),
  CONSTRAINT sale_source CHECK (transaction_type <> 'SALE' OR (from_store_id IS NOT NULL AND to_store_id IS NULL))
);

CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  cashier_id UUID NOT NULL REFERENCES users(id),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'BANK_TRANSFER')),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  UNIQUE (sale_id, product_id)
);

ALTER TABLE inventory_transactions
  ADD CONSTRAINT inventory_transaction_sale_fk
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL;

CREATE INDEX inventory_transactions_created_at_idx ON inventory_transactions(created_at DESC);
CREATE INDEX sales_created_at_idx ON sales(created_at DESC);
CREATE INDEX inventory_low_stock_idx ON inventory(store_id, quantity);

INSERT INTO stores (name) VALUES ('Store 1'), ('Store 2'), ('Store 3');

INSERT INTO users (full_name, username, password_hash, role, store_id)
VALUES
  ('Cashier 1', 'cashier1', crypt('cashier123', gen_salt('bf')), 'CASHIER', 1),
  ('Cashier 2', 'cashier2', crypt('cashier123', gen_salt('bf')), 'CASHIER', 2),
  ('Cashier 3', 'cashier3', crypt('cashier123', gen_salt('bf')), 'CASHIER', 3);

INSERT INTO products (name, size, color, cost_price, selling_price)
VALUES
  ('Classic Runner', '42', 'Black', 35.00, 60.00),
  ('Street Low', '41', 'White', 40.00, 75.00),
  ('Trail Boot', '43', 'Brown', 55.00, 95.00);

INSERT INTO inventory (store_id, product_id, quantity)
SELECT stores.id, products.id, 10
FROM stores CROSS JOIN products;
