BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(80);

UPDATE users
SET username = CASE LOWER(email)
  WHEN 'owner@shoeshop.local' THEN 'owner'
  WHEN 'cashier1@shoeshop.local' THEN 'cashier1'
  WHEN 'cashier2@shoeshop.local' THEN 'cashier2'
  WHEN 'cashier3@shoeshop.local' THEN 'cashier3'
  ELSE LEFT(COALESCE(NULLIF(LOWER(SPLIT_PART(email, '@', 1)), ''), 'user'), 60)
       || '_' || LEFT(REPLACE(id::text, '-', ''), 12)
END
WHERE username IS NULL;

ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique ON users (LOWER(username));

COMMIT;
