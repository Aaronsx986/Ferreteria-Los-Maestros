package com.example.Usuarios.controller;

import com.example.Usuarios.dto.LoginRequest;
import com.example.Usuarios.dto.LoginResponse;
import com.example.Usuarios.dto.UsuarioRequest;
import com.example.Usuarios.dto.UsuarioResponse;
import com.example.Usuarios.security.JwtKeys;
import com.example.Usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Endpoints públicos (no requieren sesión): registro, inicio de sesión y llave pública del JWT.
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
}
