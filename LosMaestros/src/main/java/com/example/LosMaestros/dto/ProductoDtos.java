package com.example.LosMaestros.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

// Todos los DTO del micro de productos en un solo archivo.
public final class ProductoDtos {

    private ProductoDtos() {
    }

    // ---------- Catálogo (API pública /api/productos) ----------

    // Datos para crear o editar un producto (campos extra que mande el frontend se ignoran)
    @JsonIgnoreProperties(ignoreUnknown = true)
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

    // Producto tal como lo entrega la API
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

    // ---------- Stock (API interna /internal/stock, la usa ventas) ----------

    // Pedido de ventas para descontar stock
    public record DescuentoStockRequest(
            @NotBlank(message = "El id de la venta es obligatorio")
            @Size(max = 64, message = "El id de la venta no puede superar 64 caracteres")
            String idVenta,

            @NotEmpty(message = "La venta debe tener al menos un producto")
            @Size(max = 50, message = "Una venta no puede tener más de 50 productos distintos")
            List<@Valid StockItemRequest> items
    ) {}

    // Un producto a descontar: código y cantidad
    public record StockItemRequest(
            @NotBlank(message = "El código del producto es obligatorio")
            String idCodigo,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor a 0")
            Integer cantidad
    ) {}

    // Pedido de ventas para devolver el stock de una venta anulada
    public record ReponerStockRequest(
            @NotBlank(message = "El id de la venta es obligatorio")
            String idVenta
    ) {}

    // Línea descontada que se devuelve a ventas (nombre y precio al momento de vender)
    public record StockLineaResponse(
            String idCodigo,
            String nombreProducto,
            Integer precioUnitario,
            Integer cantidad
    ) {}
}
