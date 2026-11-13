package com.example.Usuarios.controller;

import com.example.Usuarios.dto.UsuarioDtos.LoginRequest;
import com.example.Usuarios.dto.UsuarioDtos.LoginResponse;
import com.example.Usuarios.dto.UsuarioDtos.UsuarioRequest;
import com.example.Usuarios.dto.UsuarioDtos.UsuarioResponse;
import com.example.Usuarios.security.JwtKeys;
import com.example.Usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Autenticación: registro, login y JWKS (públicos); perfil propio y renovación del token (con sesión)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtKeys jwtKeys;

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registro(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(request));
    }

    // Devuelve el JWT + los datos del usuario
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }

    // Llave pública para que productos y ventas validen los tokens (app.jwks en esos micros)
    @GetMapping("/jwks")
    public Map<String, Object> jwks() {
        return jwtKeys.publicJwks();
    }

    // --- Requieren sesión (token válido); ver SecurityConfig ---

    // Datos del usuario dueño del token. 403 si la cuenta fue desactivada.
    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Jwt jwt) {
        return usuarioService.perfil(Long.valueOf(jwt.getSubject()));
    }

    // Renueva el token antes de que expire: devuelve un token nuevo con los datos actuales del usuario.
    @PostMapping("/refresh")
    public LoginResponse refresh(@AuthenticationPrincipal Jwt jwt) {
        return usuarioService.renovar(Long.valueOf(jwt.getSubject()));
    }
}
