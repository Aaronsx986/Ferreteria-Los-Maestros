package com.example.RegistroVentas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Lo que manda el frontend al comprar: el carrito completo.
 * El usuario NO viene en el body: sale del token JWT (claim "sub" = id del usuario).
 */
public record VentaRequest(
        @NotEmpty(message = "La venta debe tener al menos un producto")
        @Size(max = 50, message = "Una venta no puede tener más de 50 productos distintos")
        List<@Valid ItemVentaRequest> items,

        @NotBlank(message = "El método de pago es obligatorio")
        String metodoPago,

        @NotBlank(message = "El tipo de entrega es obligatorio")
        String tipoEntrega
) {}
