// src/models/hospitalizacion.model.js
'use strict';

const { query } = require('../config/database');

async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM hospitalizacion
     WHERE usuario_rips_id = $1
     ORDER BY fecha_ini_atencion ASC`,
    [usuario_rips_id]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM hospitalizacion WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({
  usuario_rips_id,
  via_ingreso_servicio_salud,
  fecha_ini_atencion,
  fecha_fin_atencion,
  num_autorizacion,
  cod_diagnostico_principal,
  cod_diagnostico_relacionado1,
  cod_diagnostico_relacionado2,
  cod_diagnostico_relacionado3,
  tipo_dx_principal,
  causa_externa,
  cod_diagnostico_muerte,
  modalidad_grupo_serv_tec_sal,
  grupo_servicios,
  cod_prestador,
  valor_hospitalizacion,
  valor_copago_moderadora,
  valor_desc_no_pos,
  valor_neg_no_pos,
  valor_cuota_recuperacion,
  valor_comp_economicas,
  concepto_recaudo,
}) {
  const { rows } = await query(
    `INSERT INTO hospitalizacion (
       usuario_rips_id,
       via_ingreso_servicio_salud,
       fecha_ini_atencion,
       fecha_fin_atencion,
       num_autorizacion,
       cod_diagnostico_principal,
       cod_diagnostico_relacionado1,
       cod_diagnostico_relacionado2,
       cod_diagnostico_relacionado3,
       tipo_dx_principal,
       causa_externa,
       cod_diagnostico_muerte,
       modalidad_grupo_serv_tec_sal,
       grupo_servicios,
       cod_prestador,
       valor_hospitalizacion,
       valor_copago_moderadora,
       valor_desc_no_pos,
       valor_neg_no_pos,
       valor_cuota_recuperacion,
       valor_comp_economicas,
       concepto_recaudo
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
       $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22
     ) RETURNING *`,
    [
      usuario_rips_id,
      via_ingreso_servicio_salud,
      fecha_ini_atencion,
      fecha_fin_atencion             || null,
      num_autorizacion               || null,
      cod_diagnostico_principal,
      cod_diagnostico_relacionado1   || null,
      cod_diagnostico_relacionado2   || null,
      cod_diagnostico_relacionado3   || null,
      tipo_dx_principal,
      causa_externa                  || null,
      cod_diagnostico_muerte         || null,
      modalidad_grupo_serv_tec_sal,
      grupo_servicios,
      cod_prestador                  || null,
      valor_hospitalizacion          || 0,
      valor_copago_moderadora        || 0,
      valor_desc_no_pos              || 0,
      valor_neg_no_pos               || 0,
      valor_cuota_recuperacion       || 0,
      valor_comp_economicas          || 0,
      concepto_recaudo,
    ]
  );
  return rows[0];
}

async function update(id, campos) {
  const permitidos = [
    'via_ingreso_servicio_salud', 'fecha_ini_atencion', 'fecha_fin_atencion',
    'num_autorizacion', 'cod_diagnostico_principal', 'cod_diagnostico_relacionado1',
    'cod_diagnostico_relacionado2', 'cod_diagnostico_relacionado3', 'tipo_dx_principal',
    'causa_externa', 'cod_diagnostico_muerte', 'modalidad_grupo_serv_tec_sal',
    'grupo_servicios', 'cod_prestador', 'valor_hospitalizacion', 'valor_copago_moderadora',
    'valor_desc_no_pos', 'valor_neg_no_pos', 'valor_cuota_recuperacion',
    'valor_comp_economicas', 'concepto_recaudo',
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
    `UPDATE hospitalizacion SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM hospitalizacion WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };
