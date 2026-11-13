package com.example.Usuarios.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    // Clave técnica numérica (los otros micros guardan este id)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(length = 20)
    private String telefono;

    // Hash BCrypt, NUNCA la contraseña en texto plano (hoy users.json las tiene planas).
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol = Rol.CLIENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;

    @Embedded
    private Direccion direccion;

    @Column(name = "ultimo_login")
    private Instant ultimoLogin;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn;

    // Roles del sistema
    public enum Rol {
        ADMIN,
        VENDEDOR,
        CLIENTE
    }

    // Equivale al "status" del front: active / inactive
    public enum EstadoUsuario {
        ACTIVO,
        INACTIVO
    }

    // El front compara correos en minúsculas; se normaliza al guardar.
    @PrePersist
    @PreUpdate
    private void normalizar() {
        if (correo != null) correo = correo.trim().toLowerCase();
        if (nombreUsuario != null) nombreUsuario = nombreUsuario.trim();
        if (nombre != null) nombre = nombre.trim();
    }
}