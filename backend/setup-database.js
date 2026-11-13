const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) throw new Error('Missing required environment variable: DATABASE_URL');

  const pool = new Pool({ connectionString: DATABASE_URL });
  let client;
  try {
    client = await pool.connect();
    const tableResult = await client.query("SELECT to_regclass('public.users') AS users_table");
    if (!tableResult.rows[0].users_table) {
      await applySchema(client);
      console.log('Fresh database schema and seed data created.');
      return;
    }

    let columns = await getUserColumns(client);
    if (!columns.has('username')) {
      if (!columns.has('email')) {
        throw new Error('Cannot migrate users: neither username nor email column exists');
      }
      await applyMigration(client, '001_add_usernames.sql');
      columns = await getUserColumns(client);
      console.log('Added usernames to existing accounts.');
    }

    if (columns.has('email')) {
      await applyMigration(client, '002_remove_email.sql');
      console.log('Removed email from existing accounts.');
    }

    console.log('Database schema is ready.');
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

async function getUserColumns(client) {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users'`
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function applySchema(client) {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function applyMigration(client, filename) {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', filename), 'utf8');
  await client.query(sql);
}

setupDatabase().catch((error) => {
  console.error(`Database setup failed: ${error.message}`);
  process.exitCode = 1;
});
