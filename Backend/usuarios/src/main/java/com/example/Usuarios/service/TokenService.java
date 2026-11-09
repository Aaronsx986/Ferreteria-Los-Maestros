package com.example.Usuarios.service;

import com.example.Usuarios.entity.Usuario;
import com.example.Usuarios.security.JwtKeys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Emite el JWT de la sesión. Claims:
 *  - iss: app.issuer (productos y ventas lo validan)
 *  - sub: id numérico del usuario (los otros micros guardan este id, no el username)
 *  - preferred_username, nombre: para mostrar
 *  - roles: ["ADMIN"] / ["CLIENTE"] / ["VENDEDOR"] -> en los otros micros se convierte en ROLE_ADMIN, etc.
 */
@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final String issuer;
    private final long minutos;

    public TokenService(JwtKeys keys,
                        @Value("${app.issuer}") String issuer,
                        @Value("${app.token-minutos:120}") long minutos) {
        this.encoder = keys.encoder();
        this.issuer = issuer;
        this.minutos = minutos;
    }

    public Token emitir(Usuario u) {
        Instant ahora = Instant.now();
        Instant expira = ahora.plus(minutos, ChronoUnit.MINUTES);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(ahora)
                .expiresAt(expira)
                .subject(u.getId().toString())
                .claim("preferred_username", u.getNombreUsuario())
                .claim("nombre", u.getNombre())
                .claim("roles", List.of(u.getRol().name()))
                .build();
        String valor = encoder
                .encode(JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                .getTokenValue();
        return new Token(valor, expira);
    }

    public record Token(String valor, Instant expiraEn) {}
}
