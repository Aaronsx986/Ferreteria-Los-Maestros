package com.example.LosMaestros.service;

import com.example.LosMaestros.dto.DescuentoStockRequest;
import com.example.LosMaestros.dto.StockItemRequest;
import com.example.LosMaestros.dto.StockLineaResponse;
import com.example.LosMaestros.entity.Producto;
import com.example.LosMaestros.entity.StockDescuento;
import com.example.LosMaestros.entity.StockDescuentoLinea;
import com.example.LosMaestros.repository.ProductoRepository;
import com.example.LosMaestros.repository.StockDescuentoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Descuento de stock pedido por el micro de ventas. Todo pasa en UNA transacción:
 *  1. Si la venta ya fue procesada (mismo idVenta), devuelve lo ya descontado (idempotencia).
 *  2. Bloquea cada producto y valida que exista, tenga precio y alcance el stock.
 *  3. Recién ahí descuenta todos. Si un producto falla, no se descuenta ninguno.
 */
@Service
public class StockService {

    private final ProductoRepository productoRepository;
    private final StockDescuentoRepository descuentoRepository;

    public StockService(ProductoRepository productoRepository, StockDescuentoRepository descuentoRepository) {
        this.productoRepository = productoRepository;
        this.descuentoRepository = descuentoRepository;
    }

    @Transactional
    public List<StockLineaResponse> descontar(DescuentoStockRequest request) {
        // Ordenar por código: todos bloquean en el mismo orden y se evitan bloqueos cruzados (deadlocks)
        List<StockItemRequest> items = request.items().stream()
                .sorted(Comparator.comparing(StockItemRequest::idCodigo))
                .toList();
        if (items.stream().map(StockItemRequest::idCodigo).distinct().count() != items.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Hay productos repetidos en la venta; suma sus cantidades en una sola línea");
        }
        String huella = items.stream()
                .map(i -> i.idCodigo() + "x" + i.cantidad())
                .collect(Collectors.joining(";"));

        // 1) ¿Esta venta ya descontó stock antes? (reintento)
        Optional<StockDescuento> previo = descuentoRepository.findById(request.idVenta());
        if (previo.isPresent()) {
            if (!previo.get().getHuella().equals(huella)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "La venta " + request.idVenta() + " ya fue procesada con otros productos");
            }
            return previo.get().getLineas().stream().map(StockService::aRespuesta).toList();
        }

        // 2) Bloquear y validar TODOS antes de descontar
        List<Producto> productos = new ArrayList<>();
        for (StockItemRequest item : items) {
            Producto p = productoRepository.bloquearPorId(item.idCodigo())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + item.idCodigo()));
            int stock = p.getStock() == null ? 0 : p.getStock();
            if (stock < item.cantidad()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente de " + p.getNombreProducto() + " (disponible: " + stock + ")");
            }
            if (p.getpVentaClp() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El producto " + p.getIdCodigo() + " no tiene precio de venta");
            }
            productos.add(p);
        }

        // 3) Descontar y registrar
        List<StockDescuentoLinea> lineas = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            Producto p = productos.get(i);
            int cantidad = items.get(i).cantidad();
            p.setStock(p.getStock() - cantidad);
            lineas.add(new StockDescuentoLinea(p.getIdCodigo(), p.getNombreProducto(), p.getpVentaClp(), cantidad));
        }
        productoRepository.saveAll(productos);
        descuentoRepository.save(new StockDescuento(request.idVenta(), huella, lineas));

        return lineas.stream().map(StockService::aRespuesta).toList();
    }

    private static StockLineaResponse aRespuesta(StockDescuentoLinea l) {
        return new StockLineaResponse(l.getIdCodigo(), l.getNombreProducto(), l.getPrecioUnitario(), l.getCantidad());
    }
}
