// src/controllers/rips.controller.js
'use strict';

const { generarRips }  = require('../services/rips.generator');
const Factura          = require('../models/factura.model');
const { query }        = require('../config/database');

/**
 * GET /api/v1/rips/:factura_id
 * Genera el JSON RIPS de una factura sin persistirlo.
 * Útil para previsualizar antes de guardar.
 */
async function preview(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.factura_id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    const rips = await generarRips(req.params.factura_id);
    res.json(rips);
  } catch (err) {
    if (err.message.includes('no tiene usuarios') || err.message.includes('no tiene servicios')) {
      return res.status(422).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/v1/rips/:factura_id/generar
 * Genera el JSON RIPS y lo persiste en la factura (campo rips_json).
 * Cambia el estado de la factura a 'validada'.
 */
async function generar(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.factura_id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    if (factura.estado === 'enviada') {
      return res.status(409).json({ error: 'La factura ya fue enviada a SISPRO' });
    }

    const rips = await generarRips(req.params.factura_id);

    // Persistir JSON en la factura
    const actualizada = await Factura.saveRipsJson(req.params.factura_id, rips);

    // Registrar en log de auditoría
    await query(
      `INSERT INTO rips_log (factura_id, accion, resultado, detalle)
       VALUES ($1, 'generar', 'ok', $2)`,
      [
        req.params.factura_id,
        JSON.stringify({
          num_factura:    factura.num_factura,
          total_usuarios: rips.usuarios.length,
        }),
      ]
    );

    // Retornar solo el JSON RIPS — sin wrapper
    res.json(rips);
  } catch (err) {
    // Registrar error en log
    await query(
      `INSERT INTO rips_log (factura_id, accion, resultado, detalle)
       VALUES ($1, 'generar', 'error', $2)`,
      [req.params.factura_id, JSON.stringify({ error: err.message })]
    ).catch(() => {}); // no propagar error del log

    if (err.message.includes('no tiene usuarios') || err.message.includes('no tiene servicios')) {
      return res.status(422).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/v1/rips/:factura_id/descargar
 * Descarga el JSON RIPS persistido como archivo .json
 */
async function descargar(req, res, next) {
  try {
    const factura = await Factura.findById(req.params.factura_id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    if (!factura.rips_json) {
      return res.status(422).json({
        error: 'Esta factura aún no tiene RIPS generado. Use POST /rips/:id/generar primero.',
      });
    }

    const filename = `RIPS_${factura.num_factura}_${factura.num_documento_id_obligado}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(factura.rips_json, null, 2));
  } catch (err) {
    next(err);
  }
}

module.exports = { preview, generar, descargar };
