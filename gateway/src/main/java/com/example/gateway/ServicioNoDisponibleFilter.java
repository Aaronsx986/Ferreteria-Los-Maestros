package com.example.gateway;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.http.HttpConnectTimeoutException;

// Si un microservicio no responde, devuelve 503 con un mensaje claro en vez de un error 500 genérico.
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class ServicioNoDisponibleFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ServicioNoDisponibleFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        try {
            chain.doFilter(req, res);
        } catch (Exception e) {
            if (res.isCommitted()) throw e;
            boolean caido = esFallaDeConexion(e);
            log.warn("Error al reenviar {} {}: {}", req.getMethod(), req.getRequestURI(), e.toString());
            int status = caido ? 503 : 502;
            String mensaje = caido
                    ? "El servicio no está disponible en este momento. Intenta nuevamente en unos minutos."
                    : "Ocurrió un error al comunicarse con el servicio.";
            res.resetBuffer();
            res.setStatus(status);
            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.getWriter().write("{\"timestamp\":\"" + java.time.Instant.now() + "\",\"status\":" + status
                + ",\"mensaje\":\"" + mensaje + "\",\"campos\":{}}");
        }
    }

    private static boolean esFallaDeConexion(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof ConnectException || t instanceof SocketTimeoutException
                    || t instanceof HttpConnectTimeoutException
                    || t.getClass().getSimpleName().equals("ResourceAccessException")) {
                return true;
            }
        }
        return false;
    }
}
