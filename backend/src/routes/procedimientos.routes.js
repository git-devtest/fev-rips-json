// src/routes/procedimientos.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/procedimientos.controller');

const router = Router({ mergeParams: true });

// ─── Parámetros ───────────────────────────────────────────────────────────────

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

// ─── Reglas de validación Resolución 2275 ────────────────────────────────────

const camposProcedimiento = [
  body('cod_procedimiento')
    .trim().notEmpty().withMessage('cod_procedimiento es requerido')
    .isLength({ max: 10 }),

  body('fecha_ini_atencion')
    .notEmpty().withMessage('fecha_ini_atencion es requerida')
    .isISO8601().withMessage('Formato inválido, use ISO 8601 (YYYY-MM-DDTHH:mm:ss)'),

  body('modalidad_grupo_serv_tec_sal')
    .trim().notEmpty().withMessage('modalidad_grupo_serv_tec_sal es requerido')
    .isIn(['01','02','03','04','05','06','07','08'])
    .withMessage('Modalidad no válida según Resolución 2275'),

  body('grupo_servicios')
    .trim().notEmpty().withMessage('grupo_servicios es requerido')
    .isIn(['01','02','03','04','05','06','07'])
    .withMessage('Grupo de servicios no válido'),

  body('via_ingreso_servicio_salud')
    .trim().notEmpty().withMessage('via_ingreso_servicio_salud es requerida')
    .isIn(['01','02','03','04','05'])
    .withMessage('Vía de ingreso no válida'),

  body('dx_principal')
    .trim().notEmpty().withMessage('dx_principal es requerido')
    .isLength({ max: 10 }),

  body('tipo_dx_principal')
    .trim().notEmpty().withMessage('tipo_dx_principal es requerido')
    .isIn(['01','02','03'])
    .withMessage('Tipo de diagnóstico no válido (01, 02, 03)'),

  body('concepto_recaudo')
    .trim().notEmpty().withMessage('concepto_recaudo es requerido')
    .isIn(['01','02','03','04','05'])
    .withMessage('Concepto de recaudo no válido'),

  // Opcionales
  body('cod_prestador').optional({ nullable: true }).isLength({ max: 12 }),
  body('num_autorizacion').optional({ nullable: true }).isLength({ max: 30 }),
  body('dx_relacionado').optional({ nullable: true }).isLength({ max: 10 }),
  body('dx_complicacion').optional({ nullable: true }).isLength({ max: 10 }),
  body('forma_acto_quirurgico')
    .optional({ nullable: true })
    .isIn(['01','02','03','04','05'])
    .withMessage('Forma de acto quirúrgico no válida'),
  body('tipo_doc_id_medico')
    .optional({ nullable: true })
    .isIn(['CC','CE','PA','SC','MS','AS','NU','PE','PT'])
    .withMessage('Tipo documento médico no válido'),
  body('num_doc_id_medico').optional({ nullable: true }).isLength({ max: 20 }),

  // Valores monetarios
  body('valor_procedimiento').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_copago_moderadora').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_desc_no_pos').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_neg_no_pos').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_cuota_recuperacion').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_comp_economicas').optional().isFloat({ min: 0 }).toFloat(),
];

const crearProcedimiento    = [facturaIdParam, usuarioIdParam, ...camposProcedimiento];
const actualizarProcedimiento = [facturaIdParam, usuarioIdParam, idParam, ...camposProcedimiento];

// ─── Rutas ────────────────────────────────────────────────────────────────────
// Montadas bajo /api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos

router.get('/',      [facturaIdParam, usuarioIdParam], ctrl.index);
router.get('/:id',   [facturaIdParam, usuarioIdParam, idParam], ctrl.show);
router.post('/',     crearProcedimiento,    ctrl.create);
router.patch('/:id', actualizarProcedimiento, ctrl.update);
router.delete('/:id',[facturaIdParam, usuarioIdParam, idParam], ctrl.remove);

module.exports = router;
