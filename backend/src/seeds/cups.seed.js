// src/seeds/cups.seed.js
// Carga masiva de CUPS desde CSV
// Formato esperado: codigo,descripcion  (con o sin encabezado)
// Uso: node src/seeds/cups.seed.js [ruta_csv]
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { pool, testConnection, getClient } = require('../config/database');

const CSV_PATH = process.argv[2]
  || path.resolve(__dirname, '../../data/cups.csv');

async function loadCups() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌  Archivo no encontrado: ${CSV_PATH}`);
    console.error('   Uso: node src/seeds/cups.seed.js <ruta_al_csv>');
    process.exit(1);
  }

  const conn = await testConnection();
  if (!conn.ok) { console.error('❌  BD:', conn.error); process.exit(1); }
  console.log(`✅  Conectado a ${conn.database}`);
  console.log(`📂  Leyendo: ${CSV_PATH}\n`);

  const rows = await parseCsv(CSV_PATH);
  if (rows.length === 0) { console.warn('⚠️   CSV vacío.'); process.exit(0); }

  const client = await getClient();
  let inserted = 0, updated = 0, errors = 0;

  try {
    await client.query('BEGIN');

    for (const row of rows) {
      const codigo      = (row[0] || '').trim().toUpperCase();
      const descripcion = (row[1] || '').trim();

      if (!codigo || !descripcion) continue;

      const res = await client.query(
        `INSERT INTO cups (codigo, descripcion)
         VALUES ($1, $2)
         ON CONFLICT (codigo)
         DO UPDATE SET descripcion = EXCLUDED.descripcion
         RETURNING (xmax = 0) AS is_insert`,
        [codigo, descripcion]
      );
      if (res.rows[0].is_insert) inserted++; else updated++;
    }

    await client.query('COMMIT');
    console.log(`✅  CUPS cargados: ${inserted} nuevos, ${updated} actualizados, ${errors} errores`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Error en transacción:', err.message);
    errors++;
  } finally {
    client.release();
    await pool.end();
  }
}

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({ skip_empty_lines: true, trim: true, bom: true }))
      .on('data', (row) => {
        // Saltar encabezado si contiene texto no numérico en col 0
        if (row[0] && isNaN(row[0].charAt(0)) && row[0].toLowerCase() === 'codigo') return;
        results.push(row);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

loadCups();
