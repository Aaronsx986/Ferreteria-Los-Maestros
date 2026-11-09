package com.example.LosMaestros.controller;

import com.example.LosMaestros.dto.DescuentoStockRequest;
import com.example.LosMaestros.dto.StockLineaResponse;
import com.example.LosMaestros.service.StockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Endpoint INTERNO: solo lo llama el micro de ventas (servidor a servidor).
 *  - No pasa por el gateway (el gateway solo enruta /api/productos/**).
 *  - No usa JWT: se protege con la clave compartida X-Internal-Key (variable INTERNAL_API_KEY).
 */
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
        // MessageDigest.isEqual compara en tiempo constante (no da pistas de cuántos caracteres coinciden)
        if (!MessageDigest.isEqual(claveInterna, clave.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Servicio no autorizado");
        }
        return stockService.descontar(request);
    }
}
