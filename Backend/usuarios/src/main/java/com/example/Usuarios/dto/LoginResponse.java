package com.example.Usuarios.dto;

import java.time.Instant;

/** Respuesta del login: el token JWT (se envía como "Authorization: Bearer <token>") y los datos del usuario. */
public record LoginResponse(
        String token,
        String tipo,
        Instant expiraEn,
        UsuarioResponse usuario) {
}
