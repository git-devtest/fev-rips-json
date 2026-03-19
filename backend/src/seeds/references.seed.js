// src/seeds/references.seed.js
// Datos fijos según Resolución 2275 de 2023 y Anexo Técnico SISPRO
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool, testConnection } = require('../config/database');

const seeds = [
  {
    table: 'ref_tipos_documento',
    rows: [
      ['RC', 'Registro civil'],
      ['TI', 'Tarjeta de identidad'],
      ['CC', 'Cédula de ciudadanía'],
      ['CE', 'Cédula de extranjería'],
      ['PA', 'Pasaporte'],
      ['MS', 'Menor sin identificación'],
      ['AS', 'Adulto sin identificación'],
      ['PE', 'Permiso especial de permanencia'],
      ['PT', 'Permiso por protección temporal'],
      ['SC', 'Salvoconducto'],
      ['CN', 'Certificado de nacido vivo'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_tipos_usuario',
    rows: [
      ['01', 'Contributivo - cotizante'],
      ['02', 'Contributivo - beneficiario'],
      ['03', 'Subsidiado'],
      ['04', 'Vinculado / pobre no asegurado'],
      ['05', 'Particular'],
      ['06', 'Otro'],
      ['07', 'Desplazado contributivo'],
      ['08', 'Desplazado subsidiado'],
      ['09', 'Desplazado no asegurado'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_modalidades',
    rows: [
      ['01', 'Atención ambulatoria'],
      ['02', 'Atención domiciliaria'],
      ['03', 'Atención de urgencias'],
      ['04', 'Hospitalización'],
      ['05', 'Recién nacido'],
      ['06', 'Telemedicina interactiva'],
      ['07', 'Telemedicina no interactiva'],
      ['08', 'Telemedicina telexperticia'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_grupos_servicio',
    rows: [
      ['01', 'Consultas'],
      ['02', 'Procedimientos'],
      ['03', 'Urgencias'],
      ['04', 'Hospitalización'],
      ['05', 'Recién nacidos'],
      ['06', 'Medicamentos'],
      ['07', 'Otros servicios'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_conceptos_recaudo',
    rows: [
      ['01', 'Copago'],
      ['02', 'Cuota moderadora'],
      ['03', 'Cuota de recuperación'],
      ['04', 'Pago de bolsillo'],
      ['05', 'Régimen ordinario'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_zonas_territoriales',
    rows: [
      ['01', 'Cabecera municipal / zona urbana'],
      ['02', 'Centro poblado / zona rural dispersa'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_vias_ingreso',
    rows: [
      ['01', 'Urgencias'],
      ['02', 'Consulta externa programada'],
      ['03', 'Hospitalización programada'],
      ['04', 'Remisión'],
      ['05', 'Nacimiento'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_tipos_diagnostico',
    rows: [
      ['01', 'Impresión diagnóstica'],
      ['02', 'Confirmado nuevo'],
      ['03', 'Confirmado repetido'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_causas_externas',
    rows: [
      ['01', 'Accidente de trabajo'],
      ['02', 'Accidente de tránsito'],
      ['03', 'Accidente rábico'],
      ['04', 'Accidente ofídico'],
      ['05', 'Otro tipo de accidente'],
      ['06', 'Evento catastrófico / terrorismo'],
      ['07', 'Lesión por agresión'],
      ['08', 'Lesión auto-infligida'],
      ['09', 'Sospecha de maltrato físico'],
      ['10', 'Sospecha de abuso sexual'],
      ['11', 'Sospecha de violencia sexual'],
      ['12', 'Sospecha de maltrato emocional'],
      ['13', 'Enfermedad general'],
      ['14', 'Enfermedad profesional'],
      ['15', 'Otra'],
    ],
    columns: ['codigo', 'descripcion'],
  },
  {
    table: 'ref_tipos_medicamento',
    rows: [
      ['01', 'Medicamento PBS'],
      ['02', 'Medicamento no PBS con autorización'],
      ['03', 'Medicamento no PBS sin autorización'],
    ],
    columns: ['codigo', 'descripcion'],
  },
];

async function runSeeds() {
  const conn = await testConnection();
  if (!conn.ok) {
    console.error('❌  No se pudo conectar a la BD:', conn.error);
    process.exit(1);
  }
  console.log(`✅  Conectado a ${conn.database}\n`);

  for (const seed of seeds) {
    const colList = seed.columns.join(', ');
    const placeholders = seed.rows[0].map((_, i) => `$${i + 1}`).join(', ');
    let inserted = 0;

    for (const row of seed.rows) {
      try {
        const res = await pool.query(
          `INSERT INTO ${seed.table} (${colList}) VALUES (${placeholders})
           ON CONFLICT DO NOTHING`,
          row
        );
        if (res.rowCount > 0) inserted++;
      } catch (err) {
        console.error(`  ❌  ${seed.table} [${row[0]}]: ${err.message}`);
      }
    }
    console.log(`  📋  ${seed.table}: ${inserted} filas insertadas (${seed.rows.length - inserted} ya existían)`);
  }

  console.log('\n🎉  Seeds de referencia completos.');
  await pool.end();
}

runSeeds();
