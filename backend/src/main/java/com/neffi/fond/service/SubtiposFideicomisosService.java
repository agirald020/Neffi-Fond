package com.neffi.fond.service;

import com.neffi.fond.dto.BaseApiResponse;
import com.neffi.fond.dto.SubtipoFideicomisoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SubtiposFideicomisosService {

    private static final String SUBTIPOS_PATH = "/subtipos-fideicomisos";

    @Value("${app.external-api.base-url}")
    private String baseUrl;

    @Value("${app.external-api.api-key}")
    private String apiKey;

    @Value("${app.external-api.api-key-value}")
    private String apiKeyValue;

    public BaseApiResponse<SubtipoFideicomisoDto> getSubtiposFideicomisos() {
        RestClient restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        try {
            BaseApiResponse<SubtipoFideicomisoDto> response = restClient.get()
                    .uri(SUBTIPOS_PATH)
                    .header(apiKey, apiKeyValue)
                    .retrieve()
                    .body(new ParameterizedTypeReference<BaseApiResponse<SubtipoFideicomisoDto>>() {
                    });

            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El API externo no devolvio contenido para subtipos-fideicomisos");
            }

            return response;
        } catch (RestClientResponseException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Error consumiendo subtipos-fideicomisos del API externo: HTTP " + ex.getStatusCode(),
                    ex
            );
        }
    }
}
