package com.neffi.fond.controller;

import com.neffi.fond.dto.BaseApiResponse;
import com.neffi.fond.dto.SucursalDto;
import com.neffi.fond.service.SucursalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
public class SucursalesController {

    private final SucursalesService service;

    @GetMapping
    public ResponseEntity<BaseApiResponse<SucursalDto>> getSucursalesPrincipales() {
        return ResponseEntity.ok(service.getSucursalesPrincipales());
    }
}
