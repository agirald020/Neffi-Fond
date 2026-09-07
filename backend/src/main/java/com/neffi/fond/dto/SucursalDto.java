package com.neffi.fond.dto;

public record SucursalDto(
        Long nitCliente,
        Integer codigoSucursal,
        String nombre,
        String direccion,
        Integer codigoCiudad,
        String nombreCiudad,
        Integer codigoZona,
        String nombreZona,
        String descripcion,
        Long nitRepresentante,
        String activa,
        String preventas,
        Integer codigoProyectoPreventas,
        String prefijoSucursal,
        Integer consecFactura,
        String telefono1,
        String telefono2,
        String fax,
        String resolFac,
        Integer sucursalEquivalente,
        Integer sedeFisica
) {
}
