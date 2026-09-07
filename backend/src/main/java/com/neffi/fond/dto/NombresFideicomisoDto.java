package com.neffi.fond.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NombresFideicomisoDto {

    private Integer id;

    @NotBlank(message = "El prefijo es obligatorio")
    private String prefijo;

    @NotBlank(message = "El nombre del fideicomiso es obligatorio")
    private String nombreFideicomiso;

    private Integer codigoSuper;

    @NotNull(message = "El código de tipo de fideicomiso es obligatorio")
    private Integer codTipoFideicomiso;

    @NotNull(message = "El código de sub-tipo de fideicomiso es obligatorio")
    private Integer codSubTipoFideicomiso;

    @NotNull(message = "El código de ciudad es obligatorio")
    private Integer codCiudad;

    @NotNull(message = "El código de sucursal es obligatorio")
    private Integer codSucursal;

    private LocalDate fechaSubContrato;
}
