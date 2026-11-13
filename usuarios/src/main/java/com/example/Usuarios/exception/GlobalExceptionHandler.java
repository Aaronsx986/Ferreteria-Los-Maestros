package com.example.Usuarios.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

// Manejador único de errores: responde siempre JSON con el mismo formato que productos y ventas
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Formato único de error. "campos" solo trae datos en errores de validación.
    public record ErrorBody(Instant timestamp, int status, String mensaje, Map<String, String> campos) {}

    // Errores de negocio lanzados por el service (400, 401, 403, 404, 409)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorBody> negocio(ResponseStatusException e) {
        String mensaje = e.getReason() != null ? e.getReason() : "Error en la solicitud.";
        return responder(e.getStatusCode().value(), mensaje, Map.of());
    }

    // Falla de @Valid en un DTO: devuelve campo -> mensaje
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> validacion(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(f -> campos.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return responder(400, "Revisa los campos del formulario.", campos);
    }

    // JSON mal escrito, un rol o estado no válido, o un parámetro con el tipo incorrecto
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorBody> formato(Exception e) {
        return responder(400, "Formato de solicitud inválido.", Map.of());
    }

    // Usuario o correo repetido cuando dos peticiones llegan al mismo tiempo
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorBody> duplicado(DataIntegrityViolationException e) {
        return responder(409, "El nombre de usuario o el correo ya existen", Map.of());
    }

    // Cualquier otro error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> otros(Exception e) {
        if (e instanceof ErrorResponse er) {
            int status = er.getStatusCode().value();
            return responder(status, status == 404 ? "Ruta no encontrada." : "Solicitud no válida.", Map.of());
        }
        log.error("Error no controlado", e);
        return responder(500, "Error interno del servidor.", Map.of());
    }

    private ResponseEntity<ErrorBody> responder(int status, String mensaje, Map<String, String> campos) {
        return ResponseEntity.status(status).body(new ErrorBody(Instant.now(), status, mensaje, campos));
    }
}
