package com.example.RegistroVentas.service;

import com.example.RegistroVentas.dto.VentaDtos.*;
import com.example.RegistroVentas.entity.Venta.EstadoVenta;
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

// Registro y gestión de ventas. El stock lo descuenta y repone el micro de productos (endpoints internos).
@Service
public class VentaService {

    private static final String DESCONTAR_STOCK = "/internal/stock/descontar";
    private static final String REPONER_STOCK = "/internal/stock/reponer";

    private final VentaRepository ventaRepository;
    private final RestClient catalogo;
    private final String claveInterna;

    public VentaService(VentaRepository ventaRepository,
                        @Value("${catalogo.url}") String catalogoUrl,
                        @Value("${app.internal-key}") String claveInterna) {
        this.ventaRepository = ventaRepository;
        this.claveInterna = claveInterna;
        // Timeouts: si productos no responde, la compra no queda colgada
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        this.catalogo = RestClient.builder().baseUrl(catalogoUrl).requestFactory(factory).build();
    }

    // Registra una compra: valida la entrega, descuenta el stock (todo o nada) y guarda la venta.
    @Transactional
    public VentaResponse registrarVenta(VentaRequest request, String idempotencyKey, String idUsuario) {
        String codigo = (idempotencyKey == null || idempotencyKey.isBlank())
                ? UUID.randomUUID().toString()
                : idempotencyKey.trim();
        if (codigo.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La Idempotency-Key no puede superar 64 caracteres");
        }
        Optional<Venta> existente = ventaRepository.findByCodigo(codigo);
        if (existente.isPresent()) {
            return VentaResponse.from(existente.get());
        }
        boolean despacho = "despacho".equals(request.tipoEntrega());
        DespachoDto d = request.despacho();
        if (despacho && (d == null || vacio(d.calle()) || vacio(d.comuna()) || vacio(d.region()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Para despacho a domicilio indica calle, comuna y región");
        }

        List<StockLineaResponse> lineas = descontarStock(codigo, request.items());

        Venta venta = new Venta();
        venta.setCodigo(codigo);
        venta.setIdUsuario(idUsuario);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago(request.metodoPago());
        venta.setTipoEntrega(request.tipoEntrega());
        venta.setEstado(despacho ? EstadoVenta.EN_PREPARACION : EstadoVenta.LISTO_RETIRO);
        venta.setNombreCliente(request.nombreCliente());
        venta.setCorreoCliente(request.correoCliente());
        if (despacho) {
            venta.setDespachoCalle(d.calle());
            venta.setDespachoDepto(d.departamento());
            venta.setDespachoComuna(d.comuna());
            venta.setDespachoRegion(d.region());
            venta.setDespachoIndicaciones(d.indicaciones());
        }
        int total = 0;
        for (StockLineaResponse l : lineas) {
            VentaDetalle det = new VentaDetalle();
            det.setIdProducto(l.idCodigo());
            det.setNombreProducto(l.nombreProducto());
            det.setCantidad(l.cantidad());
            det.setPrecioUnitario(l.precioUnitario());
            det.setSubtotal(l.precioUnitario() * l.cantidad());
            total += det.getSubtotal();
            venta.getDetalles().add(det);
        }
        venta.setTotal(total);
        return VentaResponse.from(ventaRepository.save(venta));
    }

    // Personal (ADMIN/VENDEDOR) ve todas las ventas; un cliente solo las suyas.
    @Transactional(readOnly = true)
    public List<VentaResponse> listar(String idUsuario, boolean personal) {
        List<Venta> ventas = personal
                ? ventaRepository.findAllByOrderByFechaDesc()
                : ventaRepository.findByIdUsuarioOrderByFechaDesc(idUsuario);
        return ventas.stream().map(VentaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponse obtener(Long idVenta, String idUsuario, boolean personal) {
        Venta venta = buscar(idVenta);
        if (!personal && !venta.getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes ver ventas de otro usuario");
        }
        return VentaResponse.from(venta);
    }

    // Cambia el estado del pedido (ADMIN o VENDEDOR). Una venta anulada ya no cambia.
    @Transactional
    public VentaResponse cambiarEstado(Long idVenta, EstadoRequest request) {
        Venta venta = buscar(idVenta);
        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta está anulada y no se puede modificar");
        }
        venta.setEstado(EstadoVenta.valueOf(request.estado()));
        return VentaResponse.from(ventaRepository.save(venta));
    }

    // Anula la venta (solo ADMIN): devuelve el stock al catálogo y la marca como ANULADA.
    @Transactional
    public VentaResponse anular(Long idVenta) {
        Venta venta = buscar(idVenta);
        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La venta ya está anulada");
        }
        if (venta.getEstado() == EstadoVenta.ENTREGADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede anular una venta ya entregada");
        }
        llamarCatalogo(REPONER_STOCK, Map.of("idVenta", venta.getCodigo()));
        venta.setEstado(EstadoVenta.ANULADA);
        return VentaResponse.from(ventaRepository.save(venta));
    }

    private Venta buscar(Long idVenta) {
        return ventaRepository.findById(idVenta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venta no encontrada: " + idVenta));
    }

    private static boolean vacio(String s) {
        return s == null || s.isBlank();
    }

    private List<StockLineaResponse> descontarStock(String codigo, List<ItemVentaRequest> items) {
        DescuentoStockRequest body = new DescuentoStockRequest(codigo,
                items.stream().map(i -> new DescuentoStockRequest.Item(i.idProducto(), i.cantidad())).toList());
        StockLineaResponse[] respuesta = llamarCatalogo(DESCONTAR_STOCK, body);
        if (respuesta == null || respuesta.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El catálogo respondió sin productos");
        }
        return List.of(respuesta);
    }

    // Llamada interna a productos; traduce sus errores a respuestas claras.
    private StockLineaResponse[] llamarCatalogo(String ruta, Object body) {
        try {
            return catalogo.post()
                    .uri(ruta)
                    .header("X-Internal-Key", claveInterna)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(StockLineaResponse[].class);
        } catch (HttpClientErrorException e) {
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
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El catálogo no responde. Reintenta con la misma Idempotency-Key para no descontar dos veces.");
        }
    }

    // Lee el campo "mensaje" del error JSON de productos
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
