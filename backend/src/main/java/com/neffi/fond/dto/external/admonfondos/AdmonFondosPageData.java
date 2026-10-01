package com.neffi.fond.dto.external.admonfondos;

import java.util.List;

/**
 * Shape crudo de la seccion "data" de un listado paginado de AdmonFondos-Api
 * (PageResponseTransaccionInternaResponse en su Swagger). AdmonFondos-Api no
 * soporta page/size reales en este endpoint: siempre retorna todo en una sola
 * pagina (first=true, last=true).
 */
public record AdmonFondosPageData<T>(
        List<T> content,
        Integer pageNumber,
        Integer pageSize,
        Long totalElements,
        Integer totalPages,
        Boolean last,
        Boolean first) {
}
