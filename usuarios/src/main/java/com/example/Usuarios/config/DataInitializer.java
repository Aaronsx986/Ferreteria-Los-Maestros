package com.example.Usuarios.config;

import com.example.Usuarios.entity.Direccion;
import com.example.Usuarios.entity.Usuario.EstadoUsuario;
import com.example.Usuarios.entity.Usuario.Rol;
import com.example.Usuarios.entity.Usuario;
import com.example.Usuarios.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

// Al arrancar, si la tabla está vacía crea los dos usuarios de ejemplo.
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner cargarUsuariosDePrueba(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.count() > 0) {
                return;
            }

            repo.save(crear("admin", "Administrador Principal", "admin@ferreterialosmaestros.cl",
                    "+56912345678", "admin123", Rol.ADMIN,
                    new Direccion("Av. Francisco de Aguirre 0450", "La Serena", "Región de Coquimbo", "Chile"),
                    encoder));

            repo.save(crear("usuario", "Cliente Ejemplo", "usuario@ferreterialosmaestros.cl",
                    "+56987654321", "user123", Rol.CLIENTE,
                    new Direccion("Calle Secundaria 456", "Coquimbo", "Región de Coquimbo", "Chile"),
                    encoder));

            System.out.println(">> Usuarios de prueba creados: admin y usuario");
        };
    }

    private Usuario crear(String username, String nombre, String correo, String telefono,
                          String password, Rol rol, Direccion direccion, PasswordEncoder encoder) {
        Usuario u = new Usuario();
        u.setNombreUsuario(username);
        u.setNombre(nombre);
        u.setCorreo(correo);
        u.setTelefono(telefono);
        u.setPasswordHash(encoder.encode(password));
        u.setRol(rol);
        u.setEstado(EstadoUsuario.ACTIVO);
        u.setDireccion(direccion);
        return u;
    }
}