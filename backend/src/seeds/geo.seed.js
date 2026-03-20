// src/seeds/geo.seed.js
// Carga ref_paises, ref_departamentos y ref_municipios desde los CSV de SISPRO
// Uso: node src/seeds/geo.seed.js
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/database');

const PAISES_CSV    = path.resolve(__dirname, '../../data/seeds/codPais.csv');
const MUNICIPIOS_CSV = path.resolve(__dirname, '../../data/seeds/codMunicipioResidencia.csv');

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(l => l.replace(/\r/g, '').trim())
    .filter(l => l && !l.toLowerCase().startsWith('código') && !l.toLowerCase().startsWith('codigo'))
    .map(l => {
      const idx = l.indexOf(',');
      return [l.substring(0, idx).trim(), l.substring(idx + 1).trim()];
    })
    .filter(([cod]) => cod);
}

async function loadPaises() {
  if (!fs.existsSync(PAISES_CSV)) {
    console.warn(`⚠️   Archivo no encontrado: ${PAISES_CSV} — omitiendo países`);
    return;
  }
  const rows = parseCsv(PAISES_CSV);
  let inserted = 0, updated = 0;
  for (const [codigo, descripcion] of rows) {
    const res = await pool.query(
      `INSERT INTO ref_paises (codigo, descripcion) VALUES ($1, $2)
       ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion
       RETURNING (xmax = 0) AS is_insert`,
      [codigo.padStart(3, '0'), descripcion]
    );
    if (res.rows[0].is_insert) inserted++; else updated++;
  }
  console.log(`  📋  ref_paises: ${inserted} nuevos, ${updated} actualizados`);
}

async function loadMunicipios() {
  if (!fs.existsSync(MUNICIPIOS_CSV)) {
    console.warn(`⚠️   Archivo no encontrado: ${MUNICIPIOS_CSV} — omitiendo municipios`);
    return;
  }
  const rows = parseCsv(MUNICIPIOS_CSV);

  // Extraer departamentos únicos de los primeros 2 dígitos
  const deptos = new Map();
  for (const [cod] of rows) {
    const codDepto = cod.substring(0, 2);
    if (!deptos.has(codDepto)) deptos.set(codDepto, codDepto);
  }

  // Upsert departamentos
  let dInserted = 0;
  for (const [cod] of deptos) {
    const res = await pool.query(
      `INSERT INTO ref_departamentos (codigo, descripcion) VALUES ($1, $2)
       ON CONFLICT (codigo) DO NOTHING
       RETURNING (xmax = 0) AS is_insert`,
      [cod, `Departamento ${cod}`]
    );
    if (res.rows[0]?.is_insert) dInserted++;
  }
  console.log(`  📋  ref_departamentos: ${dInserted} nuevos`);

  // Upsert municipios
  let mInserted = 0, mUpdated = 0;
  for (const [codigo, descripcion] of rows) {
    const codDepto = codigo.substring(0, 2);
    const res = await pool.query(
      `INSERT INTO ref_municipios (codigo, descripcion, cod_departamento) VALUES ($1, $2, $3)
       ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion
       RETURNING (xmax = 0) AS is_insert`,
      [codigo, descripcion, codDepto]
    );
    if (res.rows[0].is_insert) mInserted++; else mUpdated++;
  }
  console.log(`  📋  ref_municipios: ${mInserted} nuevos, ${mUpdated} actualizados`);
}

async function run() {
  const conn = await testConnection();
  if (!conn.ok) { console.error('❌  BD:', conn.error); process.exit(1); }
  console.log(`✅  Conectado a ${conn.database}\n`);

  await loadPaises();
  await loadMunicipios();

  console.log('\n🎉  Seeds geográficos completos.');
  await pool.end();
}

run();
