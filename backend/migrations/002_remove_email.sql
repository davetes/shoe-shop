BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_username_unique'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END
$$;

ALTER TABLE users DROP COLUMN IF EXISTS email;

COMMIT;
