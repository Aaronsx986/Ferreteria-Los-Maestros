package com.example.Usuarios.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

// Convierte las excepciones en respuestas JSON con la forma { "mensaje": "...", "errores": {...} }
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(ApiException ex) {
        return respuesta(ex.getStatus(), ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return respuesta(HttpStatus.BAD_REQUEST, "Datos inválidos", errores);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleJsonInvalido(HttpMessageNotReadableException ex) {
        return respuesta(HttpStatus.BAD_REQUEST,
                "El cuerpo de la petición no es válido (revisa el JSON y los valores de rol y estado)", null);
    }

    // Red de seguridad: si dos peticiones simultáneas intentan usar el mismo usuario/correo
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegridad(DataIntegrityViolationException ex) {
        return respuesta(HttpStatus.CONFLICT, "El nombre de usuario o el correo ya existen", null);
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus status, String mensaje, Object errores) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("mensaje", mensaje);
        if (errores != null) {
            cuerpo.put("errores", errores);
        }
        return ResponseEntity.status(status).body(cuerpo);
    }
}