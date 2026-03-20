// src/routes/urgencias.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/urgencias.controller');

const router = Router({ mergeParams: true });

const idParam        = param('id').isUUID().withMessage('id debe ser UUID');
const facturaIdParam = param('factura_id').isUUID().withMessage('factura_id debe ser UUID');
const usuarioIdParam = param('usuario_id').isUUID().withMessage('usuario_id debe ser UUID');

const camposUrgencia = [
  body('fecha_ini_atencion')
    .notEmpty().withMessage('fecha_ini_atencion es requerida')
    .matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    .withMessage('Formato inválido, use YYYY-MM-DD HH:mm'),
  body('fecha_fin_atencion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    .withMessage('Formato inválido, use YYYY-MM-DD HH:mm'),
  body('cod_diagnostico_principal')
    .trim().notEmpty().withMessage('cod_diagnostico_principal es requerido')
    .isLength({ max: 10 }),
  body('tipo_dx_principal')
    .trim().notEmpty().withMessage('tipo_dx_principal es requerido')
    .isIn(['01','02','03']).withMessage('Tipo diagnóstico no válido (01, 02, 03)'),
  body('via_ingreso_servicio_salud')
    .trim().notEmpty().withMessage('via_ingreso_servicio_salud es requerida')
    .isLength({ max: 2 }),
  body('modalidad_grupo_serv_tec_sal')
    .trim().notEmpty().withMessage('modalidad_grupo_serv_tec_sal es requerido')
    .isLength({ max: 2 }),
  body('grupo_servicios')
    .trim().notEmpty().withMessage('grupo_servicios es requerido')
    .isLength({ max: 2 }),
  body('concepto_recaudo')
    .trim().notEmpty().withMessage('concepto_recaudo es requerido')
    .isIn(['01','02','03','05']).withMessage('Concepto de recaudo no válido'),
  // Opcionales
  body('cod_diagnostico_relacionado1').optional({ nullable: true }).isLength({ max: 10 }),
  body('cod_diagnostico_relacionado2').optional({ nullable: true }).isLength({ max: 10 }),
  body('cod_diagnostico_relacionado3').optional({ nullable: true }).isLength({ max: 10 }),
  body('causa_externa').optional({ nullable: true }).isLength({ max: 3 }),
  body('cod_prestador').optional({ nullable: true }).isLength({ max: 12 }),
  body('num_autorizacion').optional({ nullable: true }).isLength({ max: 30 }),
  body('valor_urgencia').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_copago_moderadora').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_desc_no_pos').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_neg_no_pos').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_cuota_recuperacion').optional().isFloat({ min: 0 }).toFloat(),
  body('valor_comp_economicas').optional().isFloat({ min: 0 }).toFloat(),
];

const crearUrgencia    = [facturaIdParam, usuarioIdParam, ...camposUrgencia];
const actualizarUrgencia = [facturaIdParam, usuarioIdParam, idParam, ...camposUrgencia];

router.get('/',      [facturaIdParam, usuarioIdParam], ctrl.index);
router.get('/:id',   [facturaIdParam, usuarioIdParam, idParam], ctrl.show);
router.post('/',     crearUrgencia, ctrl.create);
router.patch('/:id', actualizarUrgencia, ctrl.update);
router.delete('/:id',[facturaIdParam, usuarioIdParam, idParam], ctrl.remove);

module.exports = router;
