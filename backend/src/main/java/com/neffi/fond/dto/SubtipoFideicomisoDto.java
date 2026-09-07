package com.neffi.fond.dto;

public record SubtipoFideicomisoDto(
        Integer tipoFideicomiso,
        Integer subtipo,
        String nombre,
        String descripcion,
        String usuario,
        String fechaRegistro,
        String tipoFideicomisoNombre
) {
}
