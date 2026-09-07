package com.neffi.fond.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BaseApiResponse<T>(
                boolean success,
                String message,
                String code,
                List<T> data,
                String timestamp,
                String path,
                Long totalCount,
                Integer pageSize,
                Integer currentPage) {

        public BaseApiResponse {
                data = data == null ? List.of() : List.copyOf(data);
                timestamp = (timestamp == null || timestamp.isBlank()) ? Instant.now().toString() : timestamp;
        }

        public static <T> BaseApiResponse<T> success(List<T> data) {
                return success("Operacion exitosa", data);
        }

        public static <T> BaseApiResponse<T> success(String message, List<T> data) {
                return new BaseApiResponse<>(
                                true,
                                message,
                                "200",
                                data,
                                null,
                                null,
                                null,
                                null,
                                null);
        }

        public static <T> BaseApiResponse<T> success(String message, List<T> data, Long totalCount, Integer pageSize, Integer currentPage) {
                return new BaseApiResponse<>(
                                true,
                                message,
                                "200",
                                data,
                                null,
                                null,
                                totalCount,
                                pageSize,
                                currentPage);
        }

        public static <T> BaseApiResponse<T> error() {
                return error("Ocurrio un error en la operacion");
        }

        public static <T> BaseApiResponse<T> error(String message) {
                return error("500", message);
        }

        public static <T> BaseApiResponse<T> error(String code, String message) {
                return new BaseApiResponse<>(
                                false,
                                message,
                                code,
                                List.of(),
                                null,
                                null,
                                null,
                                null,
                                null);
        }

        public static <T> BaseApiResponse<T> error(String message, List<T> data) {
                return new BaseApiResponse<>(
                                false,
                                message,
                                "500",
                                data,
                                null,
                                null,
                                null,
                                null,
                                null);
        }
}
