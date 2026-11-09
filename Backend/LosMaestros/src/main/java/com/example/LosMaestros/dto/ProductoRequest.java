package com.example.LosMaestros.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;


public record ProductoRequest(
        String idCodigo,

        @NotBlank(message = "La categoría es obligatoria")
        String categoria,

        String subcategoria,

        @NotBlank(message = "El nombre del producto es obligatorio")
        String nombreProducto,

        String imagenUrl,
        String marca,
        String unidad,

        @JsonProperty("pCompraClp")
        @PositiveOrZero(message = "El precio de compra no puede ser negativo")
        Integer pCompraClp,

        @JsonProperty("pVentaClp")
        @NotNull(message = "El precio de venta es obligatorio")
        @PositiveOrZero(message = "El precio de venta no puede ser negativo")
        Integer pVentaClp,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Integer stock,

        @PositiveOrZero(message = "El stock mínimo no puede ser negativo")
        Integer stockMinimo
) {}
