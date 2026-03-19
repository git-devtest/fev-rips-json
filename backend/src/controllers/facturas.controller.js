// src/controllers/facturas.controller.js
'use strict';

const { validationResult } = require('express-validator');
const Factura = require('../models/factura.model');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Datos inválidos', detalles: errors.array() });
    return true;
  }
  return false;
}

// ─── Controladores ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/facturas
 * Query params: prestador_id, estado, page, limit
 */
async function index(req, res, next) {
  try {
    const { prestador_id, estado, page, limit } = req.query;
    const result = await Factura.findAll({ prestador_id, estado, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/facturas/:id
 */
async function show(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/facturas
 */
async function create(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const { num_documento_id_obligado, razon_social, num_factura, tipo_nota, num_nota, fecha_expedicion } = req.body;

    // Verificar unicidad prestador + num_factura
    const prestador = await findOrGetPrestadorId(num_documento_id_obligado);
    if (prestador) {
      const existe = await Factura.findByNumFactura(prestador, num_factura);
      if (existe) {
        return res.status(409).json({
          error: 'Ya existe una factura con ese número para este prestador',
          factura_id: existe.id,
        });
      }
    }

    const factura = await Factura.create({
      num_documento_id_obligado,
      razon_social,
      num_factura,
      tipo_nota,
      num_nota,
      fecha_expedicion,
    });

    res.status(201).json(factura);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/facturas/:id
 */
async function update(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    if (factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede editar una factura en estado '${factura.estado}'`,
      });
    }

    const actualizada = await Factura.update(req.params.id, req.body);
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/facturas/:id
 */
async function remove(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    if (factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `Solo se pueden eliminar facturas en estado 'borrador'. Estado actual: '${factura.estado}'`,
      });
    }

    const eliminada = await Factura.remove(req.params.id);
    if (!eliminada) return res.status(404).json({ error: 'Factura no encontrada' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Helper interno: obtiene prestador_id por num_documento si ya existe
async function findOrGetPrestadorId(num_documento_id_obligado) {
  const { query } = require('../config/database');
  const { rows } = await query(
    'SELECT id FROM prestadores WHERE num_documento_id_obligado = $1',
    [num_documento_id_obligado]
  );
  return rows[0]?.id || null;
}

module.exports = { index, show, create, update, remove };
