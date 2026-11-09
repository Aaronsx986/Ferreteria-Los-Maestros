# Microservicio de Usuarios — Ferretería Los Maestros

Spring Boot 4.1.2 · Java 17 · PostgreSQL · puerto **8082**

## Requisitos
- Java 17 o superior
- PostgreSQL en `localhost:5432` con una base llamada `dbusuarios`
  (crear con `sql/00_crear_base.sql` o desde pgAdmin)

## Ejecutar
```powershell
.\mvnw.cmd spring-boot:run
```
Al arrancar, Hibernate crea la tabla `usuarios` y se cargan dos usuarios de prueba
(solo si la tabla está vacía):

| usuario  | contraseña | rol     |
|----------|------------|---------|
| admin    | admin123   | ADMIN   |
| usuario  | user123    | CLIENTE |

Prueba rápida: `POST http://localhost:8082/api/auth/login` con `{"nombreUsuario":"admin","password":"admin123"}`

## Configuración
Edita `src/main/resources/application.properties` o usa variables de entorno
(`DB_URL`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGINS`, `PORT`).
Credenciales por defecto de la base: usuario `postgres`, contraseña `admin` (cámbialas con `DB_USER` y `DB_PASSWORD`).

## API
| Acción            | Petición                     | Cuerpo                                                                 |
|-------------------|------------------------------|------------------------------------------------------------------------|
| Iniciar sesión    | `POST /api/auth/login`       | `nombreUsuario`, `password`                                            |
| Registrarse       | `POST /api/auth/registro`    | `nombre`, `nombreUsuario`, `correo`, `telefono`, `password`, `direccion` |
| Listar usuarios   | `GET /api/usuarios`          | —                                                                      |
| Ver un usuario    | `GET /api/usuarios/{id}`     | —                                                                      |
| Crear (admin)     | `POST /api/usuarios`         | igual al registro + `rol`, `estado`                                    |
| Editar            | `PUT /api/usuarios/{id}`     | sin `nombreUsuario`; `password` opcional                               |
| Desactivar        | `DELETE /api/usuarios/{id}`  | — (204; el usuario queda `INACTIVO`)                                   |

`direccion` = `{ calle, comuna, region, pais }`.
`rol`: `ADMIN` · `VENDEDOR` · `CLIENTE`. `estado`: `ACTIVO` · `INACTIVO`.
Errores: `{ "mensaje": "..." }` con códigos 400, 401, 403, 404 y 409.

## Notas
- Las contraseñas se guardan con BCrypt.
- Todavía no hay JWT: los endpoints `/api/usuarios` están abiertos.
- `mvnw test` necesita la base de datos encendida (el test carga el contexto completo).
- La carpeta `frontend-cambios/` (en el zip) trae los archivos del front para conectarlo.

## JWT (este micro emite los tokens)
- `POST /api/auth/login` devuelve `{ token, tipo: "Bearer", expiraEn, usuario }`. El token se envía en cada
  petición protegida como `Authorization: Bearer <token>` (vigencia: `TOKEN_MINUTOS`, 120 por defecto).
- Claims: `iss` = `losmaestros-usuarios` (`JWT_ISSUER`), `sub` = id del usuario, `preferred_username`, `nombre`
  y `roles` (por ejemplo `["ADMIN"]`).
- `GET /api/auth/jwks` publica la llave pública: productos y ventas validan los tokens con ella.
- La llave RSA se genera sola la primera vez en `data/keys` (`KEYS_DIRECTORY`). **No se sube a git**
  (`data/` está en `.gitignore`); en Docker vive en el volumen `usuarios-keys`.

## Seguridad
| Ruta | Acceso |
|---|---|
| `POST /api/auth/login`, `POST /api/auth/registro`, `GET /api/auth/jwks` | Público |
| `/api/usuarios/**` | Solo rol ADMIN (token) |
| Cualquier otra | Denegada |

Un administrador no puede quitarse el rol ni desactivarse a sí mismo. Sin CORS en este micro: lo maneja el API Gateway
(`/api/auth/**` y `/api/usuarios/**` → usuarios:8082).
