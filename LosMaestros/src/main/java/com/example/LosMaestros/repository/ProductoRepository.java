package com.example.LosMaestros.repository;

import com.example.LosMaestros.entity.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {

    // Lee el producto bloqueando su fila (SELECT ... FOR UPDATE) hasta que termine la transacción
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.idCodigo = :idCodigo")
    Optional<Producto> bloquearPorId(@Param("idCodigo") String idCodigo);
}
