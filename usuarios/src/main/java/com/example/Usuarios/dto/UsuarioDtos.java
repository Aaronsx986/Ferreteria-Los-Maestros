package com.example.Usuarios.dto;

import com.example.Usuarios.entity.Direccion;
import com.example.Usuarios.entity.Usuario;
import com.example.Usuarios.entity.Usuario.EstadoUsuario;
import com.example.Usuarios.entity.Usuario.Rol;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

// Todos los DTO del micro de usuarios en un solo archivo.
public final class UsuarioDtos {

    private UsuarioDtos() {
    }

    // ---------- Autenticación (/api/auth) ----------

    public record LoginRequest(
            @NotBlank(message = "El usuario es obligatorio") String nombreUsuario,
            @NotBlank(message = "La contraseña es obligatoria") String password) {
    }

    // Respuesta del login: el token JWT (se envía como "Authorization: Bearer <token>") y los datos del usuario
    public record LoginResponse(
            String token,
            String tipo,
            Instant expiraEn,
            UsuarioResponse usuario) {
    }

    // ---------- Usuarios (/api/usuarios y registro) ----------

    // Crear usuarios (registro público y panel de administración)
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

    // Edición: el nombre de usuario no se puede cambiar
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

    // Lo único que sale hacia el front. Nunca incluye passwordHash.
    public record UsuarioResponse(
            Long id,
            String nombre,
            String nombreUsuario,
            String correo,
            String telefono,
            Rol rol,
            EstadoUsuario estado,
            DireccionDto direccion,
            Instant ultimoLogin,
            Instant creadoEn) {

        public static UsuarioResponse desde(Usuario u) {
            return new UsuarioResponse(
                    u.getId(),
                    u.getNombre(),
                    u.getNombreUsuario(),
                    u.getCorreo(),
                    u.getTelefono(),
                    u.getRol(),
                    u.getEstado(),
                    DireccionDto.desde(u.getDireccion()),
                    u.getUltimoLogin(),
                    u.getCreadoEn());
        }
    }

    public record DireccionDto(
            @Size(max = 150) String calle,
            @Size(max = 80) String comuna,
            @Size(max = 80) String region,
            @Size(max = 60) String pais) {

        public static DireccionDto desde(Direccion d) {
            if (d == null) {
                return null;
            }
            return new DireccionDto(d.getCalle(), d.getComuna(), d.getRegion(), d.getPais());
        }

        public Direccion aEntidad() {
            String paisFinal = (pais == null || pais.isBlank()) ? "Chile" : pais;
            return new Direccion(calle, comuna, region, paisFinal);
        }
    }
}
