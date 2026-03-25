// src/controllers/consultas.controller.js
'use strict';

const { validationResult }        = require('express-validator');
const Consulta                    = require('../models/consulta.model');
const Usuario                     = require('../models/usuario.model');
const Factura                     = require('../models/factura.model');
const { verificarExclusionMutua } = require('../utils/servicios.utils');

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function index(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;
    const consultas = await Consulta.findByUsuario(req.params.usuario_id);
    res.json({ data: consultas, total: consultas.length });
  } catch (err) { next(err); }
}

async function show(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;
    const consulta = await Consulta.findById(req.params.id);
    if (!consulta || consulta.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }
    res.json(consulta);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se pueden agregar consultas a una factura en estado '${ctx.factura.estado}'`,
      });
    }

    // Regla de exclusión mutua Res. 2275
    const tipoExistente = await verificarExclusionMutua(req.params.usuario_id, 'consultas');
    if (tipoExistente) {
      return res.status(409).json({
        error: `Este usuario ya tiene ${tipoExistente}. Un usuario solo puede tener un tipo de servicio.`,
      });
    }

    const consulta = await Consulta.create({
      usuario_rips_id: req.params.usuario_id,
      ...req.body,
    });
    res.status(201).json(consulta);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede editar una consulta de una factura en estado '${ctx.factura.estado}'`,
      });
    }

    const consulta = await Consulta.findById(req.params.id);
    if (!consulta || consulta.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    const actualizada = await Consulta.update(req.params.id, req.body);
    res.json(actualizada);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se puede eliminar una consulta de una factura en estado '${ctx.factura.estado}'`,
      });
    }

    const consulta = await Consulta.findById(req.params.id);
    if (!consulta || consulta.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    await Consulta.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { index, show, create, update, remove };