package com.example.Usuarios.controller;

import com.example.Usuarios.dto.UsuarioRequest;
import com.example.Usuarios.dto.UsuarioResponse;
import com.example.Usuarios.dto.UsuarioUpdateRequest;
import com.example.Usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Gestión de usuarios (panel de administración): solo rol ADMIN (ver SecurityConfig).
// "jwt" es el token del administrador que hace la petición; su "sub" es su id.
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest request,
                                      @AuthenticationPrincipal Jwt jwt) {
        return usuarioService.actualizar(id, request, Long.valueOf(jwt.getSubject()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        usuarioService.desactivar(id, Long.valueOf(jwt.getSubject()));
        return ResponseEntity.noContent().build();
    }
}
