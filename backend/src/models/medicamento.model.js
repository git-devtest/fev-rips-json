// src/models/medicamento.model.js
'use strict';

const { query } = require('../config/database');

async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM medicamentos
     WHERE usuario_rips_id = $1
     ORDER BY fecha_dispensacion ASC`,
    [usuario_rips_id]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM medicamentos WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({
  usuario_rips_id,
  fecha_dispensacion,
  num_autorizacion,
  cod_diagnostico_principal,
  tipo_medicamento,
  descripcion_medicamento,
  cod_medicamento,
  concentracion_medicamento,
  unidad_medida_medicamento,
  forma_farmaceutica,
  via_administracion_medicamento,
  numero_unidades,
  valor_unit_medicamento,
  valor_total_medicamento,
  tipo_doc_id_medico,
  num_doc_id_medico,
}) {
  const { rows } = await query(
    `INSERT INTO medicamentos (
       usuario_rips_id,
       fecha_dispensacion,
       num_autorizacion,
       cod_diagnostico_principal,
       tipo_medicamento,
       descripcion_medicamento,
       cod_medicamento,
       concentracion_medicamento,
       unidad_medida_medicamento,
       forma_farmaceutica,
       via_administracion_medicamento,
       numero_unidades,
       valor_unit_medicamento,
       valor_total_medicamento,
       tipo_doc_id_medico,
       num_doc_id_medico
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
       $11,$12,$13,$14,$15,$16
     ) RETURNING *`,
    [
      usuario_rips_id,
      fecha_dispensacion,
      num_autorizacion               || null,
      cod_diagnostico_principal,
      tipo_medicamento,
      descripcion_medicamento        || null,
      cod_medicamento                || null,
      concentracion_medicamento      || null,
      unidad_medida_medicamento      || null,
      forma_farmaceutica             || null,
      via_administracion_medicamento || null,
      numero_unidades,
      valor_unit_medicamento,
      valor_total_medicamento,
      tipo_doc_id_medico             || null,
      num_doc_id_medico              || null,
    ]
  );
  return rows[0];
}

async function update(id, campos) {
  const permitidos = [
    'fecha_dispensacion', 'num_autorizacion', 'cod_diagnostico_principal',
    'tipo_medicamento', 'descripcion_medicamento', 'cod_medicamento',
    'concentracion_medicamento', 'unidad_medida_medicamento', 'forma_farmaceutica',
    'via_administracion_medicamento', 'numero_unidades', 'valor_unit_medicamento',
    'valor_total_medicamento', 'tipo_doc_id_medico', 'num_doc_id_medico',
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
    `UPDATE medicamentos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM medicamentos WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };