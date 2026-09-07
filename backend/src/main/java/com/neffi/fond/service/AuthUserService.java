package com.neffi.fond.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AuthUserService {

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    public Map<String, Object> getCurrentUser(Jwt jwt) {
        if (bypassAuth || jwt == null) {
            return Map.of(
                    "id", "dev-user",
                    "username", "dev@bypass",
                    "email", "dev@bypass.local",
                    "name", "Usuario de Desarrollo",
                    "roles", List.of("admin", "user")
            );
        }

                String username = extractUsername(jwt);
        String email = firstNonBlank(jwt.getClaimAsString("email"), "");
        String name = firstNonBlank(jwt.getClaimAsString("name"), username);

        return Map.of(
                "id", firstNonBlank(jwt.getSubject(), ""),
                "username", username,
                "email", email,
                "name", name,
                "roles", resolveRoles(jwt)
        );
    }

    public String extractUsername(Jwt jwt) {
        if (bypassAuth || jwt == null) {
            return "bypass-user";
        }

        return firstNonBlank(jwt.getClaimAsString("preferred_username"), jwt.getSubject(), "");
    }

    public String resolveUsername(Jwt jwt) {
        return extractUsername(jwt);
    }

    public String resolveFullName(Jwt jwt) {
        if (bypassAuth || jwt == null) return "Usuario de Desarrollo";
        return firstNonBlank(jwt.getClaimAsString("name"), extractUsername(jwt));
    }

    private List<String> resolveRoles(Jwt jwt) {
        List<String> directRoles = jwt.getClaimAsStringList("roles");
        if (directRoles != null && !directRoles.isEmpty()) {
            return directRoles;
        }

        Set<String> roles = new LinkedHashSet<>();

        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            Object realmRoles = realmAccess.get("roles");
            if (realmRoles instanceof List<?> list) {
                list.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .forEach(roles::add);
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            resourceAccess.values().forEach(resource -> {
                if (resource instanceof Map<?, ?> map) {
                    Object resourceRoles = map.get("roles");
                    if (resourceRoles instanceof List<?> list) {
                        list.stream()
                                .filter(String.class::isInstance)
                                .map(String.class::cast)
                                .forEach(roles::add);
                    }
                }
            });
        }

        return new ArrayList<>(roles);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}