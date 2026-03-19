require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const path     = require('path');
const ExcelJS  = require('exceljs');
const { pool, testConnection, getClient } = require('../config/database');

const FILE_PATH = path.resolve(__dirname, '../../data/seeds/CIE10.xlsx');

async function loadCie10() {
  const conn = await testConnection();
  if (!conn.ok) { console.error('❌  BD:', conn.error); process.exit(1); }
  console.log(`✅  Conectado a ${conn.database}`);
  console.log(`📂  Leyendo: ${FILE_PATH}\n`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(FILE_PATH);
  const sheet = workbook.worksheets[0];

  // Detectar índices de columnas desde el encabezado (fila 1)
  const header = {};
  sheet.getRow(1).eachCell((cell, colNumber) => {
    header[cell.value?.toString().trim().toUpperCase()] = colNumber;
  });

  const colCod  = header['COD'];
  const colDesc = header['DESCRIPCION'];

  if (!colCod || !colDesc) {
    console.error('❌  No se encontraron columnas COD / DESCRIPCION en el Excel');
    process.exit(1);
  }

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezado
    const codigo      = row.getCell(colCod).value?.toString().trim();
    const descripcion = row.getCell(colDesc).value?.toString().trim();
    if (codigo && descripcion) rows.push([codigo, descripcion]);
  });

  console.log(`📊  Filas leídas: ${rows.length}`);

  const client = await getClient();
  let inserted = 0, updated = 0;

  try {
    await client.query('BEGIN');
    for (const [codigo, descripcion] of rows) {
      const res = await client.query(
        `INSERT INTO cie10 (codigo, descripcion)
         VALUES ($1, $2)
         ON CONFLICT (codigo)
         DO UPDATE SET descripcion = EXCLUDED.descripcion
         RETURNING (xmax = 0) AS is_insert`,
        [codigo, descripcion]
      );
      if (res.rows[0].is_insert) inserted++; else updated++;
    }
    await client.query('COMMIT');
    console.log(`✅  CIE-10: ${inserted} nuevos, ${updated} actualizados`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

loadCie10();