const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');

function getDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'testuser',
    password: process.env.PGPASSWORD || 'testpass',
    database: process.env.PGDATABASE || 'testdb'
  };
}

test('integration: INSERT + SELECT przez pg', async () => {
  const pool = new Pool(getDbConfig());

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ci_products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL
      );
    `);

    await pool.query('TRUNCATE TABLE ci_products RESTART IDENTITY');

    const insertResult = await pool.query(
      'INSERT INTO ci_products (name, price) VALUES ($1, $2) RETURNING id, name, price::float8 AS price',
      ['CI Widget', 19.99]
    );

    assert.equal(insertResult.rows[0].name, 'CI Widget');
    assert.equal(Number(insertResult.rows[0].price), 19.99);

    const selectResult = await pool.query(
      'SELECT id, name, price::float8 AS price FROM ci_products ORDER BY id ASC'
    );

    assert.equal(selectResult.rowCount, 1);
    assert.equal(selectResult.rows[0].name, 'CI Widget');
    assert.equal(Number(selectResult.rows[0].price), 19.99);
  } finally {
    await pool.query('DROP TABLE IF EXISTS ci_products');
    await pool.end();
  }
});