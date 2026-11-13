# Ferretería Los Maestros - Backend

Backend del proyecto de Full Stack II. Son 3 microservicios en Spring Boot y un gateway adelante.
Cada micro tiene su propia base de datos en PostgreSQL.

| Carpeta | Qué hace | Puerto |
|---|---|---|
| `gateway` | Recibe todo lo que manda el frontend y lo reparte | 8080 |
| `usuarios` | Login, registro, token JWT y usuarios | 8082 |
| `LosMaestros` | Productos y stock | 8081 |
| `ventas` | Compras y estado de los pedidos | 8083 |

Cuando alguien compra, ventas le pide a productos que descuente el stock (llamada interna con la clave `X-Internal-Key`).

## Cómo levantarlo con Docker (lo más fácil)

```
cp .env.example .env
docker compose up --build
```

Eso levanta las 3 bases, los 3 micros y el gateway. La base de productos se carga sola la primera vez.
Si quieres partir de cero (borrar las bases): `docker compose down -v`.

## Cómo levantarlo sin Docker

1. En PostgreSQL (usuario `postgres`, clave `admin`) crea las bases `dbusuarios`, `dblosmaestros` y `dbregistroventas`.
2. En `dblosmaestros` ejecuta `db/productos/01-productos.sql` para cargar los productos.
3. Levanta cada micro con `mvnw spring-boot:run`, en este orden: usuarios, LosMaestros, ventas y gateway.
4. Prueba en el navegador: <http://localhost:8080/api/v1/productos>

Usuarios de prueba: `admin` / `admin123` y `usuario` / `user123`.

## Probar la API

- **Swagger:** <http://localhost:8080/swagger-ui.html> (arriba a la derecha eliges el micro).
  Para lo que pide sesión: haz login, copia el token y pégalo en **Authorize**.
- **Postman:** importa `postman/Ferreteria-Los-Maestros.postman_collection.json` y ejecuta primero el login.

Rutas principales (todas con el prefijo `/api/v1` por el gateway):

- `auth/login`, `auth/registro`, `auth/me`, `auth/refresh`
- `usuarios` (solo ADMIN)
- `productos` (ver es público; crear, editar y borrar es solo ADMIN)
- `ventas` (comprar, ver mis compras, cambiar estado y anular)

## AWS

- Backend: en una EC2 con Docker, se clona el repo, se crea el `.env` y se corre `docker compose up -d --build`. Abrir el puerto 8080.
- Frontend: se compila con `npm run build` y se sube la carpeta `dist/` a un bucket S3.
