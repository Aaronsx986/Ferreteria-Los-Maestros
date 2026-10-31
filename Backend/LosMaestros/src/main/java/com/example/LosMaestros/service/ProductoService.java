package com.example.LosMaestros.service;

import com.example.LosMaestros.entity.Producto;
import com.example.LosMaestros.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(String idCodigo) {
        return productoRepository.findById(idCodigo);
    }

    public Producto guardarProducto(Producto producto) {
        if (producto.getpCompraClp() != null && producto.getpCompraClp() < 0) {
            throw new IllegalArgumentException("El precio de compra no puede ser negativo");
        }
        return productoRepository.save(producto);
    }

    public void eliminarProducto(String idCodigo) {
        productoRepository.deleteById(idCodigo);
    }
}