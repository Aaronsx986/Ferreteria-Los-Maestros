package com.example.LosMaestros.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Registro de cada venta que ya descontó stock, identificada por el id que manda el micro de ventas.
 * Sirve para la idempotencia: si ventas reintenta la misma venta (por ejemplo porque se perdió la
 * respuesta), se devuelve lo ya descontado y NO se descuenta dos veces.
 */
@Entity
@Table(name = "stock_descuento")
public class StockDescuento {

    @Id
    @Column(name = "id_venta", length = 64)
    private String idVenta;

    /** Productos y cantidades ordenados ("HER-001x2;PIN-001x1"), para detectar si el mismo id llega con otra compra. */
    @Column(nullable = false, length = 2000)
    private String huella;

    @Column(nullable = false)
    private LocalDateTime fecha;

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
}
