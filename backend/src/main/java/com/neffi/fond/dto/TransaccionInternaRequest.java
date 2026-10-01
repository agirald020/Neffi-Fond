package com.neffi.fond.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Body de creacion/actualizacion de una transaccion interna (AdmonFondos-Api).
 * Los nombres de campo replican 1:1 el contrato externo (TransaccionInternaRequest
 * del Swagger de AdmonFondos-Api) para simplificar el mapeo.
 */
public record TransaccionInternaRequest(
        @NotBlank(message = "El nombre de la transaccion es obligatorio")
        @Size(max = 50, message = "El nombre de la transaccion no puede superar 50 caracteres")
        String nombreTransaccion,

        @Size(max = 256, message = "La descripcion no puede superar 256 caracteres")
        String descripcion,

        @NotBlank(message = "La senal ingreso/egreso es obligatoria")
        @Pattern(regexp = "^[IEie]$", message = "La senal ingreso/egreso debe ser I (Ingreso) o E (Egreso)")
        String senalIngEgr,

        @DecimalMin(value = "0.0", message = "El porcentaje de impuesto no puede ser negativo")
        @DecimalMax(value = "1.0", message = "El porcentaje de impuesto debe ser una fraccion entre 0 y 1")
        BigDecimal porceImpuesto,

        Long codigoTrxAfecta,

        @Size(max = 2, message = "Afecta campo acumulados no puede superar 2 caracteres")
        String afectaCampoAcumulados,

        @Size(max = 1, message = "Entra en canje no puede superar 1 caracter")
        String entraCanje,

        @Size(max = 3, message = "La clase de transaccion no puede superar 3 caracteres")
        String claseTransaccion,

        @Size(max = 2, message = "La senal de anulacion no puede superar 2 caracteres")
        String senalAnulacion,

        Long codTrxDevRnds,

        Long codTrxDevComi,

        Long codTrxDevOtros,

        Long codTrxHomolgacion,

        @Size(max = 3, message = "La descripcion de reportes no puede superar 3 caracteres")
        String descReportes,

        @Size(max = 3, message = "Cobra impuestos no puede superar 3 caracteres")
        String cobraImptos,

        @Size(max = 3, message = "El grupo de transaccion no puede superar 3 caracteres")
        String grupoTrx,

        @Size(max = 2, message = "Envio de SMS no puede superar 2 caracteres")
        String envioSms) {
}
