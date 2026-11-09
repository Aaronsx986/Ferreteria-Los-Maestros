package com.example.LosMaestros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Un producto a descontar: código y cantidad. */
public record StockItemRequest(
        @NotBlank(message = "El código del producto es obligatorio")
        String idCodigo,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        Integer cantidad
) {}
