package com.neffi.fond.dto;

import java.util.List;

public record PaginatedResponse<T>(
        List<T> data,
        Long totalCount,
        Integer pageSize,
        Integer currentPage
) {
}
