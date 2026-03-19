// src/controllers/procedimientos.controller.js
'use strict';

const { validationResult } = require('express-validator');
const Procedimiento = require('../models/procedimiento.model');
const Usuario       = require('../models/usuario.model');
const Factura       = require('../models/factura.model');
const { query }     = require('../config/database');

// ─── Helper ───────────────────────────────────────────────────────────────────

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Datos inválidos', detalles: errors.array() });
    return true;
  }
  return false;
}

async function resolveContext(req, res) {
  const usuario = await Usuario.findById(req.params.usuario_id);
  if (!usuario || usuario.factura_id !== req.params.factura_id) {
    res.status(404).json({ error: 'Usuario no encontrado en esta factura' });
    return null;
  }
  const factura = await Factura.findById(req.params.factura_id);
  if (!factura) {
    res.status(404).json({ error: 'Factura no encontrada' });
    return null;
  }
  return { usuario, factura };
}

// ─── Controladores ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos
 */
async function index(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    const procedimientos = await Procedimiento.findByUsuario(req.params.usuario_id);
    res.json({ data: procedimientos, total: procedimientos.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id
 */
async function show(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    const procedimiento = await Procedimiento.findById(req.params.id);
    if (!procedimiento || procedimiento.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Procedimiento no encontrado' });
    }
    res.json(procedimiento);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos
 */
async function create(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se pueden agregar procedimientos a una factura en estado '${ctx.factura.estado}'`,
      });
    }

    // Regla Res. 2275: un usuario tiene consultas O procedimientos, no ambos
    const { rows: consultas } = await query(
      'SELECT 1 FROM consultas WHERE usuario_rips_id = $1 LIMIT 1',
      [req.params.usuario_id]
    );
    if (consultas.length > 0) {
      return res.status(409).json({
        error: 'Este usuario ya tiene consultas. Según Resolución 2275, un usuario tiene consultas O procedimientos, no ambos.',
      });
    }

    const procedimiento = await Procedimiento.create({
      usuario_rips_id: req.params.usuario_id,
      ...req.body,
    });

    res.status(201).json(procedimiento);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id
 */
async function update(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede editar un procedimiento de una factura en estado '${ctx.factura.estado}'`,
      });
    }

    const procedimiento = await Procedimiento.findById(req.params.id);
    if (!procedimiento || procedimiento.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Procedimiento no encontrado' });
    }

    const actualizado = await Procedimiento.update(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id
 */
async function remove(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede eliminar un procedimiento de una factura en estado '${ctx.factura.estado}'`,
      });
    }

    const procedimiento = await Procedimiento.findById(req.params.id);
    if (!procedimiento || procedimiento.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Procedimiento no encontrado' });
    }

    await Procedimiento.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, create, update, remove };
