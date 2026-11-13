package com.example.RegistroVentas.controller;

import com.example.RegistroVentas.dto.VentaDtos.EstadoRequest;
import com.example.RegistroVentas.dto.VentaDtos.VentaRequest;
import com.example.RegistroVentas.dto.VentaDtos.VentaResponse;
import com.example.RegistroVentas.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Ventas. Requiere sesión; el comprador sale del token ("sub"). Permisos por rol en SecurityConfig.
@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    // Registrar una compra (Idempotency-Key opcional para reintentar sin duplicar)
    @PostMapping
    public ResponseEntity<VentaResponse> registrarVenta(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody VentaRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.registrarVenta(request, idempotencyKey, jwt.getSubject()));
    }

    // ADMIN y VENDEDOR: todas las ventas. CLIENTE: solo las suyas.
    @GetMapping
    public List<VentaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return ventaService.listar(jwt.getSubject(), esPersonal(jwt));
    }

    // Las compras del usuario de la sesión (cualquier rol)
    @GetMapping("/mias")
    public List<VentaResponse> mias(@AuthenticationPrincipal Jwt jwt) {
        return ventaService.listar(jwt.getSubject(), false);
    }

    @GetMapping("/{idVenta}")
    public VentaResponse obtener(@PathVariable Long idVenta, @AuthenticationPrincipal Jwt jwt) {
        return ventaService.obtener(idVenta, jwt.getSubject(), esPersonal(jwt));
    }

    // Cambiar el estado del pedido (ADMIN o VENDEDOR)
    @PatchMapping("/{idVenta}/estado")
    public VentaResponse cambiarEstado(@PathVariable Long idVenta, @Valid @RequestBody EstadoRequest request) {
        return ventaService.cambiarEstado(idVenta, request);
    }

    // Anular la venta y devolver el stock (solo ADMIN)
    @DeleteMapping("/{idVenta}")
    public VentaResponse anular(@PathVariable Long idVenta) {
        return ventaService.anular(idVenta);
    }

    private static boolean esPersonal(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        return roles != null && (roles.contains("ADMIN") || roles.contains("VENDEDOR"));
    }
}
