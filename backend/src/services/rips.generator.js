// src/services/rips.generator.js
// Ensambla el JSON RIPS según estructura exacta de la Resolución 2275 de 2023
'use strict';

const { query } = require('../config/database');

/**
 * Obtiene todos los datos de una factura y ensambla el JSON RIPS.
 * Estructura: 1 JSON = 1 Factura
 * {
 *   numDocumentoIdObligado,
 *   numFactura,
 *   tipoNota,
 *   numNota,
 *   usuarios: [
 *     {
 *       ...datosUsuario,
 *       servicios: {
 *         consultas: [...] | procedimientos: [...]
 *       }
 *     }
 *   ]
 * }
 */
async function generarRips(factura_id) {
  // ── 1. Cabecera de la factura ─────────────────────────────────────────────
  const { rows: facturas } = await query(
    `SELECT f.*, p.num_documento_id_obligado
     FROM facturas f
     JOIN prestadores p ON p.id = f.prestador_id
     WHERE f.id = $1`,
    [factura_id]
  );

  if (facturas.length === 0) return null;
  const factura = facturas[0];

  // ── 2. Usuarios de la factura ─────────────────────────────────────────────
  const { rows: usuarios } = await query(
    `SELECT * FROM usuarios_rips WHERE factura_id = $1 ORDER BY created_at ASC`,
    [factura_id]
  );

  if (usuarios.length === 0) {
    throw new Error('La factura no tiene usuarios registrados');
  }

  // ── 3. Servicios por usuario ──────────────────────────────────────────────
  const usuariosJson = await Promise.all(usuarios.map(async (u) => {
    const [consultas, procedimientos] = await Promise.all([
      query('SELECT * FROM consultas    WHERE usuario_rips_id = $1 ORDER BY fecha_ini_atencion ASC', [u.id]),
      query('SELECT * FROM procedimientos WHERE usuario_rips_id = $1 ORDER BY fecha_ini_atencion ASC', [u.id]),
    ]);

    const tieneConsultas      = consultas.rows.length > 0;
    const tieneProcedimientos = procedimientos.rows.length > 0;

    if (!tieneConsultas && !tieneProcedimientos) {
      throw new Error(`El usuario ${u.num_documento_identificacion} no tiene servicios registrados`);
    }

    // Mapear usuario al formato RIPS
    const usuarioRips = {
      tipoDocumentoIdentificacion:    u.tipo_documento_identificacion,
      numDocumentoIdentificacion:     u.num_documento_identificacion,
      tipoUsuario:                    u.tipo_usuario,
      fechaNacimiento:                u.fecha_nacimiento ? formatDate(u.fecha_nacimiento) : null,
      codSexo:                        u.cod_sexo              || null,
      codPaisResidencia:              u.cod_pais_residencia,
      codMunicipioResidencia:         u.cod_municipio_residencia || null,
      codZonaTerritorialResidencia:   u.cod_zona_territorial_residencia,
      incapacidad:                    u.incapacidad            || null,
      codPaisOrigen:                  u.cod_pais_origen        || '170',
      consecutivo:                    u.consecutivo_usuario    || null,
      servicios: {},
    };

    // Servicios: consultas O procedimientos (nunca ambos)
    if (tieneConsultas) {
      usuarioRips.servicios.consultas = consultas.rows.map(mapConsulta);
    } else {
      usuarioRips.servicios.procedimientos = procedimientos.rows.map(mapProcedimiento);
    }

    return usuarioRips;
  }));

  // ── 4. JSON RIPS final ────────────────────────────────────────────────────
  const ripsJson = {
    numDocumentoIdObligado: factura.num_documento_id_obligado,
    numFactura:             factura.num_factura,
    tipoNota:               factura.tipo_nota   || null,
    numNota:                factura.num_nota     || null,
    usuarios:               usuariosJson,
  };

  return ripsJson;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapConsulta(c) {
  return {
    codConsulta:                  c.cod_consulta,
    modalidadGrupoServicioTecSal: c.modalidad_grupo_serv_tec_sal,
    grupoServicios:               c.grupo_servicios,
    codPrestador:                 c.cod_prestador    || undefined,
    fechaIniAtencion:             formatDateTime(c.fecha_ini_atencion),
    numAutorizacion:              c.num_autorizacion || undefined,
    valorConsulta:                parseFloat(c.valor_consulta),
    valorCuotaModeradora:         parseFloat(c.valor_copago_moderadora),
    valorDescNoPos:               parseFloat(c.valor_desc_no_pos),
    valorNegNoPos:                parseFloat(c.valor_neg_no_pos),
    valorCuotaRecuperacion:       parseFloat(c.valor_cuota_recuperacion),
    valorCompEconomicas:          parseFloat(c.valor_comp_economicas),
    conceptoRecaudo:              c.concepto_recaudo,
    tipoDocIdMedico:              c.tipo_doc_id_medico  || undefined,
    numDocIdMedico:               c.num_doc_id_medico   || undefined,
    codDxPrincipal:               c.cod_dx_principal,
    codDxRelacionado1:            c.cod_dx_relacionado1 || undefined,
    codDxRelacionado2:            c.cod_dx_relacionado2 || undefined,
    codDxRelacionado3:            c.cod_dx_relacionado3 || undefined,
    tipoDxPrincipal:              c.tipo_dx_principal,
    finalidadConsulta:            c.finalidad_consulta,
    causaExterna:                 c.causa_externa,
    codCupCausaExterna:           c.cod_cup_causa_externa || undefined,
    viaIngresoServicioSalud:      c.via_ingreso_servicio_salud,
  };
}

function mapProcedimiento(p) {
  return {
    codPrestador:                 p.cod_prestador              || null,
    fechaInicioAtencion:          formatDateTime(p.fecha_ini_atencion),
    idMIPRES:                     p.id_mipres                  || null,
    numAutorizacion:              p.num_autorizacion            || null,
    codProcedimiento:             p.cod_procedimiento,
    viaIngresoServicioSalud:      p.via_ingreso_servicio_salud,
    modalidadGrupoServicioTecSal: p.modalidad_grupo_serv_tec_sal,
    grupoServicios:               p.grupo_servicios,
    codServicio:                  p.cod_servicio                || null,
    finalidadTecnologiaSalud:     p.finalidad_tecnologia_salud  || null,
    tipoDocumentoIdentificacion:  p.tipo_doc_id_medico          || null,
    numDocumentoIdentificacion:   p.num_doc_id_medico           || null,
    codDiagnosticoPrincipal:      p.dx_principal,
    codDiagnosticoRelacionado:    p.dx_relacionado              || null,
    codComplicacion:              p.dx_complicacion             || null,
    vrServicio:                   parseFloat(p.valor_procedimiento),
    conceptoRecaudo:              p.concepto_recaudo,
    valorPagoModerador:           parseFloat(p.valor_copago_moderadora),
    numFEVPagoModerador:          p.num_fev_pago_moderador      || null,
    consecutivo:                  p.consecutivo                 || null,
  };
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function formatDate(date) {
  // Retorna YYYY-MM-DD
  return new Date(date).toISOString().substring(0, 10);
}

function formatDateTime(date) {
  // Retorna YYYY-MM-DD HH:mm según formato del JSON de referencia SISPRO
  const d = new Date(date);
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(d.getUTCDate()).padStart(2, '0');
  const hh   = String(d.getUTCHours()).padStart(2, '0');
  const min  = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

module.exports = { generarRips };
