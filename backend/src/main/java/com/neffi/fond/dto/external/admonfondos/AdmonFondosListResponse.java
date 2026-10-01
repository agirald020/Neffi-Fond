package com.neffi.fond.dto.external.admonfondos;

/**
 * Shape crudo de respuesta de listado de AdmonFondos-Api
 * (BaseResponsePageResponseTransaccionInternaResponse en su Swagger).
 * Uso interno exclusivo de la capa service — nunca se expone al frontend.
 */
public record AdmonFondosListResponse<T>(
        boolean success,
        String message,
        String code,
        AdmonFondosPageData<T> data,
        String timestamp,
        String path) {
}
