package com.neffi.fond.controller;

import com.neffi.fond.dto.ApiResponse;
import com.neffi.fond.dto.BaseApiResponse;
import com.neffi.fond.dto.TransaccionInternaRequest;
import com.neffi.fond.dto.TransaccionInternaResponse;
import com.neffi.fond.service.TransaccionesInternasService;
import com.neffi.fond.util.ExcelResponseUtils;
import com.neffi.fond.util.TransaccionInternaExcelExporter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints propios de Neffi-Fond para Transacciones Internas. Delgado por
 * diseno: toda la logica de integracion con AdmonFondos-Api vive en
 * TransaccionesInternasService (ver politica de integracion en CLAUDE.md).
 */
@RestController
@RequestMapping("/api/transacciones-internas")
@RequiredArgsConstructor
public class TransaccionesInternasController {

    private final TransaccionesInternasService service;
    private final TransaccionInternaExcelExporter excelExporter;

    @GetMapping
    public ResponseEntity<BaseApiResponse<TransaccionInternaResponse>> listar(
            @RequestParam(required = false) String nombreTransaccion,
            @RequestParam(required = false) String senalIngEgr,
            @RequestParam(required = false) String claseTransaccion,
            @RequestParam(required = false) String grupoTrx) {
        List<TransaccionInternaResponse> data = service.listar(nombreTransaccion, senalIngEgr, claseTransaccion, grupoTrx);
        return ResponseEntity.ok(BaseApiResponse.success(
                "Transacciones internas obtenidas exitosamente", data,
                (long) data.size(), data.size(), 0));
    }

    @GetMapping("/{codigoReferencia}")
    public ResponseEntity<ApiResponse<TransaccionInternaResponse>> obtener(@PathVariable Long codigoReferencia) {
        return ResponseEntity.ok(ApiResponse.success(service.obtener(codigoReferencia)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransaccionInternaResponse>> crear(@Valid @RequestBody TransaccionInternaRequest request) {
        TransaccionInternaResponse creado = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaccion interna creada exitosamente", creado));
    }

    @PutMapping("/{codigoReferencia}")
    public ResponseEntity<ApiResponse<TransaccionInternaResponse>> actualizar(
            @PathVariable Long codigoReferencia,
            @Valid @RequestBody TransaccionInternaRequest request) {
        TransaccionInternaResponse actualizado = service.actualizar(codigoReferencia, request);
        return ResponseEntity.ok(ApiResponse.success("Transaccion interna actualizada exitosamente", actualizado));
    }

    @DeleteMapping("/{codigoReferencia}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long codigoReferencia) {
        service.eliminar(codigoReferencia);
        return ResponseEntity.ok(ApiResponse.success("Transaccion interna eliminada exitosamente", null));
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(required = false) String nombreTransaccion,
            @RequestParam(required = false) String senalIngEgr,
            @RequestParam(required = false) String claseTransaccion,
            @RequestParam(required = false) String grupoTrx) {
        List<TransaccionInternaResponse> data = service.listar(nombreTransaccion, senalIngEgr, claseTransaccion, grupoTrx);
        byte[] contenido = excelExporter.export(data);
        String filename = ExcelResponseUtils.buildFilename("transacciones-internas");
        return ExcelResponseUtils.buildExcelResponse(contenido, filename);
    }
}
