package com.example.RegistroVentas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Una venta = una compra completa (carrito), con una o más líneas de detalle.
 * Tabla "ventas" (nueva). La tabla antigua "venta" (un producto por venta) queda sin uso.
 */
@Entity
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long idVenta;

    /** Identificador único que se manda a productos (idempotencia: un reintento no descuenta dos veces). */
    @Column(nullable = false, unique = true, length = 64)
    private String codigo;

    @Column(name = "id_usuario", nullable = false)
    private String idUsuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private Integer total;

    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago;

    @Column(name = "tipo_entrega", nullable = false)
    private String tipoEntrega;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_venta", nullable = false)
    private List<VentaDetalle> detalles = new ArrayList<>();
}
