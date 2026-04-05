const { Pool } = require('pg');

const commonPoolOptions = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Build config defensively so password is always a string when passed.
const connectionString = process.env.DATABASE_URL?.trim();
const hasConnectionString = Boolean(connectionString);

const poolConfig = hasConnectionString
  ? {
      ...commonPoolOptions,
      connectionString,
      ssl: connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    }
  : {
      ...commonPoolOptions,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'synapse_ai',
      user: process.env.DB_USER || '',
      password: String(process.env.DB_PASSWORD || ''),
    };

// Create connection pool
const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Query helper
const query = (text, params) => pool.query(text, params);

// Transaction helper
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};
