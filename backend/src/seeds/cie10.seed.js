/**
 * @module seed/cie10
 * Pobla la tabla ref_cie10 desde el archivo Excel CIE10.xlsx
 * Uso: npm run db:seed:cie10
 */

'use strict';

const path = require('path');
const XLSX = require('xlsx');
const db = require('../connection');

const EXCEL_PATH = path.join(__dirname, '../../../../data/seeds/CIE10.xlsx');

function seedCie10() {
  console.log('\n--- Seed: ref_cie10 ---');

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const registros = rows
    .map(r => ({
      codigo: String(r['COD'] ?? '').trim(),
      descripcion: String(r['DESCRIPCION'] ?? '').trim(),
    }))
    .filter(r => r.codigo && r.descripcion);

  const insert = db.prepare(`
    INSERT INTO ref_cie10 (codigo, descripcion)
    VALUES (@codigo, @descripcion)
    ON CONFLICT(codigo) DO UPDATE SET descripcion = excluded.descripcion
  `);

  const insertMany = db.transaction(items => {
    for (const item of items) insert.run(item);
  });

  insertMany(registros);
  console.log(`  ✔ ref_cie10: ${registros.length} registros`);
  console.log('✅ Seed de ref_cie10 completado.\n');
}

seedCie10();
