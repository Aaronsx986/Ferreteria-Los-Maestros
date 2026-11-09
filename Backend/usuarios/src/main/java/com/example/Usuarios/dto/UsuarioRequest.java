package com.example.Usuarios.dto;

import com.example.Usuarios.entity.EstadoUsuario;
import com.example.Usuarios.entity.Rol;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Se usa para crear usuarios (registro público y panel de administración).
// "rol" y "estado" son opcionales: en el registro público se ignoran (siempre CLIENTE / ACTIVO).
// Las reglas son las mismas de validateUser() en validations.js del front.
public record UsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        String nombre,

        @NotBlank(message = "El usuario es obligatorio")
        @Pattern(regexp = "^[A-Za-z0-9_.-]{3,50}$", message = "Mínimo 3 caracteres, sin espacios")
        String nombreUsuario,

        @NotBlank(message = "El correo es obligatorio")
        @Size(max = 150)
        @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Ingresa un correo válido")
        String correo,

        @Size(max = 20)
        String telefono,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "Mínimo 6 caracteres")
        String password,

        @Valid
        DireccionDto direccion,

        Rol rol,

        EstadoUsuario estado) {
}