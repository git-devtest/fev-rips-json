// src/routes/medicamentos.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/medicamentos.controller');

const router = Router({ mergeParams: true });

// ─── Params ───────────────────────────────────────────────────────────────────

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

// ─── Regex CIE-10 ─────────────────────────────────────────────────────────────

const cie10 = /^[A-Z][0-9]{2}[0-9A-Z]$/;

// ─── Tipos de documento válidos ───────────────────────────────────────────────

const tiposDocumento = ['AS','CC','CD','CE','CN','DE','MS','NV','PA','PE','PT','RC','SC','SI','TI'];

// ─── Validaciones POST ────────────────────────────────────────────────────────

const camposPost = [
  body('fecha_dispensacion')
    .notEmpty().withMessage('fecha_dispensacion es requerida')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Formato inválido, use YYYY-MM-DD'),

  body('cod_diagnostico_principal')
    .trim().notEmpty().withMessage('cod_diagnostico_principal es requerido')
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido (ej: J180)'),

  body('tipo_medicamento')
    .trim().notEmpty().withMessage('tipo_medicamento es requerido')
    .isIn(['01','02','03','04','05'])
    .withMessage('Tipo de medicamento no válido (01–05)'),

  body('numero_unidades')
    .notEmpty().withMessage('numero_unidades es requerido')
    .isFloat({ min: 0 }).withMessage('numero_unidades debe ser un número positivo')
    .toFloat(),

  body('valor_unit_medicamento')
    .notEmpty().withMessage('valor_unit_medicamento es requerido')
    .isFloat({ min: 0 }).toFloat(),

  body('valor_total_medicamento')
    .notEmpty().withMessage('valor_total_medicamento es requerido')
    .isFloat({ min: 0 }).toFloat(),

  // Opcionales
  body('num_autorizacion')
    .optional({ nullable: true }).isLength({ max: 30 }),

  body('descripcion_medicamento')
    .optional({ nullable: true }).isLength({ max: 300 }),

  body('cod_medicamento')
    .optional({ nullable: true }).isLength({ max: 20 }),

  body('concentracion_medicamento')
    .optional({ nullable: true }).isLength({ max: 100 }),

  body('unidad_medida_medicamento')
    .optional({ nullable: true }).isLength({ max: 4 }),

  body('forma_farmaceutica')
    .optional({ nullable: true }).isLength({ max: 4 }),

  body('via_administracion_medicamento')
    .optional({ nullable: true }).isLength({ max: 4 }),

  body('tipo_doc_id_medico')
    .optional({ nullable: true })
    .isIn(tiposDocumento)
    .withMessage('Tipo de documento del médico no válido'),

  body('num_doc_id_medico')
    .optional({ nullable: true }).isLength({ max: 20 }),
];

// ─── Validaciones PATCH ───────────────────────────────────────────────────────

const camposPatch = [
  body('fecha_dispensacion')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Formato inválido, use YYYY-MM-DD'),

  body('cod_diagnostico_principal')
    .optional().trim()
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido'),

  body('tipo_medicamento')
    .optional().trim()
    .isIn(['01','02','03','04','05'])
    .withMessage('Tipo de medicamento no válido (01–05)'),

  body('numero_unidades')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('valor_unit_medicamento')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('valor_total_medicamento')
    .optional().isFloat({ min: 0 }).toFloat(),

  body('num_autorizacion')
    .optional({ nullable: true }).isLength({ max: 30 }),

  body('descripcion_medicamento')
    .optional({ nullable: true }).isLength({ max: 300 }),

  body('cod_medicamento')
    .optional({ nullable: true }).isLength({ max: 20 }),

  body('concentracion_medicamento')
    .optional({ nullable: true }).isLength({ max: 100 }),

  body('unidad_medida_medicamento')
    .optional({ nullable: true }).isLength({ max: 4 }),

  body('forma_farmaceutica')
    .optional({ nullable: true }).isLength({ max: 4 }),

  body('via_administracion_medicamento')
    .optional({ nullable: true }).isLength({ max: 4 }),

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