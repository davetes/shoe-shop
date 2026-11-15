ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_name_size_color_key;

CREATE UNIQUE INDEX IF NOT EXISTS products_variant_price_unique
  ON products (name, size, color, cost_price, selling_price);
