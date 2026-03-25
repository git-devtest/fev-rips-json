// src/routes/hospitalizaciones.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/hospitalizaciones.controller');

const router = Router({ mergeParams: true });

// ─── Params ───────────────────────────────────────────────────────────────────

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

// ─── Regex ────────────────────────────────────────────────────────────────────

const cie10      = /^[A-Z][0-9]{2}[0-9A-Z]$/;
const fechaHora  = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

// ─── Campos opcionales (compartidos POST/PATCH) ───────────────────────────────

function camposOpcionales() {
  return [
    body('fecha_fin_atencion')
      .optional({ nullable: true })
      .matches(fechaHora).withMessage('Formato inválido, use YYYY-MM-DD HH:mm'),

    body('num_autorizacion')
      .optional({ nullable: true }).isLength({ max: 30 }),

    body('cod_diagnostico_relacionado1')
      .optional({ nullable: true })
      .matches(cie10).withMessage('cod_diagnostico_relacionado1: formato CIE-10 inválido'),

    body('cod_diagnostico_relacionado2')
      .optional({ nullable: true })
      .matches(cie10).withMessage('cod_diagnostico_relacionado2: formato CIE-10 inválido'),

    body('cod_diagnostico_relacionado3')
      .optional({ nullable: true })
      .matches(cie10).withMessage('cod_diagnostico_relacionado3: formato CIE-10 inválido'),

    body('causa_externa')
      .optional({ nullable: true })
      .isIn(['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15'])
      .withMessage('Causa externa no válida'),

    body('cod_diagnostico_muerte')
      .optional({ nullable: true })
      .matches(cie10).withMessage('cod_diagnostico_muerte: formato CIE-10 inválido'),

    body('cod_prestador')
      .optional({ nullable: true }).isLength({ max: 12 }),

    body('valor_hospitalizacion')
      .optional().isFloat({ min: 0 }).toFloat(),

    body('valor_copago_moderadora')
      .optional().isFloat({ min: 0 }).toFloat(),

    body('valor_desc_no_pos')
      .optional().isFloat({ min: 0 }).toFloat(),

    body('valor_neg_no_pos')
      .optional().isFloat({ min: 0 }).toFloat(),

    body('valor_cuota_recuperacion')
      .optional().isFloat({ min: 0 }).toFloat(),

    body('valor_comp_economicas')
      .optional().isFloat({ min: 0 }).toFloat(),
  ];
}

// ─── Validaciones POST ────────────────────────────────────────────────────────

const camposPost = [
  body('via_ingreso_servicio_salud')
    .trim().notEmpty().withMessage('via_ingreso_servicio_salud es requerida')
    .isIn(['01','02','03','04','05'])
    .withMessage('Vía de ingreso no válida (01–05)'),

  body('fecha_ini_atencion')
    .notEmpty().withMessage('fecha_ini_atencion es requerida')
    .matches(fechaHora).withMessage('Formato inválido, use YYYY-MM-DD HH:mm'),

  body('cod_diagnostico_principal')
    .trim().notEmpty().withMessage('cod_diagnostico_principal es requerido')
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido (ej: J180)'),

  body('tipo_dx_principal')
    .trim().notEmpty().withMessage('tipo_dx_principal es requerido')
    .isIn(['01','02','03'])
    .withMessage('Tipo de diagnóstico no válido (01, 02, 03)'),

  body('modalidad_grupo_serv_tec_sal')
    .trim().notEmpty().withMessage('modalidad_grupo_serv_tec_sal es requerida')
    .isIn(['01','02','03','04','05','06','07','08'])
    .withMessage('Modalidad no válida según Resolución 2275'),

  body('grupo_servicios')
    .trim().notEmpty().withMessage('grupo_servicios es requerido')
    .isIn(['01','02','03','04','05','06','07'])
    .withMessage('Grupo de servicios no válido'),

  body('concepto_recaudo')
    .trim().notEmpty().withMessage('concepto_recaudo es requerido')
    .isIn(['01','02','03','05'])
    .withMessage('Concepto de recaudo no válido (01, 02, 03, 05)'),

  ...camposOpcionales(),
];

// ─── Validaciones PATCH ───────────────────────────────────────────────────────

const camposPatch = [
  body('via_ingreso_servicio_salud')
    .optional().trim()
    .isIn(['01','02','03','04','05'])
    .withMessage('Vía de ingreso no válida (01–05)'),

  body('fecha_ini_atencion')
    .optional()
    .matches(fechaHora).withMessage('Formato inválido, use YYYY-MM-DD HH:mm'),

  body('cod_diagnostico_principal')
    .optional().trim()
    .matches(cie10).withMessage('cod_diagnostico_principal: formato CIE-10 inválido'),

  body('tipo_dx_principal')
    .optional().trim()
    .isIn(['01','02','03'])
    .withMessage('Tipo de diagnóstico no válido (01, 02, 03)'),

  body('modalidad_grupo_serv_tec_sal')
    .optional().trim()
    .isIn(['01','02','03','04','05','06','07','08'])
    .withMessage('Modalidad no válida según Resolución 2275'),

  body('grupo_servicios')
    .optional().trim()
    .isIn(['01','02','03','04','05','06','07'])
    .withMessage('Grupo de servicios no válido'),

  body('concepto_recaudo')
    .optional().trim()
    .isIn(['01','02','03','05'])
    .withMessage('Concepto de recaudo no válido (01, 02, 03, 05)'),

  ...camposOpcionales(),
];

// ─── Rutas ────────────────────────────────────────────────────────────────────

router.get('/',      [facturaIdParam, usuarioIdParam],                          ctrl.index);
router.get('/:id',   [facturaIdParam, usuarioIdParam, idParam],                 ctrl.show);
router.post('/',     [facturaIdParam, usuarioIdParam, ...camposPost],           ctrl.create);
router.patch('/:id', [facturaIdParam, usuarioIdParam, idParam, ...camposPatch], ctrl.update);
router.delete('/:id',[facturaIdParam, usuarioIdParam, idParam],                 ctrl.remove);

module.exports = router;