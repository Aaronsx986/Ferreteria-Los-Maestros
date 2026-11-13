package com.example.Usuarios.repository;

import com.example.Usuarios.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Login: el front compara el usuario sin distinguir mayúsculas
    Optional<Usuario> findByNombreUsuarioIgnoreCase(String nombreUsuario);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    // Validación de duplicados (equivale a allUsernames / users.some(...) del AuthContext)
    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByCorreoIgnoreCase(String correo);
}