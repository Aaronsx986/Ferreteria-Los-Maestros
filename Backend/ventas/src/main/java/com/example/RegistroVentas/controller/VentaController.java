package com.example.RegistroVentas.controller;

import com.example.RegistroVentas.dto.VentaRequest;
import com.example.RegistroVentas.dto.VentaResponse;
import com.example.RegistroVentas.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Requiere sesión (JWT del micro de usuarios). El comprador sale del token ("sub" = id del usuario),
 * no del body: nadie puede registrar compras a nombre de otro.
 * El frontend puede mandar el header Idempotency-Key (un UUID por compra): si reintenta con la misma
 * clave, recibe la misma venta y el stock no se descuenta dos veces.
 * Sin @CrossOrigin: el CORS lo maneja el API Gateway.
 */
@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<VentaResponse> registrarVenta(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody VentaRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.registrarVenta(request, idempotencyKey, jwt.getSubject()));
    }

    @GetMapping("/{idVenta}")
    public VentaResponse obtener(@PathVariable Long idVenta, @AuthenticationPrincipal Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        boolean esAdmin = roles != null && roles.contains("ADMIN");
        return ventaService.obtener(idVenta, jwt.getSubject(), esAdmin);
    }
}
