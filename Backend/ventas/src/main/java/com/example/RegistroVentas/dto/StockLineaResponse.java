package com.example.RegistroVentas.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Lo que responde productos por cada producto descontado (nombre y precio al momento de vender). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record StockLineaResponse(
        String idCodigo,
        String nombreProducto,
        Integer precioUnitario,
        Integer cantidad
) {}
