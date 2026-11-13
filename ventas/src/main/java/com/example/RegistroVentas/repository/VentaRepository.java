package com.example.RegistroVentas.repository;

import com.example.RegistroVentas.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByCodigo(String codigo);

    List<Venta> findAllByOrderByFechaDesc();

    List<Venta> findByIdUsuarioOrderByFechaDesc(String idUsuario);
}
