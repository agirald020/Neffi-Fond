package com.neffi.fond.controller;

import com.neffi.fond.dto.BaseApiResponse;
import com.neffi.fond.dto.SubtipoFideicomisoDto;
import com.neffi.fond.service.SubtiposFideicomisosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subtipos-fideicomisos")
@RequiredArgsConstructor
public class SubtiposFideicomisosController {

    private final SubtiposFideicomisosService service;

    @GetMapping
    public ResponseEntity<BaseApiResponse<SubtipoFideicomisoDto>> getSubtiposFideicomisos() {
        return ResponseEntity.ok(service.getSubtiposFideicomisos());
    }
}
