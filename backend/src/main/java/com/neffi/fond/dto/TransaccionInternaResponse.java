package com.neffi.fond.dto;

import java.math.BigDecimal;

/**
 * Representacion propia de Neffi-Fond de una transaccion interna, devuelta al
 * frontend. Se mapea manualmente desde el contrato externo de AdmonFondos-Api
 * (ver com.neffi.fond.dto.external.admonfondos) para no reexponer su shape.
 */
public record TransaccionInternaResponse(
        Long codigoReferencia,
        String nombreTransaccion,
        String descripcion,
        String senalIngEgr,
        BigDecimal porceImpuesto,
        Long codigoTrxAfecta,
        String afectaCampoAcumulados,
        String entraCanje,
        String claseTransaccion,
        String senalAnulacion,
        Long codTrxDevRnds,
        Long codTrxDevComi,
        Long codTrxDevOtros,
        Long codTrxHomolgacion,
        String descReportes,
        String cobraImptos,
        String grupoTrx,
        String envioSms) {
}
