package com.example.RegistroVentas;

import org.springframework.boot.SpringApplication;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Swagger: servidor "/" para que "Try it out" funcione tanto en el micro como a través del gateway.
// El botón "Authorize" recibe el JWT obtenido en POST /api/auth/login.
@OpenAPIDefinition(
        info = @Info(title = "Ferretería Los Maestros - API Ventas", version = "1.0"),
        servers = @Server(url = "/"),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
@SpringBootApplication
public class RegistroVentasApplication {

	public static void main(String[] args) {
		SpringApplication.run(RegistroVentasApplication.class, args);
	}

}
