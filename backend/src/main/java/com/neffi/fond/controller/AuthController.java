package com.neffi.fond.controller;

import com.neffi.fond.service.AuthUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUserService authUserService;

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;

    @Value("${keycloak.realm:neffiLaft}")
    private String keycloakRealm;

    @Value("${keycloak.client-id}")
    private String keycloakClientId;

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(authUserService.getCurrentUser(jwt));
    }

    @GetMapping("/keycloak-config")
    public Map<String, Object> getKeycloakConfig() {
        return Map.of(
                "url", keycloakUrl,
                "realm", keycloakRealm,
                "clientId", keycloakClientId,
                "bypassActive", bypassAuth);
    }
}
