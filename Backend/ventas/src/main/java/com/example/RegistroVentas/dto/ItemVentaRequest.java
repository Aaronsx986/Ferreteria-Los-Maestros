package com.example.RegistroVentas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Un producto del carrito. */
public record ItemVentaRequest(
        @NotBlank(message = "El producto es obligatorio")
        String idProducto,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        Integer cantidad
) {}
