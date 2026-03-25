// src/routes/recien_nacidos.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/recien_nacidos.controller');

const router = Router({ mergeParams: true });

// ─── Params ───────────────────────────────────────────────────────────────────

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

// ─── Regex CIE-10 ─────────────────────────────────────────────────────────────

const cie10 = /^[A-Z][0-9]{2}[0-9A-Z]$/;

// ─── Tipos de documento válidos (Res. 2275 / ref_tipos_documento) ─────────────

const tiposDocumento = ['AS','CC','CD','CE','CN','DE','MS','NV','PA','PE','PT','RC','SC','SI','TI'];

// ─── Validaciones POST ────────────────────────────────────────────────────────

const camposPost = [
  body('cod_diagnostico_principal')
    .trim().notEmpty().withMessage('cod_diagnostico_principal es requerido')
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido (ej: Z380)'),

  body('num_documento_id_madre')
    .optional({ nullable: true }).isLength({ max: 20 }),

  body('tipo_documento_id_madre')
    .optional({ nullable: true })
    .isIn(tiposDocumento)
    .withMessage('Tipo de documento de la madre no válido'),

  body('edad_gestacional')
    .optional({ nullable: true })
    .isInt({ min: 20, max: 45 })
    .withMessage('Edad gestacional debe estar entre 20 y 45 semanas'),

  body('multiplicidad_gestacion')
    .optional({ nullable: true })
    .isIn(['01','02','03','04'])
    .withMessage('Multiplicidad de gestación no válida (01–04)'),

  body('peso_al_nacer')
    .optional({ nullable: true })
    .isInt({ min: 200, max: 8000 })
    .withMessage('Peso al nacer debe estar entre 200 y 8000 gramos'),

  body('condicion_usuario_al_egreso')
    .optional({ nullable: true })
    .isIn(['01','02','03','04','05','06','07'])
    .withMessage('Condición al egreso no válida (01–07)'),
];

// ─── Validaciones PATCH ───────────────────────────────────────────────────────

const camposPatch = [
  body('cod_diagnostico_principal')
    .optional().trim()
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido'),

  body('num_documento_id_madre')
    .optional({ nullable: true }).isLength({ max: 20 }),

  body('tipo_documento_id_madre')
    .optional({ nullable: true })
    .isIn(tiposDocumento)
    .withMessage('Tipo de documento de la madre no válido'),

  body('edad_gestacional')
    .optional({ nullable: true })
    .isInt({ min: 20, max: 45 })
    .withMessage('Edad gestacional debe estar entre 20 y 45 semanas'),

  body('multiplicidad_gestacion')
    .optional({ nullable: true })
    .isIn(['01','02','03','04'])
    .withMessage('Multiplicidad de gestación no válida (01–04)'),

  body('peso_al_nacer')
    .optional({ nullable: true })
    .isInt({ min: 200, max: 8000 })
    .withMessage('Peso al nacer debe estar entre 200 y 8000 gramos'),

  body('condicion_usuario_al_egreso')
    .optional({ nullable: true })
    .isIn(['01','02','03','04','05','06','07'])
    .withMessage('Condición al egreso no válida (01–07)'),
];

// ─── Rutas ────────────────────────────────────────────────────────────────────

router.get('/',      [facturaIdParam, usuarioIdParam],                          ctrl.index);
router.get('/:id',   [facturaIdParam, usuarioIdParam, idParam],                 ctrl.show);
router.post('/',     [facturaIdParam, usuarioIdParam, ...camposPost],           ctrl.create);
router.patch('/:id', [facturaIdParam, usuarioIdParam, idParam, ...camposPatch], ctrl.update);
router.delete('/:id',[facturaIdParam, usuarioIdParam, idParam],                 ctrl.remove);

module.exports = router;