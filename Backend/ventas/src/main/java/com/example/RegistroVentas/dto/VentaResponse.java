package com.example.RegistroVentas.dto;

import com.example.RegistroVentas.entity.Venta;

import java.time.LocalDateTime;
import java.util.List;

/** Lo que la API devuelve de una venta (no se expone la entidad directamente). */
public record VentaResponse(
        Long idVenta,
        String codigo,
        String idUsuario,
        LocalDateTime fecha,
        Integer total,
        String metodoPago,
        String tipoEntrega,
        List<Linea> detalles
) {

    public record Linea(String idProducto, String nombreProducto, Integer cantidad,
                        Integer precioUnitario, Integer subtotal) {}

    public static VentaResponse from(Venta v) {
        return new VentaResponse(
                v.getIdVenta(), v.getCodigo(), v.getIdUsuario(), v.getFecha(), v.getTotal(),
                v.getMetodoPago(), v.getTipoEntrega(),
                v.getDetalles().stream()
                        .map(d -> new Linea(d.getIdProducto(), d.getNombreProducto(), d.getCantidad(),
                                d.getPrecioUnitario(), d.getSubtotal()))
                        .toList());
    }
}
