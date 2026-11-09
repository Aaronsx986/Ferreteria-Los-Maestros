package com.example.RegistroVentas.exception;

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

/**
 * Único manejador de errores del micro (mismo enfoque que el catálogo del profe).
 * Atrapa las excepciones de todos los controllers y responde siempre con ErrorBody en JSON.
 * Los errores de negocio se lanzan desde el service con la excepción de Spring:
 *   throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Formato único de error. "campos" solo trae datos en errores de validación. */
    public record ErrorBody(Instant timestamp, int status, String mensaje, Map<String, String> campos) {}

    /** Errores de negocio lanzados por el service (404, 409, 400...). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorBody> negocio(ResponseStatusException e) {
        String mensaje = e.getReason() != null ? e.getReason() : "Error en la solicitud.";
        return responder(e.getStatusCode().value(), mensaje, Map.of());
    }

    /** Falla de @Valid en un DTO: devuelve campo -> mensaje. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> validacion(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(f -> campos.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return responder(400, "Revisa los campos del formulario.", campos);
    }

    /** JSON mal escrito o un parámetro con el tipo incorrecto. */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorBody> formato(Exception e) {
        return responder(400, "Formato de solicitud inválido.", Map.of());
    }

    /** Registro duplicado en la BD (por ejemplo, el mismo id de venta llegando dos veces al mismo tiempo). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorBody> duplicado(DataIntegrityViolationException e) {
        return responder(409, "El registro ya existe o está siendo utilizado.", Map.of());
    }

    /** Cualquier otro error. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> otros(Exception e) {
        // Errores HTTP propios de Spring (ruta inexistente 404, método no permitido 405, etc.)
        if (e instanceof ErrorResponse er) {
            int status = er.getStatusCode().value();
            return responder(status, status == 404 ? "Ruta no encontrada." : "Solicitud no válida.", Map.of());
        }
        // Error inesperado: se registra completo en el log, pero al cliente no se le muestran detalles.
        log.error("Error no controlado", e);
        return responder(500, "Error interno del servidor.", Map.of());
    }

    private ResponseEntity<ErrorBody> responder(int status, String mensaje, Map<String, String> campos) {
        return ResponseEntity.status(status).body(new ErrorBody(Instant.now(), status, mensaje, campos));
    }
}
