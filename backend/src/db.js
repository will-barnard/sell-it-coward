const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS consignors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      street_address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      mobile_phone TEXT,
      email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      consignor_id INTEGER NOT NULL REFERENCES consignors(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      list_price NUMERIC(10, 2),
      low_price NUMERIC(10, 2),
      sold_price NUMERIC(10, 2),
      picked_up BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE items ADD COLUMN IF NOT EXISTS fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00;

    CREATE TABLE IF NOT EXISTS payouts (
      id SERIAL PRIMARY KEY,
      consignor_id INTEGER NOT NULL REFERENCES consignors(id) ON DELETE CASCADE,
      amount NUMERIC(10, 2) NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

module.exports = { pool, migrate };
