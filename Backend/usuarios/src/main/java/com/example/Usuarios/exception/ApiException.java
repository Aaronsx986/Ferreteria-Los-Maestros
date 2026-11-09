package com.example.Usuarios.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }
}