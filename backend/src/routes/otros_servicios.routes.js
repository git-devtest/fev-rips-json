// src/routes/otros_servicios.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/otros_servicios.controller');

const router = Router({ mergeParams: true });

// ─── Params ───────────────────────────────────────────────────────────────────

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

// ─── Tipos de documento válidos ───────────────────────────────────────────────

const tiposDocumento = ['AS','CC','CD','CE','CN','DE','MS','NV','PA','PE','PT','RC','SC','SI','TI'];

// ─── Validaciones POST ────────────────────────────────────────────────────────

const camposPost = [
  body('cod_otro_servicio')
    .trim().notEmpty().withMessage('cod_otro_servicio es requerido')
    .isLength({ max: 10 }),

  body('fecha_suministro')
    .notEmpty().withMessage('fecha_suministro es requerida')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Formato inválido, use YYYY-MM-DD'),

  body('cantidad_otro_servicio')
    .notEmpty().withMessage('cantidad_otro_servicio es requerida')
    .isFloat({ min: 0 }).toFloat(),

  body('valor_unit_otro_servicio')
    .notEmpty().withMessage('valor_unit_otro_servicio es requerido')
    .isFloat({ min: 0 }).toFloat(),

  body('valor_total_otro_servicio')
    .notEmpty().withMessage('valor_total_otro_servicio es requerido')
    .isFloat({ min: 0 }).toFloat(),

  // Opcionales
  body('num_autorizacion')
    .optional({ nullable: true }).isLength({ max: 30 }),

  body('tipo_doc_id_medico')
    .optional({ nullable: true })
    .isIn(tiposDocumento)
    .withMessage('Tipo de documento del médico no válido'),

  body('num_doc_id_medico')
    .optional({ nullable: true }).isLength({ max: 20 }),
];

// ─── Validaciones PATCH ───────────────────────────────────────────────────────

const camposPatch = [
  body('cod_otro_servicio')
    .optional().trim().isLength({ max: 10 }),

  body('fecha_suministro')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Formato inválido, use YYYY-MM-DD'),

  body('cantidad_otro_servicio')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('valor_unit_otro_servicio')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('valor_total_otro_servicio')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('num_autorizacion')
    .optional({ nullable: true }).isLength({ max: 30 }),

  body('tipo_doc_id_medico')
    .optional({ nullable: true })
    .isIn(tiposDocumento)
    .withMessage('Tipo de documento del médico no válido'),

  body('num_doc_id_medico')
    .optional({ nullable: true }).isLength({ max: 20 }),
];

// ─── Rutas ────────────────────────────────────────────────────────────────────

router.get('/',      [facturaIdParam, usuarioIdParam],                          ctrl.index);
router.get('/:id',   [facturaIdParam, usuarioIdParam, idParam],                 ctrl.show);
router.post('/',     [facturaIdParam, usuarioIdParam, ...camposPost],           ctrl.create);
router.patch('/:id', [facturaIdParam, usuarioIdParam, idParam, ...camposPatch], ctrl.update);
router.delete('/:id',[facturaIdParam, usuarioIdParam, idParam],                 ctrl.remove);

module.exports = router;