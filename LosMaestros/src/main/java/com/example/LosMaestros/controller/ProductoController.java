package com.example.LosMaestros.controller;

import com.example.LosMaestros.dto.ProductoDtos.ProductoRequest;
import com.example.LosMaestros.dto.ProductoDtos.ProductoResponse;
import com.example.LosMaestros.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoResponse> obtenerTodos() {
        return productoService.obtenerTodos();
    }

    @GetMapping("/{idCodigo}")
    public ProductoResponse obtenerPorId(@PathVariable String idCodigo) {
        return productoService.obtenerPorId(idCodigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse crearProducto(@Valid @RequestBody ProductoRequest request) {
        return productoService.crear(request);
    }

    @PutMapping("/{idCodigo}")
    public ProductoResponse editarProducto(@PathVariable String idCodigo,
                                           @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(idCodigo, request);
    }

    @DeleteMapping("/{idCodigo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarProducto(@PathVariable String idCodigo) {
        productoService.eliminar(idCodigo);
    }
}
