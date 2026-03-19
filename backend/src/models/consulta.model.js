// src/models/consulta.model.js
'use strict';

const { query } = require('../config/database');

/**
 * Lista consultas de un usuario RIPS.
 */
async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM consultas
     WHERE usuario_rips_id = $1
     ORDER BY fecha_ini_atencion ASC`,
    [usuario_rips_id]
  );
  return rows;
}

/**
 * Busca una consulta por ID.
 */
async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM consultas WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Crea una consulta asociada a un usuario RIPS.
 */
async function create({
  usuario_rips_id,
  cod_consulta,
  modalidad_grupo_serv_tec_sal,
  grupo_servicios,
  cod_prestador,
  fecha_ini_atencion,
  num_autorizacion,
  valor_consulta,
  valor_copago_moderadora,
  valor_desc_no_pos,
  valor_neg_no_pos,
  valor_cuota_recuperacion,
  valor_comp_economicas,
  concepto_recaudo,
  tipo_doc_id_medico,
  num_doc_id_medico,
  cod_dx_principal,
  cod_dx_relacionado1,
  cod_dx_relacionado2,
  cod_dx_relacionado3,
  tipo_dx_principal,
  finalidad_consulta,
  causa_externa,
  cod_cup_causa_externa,
  via_ingreso_servicio_salud,
}) {
  const { rows } = await query(
    `INSERT INTO consultas (
       usuario_rips_id,
       cod_consulta,
       modalidad_grupo_serv_tec_sal,
       grupo_servicios,
       cod_prestador,
       fecha_ini_atencion,
       num_autorizacion,
       valor_consulta,
       valor_copago_moderadora,
       valor_desc_no_pos,
       valor_neg_no_pos,
       valor_cuota_recuperacion,
       valor_comp_economicas,
       concepto_recaudo,
       tipo_doc_id_medico,
       num_doc_id_medico,
       cod_dx_principal,
       cod_dx_relacionado1,
       cod_dx_relacionado2,
       cod_dx_relacionado3,
       tipo_dx_principal,
       finalidad_consulta,
       causa_externa,
       cod_cup_causa_externa,
       via_ingreso_servicio_salud
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
       $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22,$23,$24,$25
     ) RETURNING *`,
    [
      usuario_rips_id,
      cod_consulta,
      modalidad_grupo_serv_tec_sal,
      grupo_servicios,
      cod_prestador        || null,
      fecha_ini_atencion,
      num_autorizacion     || null,
      valor_consulta       || 0,
      valor_copago_moderadora  || 0,
      valor_desc_no_pos    || 0,
      valor_neg_no_pos     || 0,
      valor_cuota_recuperacion || 0,
      valor_comp_economicas || 0,
      concepto_recaudo,
      tipo_doc_id_medico   || null,
      num_doc_id_medico    || null,
      cod_dx_principal,
      cod_dx_relacionado1  || null,
      cod_dx_relacionado2  || null,
      cod_dx_relacionado3  || null,
      tipo_dx_principal,
      finalidad_consulta,
      causa_externa,
      cod_cup_causa_externa || null,
      via_ingreso_servicio_salud,
    ]
  );
  return rows[0];
}

/**
 * Actualiza una consulta.
 */
async function update(id, campos) {
  const permitidos = [
    'cod_consulta', 'modalidad_grupo_serv_tec_sal', 'grupo_servicios',
    'cod_prestador', 'fecha_ini_atencion', 'num_autorizacion',
    'valor_consulta', 'valor_copago_moderadora', 'valor_desc_no_pos',
    'valor_neg_no_pos', 'valor_cuota_recuperacion', 'valor_comp_economicas',
    'concepto_recaudo', 'tipo_doc_id_medico', 'num_doc_id_medico',
    'cod_dx_principal', 'cod_dx_relacionado1', 'cod_dx_relacionado2',
    'cod_dx_relacionado3', 'tipo_dx_principal', 'finalidad_consulta',
    'causa_externa', 'cod_cup_causa_externa', 'via_ingreso_servicio_salud',
  ];

  const fields = [];
  const params = [];
  let   idx    = 1;

  for (const campo of permitidos) {
    if (campos[campo] !== undefined) {
      fields.push(`${campo} = $${idx++}`);
      params.push(campos[campo]);
    }
  }

  if (fields.length === 0) return null;
  params.push(id);

  const { rows } = await query(
    `UPDATE consultas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

/**
 * Elimina una consulta.
 */
async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM consultas WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };
