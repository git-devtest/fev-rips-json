// src/routes/rips.routes.js
'use strict';

const { Router } = require('express');
const { param }  = require('express-validator');
const ctrl       = require('../controllers/rips.controller');

const router = Router();

const facturaIdParam = param('factura_id')
  .isUUID().withMessage('factura_id debe ser UUID');

// GET  /api/v1/rips/:factura_id            → previsualizar JSON sin persistir
router.get('/:factura_id',            [facturaIdParam], ctrl.preview);

// POST /api/v1/rips/:factura_id/generar   → generar y persistir en BD
router.post('/:factura_id/generar',   [facturaIdParam], ctrl.generar);

// GET  /api/v1/rips/:factura_id/descargar → descargar archivo .json
router.get('/:factura_id/descargar',  [facturaIdParam], ctrl.descargar);

module.exports = router;
