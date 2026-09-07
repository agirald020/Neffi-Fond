package com.neffi.fond.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class AdmonFiduciaClientConfig {

    @Value("${admon-fiducia.api.base-url}")
    private String baseUrl;

    @Value("${admon-fiducia.api.timeout-ms:30000}")
    private int timeoutMs;

    @Value("${admon-fiducia.api.key-header:}")
    private String apiKeyHeader;

    @Value("${admon-fiducia.api.key-value:}")
    private String apiKeyValue;

    @Bean("admonFiduciaRestTemplate")
    public RestTemplate admonFiduciaRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);

        RestTemplate restTemplate = new RestTemplate(factory);

        if (apiKeyHeader != null && !apiKeyHeader.isBlank()) {
            List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
            interceptors.add(new ClientHttpRequestInterceptor() {
                @Override
                public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                        ClientHttpRequestExecution execution) throws IOException {
                    request.getHeaders().set(apiKeyHeader, apiKeyValue);
                    return execution.execute(request, body);
                }
            });
            restTemplate.setInterceptors(interceptors);
        }

        return restTemplate;
    }
}
