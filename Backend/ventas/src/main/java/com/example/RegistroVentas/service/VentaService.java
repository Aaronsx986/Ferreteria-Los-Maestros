package com.example.RegistroVentas.service;

import com.example.RegistroVentas.dto.*;
import com.example.RegistroVentas.entity.Venta;
import com.example.RegistroVentas.entity.VentaDetalle;
import com.example.RegistroVentas.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Registra ventas. Flujo:
 *  1. Si llega una Idempotency-Key ya usada, devuelve esa venta (no se cobra ni descuenta dos veces).
 *  2. Pide a productos que descuente el stock de TODO el carrito en una sola operación
 *     (POST /internal/stock/descontar). Productos valida, bloquea y descuenta; si falta stock
 *     de un producto, no descuenta ninguno. Devuelve nombre y precio de cada producto.
 *  3. Guarda la venta con esos precios.
 */
@Service
public class VentaService {

    // Endpoint interno del micro de productos (no pasa por el gateway)
    private static final String DESCONTAR_STOCK = "/internal/stock/descontar";

    private final VentaRepository ventaRepository;
    private final RestClient catalogo;
    private final String claveInterna;

    public VentaService(VentaRepository ventaRepository,
                        @Value("${catalogo.url}") String catalogoUrl,
                        @Value("${app.internal-key}") String claveInterna) {
        this.ventaRepository = ventaRepository;
        this.claveInterna = claveInterna;
        // Timeouts: si productos no responde, no dejamos la compra colgada
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        this.catalogo = RestClient.builder().baseUrl(catalogoUrl).requestFactory(factory).build();
    }

    @Transactional
    public VentaResponse registrarVenta(VentaRequest request, String idempotencyKey, String idUsuario) {
        String codigo = (idempotencyKey == null || idempotencyKey.isBlank())
                ? UUID.randomUUID().toString()
                : idempotencyKey.trim();
        if (codigo.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La Idempotency-Key no puede superar 64 caracteres");
        }

        // 1) Reintento de una venta ya registrada
        Optional<Venta> existente = ventaRepository.findByCodigo(codigo);
        if (existente.isPresent()) {
            return VentaResponse.from(existente.get());
        }

        // 2) Descontar stock en productos (todo o nada)
        List<StockLineaResponse> lineas = descontarStock(codigo, request.items());

        // 3) Guardar la venta con los precios que informó productos
        Venta venta = new Venta();
        venta.setCodigo(codigo);
        venta.setIdUsuario(idUsuario);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago(request.metodoPago());
        venta.setTipoEntrega(request.tipoEntrega());
        int total = 0;
        for (StockLineaResponse l : lineas) {
            VentaDetalle d = new VentaDetalle();
            d.setIdProducto(l.idCodigo());
            d.setNombreProducto(l.nombreProducto());
            d.setCantidad(l.cantidad());
            d.setPrecioUnitario(l.precioUnitario());
            d.setSubtotal(l.precioUnitario() * l.cantidad());
            total += d.getSubtotal();
            venta.getDetalles().add(d);
        }
        venta.setTotal(total);
        return VentaResponse.from(ventaRepository.save(venta));
    }

    @Transactional(readOnly = true)
    public VentaResponse obtener(Long idVenta, String idUsuario, boolean esAdmin) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venta no encontrada: " + idVenta));
        // Un cliente solo puede ver sus propias ventas; un administrador, todas
        if (!esAdmin && !venta.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes ver ventas de otro usuario");
        }
        return VentaResponse.from(venta);
    }

    private List<StockLineaResponse> descontarStock(String codigo, List<ItemVentaRequest> items) {
        DescuentoStockRequest body = new DescuentoStockRequest(codigo,
                items.stream().map(i -> new DescuentoStockRequest.Item(i.idProducto(), i.cantidad())).toList());
        try {
            StockLineaResponse[] respuesta = catalogo.post()
                    .uri(DESCONTAR_STOCK)
                    .header("X-Internal-Key", claveInterna)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(StockLineaResponse[].class);
            if (respuesta == null || respuesta.length == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El catálogo respondió sin productos");
            }
            return List.of(respuesta);
        } catch (HttpClientErrorException e) {
            // Errores 4xx de productos: se traducen con su mensaje
            String mensaje = mensajeDe(e);
            switch (e.getStatusCode().value()) {
                case 404 -> throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        mensaje != null ? mensaje : "Uno de los productos no existe");
                case 409 -> throw new ResponseStatusException(HttpStatus.CONFLICT,
                        mensaje != null ? mensaje : "Stock insuficiente");
                case 400 -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        mensaje != null ? mensaje : "Datos de la venta inválidos para el catálogo");
                default -> throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Ventas no está autorizada en el catálogo (revisa INTERNAL_API_KEY en ambos micros)");
            }
        } catch (RestClientException e) {
            // Productos caído, timeout o error 5xx
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El catálogo no responde. Reintenta con la misma Idempotency-Key para no descontar dos veces.");
        }
    }

    /** Lee el campo "mensaje" del error JSON de productos (formato ErrorBody). */
    private static String mensajeDe(HttpClientErrorException e) {
        try {
            Map<?, ?> cuerpo = e.getResponseBodyAs(Map.class);
            Object mensaje = cuerpo == null ? null : cuerpo.get("mensaje");
            return mensaje == null ? null : mensaje.toString();
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
