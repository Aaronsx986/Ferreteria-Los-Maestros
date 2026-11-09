package com.example.RegistroVentas.dto;

import java.util.List;

/**
 * Lo que ventas manda al endpoint interno de productos (POST /internal/stock/descontar).
 * Los nombres de campo deben coincidir con el DescuentoStockRequest de productos.
 */
public record DescuentoStockRequest(String idVenta, List<Item> items) {

    public record Item(String idCodigo, Integer cantidad) {}
}
