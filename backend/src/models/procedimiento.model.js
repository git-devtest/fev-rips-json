// src/models/procedimiento.model.js
'use strict';

const { query } = require('../config/database');

/**
 * Lista procedimientos de un usuario RIPS.
 */
async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM procedimientos
     WHERE usuario_rips_id = $1
     ORDER BY fecha_ini_atencion ASC`,
    [usuario_rips_id]
  );
  return rows;
}

/**
 * Busca un procedimiento por ID.
 */
async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM procedimientos WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Crea un procedimiento asociado a un usuario RIPS.
 */
async function create({
  usuario_rips_id,
  cod_procedimiento,
  fecha_ini_atencion,
  modalidad_grupo_serv_tec_sal,
  grupo_servicios,
  cod_prestador,
  via_ingreso_servicio_salud,
  num_autorizacion,
  dx_principal,
  dx_relacionado,
  dx_complicacion,
  tipo_dx_principal,
  forma_acto_quirurgico,
  valor_procedimiento,
  valor_copago_moderadora,
  valor_desc_no_pos,
  valor_neg_no_pos,
  valor_cuota_recuperacion,
  valor_comp_economicas,
  concepto_recaudo,
  tipo_doc_id_medico,
  num_doc_id_medico,
}) {
  const { rows } = await query(
    `INSERT INTO procedimientos (
       usuario_rips_id,
       cod_procedimiento,
       fecha_ini_atencion,
       modalidad_grupo_serv_tec_sal,
       grupo_servicios,
       cod_prestador,
       via_ingreso_servicio_salud,
       num_autorizacion,
       dx_principal,
       dx_relacionado,
       dx_complicacion,
       tipo_dx_principal,
       forma_acto_quirurgico,
       valor_procedimiento,
       valor_copago_moderadora,
       valor_desc_no_pos,
       valor_neg_no_pos,
       valor_cuota_recuperacion,
       valor_comp_economicas,
       concepto_recaudo,
       tipo_doc_id_medico,
       num_doc_id_medico
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
       $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22
     ) RETURNING *`,
    [
      usuario_rips_id,
      cod_procedimiento,
      fecha_ini_atencion,
      modalidad_grupo_serv_tec_sal,
      grupo_servicios,
      cod_prestador          || null,
      via_ingreso_servicio_salud,
      num_autorizacion       || null,
      dx_principal,
      dx_relacionado         || null,
      dx_complicacion        || null,
      tipo_dx_principal,
      forma_acto_quirurgico  || null,
      valor_procedimiento    || 0,
      valor_copago_moderadora  || 0,
      valor_desc_no_pos      || 0,
      valor_neg_no_pos       || 0,
      valor_cuota_recuperacion || 0,
      valor_comp_economicas  || 0,
      concepto_recaudo,
      tipo_doc_id_medico     || null,
      num_doc_id_medico      || null,
    ]
  );
  return rows[0];
}

/**
 * Actualiza un procedimiento.
 */
async function update(id, campos) {
  const permitidos = [
    'cod_procedimiento', 'fecha_ini_atencion', 'modalidad_grupo_serv_tec_sal',
    'grupo_servicios', 'cod_prestador', 'via_ingreso_servicio_salud',
    'num_autorizacion', 'dx_principal', 'dx_relacionado', 'dx_complicacion',
    'tipo_dx_principal', 'forma_acto_quirurgico', 'valor_procedimiento',
    'valor_copago_moderadora', 'valor_desc_no_pos', 'valor_neg_no_pos',
    'valor_cuota_recuperacion', 'valor_comp_economicas', 'concepto_recaudo',
    'tipo_doc_id_medico', 'num_doc_id_medico',
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
    `UPDATE procedimientos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

/**
 * Elimina un procedimiento.
 */
async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM procedimientos WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };
