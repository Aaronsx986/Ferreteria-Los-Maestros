package com.example.LosMaestros.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    JwtDecoder jwtDecoder(@Value("${app.jwks}") String jwksUrl,
                          @Value("${app.issuer}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                // Llamadas internas entre micros (ventas -> productos): sin JWT, las protege la clave X-Internal-Key
                .requestMatchers("/internal/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/**").permitAll()
                .requestMatchers("/api/productos", "/api/productos/**").hasRole("ADMIN")
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
