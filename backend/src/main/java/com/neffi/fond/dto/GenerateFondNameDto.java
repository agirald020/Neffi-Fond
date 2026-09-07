package com.neffi.fond.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GenerateFondNameDto {

    @NotBlank(message = "El tipo de fideicomiso es requerido")
    @Pattern(regexp = "FA|MR|FG", message = "Tipo debe ser FA, MR o FG")
    private String type;

    // Código asignado por la Superfinanciera (referencia externa, no va en el nombre)
    private String superfinancieraCode;

    // Clasificación del negocio fiduciario
    private String tipoNegocio;
    private String subtipoNegocio;

    @NotBlank(message = "El nombre del negocio es requerido")
    private String businessName;

    // Trazabilidad
    private String assignedBy;
    private String assignedByEmail;

    // Ciudad de ejecución (DIVIPOLA)
    private String ciudadEjecucion;
    private String codigoDivipola;
    private String departamento;
}
