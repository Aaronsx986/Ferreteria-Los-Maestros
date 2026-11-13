package com.example.RegistroVentas.dto;

import com.example.RegistroVentas.entity.Venta;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

// Todos los DTO del micro de ventas en un solo archivo.
public final class VentaDtos {

    private VentaDtos() {
    }

    // ---------- API pública /api/ventas ----------

    // Carrito que envía el frontend al comprar. El comprador sale del token, no del body.
    public record VentaRequest(
            @NotEmpty(message = "La venta debe tener al menos un producto")
            @Size(max = 50, message = "Una venta no puede tener más de 50 productos distintos")
            List<@Valid ItemVentaRequest> items,

            @NotBlank(message = "El método de pago es obligatorio")
            @Pattern(regexp = "debito|credito|transferencia|efectivo", message = "Método de pago no válido")
            String metodoPago,

            @NotBlank(message = "El tipo de entrega es obligatorio")
            @Pattern(regexp = "despacho|retiro", message = "Tipo de entrega no válido")
            String tipoEntrega,

            @Size(max = 150) String nombreCliente,
            @Size(max = 150) @Email(message = "Correo no válido") String correoCliente,

            // Obligatorios solo si tipoEntrega = despacho
            @Valid DespachoDto despacho
    ) {}

    // Un producto del carrito
    public record ItemVentaRequest(
            @NotBlank(message = "El producto es obligatorio")
            String idProducto,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor a 0")
            Integer cantidad
    ) {}

    // Dirección de despacho de una venta
    public record DespachoDto(
            @Size(max = 150) String calle,
            @Size(max = 30) String departamento,
            @Size(max = 80) String comuna,
            @Size(max = 80) String region,
            @Size(max = 300) String indicaciones
    ) {}

    // Nuevo estado de un pedido (la anulación se hace con DELETE)
    public record EstadoRequest(
            @NotBlank(message = "El estado es obligatorio")
            @Pattern(regexp = "EN_PREPARACION|LISTO_RETIRO|DESPACHADO|ENTREGADO", message = "Estado no válido")
            String estado
    ) {}

    // Venta tal como la entrega la API
    public record VentaResponse(
            Long idVenta,
            String codigo,
            String idUsuario,
            LocalDateTime fecha,
            Integer total,
            String metodoPago,
            String tipoEntrega,
            String estado,
            String nombreCliente,
            String correoCliente,
            DespachoDto despacho,
            List<Linea> detalles
    ) {
        public record Linea(String idProducto, String nombreProducto, Integer cantidad,
                            Integer precioUnitario, Integer subtotal) {}

        public static VentaResponse from(Venta v) {
            DespachoDto despacho = v.getDespachoCalle() == null ? null : new DespachoDto(
                    v.getDespachoCalle(), v.getDespachoDepto(), v.getDespachoComuna(), v.getDespachoRegion(), v.getDespachoIndicaciones());
            return new VentaResponse(
                    v.getIdVenta(), v.getCodigo(), v.getIdUsuario(), v.getFecha(), v.getTotal(),
                    v.getMetodoPago(), v.getTipoEntrega(), v.getEstado().name(),
                    v.getNombreCliente(), v.getCorreoCliente(), despacho,
                    v.getDetalles().stream()
                            .map(d -> new Linea(d.getIdProducto(), d.getNombreProducto(), d.getCantidad(),
                                    d.getPrecioUnitario(), d.getSubtotal()))
                            .toList());
        }
    }

    // ---------- Llamada interna a productos (/internal/stock) ----------

    // Lo que ventas manda a POST /internal/stock/descontar
    public record DescuentoStockRequest(String idVenta, List<Item> items) {

        public record Item(String idCodigo, Integer cantidad) {}
    }

    // Lo que responde productos por cada producto descontado (nombre y precio al momento de vender)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StockLineaResponse(
            String idCodigo,
            String nombreProducto,
            Integer precioUnitario,
            Integer cantidad
    ) {}
}
