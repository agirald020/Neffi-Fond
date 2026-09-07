package com.neffi.fond.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * Utilidades de exportación para capa web.
 */
public final class ExcelResponseUtils {

    private static final DateTimeFormatter FILENAME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private ExcelResponseUtils() {
    }

    /**
     * Construye el nombre del archivo con timestamp
     *
     * @param baseName nombre base del archivo (sin extensión)
     * @return nombre del archivo con timestamp
     */
    public static String buildFilename(String baseName) {
        String timestamp = LocalDateTime.now().format(FILENAME_FORMATTER);
        return baseName + "-" + timestamp + ".xlsx";
    }

    /**
     * Construye la respuesta HTTP para descargar un archivo Excel
     *
     * @param content  bytes del contenido del archivo
     * @param filename nombre del archivo
     * @return ResponseEntity configurada para descarga
     */
    public static ResponseEntity<byte[]> buildExcelResponse(byte[] content, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header("X-Filename", filename)
                .body(content);
    }
}
