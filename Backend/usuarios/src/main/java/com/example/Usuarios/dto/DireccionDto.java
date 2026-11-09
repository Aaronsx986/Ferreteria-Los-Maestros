package com.example.Usuarios.dto;

import com.example.Usuarios.entity.Direccion;
import jakarta.validation.constraints.Size;

public record DireccionDto(
        @Size(max = 150) String calle,
        @Size(max = 80) String comuna,
        @Size(max = 80) String region,
        @Size(max = 60) String pais) {

    public static DireccionDto desde(Direccion d) {
        if (d == null) {
            return null;
        }
        return new DireccionDto(d.getCalle(), d.getComuna(), d.getRegion(), d.getPais());
    }

    public Direccion aEntidad() {
        String paisFinal = (pais == null || pais.isBlank()) ? "Chile" : pais;
        return new Direccion(calle, comuna, region, paisFinal);
    }
}