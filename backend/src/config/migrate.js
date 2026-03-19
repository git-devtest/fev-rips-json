// src/config/migrate.js
require('dotenv').config();
const { pool, testConnection } = require('./database');

// ─────────────────────────────────────────────
// DDL - Orden importa por foreign keys
// ─────────────────────────────────────────────
const migrations = [
  // ── 1. TABLAS DE REFERENCIA ─────────────────
  {
    name: '001_ref_tipos_documento',
    up: `
      CREATE TABLE IF NOT EXISTS ref_tipos_documento (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '002_ref_tipos_usuario',
    up: `
      CREATE TABLE IF NOT EXISTS ref_tipos_usuario (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '003_ref_modalidades',
    up: `
      CREATE TABLE IF NOT EXISTS ref_modalidades (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '004_ref_grupos_servicio',
    up: `
      CREATE TABLE IF NOT EXISTS ref_grupos_servicio (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '005_ref_conceptos_recaudo',
    up: `
      CREATE TABLE IF NOT EXISTS ref_conceptos_recaudo (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '006_ref_cobertura_plan',
    up: `
      CREATE TABLE IF NOT EXISTS ref_cobertura_plan (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '007_ref_zonas_territoriales',
    up: `
      CREATE TABLE IF NOT EXISTS ref_zonas_territoriales (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '008_ref_vias_ingreso',
    up: `
      CREATE TABLE IF NOT EXISTS ref_vias_ingreso (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '009_ref_tipos_diagnostico',
    up: `
      CREATE TABLE IF NOT EXISTS ref_tipos_diagnostico (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '010_ref_causas_externas',
    up: `
      CREATE TABLE IF NOT EXISTS ref_causas_externas (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '011_ref_tipos_incapacidad',
    up: `
      CREATE TABLE IF NOT EXISTS ref_tipos_incapacidad (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(200) NOT NULL
      );
    `,
  },
  {
    name: '012_ref_departamentos',
    up: `
      CREATE TABLE IF NOT EXISTS ref_departamentos (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '013_ref_municipios',
    up: `
      CREATE TABLE IF NOT EXISTS ref_municipios (
        codigo           VARCHAR(5)   PRIMARY KEY,
        descripcion      VARCHAR(150) NOT NULL,
        cod_departamento VARCHAR(2)   NOT NULL REFERENCES ref_departamentos(codigo)
      );
    `,
  },
  {
    name: '014_cups',
    up: `
      CREATE TABLE IF NOT EXISTS cups (
        codigo      VARCHAR(10)  PRIMARY KEY,
        descripcion VARCHAR(500) NOT NULL,
        activo      BOOLEAN      NOT NULL DEFAULT true
      );
      CREATE INDEX IF NOT EXISTS idx_cups_desc ON cups USING gin(to_tsvector('spanish', descripcion));
    `,
  },
  {
    name: '015_cie10',
    up: `
      CREATE TABLE IF NOT EXISTS cie10 (
        codigo      VARCHAR(10)  PRIMARY KEY,
        descripcion VARCHAR(500) NOT NULL,
        activo      BOOLEAN      NOT NULL DEFAULT true
      );
      CREATE INDEX IF NOT EXISTS idx_cie10_desc ON cie10 USING gin(to_tsvector('spanish', descripcion));
    `,
  },
  {
    name: '016_ref_tipos_medicamento',
    up: `
      CREATE TABLE IF NOT EXISTS ref_tipos_medicamento (
        codigo      VARCHAR(2)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '017_ref_formas_farmaceuticas',
    up: `
      CREATE TABLE IF NOT EXISTS ref_formas_farmaceuticas (
        codigo      VARCHAR(4)   PRIMARY KEY,
        descripcion VARCHAR(150) NOT NULL
      );
    `,
  },
  {
    name: '018_ref_unidades_medida',
    up: `
      CREATE TABLE IF NOT EXISTS ref_unidades_medida (
        codigo      VARCHAR(4)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },
  {
    name: '019_ref_vias_administracion',
    up: `
      CREATE TABLE IF NOT EXISTS ref_vias_administracion (
        codigo      VARCHAR(4)   PRIMARY KEY,
        descripcion VARCHAR(100) NOT NULL
      );
    `,
  },

  // ── 2. TABLAS DE NEGOCIO ─────────────────────
  {
    name: '020_prestadores',
    up: `
      CREATE TABLE IF NOT EXISTS prestadores (
        id                       SERIAL       PRIMARY KEY,
        num_documento_id_obligado VARCHAR(12)  NOT NULL UNIQUE,
        razon_social             VARCHAR(200),
        tipo_documento           VARCHAR(2),
        activo                   BOOLEAN      NOT NULL DEFAULT true,
        created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '021_facturas',
    up: `
      CREATE TABLE IF NOT EXISTS facturas (
        id                       SERIAL       PRIMARY KEY,
        prestador_id             INTEGER      NOT NULL REFERENCES prestadores(id),
        num_factura              VARCHAR(20)  NOT NULL,
        tipo_nota                VARCHAR(2),
        num_nota                 VARCHAR(20),
        fecha_expedicion         DATE         NOT NULL,
        estado                   VARCHAR(20)  NOT NULL DEFAULT 'borrador'
                                   CHECK (estado IN ('borrador','validada','enviada','rechazada')),
        rips_json                JSONB,
        created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (prestador_id, num_factura)
      );
      CREATE INDEX IF NOT EXISTS idx_facturas_prestador ON facturas(prestador_id);
      CREATE INDEX IF NOT EXISTS idx_facturas_estado    ON facturas(estado);
    `,
  },
  {
    name: '022_usuarios_rips',
    up: `
      CREATE TABLE IF NOT EXISTS usuarios_rips (
        id                              SERIAL       PRIMARY KEY,
        factura_id                      INTEGER      NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
        tipo_documento_identificacion   VARCHAR(2)   NOT NULL,
        num_documento_identificacion    VARCHAR(20)  NOT NULL,
        tipo_usuario                    VARCHAR(2)   NOT NULL,
        fecha_nacimiento                DATE,
        cod_pais_residencia             VARCHAR(3),
        cod_municipio_residencia        VARCHAR(5),
        cod_zona_territorial_residencia VARCHAR(2)   NOT NULL,
        incapacidad                     VARCHAR(2),
        consecutivo_usuario             INTEGER,
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_usuarios_factura ON usuarios_rips(factura_id);
    `,
  },
  {
    name: '023_consultas',
    up: `
      CREATE TABLE IF NOT EXISTS consultas (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        cod_consulta                    VARCHAR(10)  NOT NULL,
        modalidad_grupo_serv_tec_sal    VARCHAR(2)   NOT NULL,
        grupo_servicios                 VARCHAR(2)   NOT NULL,
        cod_prestador                   VARCHAR(12),
        fecha_ini_atencion              TIMESTAMPTZ  NOT NULL,
        num_autorizacion                VARCHAR(30),
        valor_consulta                  NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_copago_moderadora         NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_desc_no_pos               NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_neg_no_pos                NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_cuota_recuperacion        NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_comp_economicas           NUMERIC(15,2) NOT NULL DEFAULT 0,
        concepto_recaudo                VARCHAR(2)   NOT NULL,
        tipo_doc_id_medico              VARCHAR(2),
        num_doc_id_medico               VARCHAR(20),
        cod_dx_principal                VARCHAR(10)  NOT NULL,
        cod_dx_relacionado1             VARCHAR(10),
        cod_dx_relacionado2             VARCHAR(10),
        cod_dx_relacionado3             VARCHAR(10),
        tipo_dx_principal               VARCHAR(2)   NOT NULL,
        finalidad_consulta              VARCHAR(2)   NOT NULL,
        causa_externa                   VARCHAR(2)   NOT NULL,
        cod_cup_causa_externa           VARCHAR(10),
        via_ingreso_servicio_salud      VARCHAR(2)   NOT NULL,
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_consultas_usuario ON consultas(usuario_rips_id);
    `,
  },
  {
    name: '024_procedimientos',
    up: `
      CREATE TABLE IF NOT EXISTS procedimientos (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        cod_procedimiento               VARCHAR(10)  NOT NULL,
        fecha_ini_atencion              TIMESTAMPTZ  NOT NULL,
        modalidad_grupo_serv_tec_sal    VARCHAR(2)   NOT NULL,
        grupo_servicios                 VARCHAR(2)   NOT NULL,
        cod_prestador                   VARCHAR(12),
        via_ingreso_servicio_salud      VARCHAR(2)   NOT NULL,
        num_autorizacion                VARCHAR(30),
        dx_principal                    VARCHAR(10)  NOT NULL,
        dx_relacionado                  VARCHAR(10),
        dx_complicacion                 VARCHAR(10),
        tipo_dx_principal               VARCHAR(2)   NOT NULL,
        forma_acto_quirurgico           VARCHAR(2),
        valor_procedimiento             NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_copago_moderadora         NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_desc_no_pos               NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_neg_no_pos                NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_cuota_recuperacion        NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_comp_economicas           NUMERIC(15,2) NOT NULL DEFAULT 0,
        concepto_recaudo                VARCHAR(2)   NOT NULL,
        tipo_doc_id_medico              VARCHAR(2),
        num_doc_id_medico               VARCHAR(20),
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_procedimientos_usuario ON procedimientos(usuario_rips_id);
    `,
  },
  {
    name: '025_urgencias',
    up: `
      CREATE TABLE IF NOT EXISTS urgencias (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        fecha_ini_atencion              TIMESTAMPTZ  NOT NULL,
        fecha_fin_atencion              TIMESTAMPTZ,
        cod_diagnostico_principal       VARCHAR(10)  NOT NULL,
        cod_diagnostico_relacionado1    VARCHAR(10),
        cod_diagnostico_relacionado2    VARCHAR(10),
        cod_diagnostico_relacionado3    VARCHAR(10),
        tipo_dx_principal               VARCHAR(2)   NOT NULL,
        causa_externa                   VARCHAR(2),
        via_ingreso_servicio_salud      VARCHAR(2)   NOT NULL,
        modalidad_grupo_serv_tec_sal    VARCHAR(2)   NOT NULL,
        grupo_servicios                 VARCHAR(2)   NOT NULL,
        cod_prestador                   VARCHAR(12),
        num_autorizacion                VARCHAR(30),
        valor_urgencia                  NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_copago_moderadora         NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_desc_no_pos               NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_neg_no_pos                NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_cuota_recuperacion        NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_comp_economicas           NUMERIC(15,2) NOT NULL DEFAULT 0,
        concepto_recaudo                VARCHAR(2)   NOT NULL,
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '026_hospitalizacion',
    up: `
      CREATE TABLE IF NOT EXISTS hospitalizacion (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        via_ingreso_servicio_salud      VARCHAR(2)   NOT NULL,
        fecha_ini_atencion              TIMESTAMPTZ  NOT NULL,
        fecha_fin_atencion              TIMESTAMPTZ,
        num_autorizacion                VARCHAR(30),
        cod_diagnostico_principal       VARCHAR(10)  NOT NULL,
        cod_diagnostico_relacionado1    VARCHAR(10),
        cod_diagnostico_relacionado2    VARCHAR(10),
        cod_diagnostico_relacionado3    VARCHAR(10),
        tipo_dx_principal               VARCHAR(2)   NOT NULL,
        causa_externa                   VARCHAR(2),
        cod_diagnostico_muerte          VARCHAR(10),
        modalidad_grupo_serv_tec_sal    VARCHAR(2)   NOT NULL,
        grupo_servicios                 VARCHAR(2)   NOT NULL,
        cod_prestador                   VARCHAR(12),
        valor_hospitalizacion           NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_copago_moderadora         NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_desc_no_pos               NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_neg_no_pos                NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_cuota_recuperacion        NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_comp_economicas           NUMERIC(15,2) NOT NULL DEFAULT 0,
        concepto_recaudo                VARCHAR(2)   NOT NULL,
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '027_recien_nacidos',
    up: `
      CREATE TABLE IF NOT EXISTS recien_nacidos (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        num_documento_id_madre          VARCHAR(20),
        tipo_documento_id_madre         VARCHAR(2),
        edad_gestacional                INTEGER,
        multiplicidad_gestacion         VARCHAR(2),
        peso_al_nacer                   INTEGER,
        cod_diagnostico_principal       VARCHAR(10)  NOT NULL,
        condicion_usuario_al_egreso     VARCHAR(2),
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '028_medicamentos',
    up: `
      CREATE TABLE IF NOT EXISTS medicamentos (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        fecha_dispensacion              DATE         NOT NULL,
        num_autorizacion                VARCHAR(30),
        cod_diagnostico_principal       VARCHAR(10)  NOT NULL,
        tipo_medicamento                VARCHAR(2)   NOT NULL,
        descripcion_medicamento         VARCHAR(300),
        cod_medicamento                 VARCHAR(20),
        concentracion_medicamento       VARCHAR(100),
        unidad_medida_medicamento       VARCHAR(4),
        forma_farmaceutica              VARCHAR(4),
        via_administracion_medicamento  VARCHAR(4),
        numero_unidades                 NUMERIC(10,2) NOT NULL DEFAULT 0,
        valor_unit_medicamento          NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_total_medicamento         NUMERIC(15,2) NOT NULL DEFAULT 0,
        tipo_doc_id_medico              VARCHAR(2),
        num_doc_id_medico               VARCHAR(20),
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '029_otros_servicios',
    up: `
      CREATE TABLE IF NOT EXISTS otros_servicios (
        id                              SERIAL       PRIMARY KEY,
        usuario_rips_id                 INTEGER      NOT NULL REFERENCES usuarios_rips(id) ON DELETE CASCADE,
        cod_otro_servicio               VARCHAR(10)  NOT NULL,
        fecha_suministro                DATE         NOT NULL,
        num_autorizacion                VARCHAR(30),
        cantidad_otro_servicio          NUMERIC(10,2) NOT NULL DEFAULT 0,
        valor_unit_otro_servicio        NUMERIC(15,2) NOT NULL DEFAULT 0,
        valor_total_otro_servicio       NUMERIC(15,2) NOT NULL DEFAULT 0,
        tipo_doc_id_medico              VARCHAR(2),
        num_doc_id_medico               VARCHAR(20),
        created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `,
  },
  // ── 3. TABLA DE AUDITORÍA ────────────────────
  {
    name: '030_rips_log',
    up: `
      CREATE TABLE IF NOT EXISTS rips_log (
        id            SERIAL      PRIMARY KEY,
        factura_id    INTEGER     REFERENCES facturas(id),
        accion        VARCHAR(50) NOT NULL,
        resultado     VARCHAR(20) NOT NULL, -- 'ok' | 'error'
        detalle       JSONB,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  // ── 4. TABLA DE MIGRACIONES ──────────────────
  {
    name: '000_migrations_table',
    up: `
      CREATE TABLE IF NOT EXISTS _migrations (
        name       VARCHAR(200) PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
];

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────
async function runMigrations() {
  const conn = await testConnection();
  if (!conn.ok) {
    console.error('❌  No se pudo conectar a la BD:', conn.error);
    process.exit(1);
  }
  console.log(`✅  Conectado a ${conn.database} (${conn.version})`);

  // Asegurar tabla de migraciones primero
  const initMig = migrations.find(m => m.name === '000_migrations_table');
  await pool.query(initMig.up);

  let applied = 0;
  for (const mig of migrations) {
    if (mig.name === '000_migrations_table') continue;

    const { rowCount } = await pool.query(
      'SELECT 1 FROM _migrations WHERE name = $1', [mig.name]
    );
    if (rowCount > 0) {
      process.stdout.write(`  ⏭  ${mig.name}\n`);
      continue;
    }

    try {
      await pool.query(mig.up);
      await pool.query('INSERT INTO _migrations(name) VALUES($1)', [mig.name]);
      console.log(`  ✅  ${mig.name}`);
      applied++;
    } catch (err) {
      console.error(`  ❌  ${mig.name}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n🎉  Migraciones completas. Nuevas: ${applied}`);
  await pool.end();
}

runMigrations();
