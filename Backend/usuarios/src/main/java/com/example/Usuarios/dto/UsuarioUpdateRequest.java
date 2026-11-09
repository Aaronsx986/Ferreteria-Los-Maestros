package com.example.Usuarios.dto;

import com.example.Usuarios.entity.EstadoUsuario;
import com.example.Usuarios.entity.Rol;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Edición: el nombre de usuario no se puede cambiar.
// "password" vacío o ausente = no cambiar la contraseña.
public record UsuarioUpdateRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Size(max = 150)
        @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Ingresa un correo válido")
        String correo,

        @Size(max = 20)
        String telefono,

        @Pattern(regexp = "^$|.{6,100}", message = "Mínimo 6 caracteres")
        String password,

        @Valid
        DireccionDto direccion,

        Rol rol,

        EstadoUsuario estado) {
}