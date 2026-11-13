package com.example.LosMaestros.repository;

import com.example.LosMaestros.entity.StockDescuento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockDescuentoRepository extends JpaRepository<StockDescuento, String> {
}
