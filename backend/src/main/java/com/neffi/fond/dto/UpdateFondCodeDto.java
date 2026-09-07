package com.neffi.fond.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateFondCodeDto {

    @NotBlank(message = "El nombre del negocio es requerido")
    private String businessName;

    private String superfinancieraCode;
    private String tipoNegocio;
    private String subtipoNegocio;

    private String updatedBy;
    private String updatedByEmail;
}
