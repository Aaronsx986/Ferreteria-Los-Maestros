package com.example.Usuarios.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Value object: no tiene id ni tabla propia, sus columnas quedan dentro de "usuarios".
// Región y comuna coinciden con lo que ya pide el Checkout (src/data/regiones.js).
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Direccion {

    @Column(name = "dir_calle", length = 150)
    private String calle;

    @Column(name = "dir_comuna", length = 80)
    private String comuna;

    @Column(name = "dir_region", length = 80)
    private String region;

    @Column(name = "dir_pais", length = 60)
    private String pais = "Chile";
}