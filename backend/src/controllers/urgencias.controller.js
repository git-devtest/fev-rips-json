// src/controllers/urgencias.controller.js
'use strict';

const { validationResult } = require('express-validator');
const Urgencia  = require('../models/urgencia.model');
const Usuario   = require('../models/usuario.model');
const Factura   = require('../models/factura.model');
const { query } = require('../config/database');

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

async function index(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;
    const urgencias = await Urgencia.findByUsuario(req.params.usuario_id);
    res.json({ data: urgencias, total: urgencias.length });
  } catch (err) { next(err); }
}

async function show(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;
    const urgencia = await Urgencia.findById(req.params.id);
    if (!urgencia || urgencia.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Urgencia no encontrada' });
    }
    res.json(urgencia);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({
        error: `No se pueden agregar urgencias a una factura en estado '${ctx.factura.estado}'`,
      });
    }

    // Regla de exclusión mutua: un usuario tiene solo un tipo de servicio
    const [consultas, procedimientos, urgencias] = await Promise.all([
      query('SELECT 1 FROM consultas     WHERE usuario_rips_id = $1 LIMIT 1', [req.params.usuario_id]),
      query('SELECT 1 FROM procedimientos WHERE usuario_rips_id = $1 LIMIT 1', [req.params.usuario_id]),
      query('SELECT 1 FROM urgencias     WHERE usuario_rips_id = $1 LIMIT 1', [req.params.usuario_id]),
    ]);

    if (consultas.rows.length > 0) {
      return res.status(409).json({ error: 'Este usuario ya tiene consultas. Un usuario solo puede tener un tipo de servicio.' });
    }
    if (procedimientos.rows.length > 0) {
      return res.status(409).json({ error: 'Este usuario ya tiene procedimientos. Un usuario solo puede tener un tipo de servicio.' });
    }
    if (urgencias.rows.length > 0) {
      return res.status(409).json({ error: 'Este usuario ya tiene una urgencia registrada.' });
    }

    const urgencia = await Urgencia.create({
      usuario_rips_id: req.params.usuario_id,
      ...req.body,
    });
    res.status(201).json(urgencia);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  if (validationErrors(req, res)) return;
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({ error: `No se puede editar una urgencia de una factura en estado '${ctx.factura.estado}'` });
    }

    const urgencia = await Urgencia.findById(req.params.id);
    if (!urgencia || urgencia.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Urgencia no encontrada' });
    }

    const actualizada = await Urgencia.update(req.params.id, req.body);
    res.json(actualizada);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const ctx = await resolveContext(req, res);
    if (!ctx) return;

    if (ctx.factura.estado !== 'borrador') {
      return res.status(409).json({ error: `No se puede eliminar una urgencia de una factura en estado '${ctx.factura.estado}'` });
    }

    const urgencia = await Urgencia.findById(req.params.id);
    if (!urgencia || urgencia.usuario_rips_id !== req.params.usuario_id) {
      return res.status(404).json({ error: 'Urgencia no encontrada' });
    }

    await Urgencia.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { index, show, create, update, remove };
