// src/models/usuario.model.js
'use strict';

const { query, getClient } = require('../config/database');

/**
 * Lista usuarios de una factura.
 */
async function findByFactura(factura_id) {
  const { rows } = await query(
    `SELECT
       u.*,
       (SELECT COUNT(*)::int FROM consultas    WHERE usuario_rips_id = u.id) AS total_consultas,
       (SELECT COUNT(*)::int FROM procedimientos WHERE usuario_rips_id = u.id) AS total_procedimientos
     FROM usuarios_rips u
     WHERE u.factura_id = $1
     ORDER BY u.created_at ASC`,
    [factura_id]
  );
  return rows;
}

/**
 * Busca un usuario por ID.
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT u.*
     FROM usuarios_rips u
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Busca un usuario por factura + num_documento (unicidad de negocio).
 * Según Resolución 2275: la clave es numDocumentoIdentificacion + numFactura.
 */
async function findByDocumentoEnFactura(factura_id, num_documento_identificacion) {
  const { rows } = await query(
    `SELECT * FROM usuarios_rips
     WHERE factura_id = $1 AND num_documento_identificacion = $2`,
    [factura_id, num_documento_identificacion]
  );
  return rows[0] || null;
}

/**
 * Crea un usuario RIPS asociado a una factura.
 */
async function create({
  factura_id,
  tipo_documento_identificacion,
  num_documento_identificacion,
  tipo_usuario,
  fecha_nacimiento,
  cod_pais_residencia,
  cod_municipio_residencia,
  cod_zona_territorial_residencia,
  incapacidad,
  consecutivo_usuario,
}) {
  const { rows } = await query(
    `INSERT INTO usuarios_rips (
       factura_id,
       tipo_documento_identificacion,
       num_documento_identificacion,
       tipo_usuario,
       fecha_nacimiento,
       cod_pais_residencia,
       cod_municipio_residencia,
       cod_zona_territorial_residencia,
       incapacidad,
       consecutivo_usuario
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      factura_id,
      tipo_documento_identificacion,
      num_documento_identificacion,
      tipo_usuario,
      fecha_nacimiento       || null,
      cod_pais_residencia    || '170',  // Colombia por defecto
      cod_municipio_residencia || null,
      cod_zona_territorial_residencia,
      incapacidad            || null,
      consecutivo_usuario    || null,
    ]
  );
  return rows[0];
}

/**
 * Actualiza un usuario (solo campos editables).
 */
async function update(id, campos) {
  const permitidos = [
    'tipo_usuario',
    'fecha_nacimiento',
    'cod_pais_residencia',
    'cod_municipio_residencia',
    'cod_zona_territorial_residencia',
    'incapacidad',
    'consecutivo_usuario',
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
    `UPDATE usuarios_rips SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

/**
 * Elimina un usuario y sus servicios en cascada.
 */
async function remove(id) {
  const { rowCount } = await query(
    'DELETE FROM usuarios_rips WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByFactura, findById, findByDocumentoEnFactura, create, update, remove };
