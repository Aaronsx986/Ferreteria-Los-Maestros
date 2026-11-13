package com.example.Usuarios.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

// Llave RSA que firma los JWT; su parte pública se publica en /api/auth/jwks
@Component
public class JwtKeys {

    private final RSAKey rsa;

    public JwtKeys(@Value("${app.keys-directory}") String directorio) throws Exception {
        Path dir = Path.of(directorio);
        Files.createDirectories(dir);
        Path privada = dir.resolve("private.pk8");
        Path publica = dir.resolve("public.der");

        if (!Files.exists(privada)) {
            KeyPairGenerator generador = KeyPairGenerator.getInstance("RSA");
            generador.initialize(2048);
            KeyPair par = generador.generateKeyPair();
            Files.write(privada, par.getPrivate().getEncoded());
            Files.write(publica, par.getPublic().getEncoded());
            try {
                Files.setPosixFilePermissions(privada, PosixFilePermissions.fromString("rw-------"));
            } catch (UnsupportedOperationException ignorado) {
                // Windows no tiene permisos POSIX
            }
        }

        KeyFactory fabrica = KeyFactory.getInstance("RSA");
        RSAPrivateKey priv = (RSAPrivateKey) fabrica.generatePrivate(new PKCS8EncodedKeySpec(Files.readAllBytes(privada)));
        RSAPublicKey pub = (RSAPublicKey) fabrica.generatePublic(new X509EncodedKeySpec(Files.readAllBytes(publica)));
        // kid = huella de la llave pública (identifica qué llave firmó cada token)
        String kid = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(MessageDigest.getInstance("SHA-256").digest(pub.getEncoded()));
        this.rsa = new RSAKey.Builder(pub).privateKey(priv).keyID(kid).build();
    }

    /** Firma tokens (solo lo usa TokenService). */
    public JwtEncoder encoder() {
        return new NimbusJwtEncoder(new ImmutableJWKSet<SecurityContext>(new JWKSet(rsa)));
    }

    /** Valida los tokens que llegan a este micro, con la llave pública local (sin llamadas HTTP). */
    public JwtDecoder decoder(String issuer) throws Exception {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(rsa.toRSAPublicKey()).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }

    /** JWKS público (solo la llave pública) para /api/auth/jwks. */
    public Map<String, Object> publicJwks() {
        return new JWKSet(rsa.toPublicJWK()).toJSONObject();
    }
}
