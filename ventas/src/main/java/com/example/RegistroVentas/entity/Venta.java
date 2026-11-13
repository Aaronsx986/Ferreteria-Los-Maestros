package com.example.RegistroVentas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Una venta (carrito completo) con sus líneas de detalle, estado y datos de entrega.
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

    // Idempotency-Key de la compra: un reintento no la registra dos veces
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

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoVenta estado;

    @Column(name = "nombre_cliente", length = 150)
    private String nombreCliente;

    @Column(name = "correo_cliente", length = 150)
    private String correoCliente;

    @Column(name = "despacho_calle", length = 150)
    private String despachoCalle;

    @Column(name = "despacho_depto", length = 30)
    private String despachoDepto;

    @Column(name = "despacho_comuna", length = 80)
    private String despachoComuna;

    @Column(name = "despacho_region", length = 80)
    private String despachoRegion;

    @Column(name = "despacho_indicaciones", length = 300)
    private String despachoIndicaciones;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_venta", nullable = false)
    private List<VentaDetalle> detalles = new ArrayList<>();

    // Estados del pedido. ANULADA solo se alcanza anulando la venta (devuelve el stock).
    public enum EstadoVenta {
        EN_PREPARACION,
        LISTO_RETIRO,
        DESPACHADO,
        ENTREGADO,
        ANULADA
    }

    // Ventas antiguas (antes de existir el estado) se informan según su tipo de entrega
    public EstadoVenta getEstado() {
        if (estado != null) return estado;
        return "despacho".equals(tipoEntrega) ? EstadoVenta.EN_PREPARACION : EstadoVenta.LISTO_RETIRO;
    }
}
