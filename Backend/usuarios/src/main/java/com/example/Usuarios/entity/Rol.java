package com.example.Usuarios.entity;

// En el front hoy existen "admin", "user" y (en users.json) "seller".
// El mapeo entre el texto del front y este enum se hace en el DTO/mapper, no aquí.
public enum Rol {
    ADMIN,
    VENDEDOR,
    CLIENTE
}