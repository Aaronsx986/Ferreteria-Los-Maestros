package com.example.RegistroVentas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Línea de una venta: guarda el nombre y el precio tal como se cobraron
@Entity
@Table(name = "ventas_detalle")
@Getter
@Setter
@NoArgsConstructor
public class VentaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @Column(name = "id_producto", nullable = false)
    private String idProducto;

    @Column(name = "nombre_producto")
    private String nombreProducto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private Integer subtotal;
}
