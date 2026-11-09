package com.example.Usuarios.dto;

import com.example.Usuarios.entity.EstadoUsuario;
import com.example.Usuarios.entity.Rol;
import com.example.Usuarios.entity.Usuario;

import java.time.Instant;

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