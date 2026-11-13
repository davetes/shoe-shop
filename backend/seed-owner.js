const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

dotenv.config({ path: path.join(__dirname, '.env') });

async function seedOwner() {
  const { DATABASE_URL, OWNER_PASSWORD } = process.env;
  const OWNER_USERNAME = String(process.env.OWNER_USERNAME || '').trim().toLowerCase();
  if (!DATABASE_URL) throw new Error('Missing required environment variable: DATABASE_URL');
  if (!OWNER_USERNAME) throw new Error('Missing required environment variable: OWNER_USERNAME');
  if (!/^[a-z0-9._-]{3,40}$/.test(OWNER_USERNAME)) throw new Error('OWNER_USERNAME must be 3-40 characters and use letters, numbers, dots, underscores, or hyphens');
  if (!OWNER_PASSWORD) throw new Error('Missing required environment variable: OWNER_PASSWORD');
  if (OWNER_PASSWORD.length < 8) throw new Error('OWNER_PASSWORD must be at least 8 characters long');

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
    await client.query('BEGIN');
    const existingOwner = await client.query(
      `SELECT id FROM users
       WHERE role = 'OWNER'
       ORDER BY created_at
       LIMIT 1
       FOR UPDATE`
    );
    const result = existingOwner.rowCount
      ? await client.query(
        `UPDATE users
         SET full_name = 'Shop Owner', username = $1, password_hash = $2, store_id = NULL
         WHERE id = $3
         RETURNING username`,
        [OWNER_USERNAME, passwordHash, existingOwner.rows[0].id]
      )
      : await client.query(
        `INSERT INTO users (full_name, username, password_hash, role, store_id)
         VALUES ('Shop Owner', $1, $2, 'OWNER', NULL)
         RETURNING username`,
        [OWNER_USERNAME, passwordHash]
      );
    await client.query('COMMIT');
    console.log(`Owner account configured with username ${result.rows[0].username}`);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new Error('OWNER_USERNAME is already used by another account');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedOwner().catch((error) => {
  console.error(`Owner seed failed: ${error.message}`);
  process.exitCode = 1;
});
