package com.example.LosMaestros.service;

import com.example.LosMaestros.dto.ProductoDtos.ProductoRequest;
import com.example.LosMaestros.dto.ProductoDtos.ProductoResponse;
import com.example.LosMaestros.entity.Producto;
import com.example.LosMaestros.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Lógica del catálogo: CRUD de productos
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // Entidad -> respuesta de la API
    public static ProductoResponse vista(Producto p) {
        return new ProductoResponse(
                p.getIdCodigo(),
                p.getCategoria(),
                p.getSubcategoria(),
                p.getNombreProducto(),
                p.getImagenUrl(),
                p.getMarca(),
                p.getUnidad(),
                p.getpCompraClp(),
                p.getpVentaClp(),
                p.getStock(),
                p.getStockMinimo()
        );
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> obtenerTodos() {
        return productoRepository.findAll().stream().map(ProductoService::vista).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(String idCodigo) {
        return vista(buscar(idCodigo));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        if (request.idCodigo() == null || request.idCodigo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código del producto es obligatorio");
        }
        if (productoRepository.existsById(request.idCodigo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con código " + request.idCodigo());
        }
        Producto producto = new Producto();
        producto.setIdCodigo(request.idCodigo());
        copiarDatos(request, producto, false);
        return vista(productoRepository.save(producto));
    }

    // Edición: los campos opcionales que no vienen (null) conservan su valor actual
    @Transactional
    public ProductoResponse actualizar(String idCodigo, ProductoRequest request) {
        Producto producto = buscar(idCodigo);
        copiarDatos(request, producto, true);
        return vista(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(String idCodigo) {
        productoRepository.delete(buscar(idCodigo));
    }

    private Producto buscar(String idCodigo) {
        return productoRepository.findById(idCodigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Producto no encontrado: " + idCodigo));
    }

    // Request -> entidad (todo menos el código). Con parcial=true no sobrescribe con null.
    private void copiarDatos(ProductoRequest r, Producto p, boolean parcial) {
        p.setCategoria(r.categoria());
        p.setNombreProducto(r.nombreProducto());
        p.setpVentaClp(r.pVentaClp());
        p.setStock(r.stock());
        if (!parcial || r.subcategoria() != null) p.setSubcategoria(r.subcategoria());
        if (!parcial || r.imagenUrl() != null) p.setImagenUrl(r.imagenUrl());
        if (!parcial || r.marca() != null) p.setMarca(r.marca());
        if (!parcial || r.unidad() != null) p.setUnidad(r.unidad());
        if (!parcial || r.pCompraClp() != null) p.setpCompraClp(r.pCompraClp());
        if (!parcial || r.stockMinimo() != null) p.setStockMinimo(r.stockMinimo());
    }
}
