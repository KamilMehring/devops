const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const port = Number(process.env.PORT) || 3000;
const instanceId = process.env.INSTANCE_ID || process.env.HOSTNAME || 'backend';

function getPgConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL
    };
  }

  if (
    process.env.PGHOST ||
    process.env.PGPORT ||
    process.env.PGUSER ||
    process.env.PGPASSWORD ||
    process.env.PGDATABASE
  ) {
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    };
  }

  return {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  };
}

const pool = new Pool(getPgConfig());

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://cache:6379'
});

const CACHE_KEY = 'products:all';
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 30;

let cacheHits = 0;

app.use(express.json());

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0
    );
  `);
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('GET /health error:', error);
    res.status(503).json({ status: 'error' });
  }
});

app.get('/items', async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      cacheHits += 1;
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT id, name, price::float8 AS price FROM products ORDER BY id ASC'
    );

    await redis.setEx(
      CACHE_KEY,
      CACHE_TTL_SECONDS,
      JSON.stringify(result.rows)
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('GET /items error:', error);
    return res.status(500).json({
      error: 'Nie udało się pobrać produktów.'
    });
  }
});

app.post('/items', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || typeof price !== 'number' || Number.isNaN(price)) {
      return res.status(400).json({
        error: 'Pola name i price są wymagane.'
      });
    }

    const result = await pool.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id, name, price::float8 AS price',
      [name, price]
    );

    await redis.del(CACHE_KEY);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /items error:', error);
    return res.status(500).json({
      error: 'Nie udało się dodać produktu.'
    });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS total FROM products'
    );

    return res.json({
      totalProducts: result.rows[0].total,
      cache_hits: cacheHits,
      instanceId
    });
  } catch (error) {
    console.error('GET /stats error:', error);
    return res.status(500).json({
      error: 'Nie udało się pobrać statystyk.'
    });
  }
});

async function start() {
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  await redis.connect();
  await initDb();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on port ${port}; instance ${instanceId}`);
  });
}

start().catch((error) => {
  console.error('Application startup error:', error);
  process.exit(1);
});