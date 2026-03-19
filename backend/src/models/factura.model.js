// src/models/factura.model.js
'use strict';

const { query, getClient } = require('../config/database');

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * Lista facturas con paginación y filtros opcionales.
 * @param {object} opts - { prestador_id, estado, page, limit }
 */
async function findAll({ prestador_id, estado, page = 1, limit = 20 } = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (prestador_id) { conditions.push(`f.prestador_id = $${idx++}`); params.push(prestador_id); }
  if (estado)       { conditions.push(`f.estado = $${idx++}`);       params.push(estado); }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query(
      `SELECT
         f.id,
         f.num_factura,
         f.tipo_nota,
         f.num_nota,
         f.fecha_expedicion,
         f.estado,
         f.prestador_id,
         p.num_documento_id_obligado,
         p.razon_social,
         f.created_at,
         f.updated_at
       FROM facturas f
       JOIN prestadores p ON p.id = f.prestador_id
       ${where}
       ORDER BY f.fecha_expedicion DESC, f.id DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(
      `SELECT COUNT(*) AS total FROM facturas f ${where}`,
      params
    ),
  ]);

  return {
    data:  data.rows,
    total: parseInt(total.rows[0].total),
    page:  parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total.rows[0].total / limit),
  };
}

/**
 * Busca una factura por ID, incluyendo conteo de usuarios.
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT
       f.*,
       p.num_documento_id_obligado,
       p.razon_social,
       COUNT(u.id)::int AS total_usuarios
     FROM facturas f
     JOIN prestadores p ON p.id = f.prestador_id
     LEFT JOIN usuarios_rips u ON u.factura_id = f.id
     WHERE f.id = $1
     GROUP BY f.id, p.id`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Busca por prestador_id + num_factura (unicidad de negocio).
 */
async function findByNumFactura(prestador_id, num_factura) {
  const { rows } = await query(
    `SELECT * FROM facturas WHERE prestador_id = $1 AND num_factura = $2`,
    [prestador_id, num_factura]
  );
  return rows[0] || null;
}

/**
 * Crea un prestador si no existe (upsert por num_documento_id_obligado).
 * Retorna el prestador_id.
 */
async function upsertPrestador(client, { num_documento_id_obligado, razon_social }) {
  const { rows } = await client.query(
    `INSERT INTO prestadores (num_documento_id_obligado, razon_social)
     VALUES ($1, $2)
     ON CONFLICT (num_documento_id_obligado)
     DO UPDATE SET razon_social = EXCLUDED.razon_social, updated_at = NOW()
     RETURNING id`,
    [num_documento_id_obligado, razon_social || null]
  );
  return rows[0].id;
}

/**
 * Crea una factura. Hace upsert del prestador en la misma transacción.
 */
async function create({ num_documento_id_obligado, razon_social, num_factura, tipo_nota, num_nota, fecha_expedicion }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const prestador_id = await upsertPrestador(client, { num_documento_id_obligado, razon_social });

    const { rows } = await client.query(
      `INSERT INTO facturas (prestador_id, num_factura, tipo_nota, num_nota, fecha_expedicion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [prestador_id, num_factura, tipo_nota || null, num_nota || null, fecha_expedicion]
    );

    await client.query('COMMIT');
    return { ...rows[0], num_documento_id_obligado, razon_social };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Actualiza campos editables de una factura (solo en estado 'borrador').
 */
async function update(id, { tipo_nota, num_nota, fecha_expedicion, estado }) {
  const fields = [];
  const params = [];
  let   idx    = 1;

  if (tipo_nota       !== undefined) { fields.push(`tipo_nota = $${idx++}`);       params.push(tipo_nota); }
  if (num_nota        !== undefined) { fields.push(`num_nota = $${idx++}`);        params.push(num_nota); }
  if (fecha_expedicion !== undefined) { fields.push(`fecha_expedicion = $${idx++}`); params.push(fecha_expedicion); }
  if (estado          !== undefined) { fields.push(`estado = $${idx++}`);          params.push(estado); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const { rows } = await query(
    `UPDATE facturas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

/**
 * Elimina una factura (solo si está en estado 'borrador').
 */
async function remove(id) {
  const { rowCount } = await query(
    `DELETE FROM facturas WHERE id = $1 AND estado = 'borrador'`,
    [id]
  );
  return rowCount > 0;
}

/**
 * Guarda el JSON RIPS generado en la factura.
 */
async function saveRipsJson(id, ripsJson) {
  const { rows } = await query(
    `UPDATE facturas
     SET rips_json = $1, estado = 'validada', updated_at = NOW()
     WHERE id = $2
     RETURNING id, num_factura, estado`,
    [JSON.stringify(ripsJson), id]
  );
  return rows[0] || null;
}

module.exports = { findAll, findById, findByNumFactura, create, update, remove, saveRipsJson };