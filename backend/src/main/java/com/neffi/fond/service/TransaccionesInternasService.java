package com.neffi.fond.service;

import com.neffi.fond.dto.TransaccionInternaRequest;
import com.neffi.fond.dto.TransaccionInternaResponse;
import com.neffi.fond.dto.external.admonfondos.AdmonFondosListResponse;
import com.neffi.fond.dto.external.admonfondos.AdmonFondosSingleResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.function.Supplier;

/**
 * Integracion con AdmonFondos-Api (parametros/transacciones-internas).
 * Unica capa que conoce el shape externo (com.neffi.fond.dto.external.admonfondos):
 * mapea siempre a los DTOs propios de Neffi-Fond antes de retornar al controller.
 *
 * AdmonFondos-Api exige un Bearer JWT en cada request. Se reenvia el mismo
 * token del usuario autenticado (mismo Keycloak/realm que Neffi-Fond); en modo
 * AUTH_BYPASS=true (desarrollo, sin JWT real) se usa el fallback
 * admonfondos.api.dev-token si esta configurado.
 */
@Slf4j
@Service
public class TransaccionesInternasService {

    private static final String BASE_PATH = "/parametros/transacciones-internas";

    @Value("${admonfondos.api.base-url}")
    private String baseUrl;

    @Value("${admonfondos.api.dev-token:}")
    private String devToken;

    private RestClient restClient;

    @PostConstruct
    void init() {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<TransaccionInternaResponse> listar(String nombreTransaccion, String senalIngEgr,
                                                     String claseTransaccion, String grupoTrx) {
        AdmonFondosListResponse<TransaccionInternaResponse> response = ejecutar(() -> restClient.get()
                        .uri(uriBuilder -> {
                            uriBuilder.path(BASE_PATH);
                            if (nombreTransaccion != null && !nombreTransaccion.isBlank()) {
                                uriBuilder.queryParam("nombreTransaccion", nombreTransaccion);
                            }
                            if (senalIngEgr != null && !senalIngEgr.isBlank()) {
                                uriBuilder.queryParam("senalIngEgr", senalIngEgr);
                            }
                            if (claseTransaccion != null && !claseTransaccion.isBlank()) {
                                uriBuilder.queryParam("claseTransaccion", claseTransaccion);
                            }
                            if (grupoTrx != null && !grupoTrx.isBlank()) {
                                uriBuilder.queryParam("grupoTrx", grupoTrx);
                            }
                            return uriBuilder.build();
                        })
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resolveBearerToken())
                        .retrieve()
                        .body(new ParameterizedTypeReference<AdmonFondosListResponse<TransaccionInternaResponse>>() {
                        }),
                "listar transacciones internas", null);

        if (response == null || response.data() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El API externo no devolvio contenido para transacciones internas");
        }
        return response.data().content() == null ? List.of() : response.data().content();
    }

    public TransaccionInternaResponse obtener(Long codigoReferencia) {
        AdmonFondosSingleResponse<TransaccionInternaResponse> response = ejecutar(() -> restClient.get()
                        .uri(BASE_PATH + "/{codigoReferencia}", codigoReferencia)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resolveBearerToken())
                        .retrieve()
                        .body(new ParameterizedTypeReference<AdmonFondosSingleResponse<TransaccionInternaResponse>>() {
                        }),
                "obtener transaccion interna", codigoReferencia);

        return extraerDato(response, codigoReferencia);
    }

    public TransaccionInternaResponse crear(TransaccionInternaRequest request) {
        AdmonFondosSingleResponse<TransaccionInternaResponse> response = ejecutar(() -> restClient.post()
                        .uri(BASE_PATH)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resolveBearerToken())
                        .body(request)
                        .retrieve()
                        .body(new ParameterizedTypeReference<AdmonFondosSingleResponse<TransaccionInternaResponse>>() {
                        }),
                "crear transaccion interna", null);

        return extraerDato(response, null);
    }

    public TransaccionInternaResponse actualizar(Long codigoReferencia, TransaccionInternaRequest request) {
        AdmonFondosSingleResponse<TransaccionInternaResponse> response = ejecutar(() -> restClient.put()
                        .uri(BASE_PATH + "/{codigoReferencia}", codigoReferencia)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resolveBearerToken())
                        .body(request)
                        .retrieve()
                        .body(new ParameterizedTypeReference<AdmonFondosSingleResponse<TransaccionInternaResponse>>() {
                        }),
                "actualizar transaccion interna", codigoReferencia);

        return extraerDato(response, codigoReferencia);
    }

    public void eliminar(Long codigoReferencia) {
        ejecutarVoid(() -> restClient.delete()
                        .uri(BASE_PATH + "/{codigoReferencia}", codigoReferencia)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resolveBearerToken())
                        .retrieve()
                        .toBodilessEntity(),
                "eliminar transaccion interna", codigoReferencia);
    }

    private TransaccionInternaResponse extraerDato(AdmonFondosSingleResponse<TransaccionInternaResponse> response,
                                                     Long codigoReferencia) {
        if (response == null || response.data() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Transaccion interna no encontrada" + (codigoReferencia != null ? ": " + codigoReferencia : ""));
        }
        return response.data();
    }

    private String resolveBearerToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getTokenValue();
        }
        if (devToken != null && !devToken.isBlank()) {
            return devToken;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "No hay token JWT disponible para autenticar contra AdmonFondos-Api. "
                        + "Configure ADMONFONDOS_API_DEV_TOKEN en modo desarrollo (AUTH_BYPASS=true).");
    }

    private <R> R ejecutar(Supplier<R> call, String operacion, Long codigoReferencia) {
        try {
            return call.get();
        } catch (RestClientResponseException ex) {
            throw traducirError(ex, operacion, codigoReferencia);
        }
    }

    private void ejecutarVoid(Runnable call, String operacion, Long codigoReferencia) {
        try {
            call.run();
        } catch (RestClientResponseException ex) {
            throw traducirError(ex, operacion, codigoReferencia);
        }
    }

    private ResponseStatusException traducirError(RestClientResponseException ex, String operacion, Long codigoReferencia) {
        int status = ex.getStatusCode().value();
        if (status == 404) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Transaccion interna no encontrada" + (codigoReferencia != null ? ": " + codigoReferencia : ""));
        }
        if (status == 400) {
            return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solicitud invalida hacia AdmonFondos-Api al " + operacion);
        }
        log.error("Error HTTP {} consumiendo AdmonFondos-Api al {}: {}", status, operacion, ex.getMessage());
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Error consumiendo transacciones internas del API externo al " + operacion + ": HTTP " + status, ex);
    }
}
