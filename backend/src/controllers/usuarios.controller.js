// src/controllers/usuarios.controller.js
'use strict';

const { validationResult } = require('express-validator');
const Usuario = require('../models/usuario.model');
const Factura = require('../models/factura.model');

// ─── Helper ──────────────────────────────────────────────────────────────────

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Datos inválidos', detalles: errors.array() });
    return true;
  }
  return false;
}

// ─── Controladores ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facturas/:factura_id/usuarios
 */
async function index(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.factura_id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    const usuarios = await Usuario.findByFactura(req.params.factura_id);
    res.json({ data: usuarios, total: usuarios.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/facturas/:factura_id/usuarios/:id
 */
async function show(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario || usuario.factura_id !== req.params.factura_id) {
      return res.status(404).json({ error: 'Usuario no encontrado en esta factura' });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/facturas/:factura_id/usuarios
 */
async function create(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const factura = await Factura.findById(req.params.factura_id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    if (factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se pueden agregar usuarios a una factura en estado '${factura.estado}'`,
      });
    }

    // Regla de negocio: 1 factura = 1 usuario
    if (parseInt(factura.total_usuarios) >= 1) {
      return res.status(409).json({
        error: 'Una factura solo puede tener un usuario asociado según la Resolución 2275.',
        usuario_id: (await Usuario.findByFactura(req.params.factura_id))[0]?.id,
      });
    }

    // Verificar unicidad: mismo documento en la misma factura
    const existe = await Usuario.findByDocumentoEnFactura(
      req.params.factura_id,
      req.body.num_documento_identificacion
    );
    if (existe) {
      return res.status(409).json({
        error: 'Ya existe un usuario con ese documento en esta factura',
        usuario_id: existe.id,
      });
    }

    const usuario = await Usuario.create({
      factura_id: req.params.factura_id,
      ...req.body,
    });

    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/facturas/:factura_id/usuarios/:id
 */
async function update(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario || usuario.factura_id !== req.params.factura_id) {
      return res.status(404).json({ error: 'Usuario no encontrado en esta factura' });
    }

    const factura = await Factura.findById(req.params.factura_id);
    if (factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede editar un usuario de una factura en estado '${factura.estado}'`,
      });
    }

    const actualizado = await Usuario.update(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/facturas/:factura_id/usuarios/:id
 */
async function remove(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario || usuario.factura_id !== req.params.factura_id) {
      return res.status(404).json({ error: 'Usuario no encontrado en esta factura' });
    }

    const factura = await Factura.findById(req.params.factura_id);
    if (factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede eliminar un usuario de una factura en estado '${factura.estado}'`,
      });
    }

    await Usuario.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, create, update, remove };
