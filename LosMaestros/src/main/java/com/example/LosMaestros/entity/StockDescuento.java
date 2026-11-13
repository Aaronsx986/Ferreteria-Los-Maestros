package com.example.LosMaestros.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Registro de cada venta que ya descontó stock (idempotencia y reposición al anular)
@Entity
@Table(name = "stock_descuento")
public class StockDescuento {

    @Id
    @Column(name = "id_venta", length = 64)
    private String idVenta;

    // Productos y cantidades ordenados ("HER-001x2;PIN-001x1"), para detectar si el mismo id llega con otra compra
    @Column(nullable = false, length = 2000)
    private String huella;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // true cuando la venta se anuló y su stock ya fue devuelto
    private Boolean repuesto;

    @ElementCollection
    @CollectionTable(name = "stock_descuento_linea", joinColumns = @JoinColumn(name = "id_venta"))
    private List<StockDescuentoLinea> lineas = new ArrayList<>();

    protected StockDescuento() {
    }

    public StockDescuento(String idVenta, String huella, List<StockDescuentoLinea> lineas) {
        this.idVenta = idVenta;
        this.huella = huella;
        this.fecha = LocalDateTime.now();
        this.lineas = new ArrayList<>(lineas);
    }

    public String getIdVenta() { return idVenta; }
    public String getHuella() { return huella; }
    public LocalDateTime getFecha() { return fecha; }
    public List<StockDescuentoLinea> getLineas() { return lineas; }
    public boolean isRepuesto() { return Boolean.TRUE.equals(repuesto); }
    public void marcarRepuesto() { this.repuesto = true; }

    // Una línea descontada: guarda nombre y precio tal como estaban al momento de la venta
    @Embeddable
    public static class StockDescuentoLinea {

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
}
