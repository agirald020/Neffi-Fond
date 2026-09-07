package com.neffi.fond.dto;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        String message,
        String code,
        T data,
        String timestamp,
        String path) {

    public ApiResponse {
        timestamp = (timestamp == null || timestamp.isBlank()) ? Instant.now().toString() : timestamp;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success("Operacion exitosa", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                true,
                message,
                "200",
                data,
                null,
                null);
    }

    public static <T> ApiResponse<T> error() {
        return error("Ocurrio un error en la operacion");
    }

    public static <T> ApiResponse<T> error(String message) {
        return error("500", message);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(
                false,
                message,
                code,
                null,
                null,
                null);
    }
}
