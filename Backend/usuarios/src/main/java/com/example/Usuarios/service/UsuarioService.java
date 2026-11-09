package com.example.Usuarios.service;

import com.example.Usuarios.dto.LoginRequest;
import com.example.Usuarios.dto.LoginResponse;
import com.example.Usuarios.dto.UsuarioRequest;
import com.example.Usuarios.dto.UsuarioResponse;
import com.example.Usuarios.dto.UsuarioUpdateRequest;
import com.example.Usuarios.entity.EstadoUsuario;
import com.example.Usuarios.entity.Rol;
import com.example.Usuarios.entity.Usuario;
import com.example.Usuarios.exception.ApiException;
import com.example.Usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.desde(buscar(id));
    }

    // Registro público: siempre crea un CLIENTE activo, sin importar lo que venga en el JSON
    @Transactional
    public UsuarioResponse registrar(UsuarioRequest req) {
        return guardarNuevo(req, Rol.CLIENTE, EstadoUsuario.ACTIVO);
    }

    // Creación desde el panel de administración: respeta rol y estado si vienen
    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        Rol rol = req.rol() != null ? req.rol() : Rol.CLIENTE;
        EstadoUsuario estado = req.estado() != null ? req.estado() : EstadoUsuario.ACTIVO;
        return guardarNuevo(req, rol, estado);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest req, Long idActual) {
        // Un administrador no puede quitarse el rol ni desactivarse a sí mismo (quedaría sin administrador)
        if (id.equals(idActual)
                && ((req.rol() != null && req.rol() != Rol.ADMIN)
                    || (req.estado() != null && req.estado() != EstadoUsuario.ACTIVO))) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "No puedes quitarte el rol de administrador ni desactivar tu propia cuenta");
        }
        Usuario u = buscar(id);
        String correo = req.correo().trim();

        usuarioRepository.findByCorreoIgnoreCase(correo)
                .filter(otro -> !otro.getId().equals(id))
                .ifPresent(otro -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
                });

        u.setNombre(req.nombre());
        u.setCorreo(correo);
        u.setTelefono(req.telefono());
        if (req.direccion() != null) {
            u.setDireccion(req.direccion().aEntidad());
        }
        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        if (req.rol() != null) {
            u.setRol(req.rol());
        }
        if (req.estado() != null) {
            u.setEstado(req.estado());
        }
        return UsuarioResponse.desde(usuarioRepository.save(u));
    }

    // Baja lógica: el usuario queda INACTIVO y no puede iniciar sesión, pero su historial se conserva
    @Transactional
    public void desactivar(Long id, Long idActual) {
        if (id.equals(idActual)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No puedes desactivar tu propia cuenta");
        }
        Usuario u = buscar(id);
        u.setEstado(EstadoUsuario.INACTIVO);
        usuarioRepository.save(u);
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        Usuario u = usuarioRepository.findByNombreUsuarioIgnoreCase(req.nombreUsuario().trim())
                .filter(x -> passwordEncoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos"));

        if (u.getEstado() != EstadoUsuario.ACTIVO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tu cuenta está inactiva");
        }

        u.setUltimoLogin(Instant.now());
        Usuario guardado = usuarioRepository.save(u);
        // Token JWT que el frontend enviará como "Authorization: Bearer <token>"
        TokenService.Token token = tokenService.emitir(guardado);
        return new LoginResponse(token.valor(), "Bearer", token.expiraEn(), UsuarioResponse.desde(guardado));
    }

    // ---------- auxiliares ----------

    private UsuarioResponse guardarNuevo(UsuarioRequest req, Rol rol, EstadoUsuario estado) {
        String nombreUsuario = req.nombreUsuario().trim();
        String correo = req.correo().trim();

        if (usuarioRepository.existsByNombreUsuarioIgnoreCase(nombreUsuario)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ese nombre de usuario ya está en uso");
        }
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }

        Usuario u = new Usuario();
        u.setNombreUsuario(nombreUsuario);
        u.setNombre(req.nombre());
        u.setCorreo(correo);
        u.setTelefono(req.telefono());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRol(rol);
        u.setEstado(estado);
        u.setDireccion(req.direccion() != null ? req.direccion().aEntidad() : null);

        return UsuarioResponse.desde(usuarioRepository.save(u));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "El usuario no existe"));
    }
}