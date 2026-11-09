package com.example.LosMaestros.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DescuentoStockRequest(
        @NotBlank(message = "El id de la venta es obligatorio")
        @Size(max = 64, message = "El id de la venta no puede superar 64 caracteres")
        String idVenta,

        @NotEmpty(message = "La venta debe tener al menos un producto")
        @Size(max = 50, message = "Una venta no puede tener más de 50 productos distintos")
        List<@Valid StockItemRequest> items
) {}
