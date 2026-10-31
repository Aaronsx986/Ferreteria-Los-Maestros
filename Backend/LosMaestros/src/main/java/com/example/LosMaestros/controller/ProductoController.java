package com.example.LosMaestros.controller;

import com.example.LosMaestros.entity.Producto;
import com.example.LosMaestros.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;
  
    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoService.obtenerTodos();
    }


    @GetMapping("/{idCodigo}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable String idCodigo) {
        //manejo de errores si no encuentra el producto, devolviendo un 404 vacío y limpio
        Optional<Producto> producto = productoService.obtenerPorId(idCodigo);
        
        if (producto.isPresent()) {
            return ResponseEntity.ok(producto.get()); //si lo encuentra
        } else {
            return ResponseEntity.notFound().build(); //si no lo encuentra, error 4004
        }
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto nuevoProducto) {
        return productoService.guardarProducto(nuevoProducto);
    }

    @PutMapping("/{idCodigo}")
    public ResponseEntity<Producto> editarProducto(@PathVariable String idCodigo, @RequestBody Producto productoActualizado) {
        // 1. Verificamos si existe primero
        if (!productoService.obtenerPorId(idCodigo).isPresent()) {
            return ResponseEntity.notFound().build(); // 404 si no existe
        }
        
        // 2. Si existe, lo actualizamos
        productoActualizado.setIdCodigo(idCodigo);
        Producto guardado = productoService.guardarProducto(productoActualizado);
        
        return ResponseEntity.ok(guardado); // 200 OK
    }

    @DeleteMapping("/{idCodigo}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable String idCodigo) {
        // 1. Verificamos si existe
        if (!productoService.obtenerPorId(idCodigo).isPresent()) {
            return ResponseEntity.notFound().build(); // 404 si no existe
        }
        
        // 2. Si existe, lo eliminamos
        productoService.eliminarProducto(idCodigo);
        return ResponseEntity.noContent().build(); // 204 No Content (Éxito sin devolver datos)
    }
}