package com.neffi.fond.dto.external.admonfondos;

/**
 * Shape crudo de respuesta de AdmonFondos-Api para un unico objeto
 * (BaseResponseTransaccionInternaResponse / BaseResponseVoid en su Swagger).
 * Uso interno exclusivo de la capa service — nunca se expone al frontend.
 */
public record AdmonFondosSingleResponse<T>(
        boolean success,
        String message,
        String code,
        T data,
        String timestamp,
        String path) {
}
