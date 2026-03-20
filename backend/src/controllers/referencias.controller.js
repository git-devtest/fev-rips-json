// src/controllers/referencias.controller.js
'use strict';

const { query } = require('../config/database');

// Mapa de tablas permitidas → consulta SQL
// Clave: nombre que expone la API  Valor: tabla real en BD
const TABLAS = {
  // Identificación y usuarios
  'tipos-documento':          { tabla: 'ref_tipos_documento',          pk: 'codigo' },
  'tipos-usuario':            { tabla: 'ref_tipos_usuario',            pk: 'codigo' },
  'cod-sexo':                 { tabla: 'ref_cod_sexo',                 pk: 'codigo' },
  'cod-sexo-biologico':       { tabla: 'ref_cod_sexo_biologico',       pk: 'codigo' },
  'zonas-territoriales':      { tabla: 'ref_zonas_territoriales',      pk: 'codigo' },
  'paises':                   { tabla: 'ref_paises',                   pk: 'codigo' },
  'departamentos':            { tabla: 'ref_departamentos',            pk: 'codigo' },
  'incapacidad':              { tabla: 'ref_tipos_incapacidad',        pk: 'codigo' },

  // Municipios (soporta filtro por departamento)
  'municipios':               { tabla: 'ref_municipios',               pk: 'codigo', filtro: 'cod_departamento' },

  // Atención
  'modalidades':              { tabla: 'ref_modalidades',              pk: 'codigo' },
  'grupos-servicio':          { tabla: 'ref_grupos_servicio',          pk: 'codigo' },
  'vias-ingreso':             { tabla: 'ref_vias_ingreso',             pk: 'codigo' },
  'conceptos-recaudo':        { tabla: 'ref_conceptos_recaudo',        pk: 'codigo' },
  'tipos-diagnostico':        { tabla: 'ref_tipos_diagnostico',        pk: 'codigo' },
  'causa-motivo-cons-ext':    { tabla: 'ref_causa_motivo_cons_ext',    pk: 'codigo' },
  'causa-motivo-urg-proc':    { tabla: 'ref_causa_motivo_urg_proc',    pk: 'codigo' },
  'finalidad-tecnologia':     { tabla: 'ref_finalidad_tecnologia_salud', pk: 'codigo' },
  'cod-servicio':             { tabla: 'ref_cod_servicio',             pk: 'codigo' },
  'condicion-egreso':         { tabla: 'ref_condicion_egreso',         pk: 'codigo' },

  // Facturación
  'tipos-nota':               { tabla: 'ref_tipo_nota',                pk: 'codigo' },

  // Medicamentos y otros servicios
  'tipos-medicamento':        { tabla: 'ref_tipos_medicamento',        pk: 'codigo' },
  'formas-farmaceuticas':     { tabla: 'ref_formas_farmaceuticas',     pk: 'codigo' },
  'unidades-medida':          { tabla: 'ref_unidad_medida',            pk: 'codigo' },
  'unidades-min-dispensa':    { tabla: 'ref_unidad_min_dispensa',      pk: 'codigo' },
  'tipos-os':                 { tabla: 'ref_tipo_os',                  pk: 'codigo' },

  // Catálogos clínicos
  'cups':                     { tabla: 'cups',   pk: 'codigo', busqueda: true },
  'cie10':                    { tabla: 'cie10',  pk: 'codigo', busqueda: true },
};

/**
 * GET /api/v1/ref
 * Lista todas las tablas de referencia disponibles.
 */
async function listar(req, res) {
  res.json({ tablas: Object.keys(TABLAS) });
}

/**
 * GET /api/v1/ref/:tabla
 * Retorna todos los registros de una tabla de referencia.
 *
 * Query params:
 *   - q          búsqueda por descripción (solo tablas con busqueda: true)
 *   - departamento  filtro para municipios
 *   - limit      número máximo de resultados (default 50 para búsquedas, sin límite para el resto)
 */
async function obtener(req, res, next) {
  try {
    const def = TABLAS[req.params.tabla];
    if (!def) {
      return res.status(404).json({
        error: `Tabla '${req.params.tabla}' no encontrada`,
        disponibles: Object.keys(TABLAS),
      });
    }

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    // Filtro por departamento (municipios)
    if (def.filtro && req.query[def.filtro.replace('cod_', '')]) {
      conditions.push(`${def.filtro} = $${idx++}`);
      params.push(req.query[def.filtro.replace('cod_', '')]);
    }

    // Búsqueda full-text (CUPS y CIE-10)
    if (def.busqueda && req.query.q) {
      const term = req.query.q.trim();
      // Busca por código exacto primero, luego por descripción
      conditions.push(`(codigo ILIKE $${idx++} OR descripcion ILIKE $${idx++})`);
      params.push(`${term}%`);
      params.push(`%${term}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = def.busqueda
      ? `LIMIT ${Math.min(parseInt(req.query.limit) || 50, 200)}`
      : '';

    const { rows } = await query(
      `SELECT * FROM ${def.tabla} ${where} ORDER BY ${def.pk} ASC ${limit}`,
      params
    );

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener };
