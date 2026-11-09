package com.example.RegistroVentas.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;

/**
 * Seguridad del micro de ventas (resource server, igual que productos):
 *  - /api/ventas/** -> cualquier usuario con sesión (JWT emitido por el micro de usuarios)
 *  - cualquier otra ruta -> denegada
 * Este micro NO hace login; valida el token con las llaves públicas (JWKS) del micro de usuarios.
 * Sin CORS aquí: lo maneja el API Gateway.
 */
@Configuration
public class SecurityConfig {

    @Bean
    JwtDecoder jwtDecoder(@Value("${app.jwks}") String jwksUrl,
                          @Value("${app.issuer}") String issuer) {
        // Las llaves se descargan con el primer token: el micro levanta aunque usuarios esté apagado
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())                 // API REST sin cookies de sesión
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/ventas", "/api/ventas/**").authenticated()
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

    /** Claim "roles" (ej: ["ADMIN"]) -> ROLE_ADMIN. */
    private static JwtAuthenticationConverter rolesDesdeJwt() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }

    private static void escribir(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"mensaje\":\"" + mensaje + "\"}");
    }
}
