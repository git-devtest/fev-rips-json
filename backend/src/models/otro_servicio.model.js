// src/models/otro_servicio.model.js
'use strict';

const { query } = require('../config/database');

async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM otros_servicios
     WHERE usuario_rips_id = $1
     ORDER BY fecha_suministro ASC`,
    [usuario_rips_id]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM otros_servicios WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({
  usuario_rips_id,
  cod_otro_servicio,
  fecha_suministro,
  num_autorizacion,
  cantidad_otro_servicio,
  valor_unit_otro_servicio,
  valor_total_otro_servicio,
  tipo_doc_id_medico,
  num_doc_id_medico,
}) {
  const { rows } = await query(
    `INSERT INTO otros_servicios (
       usuario_rips_id,
       cod_otro_servicio,
       fecha_suministro,
       num_autorizacion,
       cantidad_otro_servicio,
       valor_unit_otro_servicio,
       valor_total_otro_servicio,
       tipo_doc_id_medico,
       num_doc_id_medico
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      usuario_rips_id,
      cod_otro_servicio,
      fecha_suministro,
      num_autorizacion          || null,
      cantidad_otro_servicio,
      valor_unit_otro_servicio,
      valor_total_otro_servicio,
      tipo_doc_id_medico        || null,
      num_doc_id_medico         || null,
    ]
  );
  return rows[0];
}

async function update(id, campos) {
  const permitidos = [
    'cod_otro_servicio', 'fecha_suministro', 'num_autorizacion',
    'cantidad_otro_servicio', 'valor_unit_otro_servicio', 'valor_total_otro_servicio',
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
    `UPDATE otros_servicios SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM otros_servicios WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };