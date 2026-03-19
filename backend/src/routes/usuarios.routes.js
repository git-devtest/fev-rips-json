// src/routes/usuarios.routes.js
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/usuarios.controller');

const router = Router({ mergeParams: true }); // hereda factura_id del router padre

// ─── Reglas de validación ─────────────────────────────────────────────────────

const idParam = param('id')
  .isUUID().withMessage('El id debe ser un UUID válido');

const facturaIdParam = param('factura_id')
  .isUUID().withMessage('El factura_id debe ser un UUID válido');

const crearUsuario = [
  facturaIdParam,
  body('tipo_documento_identificacion')
    .trim().notEmpty().withMessage('tipo_documento_identificacion es requerido')
    .isIn(['RC','TI','CC','CE','PA','MS','AS','PE','PT','SC','CN'])
    .withMessage('Tipo de documento no válido según Resolución 2275'),
  body('num_documento_identificacion')
    .trim().notEmpty().withMessage('num_documento_identificacion es requerido')
    .isLength({ max: 20 }),
  body('tipo_usuario')
    .trim().notEmpty().withMessage('tipo_usuario es requerido')
    .isIn(['01','02','03','04','05','06','07','08','09'])
    .withMessage('Tipo de usuario no válido según Resolución 2275'),
  body('cod_zona_territorial_residencia')
    .trim().notEmpty().withMessage('cod_zona_territorial_residencia es requerido')
    .isIn(['01','02'])
    .withMessage('Debe ser 01 (urbana) o 02 (rural)'),
  body('fecha_nacimiento')
    .optional({ nullable: true })
    .isDate().withMessage('Formato inválido (YYYY-MM-DD)'),
  body('cod_pais_residencia')
    .optional({ nullable: true })
    .isLength({ max: 3 }),
  body('cod_municipio_residencia')
    .optional({ nullable: true })
    .isLength({ max: 5 }),
  body('incapacidad')
    .optional({ nullable: true })
    .isIn(['01','02','03','04','05'])
    .withMessage('Código de incapacidad no válido'),
  body('consecutivo_usuario')
    .optional({ nullable: true })
    .isInt({ min: 1 }).toInt(),
];

const actualizarUsuario = [
  facturaIdParam,
  idParam,
  body('tipo_usuario')
    .optional()
    .isIn(['01','02','03','04','05','06','07','08','09']),
  body('cod_zona_territorial_residencia')
    .optional()
    .isIn(['01','02']),
  body('fecha_nacimiento')
    .optional({ nullable: true })
    .isDate(),
  body('cod_pais_residencia')
    .optional({ nullable: true })
    .isLength({ max: 3 }),
  body('cod_municipio_residencia')
    .optional({ nullable: true })
    .isLength({ max: 5 }),
  body('incapacidad')
    .optional({ nullable: true })
    .isIn(['01','02','03','04','05']),
  body('consecutivo_usuario')
    .optional({ nullable: true })
    .isInt({ min: 1 }).toInt(),
];

// ─── Rutas ────────────────────────────────────────────────────────────────────
// Montadas bajo /api/v1/facturas/:factura_id/usuarios

router.get('/',    [facturaIdParam], ctrl.index);
router.get('/:id', [facturaIdParam, idParam], ctrl.show);
router.post('/',   crearUsuario,    ctrl.create);
router.patch('/:id', actualizarUsuario, ctrl.update);
router.delete('/:id', [facturaIdParam, idParam], ctrl.remove);

module.exports = router;
