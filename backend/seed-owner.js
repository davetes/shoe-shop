const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

dotenv.config({ path: path.join(__dirname, '.env') });

async function seedOwner() {
  const { DATABASE_URL, OWNER_PASSWORD } = process.env;
  if (!DATABASE_URL) throw new Error('Missing required environment variable: DATABASE_URL');
  if (!OWNER_PASSWORD) throw new Error('Missing required environment variable: OWNER_PASSWORD');
  if (OWNER_PASSWORD.length < 8) throw new Error('OWNER_PASSWORD must be at least 8 characters long');

  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, username, password_hash, role, store_id)
       VALUES ('Shop Owner', 'owner', $1, 'OWNER', NULL)
       ON CONFLICT (username) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           role = 'OWNER',
           store_id = NULL
       WHERE users.role = 'OWNER'
       RETURNING username`,
      [passwordHash]
    );
    if (!result.rowCount) throw new Error('Cannot seed Owner: username "owner" is assigned to a non-Owner account');
    console.log(`Owner account configured with username ${result.rows[0].username}`);
  } finally {
    await pool.end();
  }
}

seedOwner().catch((error) => {
  console.error(`Owner seed failed: ${error.message}`);
  process.exitCode = 1;
});
