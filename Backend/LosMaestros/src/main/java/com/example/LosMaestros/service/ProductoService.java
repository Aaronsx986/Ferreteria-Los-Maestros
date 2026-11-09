package com.example.LosMaestros.service;

import com.example.LosMaestros.dto.ProductoRequest;
import com.example.LosMaestros.dto.ProductoResponse;
import com.example.LosMaestros.entity.Producto;
import com.example.LosMaestros.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    /** Entidad -> respuesta (lo que antes hacía el mapper; igual al método vista() del profe). */
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
        copiarDatos(request, producto);
        return vista(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(String idCodigo, ProductoRequest request) {
        Producto producto = buscar(idCodigo);
        copiarDatos(request, producto);   // el id no se toca: manda el de la URL
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

    /** Request -> entidad: copia todos los datos menos el id. */
    private void copiarDatos(ProductoRequest r, Producto p) {
        p.setCategoria(r.categoria());
        p.setSubcategoria(r.subcategoria());
        p.setNombreProducto(r.nombreProducto());
        p.setImagenUrl(r.imagenUrl());
        p.setMarca(r.marca());
        p.setUnidad(r.unidad());
        p.setpCompraClp(r.pCompraClp());
        p.setpVentaClp(r.pVentaClp());
        p.setStock(r.stock());
        p.setStockMinimo(r.stockMinimo());
    }
}
