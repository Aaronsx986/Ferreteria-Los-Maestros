package com.example.LosMaestros.dto;

/** Línea descontada que se devuelve a ventas, con el nombre y precio vigentes al momento de vender. */
public record StockLineaResponse(
        String idCodigo,
        String nombreProducto,
        Integer precioUnitario,
        Integer cantidad
) {}
