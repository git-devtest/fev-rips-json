// src/utils/servicios.utils.js
'use strict';

const { query } = require('../config/database');

const TABLAS_SERVICIO = {
  consultas:       'consultas',
  procedimientos:  'procedimientos',
  urgencias:       'urgencias',
  hospitalizacion: 'hospitalización',
  recien_nacidos:  'recién nacidos',
  medicamentos:    'medicamentos',
  otros_servicios: 'otros servicios',
};

/**
 * Verifica exclusión mutua de servicios por usuario (Res. 2275).
 * Consulta en paralelo todas las tablas excepto la del tipo actual.
 *
 * @param {string} usuario_rips_id  UUID del usuario
 * @param {string} tipoActual       Clave del mapa TABLAS_SERVICIO del tipo que se va a crear
 * @returns {string|null}           Nombre legible del tipo existente, o null si no hay conflicto
 */
async function verificarExclusionMutua(usuario_rips_id, tipoActual) {
  const otras = Object.entries(TABLAS_SERVICIO).filter(([tabla]) => tabla !== tipoActual);

  const resultados = await Promise.all(
    otras.map(([tabla]) =>
      query(`SELECT 1 FROM ${tabla} WHERE usuario_rips_id = $1 LIMIT 1`, [usuario_rips_id])
    )
  );

  const conflicto = resultados.findIndex(({ rows }) => rows.length > 0);
  return conflicto >= 0 ? otras[conflicto][1] : null;
}

module.exports = { verificarExclusionMutua };