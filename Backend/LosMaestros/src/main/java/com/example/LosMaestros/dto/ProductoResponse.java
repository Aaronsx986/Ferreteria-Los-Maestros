package com.example.LosMaestros.dto;

import com.fasterxml.jackson.annotation.JsonProperty;


public record ProductoResponse(
        String idCodigo,
        String categoria,
        String subcategoria,
        String nombreProducto,
        String imagenUrl,
        String marca,
        String unidad,
        @JsonProperty("pCompraClp") Integer pCompraClp,
        @JsonProperty("pVentaClp") Integer pVentaClp,
        Integer stock,
        Integer stockMinimo
) {}
