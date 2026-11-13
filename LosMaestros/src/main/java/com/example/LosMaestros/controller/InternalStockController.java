package com.example.LosMaestros.controller;

import com.example.LosMaestros.dto.ProductoDtos.DescuentoStockRequest;
import com.example.LosMaestros.dto.ProductoDtos.ReponerStockRequest;
import com.example.LosMaestros.dto.ProductoDtos.StockLineaResponse;
import com.example.LosMaestros.service.StockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

// Endpoints internos de stock: solo los llama ventas, protegidos con X-Internal-Key
@RestController
@RequestMapping("/internal/stock")
public class InternalStockController {

    private final StockService stockService;
    private final byte[] claveInterna;

    public InternalStockController(StockService stockService,
                                   @Value("${app.internal-key}") String claveInterna) {
        this.stockService = stockService;
        this.claveInterna = claveInterna.getBytes(StandardCharsets.UTF_8);
    }

    @PostMapping("/descontar")
    public List<StockLineaResponse> descontar(
            @RequestHeader(value = "X-Internal-Key", defaultValue = "") String clave,
            @Valid @RequestBody DescuentoStockRequest request) {
        validarClave(clave);
        return stockService.descontar(request);
    }

    // Devuelve al inventario el stock de una venta anulada (idempotente)
    @PostMapping("/reponer")
    public List<StockLineaResponse> reponer(
            @RequestHeader(value = "X-Internal-Key", defaultValue = "") String clave,
            @Valid @RequestBody ReponerStockRequest request) {
        validarClave(clave);
        return stockService.reponer(request.idVenta());
    }

    // Compara la clave en tiempo constante (no da pistas de cuántos caracteres coinciden)
    private void validarClave(String clave) {
        if (!MessageDigest.isEqual(claveInterna, clave.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Servicio no autorizado");
        }
    }
}
