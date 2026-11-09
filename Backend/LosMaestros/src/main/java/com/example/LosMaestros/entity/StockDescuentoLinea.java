package com.example.LosMaestros.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Una línea descontada: guarda nombre y precio tal como estaban al momento de la venta. */
@Embeddable
public class StockDescuentoLinea {

    @Column(name = "id_codigo", nullable = false)
    private String idCodigo;

    @Column(name = "nombre_producto")
    private String nombreProducto;

    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    protected StockDescuentoLinea() {
    }

    public StockDescuentoLinea(String idCodigo, String nombreProducto, Integer precioUnitario, Integer cantidad) {
        this.idCodigo = idCodigo;
        this.nombreProducto = nombreProducto;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
    }

    public String getIdCodigo() { return idCodigo; }
    public String getNombreProducto() { return nombreProducto; }
    public Integer getPrecioUnitario() { return precioUnitario; }
    public Integer getCantidad() { return cantidad; }
}
