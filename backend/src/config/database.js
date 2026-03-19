// src/config/database.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'fev_rips',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // Pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Evento para loguear errores de pool sin crashear el proceso
pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente idle:', err.message);
});

/**
 * Prueba la conexión a la base de datos.
 * Retorna { ok, version, database, host, error? }
 */
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query(
      'SELECT version(), current_database() AS database, inet_server_addr() AS host'
    );
    const row = res.rows[0];
    return {
      ok: true,
      version:  row.version.split(' ').slice(0, 2).join(' '), // "PostgreSQL 16.x"
      database: row.database,
      host:     row.host || process.env.DB_HOST,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    if (client) client.release();
  }
}

/**
 * Helper para ejecutar queries con manejo de errores centralizado.
 * Uso: const { rows } = await query('SELECT ...', [param1, param2]);
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] query: ${text.substring(0, 80)} | ${duration}ms | rows: ${result.rowCount}`);
  }
  return result;
}

/**
 * Obtiene un cliente del pool para transacciones manuales.
 * Siempre usa try/finally para liberar el cliente.
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient, testConnection };
