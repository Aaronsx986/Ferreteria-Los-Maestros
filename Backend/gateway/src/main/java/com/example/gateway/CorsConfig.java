package com.example.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS del sistema: el navegador solo habla con el gateway, por eso vive aquí y no en los micros.
 * Orígenes permitidos desde la variable FRONTEND_ORIGINS, separados por coma. Ejemplo en AWS:
 *   FRONTEND_ORIGINS=http://localhost:*,http://mi-bucket.s3-website-us-east-1.amazonaws.com
 * Si no está definida, se permite cualquier puerto de localhost (desarrollo).
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter(@Value("${FRONTEND_ORIGINS:http://localhost:*}") String origins) {
        List<String> origenes = Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .toList();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(origenes);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
