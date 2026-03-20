// src/routes/referencias.routes.js
'use strict';

const { Router } = require('express');
const { param, query } = require('express-validator');
const ctrl = require('../controllers/referencias.controller');

const router = Router();

// GET /api/v1/ref              → lista tablas disponibles
router.get('/', ctrl.listar);

// GET /api/v1/ref/:tabla       → obtiene registros de una tabla
// GET /api/v1/ref/municipios?departamento=76
// GET /api/v1/ref/cups?q=puncion&limit=20
// GET /api/v1/ref/cie10?q=J06
router.get('/:tabla', [
  param('tabla').trim().notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('departamento').optional().trim().isLength({ max: 2 }),
  query('q').optional().trim().isLength({ min: 2, max: 100 }),
], ctrl.obtener);

module.exports = router;
