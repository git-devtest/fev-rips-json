// src/models/recien_nacido.model.js
'use strict';

const { query } = require('../config/database');

async function findByUsuario(usuario_rips_id) {
  const { rows } = await query(
    `SELECT * FROM recien_nacidos
     WHERE usuario_rips_id = $1
     ORDER BY created_at ASC`,
    [usuario_rips_id]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM recien_nacidos WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({
  usuario_rips_id,
  num_documento_id_madre,
  tipo_documento_id_madre,
  edad_gestacional,
  multiplicidad_gestacion,
  peso_al_nacer,
  cod_diagnostico_principal,
  condicion_usuario_al_egreso,
}) {
  const { rows } = await query(
    `INSERT INTO recien_nacidos (
       usuario_rips_id,
       num_documento_id_madre,
       tipo_documento_id_madre,
       edad_gestacional,
       multiplicidad_gestacion,
       peso_al_nacer,
       cod_diagnostico_principal,
       condicion_usuario_al_egreso
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      usuario_rips_id,
      num_documento_id_madre      || null,
      tipo_documento_id_madre     || null,
      edad_gestacional            || null,
      multiplicidad_gestacion     || null,
      peso_al_nacer               || null,
      cod_diagnostico_principal,
      condicion_usuario_al_egreso || null,
    ]
  );
  return rows[0];
}

async function update(id, campos) {
  const permitidos = [
    'num_documento_id_madre', 'tipo_documento_id_madre', 'edad_gestacional',
    'multiplicidad_gestacion', 'peso_al_nacer', 'cod_diagnostico_principal',
    'condicion_usuario_al_egreso',
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
    `UPDATE recien_nacidos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM recien_nacidos WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByUsuario, findById, create, update, remove };