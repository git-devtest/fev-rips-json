// src/routes/facturas.routes.js
'use strict';

const { Router }  = require('express');
const { body, param, query } = require('express-validator');
const ctrl = require('../controllers/facturas.controller');

const router = Router();

// ─── Reglas de validación reutilizables ──────────────────────────────────────

const idParam = param('id')
  .isUUID().withMessage('El id debe ser un UUID válido');

const crearFactura = [
  body('num_documento_id_obligado')
    .trim().notEmpty().withMessage('num_documento_id_obligado es requerido')
    .isLength({ max: 12 }).withMessage('Máximo 12 caracteres'),
  body('razon_social')
    .optional().trim().isLength({ max: 200 }),
  body('num_factura')
    .trim().notEmpty().withMessage('num_factura es requerido')
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres'),
  body('fecha_expedicion')
    .notEmpty().withMessage('fecha_expedicion es requerida')
    .isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('tipo_nota')
    .optional({ nullable: true })
    .isIn(['01', '02']).withMessage('tipo_nota debe ser 01 (débito) o 02 (crédito)'),
  body('num_nota')
    .optional({ nullable: true })
    .isLength({ max: 20 }),
];

const actualizarFactura = [
  idParam,
  body('fecha_expedicion')
    .optional()
    .isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('tipo_nota')
    .optional({ nullable: true })
    .isIn(['01', '02']).withMessage('tipo_nota debe ser 01 o 02'),
  body('num_nota')
    .optional({ nullable: true })
    .isLength({ max: 20 }),
  body('estado')
    .optional()
    .isIn(['borrador', 'validada', 'enviada', 'rechazada'])
    .withMessage('Estado no permitido'),
];

const listarFacturas = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('prestador_id').optional().isUUID().withMessage('prestador_id debe ser un UUID válido'),
  query('estado').optional().isIn(['borrador', 'validada', 'enviada', 'rechazada']),
];

// ─── Rutas ────────────────────────────────────────────────────────────────────

// GET    /api/v1/facturas
router.get('/',     listarFacturas,   ctrl.index);

// GET    /api/v1/facturas/:id
router.get('/:id',  [idParam],        ctrl.show);

// POST   /api/v1/facturas
router.post('/',    crearFactura,     ctrl.create);

// PATCH  /api/v1/facturas/:id
router.patch('/:id', actualizarFactura, ctrl.update);

// DELETE /api/v1/facturas/:id
router.delete('/:id', [idParam],     ctrl.remove);

module.exports = router;
