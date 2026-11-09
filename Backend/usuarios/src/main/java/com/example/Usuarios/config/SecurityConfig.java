package com.example.Usuarios.config;

import com.example.Usuarios.security.JwtKeys;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;

/**
 * Seguridad del micro de usuarios:
 *  - POST /api/auth/login y /api/auth/registro, GET /api/auth/jwks -> públicos
 *  - /api/usuarios/**                                              -> solo rol ADMIN (JWT)
 *  - cualquier otra ruta                                           -> denegada
 * Sin CORS aquí: lo maneja el API Gateway.
 */
@Configuration
public class SecurityConfig {

    @Bean
    JwtDecoder jwtDecoder(JwtKeys keys, @Value("${app.issuer}") String issuer) throws Exception {
        return keys.decoder(issuer);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                 // API REST sin cookies de sesión
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/registro").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/jwks").permitAll()
                .requestMatchers("/api/usuarios", "/api/usuarios/**").hasRole("ADMIN")
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(rolesDesdeJwt()))
                .authenticationEntryPoint((req, res, e) ->
                        escribir(res, 401, "Debes iniciar sesión o renovar tu sesión.")))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                        escribir(res, 401, "Debes iniciar sesión o renovar tu sesión."))
                .accessDeniedHandler((req, res, e) ->
                        escribir(res, 403, "No tienes permisos para esta acción.")));

        return http.build();
    }

    /** Claim "roles" (ej: ["ADMIN"]) -> ROLE_ADMIN, para que funcione hasRole("ADMIN"). Igual que en productos. */
    private static JwtAuthenticationConverter rolesDesdeJwt() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }

    /** Respuestas 401/403 en JSON, con "mensaje" como el resto de los errores de este micro. */
    private static void escribir(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"mensaje\":\"" + mensaje + "\"}");
    }
}
