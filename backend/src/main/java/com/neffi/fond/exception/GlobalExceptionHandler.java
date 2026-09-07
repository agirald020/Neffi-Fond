package com.neffi.fond.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.neffi.fond.dto.BaseApiResponse;
import com.neffi.fond.exception.custom.ExcelExportException;

import java.util.List;
import java.util.ArrayList;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseApiResponse<String>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.add(e.getField() + ": " + e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(BaseApiResponse.error("Error de validación", errors));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<BaseApiResponse<String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.error("Data integrity violation", ex);
        return ResponseEntity.status(400).body(BaseApiResponse.error("Violación de integridad de datos."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseApiResponse<String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Solicitud inválida: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(BaseApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ExcelExportException.class)
    public ResponseEntity<BaseApiResponse<String>> handleExcelExport(ExcelExportException ex) {
        log.error("Error en exportación de Excel: {}", ex.getMessage(), ex);
        return ResponseEntity.status(500).body(BaseApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseApiResponse<String>> handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(500).body(BaseApiResponse.error("Ocurrió un error en el servidor."));
    }
}
