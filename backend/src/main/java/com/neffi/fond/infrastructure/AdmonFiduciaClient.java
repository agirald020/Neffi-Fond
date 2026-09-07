package com.neffi.fond.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AdmonFiduciaClient {

    @Value("${admon-fiducia.api.base-url}")
    private String baseUrl;

    private final RestTemplate admonFiduciaRestTemplate;

    public AdmonFiduciaClient(@Qualifier("admonFiduciaRestTemplate") RestTemplate admonFiduciaRestTemplate) {
        this.admonFiduciaRestTemplate = admonFiduciaRestTemplate;
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────────

    public record OrdenGiroDto(
            Long codigoFideicomiso,
            Long consecutivoMasivo,
            String estado,
            String estadoDescripcion,
            String tipoDato,
            String tipoNegocio,
            String tipoOrden,
            Long nitFondoOrigen,
            Long sucursalOrigen,
            String descripcionPago,
            String numRadicado,
            String fechaEjecucion,
            String fechaInicial,
            String fechaFinal,
            String fechaRegistro,
            String usuarioRegistro,
            BigDecimal ingresos,
            BigDecimal gastos,
            BigDecimal montoTotal,
            Long cantidadLineas) {}

    public record PagoDetalleDto(
            Long codigoFideicomiso,
            Long consecutivoMasivo,
            Long nroRegistroMasivo,
            String contratoNumero,
            Long nitTerceroPago,
            BigDecimal valorPago,
            BigDecimal vlrNetoPago,
            String estado,
            Long tipoCuenta,
            String numeroCuenta,
            Long entidadBancaria,
            String observaciones,
            String fechaProceso) {}

    public record ParametrosOGDto(
            Long nitCompania,
            BigDecimal montoAutorizacionTelefonica,
            BigDecimal montoAutorizacionMaxima) {}

    public record UsuarioTipoResponsableDto(
            Integer codigoTipoResponsable,
            String tipoResponsable,
            String clasificacion,
            Long codigoFideicomiso,
            String usuario,
            String email) {}

    public record AnexoOrdenGiroDto(
            Long secuencia,
            String nombre,
            String tipo,
            Long tamanio,
            Long nitTercero,
            Integer tipoDocumento,
            String urlDescarga) {}

    public record OrdenGiroResumenDto(
            String estado,
            String estadoDescripcion,
            Long cantidad,
            BigDecimal montoTotal) {}

    public record PageableOrdenesDto(
            List<OrdenGiroDto> content,
            Long totalElements,
            Integer pageSize,
            Integer currentPage) {}

    // ── Methods ───────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public OrdenGiroDto getOrdenGiro(Long codigoFideicomiso, Long consecutivoMasivo) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" + consecutivoMasivo;
        log.debug("GET OrdenGiro: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET OrdenGiro completado en {}ms - status {}", duracion, response.getStatusCode());
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getOrdenGiro: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            return mapToOrdenGiroDto((Map<String, Object>) body.get("data"));
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getOrdenGiro [{}/{}]: {}", codigoFideicomiso, consecutivoMasivo, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado en AdmonFiduciaClient.getOrdenGiro: {}", e.getMessage());
            throw new RuntimeException("Error al obtener orden de giro: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<PagoDetalleDto> getLineasOrdenGiro(Long codigoFideicomiso, Long consecutivoMasivo) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" + consecutivoMasivo + "/lineas";
        log.debug("GET LineasOrdenGiro: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET LineasOrdenGiro completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getLineasOrdenGiro: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream().map(this::mapToPagoDetalleDto).toList();
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getLineasOrdenGiro: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener líneas de orden de giro: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public ParametrosOGDto getParametrosOG(Long nitCompania) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/parametros/" + nitCompania;
        log.debug("GET ParametrosOG: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET ParametrosOG completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getParametrosOG: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            return mapToParametrosOGDto(data);
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getParametrosOG [{}]: {}", nitCompania, e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener parámetros OG: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public OrdenGiroDto cambiarEstadoOrden(Long codigoFideicomiso, Long consecutivoMasivo,
            String estadoNuevo, String observacion, String usuario) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" + consecutivoMasivo + "/estado";
        log.info("POST CambiarEstadoOrden: {}/{} -> estado={}", codigoFideicomiso, consecutivoMasivo, estadoNuevo);

        if (observacion != null && observacion.length() > 200) {
            observacion = observacion.substring(0, 100) + "...";
        }

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("estadoNuevo", estadoNuevo);
        requestBody.put("observacion", observacion != null ? observacion : "");
        // Oracle usa usuarios en mayúsculas
        requestBody.put("usuario", usuario != null ? usuario.toUpperCase() : usuario);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.POST, requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("POST CambiarEstadoOrden completado en {}ms - status {}", duracion, response.getStatusCode());
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia cambiarEstadoOrden: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            Object data = body.get("data");
            if (data instanceof Map) {
                return mapToOrdenGiroDto((Map<String, Object>) data);
            }
            return null;
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.cambiarEstadoOrden: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar estado de orden de giro: " + e.getMessage(), e);
        }
    }

    /**
     * Retorna TODOS los tipos de responsable del usuario para un fideicomiso.
     * Un usuario puede tener múltiples códigos (ej: Administrador=0, Auxiliar=5).
     * La respuesta de AdmonFiducia puede ser una lista o un solo objeto —
     * ambos casos se manejan correctamente.
     */
    @SuppressWarnings("unchecked")
    public List<UsuarioTipoResponsableDto> getTiposResponsableUsuario(String usuario, Long codigoFideicomiso) {
        // Oracle almacena los usuarios en mayúsculas; Keycloak los envía en minúsculas.
        String usuarioOracle = usuario != null ? usuario.toUpperCase() : usuario;
        String url = baseUrl + "/tipos-responsables/usuario/" + usuarioOracle + "/fideicomiso/" + codigoFideicomiso;
        log.debug("GET TiposResponsableUsuario: usuario={}, fideicomiso={}", usuario, codigoFideicomiso);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                log.warn("TiposResponsableUsuario sin datos para usuario='{}' fideicomiso={}: {}",
                        usuario, codigoFideicomiso, body != null ? body.get("message") : "respuesta nula");
                return List.of();
            }
            Object rawData = body.get("data");
            if (rawData == null) return List.of();

            // Soporta respuesta como List<Map> (BaseApiResponse estándar)
            if (rawData instanceof List<?> lista) {
                return lista.stream()
                        .filter(item -> item instanceof Map)
                        .map(item -> mapToUsuarioTipoResponsableDto((Map<String, Object>) item))
                        .filter(dto -> dto != null && dto.codigoTipoResponsable() != null)
                        .toList();
            }
            // Soporta respuesta como Map (objeto único)
            if (rawData instanceof Map<?,?> mapa) {
                UsuarioTipoResponsableDto dto = mapToUsuarioTipoResponsableDto((Map<String, Object>) mapa);
                return dto != null && dto.codigoTipoResponsable() != null ? List.of(dto) : List.of();
            }
            return List.of();
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.warn("AdmonFiducia 5xx en TiposResponsableUsuario usuario='{}' fideicomiso={}", usuario, codigoFideicomiso);
            return List.of();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.warn("AdmonFiducia 4xx en TiposResponsableUsuario usuario='{}' fideicomiso={}: {}", usuario, codigoFideicomiso, e.getStatusCode());
            return List.of();
        } catch (Exception e) {
            log.error("Error en getTiposResponsableUsuario [{}/{}]: {}", usuario, codigoFideicomiso, e.getMessage());
            return List.of();
        }
    }

    /** @deprecated Usar {@link #getTiposResponsableUsuario} — retorna lista completa. */
    @Deprecated
    public UsuarioTipoResponsableDto getTipoResponsableUsuario(String usuario, Long codigoFideicomiso) {
        return getTiposResponsableUsuario(usuario, codigoFideicomiso).stream().findFirst().orElse(null);
    }

    @SuppressWarnings("unchecked")
    public PageableOrdenesDto getOrdenesGiro(Long codigoFideicomiso, String estado, String tipoOrden,String idUsuario, int page, int size) {
        long inicio = System.currentTimeMillis();
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/ordenes-giro")
                .queryParam("page", page)
                .queryParam("size", size);
        if (codigoFideicomiso != null) builder.queryParam("codigoFideicomiso", codigoFideicomiso);
        if (estado != null && !estado.isBlank()) builder.queryParam("estado", estado);
        if (tipoOrden != null && !tipoOrden.isBlank()) builder.queryParam("tipoOrden", tipoOrden);
        if (idUsuario != null && !idUsuario.isBlank()) builder.queryParam("idUsuario", idUsuario);
        String url = builder.toUriString();
        log.debug("GET OrdenesGiro: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET OrdenesGiro completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getOrdenesGiro: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            // Try to parse paginated data
            Object rawData = body.get("data");
            List<OrdenGiroDto> content;
            Long totalElements = null;
            if (rawData instanceof List) {
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) rawData;
                content = dataList.stream().map(this::mapToOrdenGiroDto).toList();
                Object total = body.get("totalCount");
                if (total instanceof Number n) totalElements = n.longValue();
            } else if (rawData instanceof Map) {
                Map<String, Object> pageData = (Map<String, Object>) rawData;
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) pageData.get("content");
                content = contentList != null ? contentList.stream().map(this::mapToOrdenGiroDto).toList() : List.of();
                Object total = pageData.get("totalElements");
                if (total instanceof Number n) totalElements = n.longValue();
            } else {
                content = List.of();
            }
            return new PageableOrdenesDto(content, totalElements, size, page);
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getOrdenesGiro: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener órdenes de giro: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<OrdenGiroResumenDto> getResumenOrdenes(Long codigoFideicomiso) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/resumen/" + codigoFideicomiso;
        log.debug("GET ResumenOrdenes: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET ResumenOrdenes completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getResumenOrdenes: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream().map(this::mapToOrdenGiroResumenDto).toList();
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getResumenOrdenes [{}]: {}", codigoFideicomiso, e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener resumen de órdenes: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<AnexoOrdenGiroDto> getAnexosOrden(Long codigoFideicomiso, Long consecutivoMasivo) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" + consecutivoMasivo + "/anexos";
        log.debug("GET AnexosOrden: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET AnexosOrden completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getAnexosOrden: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream()
                    .map(m -> mapToAnexoOrdenGiroDto(m, codigoFideicomiso, consecutivoMasivo))
                    .toList();
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getAnexosOrden [{}/{}]: {}", codigoFideicomiso, consecutivoMasivo, e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener anexos de orden de giro: " + e.getMessage(), e);
        }
    }

    public byte[] descargarAnexo(Long codigoFideicomiso, Long consecutivoMasivo, Long secuencia) {
        long inicio = System.currentTimeMillis();
        String url = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" + consecutivoMasivo +
                "/anexos/" + secuencia + "/descargar";
        log.info("GET DescargarAnexo: {}/{}/{}", codigoFideicomiso, consecutivoMasivo, secuencia);
        try {
            ResponseEntity<byte[]> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null, byte[].class);
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET DescargarAnexo completado en {}ms - {} bytes", duracion,
                    response.getBody() != null ? response.getBody().length : 0);
            byte[] body = response.getBody();
            if (body == null) throw new RuntimeException("Contenido de anexo vacío");
            return body;
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new RuntimeException("Anexo no encontrado: " + codigoFideicomiso + "/" + consecutivoMasivo + "/" + secuencia);
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.descargarAnexo [{}/{}/{}]: {}", codigoFideicomiso, consecutivoMasivo, secuencia, e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al descargar anexo: " + e.getMessage(), e);
        }
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private OrdenGiroDto mapToOrdenGiroDto(Map<String, Object> m) {
        if (m == null) return null;
        return new OrdenGiroDto(
                toLong(m.get("codigoFideicomiso")),
                toLong(m.get("consecutivoMasivo")),
                str(m.get("estado")),
                str(m.get("estadoDescripcion")),
                str(m.get("tipoDato")),
                str(m.get("tipoNegocio")),
                str(m.get("tipoOrden")),
                toLong(m.get("nitFondoOrigen")),
                toLong(m.get("sucursalOrigen")),
                str(m.get("descripcionPago")),
                str(m.get("numRadicado")),
                str(m.get("fechaEjecucion")),
                str(m.get("fechaInicial")),
                str(m.get("fechaFinal")),
                str(m.get("fechaRegistro")),
                str(m.get("usuarioRegistro")),
                toBigDecimal(m.get("ingresos")),
                toBigDecimal(m.get("gastos")),
                toBigDecimal(m.get("montoTotal")),
                toLong(m.get("cantidadLineas")));
    }

    private PagoDetalleDto mapToPagoDetalleDto(Map<String, Object> m) {
        if (m == null) return null;
        return new PagoDetalleDto(
                toLong(m.get("codigoFideicomiso")),
                toLong(m.get("consecutivoMasivo")),
                toLong(m.get("nroRegistroMasivo")),
                str(m.get("contratoNumero")),
                toLong(m.get("nitTerceroPago")),
                toBigDecimal(m.get("valorPago")),
                toBigDecimal(m.get("vlrNetoPago")),
                str(m.get("estado")),
                toLong(m.get("tipoCuenta")),
                str(m.get("numeroCuenta")),
                toLong(m.get("entidadBancaria")),
                str(m.get("observaciones")),
                str(m.get("fechaProceso")));
    }

    private ParametrosOGDto mapToParametrosOGDto(Map<String, Object> m) {
        if (m == null) return null;
        return new ParametrosOGDto(
                toLong(m.get("nitCompania")),
                toBigDecimal(m.get("montoAutorizacionTelefonica")),
                toBigDecimal(m.get("montoAutorizacionMaxima")));
    }

    private UsuarioTipoResponsableDto mapToUsuarioTipoResponsableDto(Map<String, Object> m) {
        if (m == null) return null;
        return new UsuarioTipoResponsableDto(
                toInteger(m.get("codigoTipoResponsable")),
                str(m.get("tipoResponsable")),
                str(m.get("clasificacion")),
                toLong(m.get("codigoFideicomiso")),
                str(m.get("usuario")),
                str(m.get("email")));
    }

    private AnexoOrdenGiroDto mapToAnexoOrdenGiroDto(Map<String, Object> m, Long codigoFideicomiso, Long consecutivoMasivo) {
        if (m == null) return null;
        Long secuencia = toLong(m.get("secuencia"));
        // La URL de descarga apunta al endpoint externo de AdmonFiducia
        String urlDescarga = baseUrl + "/ordenes-giro/" + codigoFideicomiso + "/" +
            consecutivoMasivo + "/anexos/" + secuencia + "/descargar";
        return new AnexoOrdenGiroDto(
                secuencia,
                str(m.get("nombre")),
                str(m.get("tipo")),
                toLong(m.get("tamanio")),
                toLong(m.get("nitTercero")),
                toInteger(m.get("tipoDocumento")),
                urlDescarga);
    }

    private OrdenGiroResumenDto mapToOrdenGiroResumenDto(Map<String, Object> m) {
        if (m == null) return null;
        return new OrdenGiroResumenDto(
                str(m.get("estado")),
                str(m.get("estadoDescripcion")),
                toLong(m.get("cantidad")),
                toBigDecimal(m.get("montoTotal")));
    }

    @SuppressWarnings("unchecked")
    public List<OrdenGiroResumenDto> getResumenGlobal(String idUsuario) {
        long inicio = System.currentTimeMillis();
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/ordenes-giro/resumen-global");
        if (idUsuario != null && !idUsuario.isBlank()) builder.queryParam("idUsuario", idUsuario);
        String url = builder.toUriString();
        log.debug("GET ResumenGlobal: {}", url);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            long duracion = System.currentTimeMillis() - inicio;
            log.info("GET ResumenGlobal completado en {}ms", duracion);
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                throw new RuntimeException("Error en AdmonFiducia getResumenGlobal: " +
                        (body != null ? body.get("message") : "respuesta nula"));
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream().map(this::mapToOrdenGiroResumenDto).toList();
        } catch (RuntimeException e) {
            log.error("Error en AdmonFiduciaClient.getResumenGlobal: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener resumen global: " + e.getMessage(), e);
        }
    }

    // ── Responsables por tipo (para notificaciones) ───────────────────────────

    /**
     * Obtiene los correos electrónicos de los responsables de un tipo dado para un fideicomiso.
     * Llama a GET /tipos-responsables/{codigoTipoResponsable}/fideicomiso/{codigoFideicomiso}/usuarios
     *
     * <p>Si el endpoint no existe o devuelve error, retorna lista vacía para no bloquear el flujo.
     */
    @SuppressWarnings("unchecked")
    public List<String> getEmailsResponsablesPorTipo(Integer codigoTipoResponsable, Long codigoFideicomiso) {
        String url = baseUrl + "/tipos-responsables/" + codigoTipoResponsable
                + "/fideicomiso/" + codigoFideicomiso + "/usuarios";
        log.debug("GET EmailsResponsablesPorTipo: tipo={} fideicomiso={}", codigoTipoResponsable, codigoFideicomiso);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                log.warn("Sin datos de responsables para tipo={} fideicomiso={}", codigoTipoResponsable, codigoFideicomiso);
                return List.of();
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream()
                    .map(m -> str(m.get("email")))
                    .filter(e -> e != null && !e.isBlank() && e.contains("@"))
                    .toList();
        } catch (org.springframework.web.client.HttpClientErrorException |
                 org.springframework.web.client.HttpServerErrorException e) {
            log.warn("AdmonFiducia {}xx al obtener responsables tipo={} fideicomiso={} — sin emails disponibles",
                    e.getStatusCode().value() / 100, codigoTipoResponsable, codigoFideicomiso);
            return List.of();
        } catch (Exception e) {
            log.warn("Error al obtener emails responsables tipo={} fideicomiso={}: {}",
                    codigoTipoResponsable, codigoFideicomiso, e.getMessage());
            return List.of();
        }
    }

    /**
     * Retorna los emails de TODOS los responsables del fideicomiso, sin filtrar por tipo.
     * Se usa como fallback cuando no hay actores NOT configurados en nt_nivel_actores.
     * Llama a GET /tipos-responsables/fideicomiso/{codigoFideicomiso}/todos-emails
     */
    @SuppressWarnings("unchecked")
    public List<String> getEmailsTodosResponsables(Long codigoFideicomiso) {
        String url = baseUrl + "/tipos-responsables/fideicomiso/" + codigoFideicomiso + "/todos-emails";
        log.debug("GET EmailsTodosResponsables: fideicomiso={}", codigoFideicomiso);
        try {
            ResponseEntity<Map<String, Object>> response = admonFiduciaRestTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> body = response.getBody();
            if (body == null || !Boolean.TRUE.equals(body.get("success"))) {
                log.warn("Sin datos de responsables (fallback) para fideicomiso={}", codigoFideicomiso);
                return List.of();
            }
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
            if (dataList == null) return List.of();
            return dataList.stream()
                    .map(m -> str(m.get("email")))
                    .filter(e -> e != null && !e.isBlank() && e.contains("@"))
                    .toList();
        } catch (Exception e) {
            log.warn("Error al obtener todos los emails fideicomiso={}: {}", codigoFideicomiso, e.getMessage());
            return List.of();
        }
    }

    // ── Type conversion utilities ─────────────────────────────────────────────

    private String str(Object o) {
        return o != null ? String.valueOf(o) : null;
    }

    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }

    private Integer toInteger(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof BigDecimal bd) return bd;
        if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }
}
