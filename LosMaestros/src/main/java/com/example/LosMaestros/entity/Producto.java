package com.example.LosMaestros.entity;

import jakarta.persistence.*;

// Producto del catálogo (tabla catalogo_prod). La categoría se guarda como texto.
@Entity
@Table(name = "catalogo_prod")
public class Producto {

    @Id
    @Column(name = "id_codigo")
    private String idCodigo;

    private String categoria;
    private String subcategoria;

    @Column(name = "nombre_producto")
    private String nombreProducto;

    @Column(name = "imagen_url")
    private String imagenUrl;

    private String marca;
    private String unidad;

    @Column(name = "p_compra_clp")
    private Integer pCompraClp;

    @Column(name = "p_venta_clp")
    private Integer pVentaClp;

    private Integer stock;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    public String getIdCodigo() { return idCodigo; }
    public void setIdCodigo(String idCodigo) { this.idCodigo = idCodigo; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getSubcategoria() { return subcategoria; }
    public void setSubcategoria(String subcategoria) { this.subcategoria = subcategoria; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public Integer getpCompraClp() { return pCompraClp; }
    public void setpCompraClp(Integer pCompraClp) { this.pCompraClp = pCompraClp; }
    public Integer getpVentaClp() { return pVentaClp; }
    public void setpVentaClp(Integer pVentaClp) { this.pVentaClp = pVentaClp; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
}
