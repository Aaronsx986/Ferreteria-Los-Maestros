# Backend – Los Maestros

Arquitectura: `frontend → gateway (8080) → microservicios → base de datos`.
Solo el gateway publica puerto; los demás se hablan por la red interna de Docker usando el
**nombre del servicio** como host (`http://productos:8081`, `db-productos:5432`).
Dentro de un contenedor, `localhost` es el propio contenedor: nunca uses `localhost` para llamar a otro servicio.

## Levantar todo
```
cp .env.example .env     # y cambia DB_PASSWORD
docker compose up --build
```
Prueba: http://localhost:8080/api/productos

| Comando | Qué hace |
|---|---|
| `docker compose up --build` | Construye las imágenes y levanta todo |
| `docker compose up -d` | Igual, en segundo plano |
| `docker compose ps` | Estado de los contenedores |
| `docker compose logs -f productos` | Logs de un servicio en vivo |
| `docker compose down` | Apaga todo (los datos se conservan) |
| `docker compose down -v` | Apaga y **borra las bases de datos** (volúmenes) |

## Puertos
| Servicio | Puerto interno | Publicado en tu PC |
|---|---|---|
| gateway | 8080 | 8080 |
| productos (LosMaestros) | 8081 | no |
| usuarios | 8082 | no |
| db-usuarios | 5432 | no (opcional `5435:5432` para pgAdmin) |
| ventas | 8083 | no |
| db-ventas | 5432 | no (opcional `5434:5432` para pgAdmin) |
| db-productos | 5432 | no (opcional `5433:5432` para pgAdmin) |

El puerto interno lo define `server.port` en el `application.properties` de cada micro;
`EXPOSE` en el Dockerfile solo lo documenta; `ports:` en el compose lo publica (`PC:CONTENEDOR`).

## Base de datos
| Ambiente | Dónde vive | URL de conexión |
|---|---|---|
| PC sin Docker | PostgreSQL de Windows | `localhost:5432` (application.properties) |
| PC con Docker | Contenedor `db-productos` (postgres:18) + volumen `pg-productos` | `db-productos:5432` (compose) |
| AWS | Contenedor `db-productos` dentro de la misma EC2 (mismo compose) | `db-productos:5432` |

El código no cambia entre ambientes: el compose define `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`,
que tienen prioridad sobre `application.properties`.
La primera vez que se crea la base se cargan los productos de `db/productos/productos.dump` (ver `db/productos/LEEME.md`).

## Agregar un microservicio nuevo (ej. `ventas`)
1. Crea la carpeta `ventas/` (Spring Initializr: Spring Web + JPA + PostgreSQL) con su `@RequestMapping("/api/ventas")`.
2. Copia el `Dockerfile` y `.dockerignore` de `LosMaestros/` y cambia el `EXPOSE` (ej. 8083).
3. En su `application.properties`: `server.port=8083` y la conexión a tu PostgreSQL local (se usa sin Docker).
   No pongas `@CrossOrigin`: el CORS vive en el gateway.
4. En `docker-compose.yml` agrega **su propia base** (`db-ventas`, copiando `db-productos` con otro volumen `pg-ventas`)
   y el servicio `ventas` (copiando `productos`, cambiando `build:` y las variables `SPRING_DATASOURCE_*`).
   Si llama a otro micro, pásale la URL por variable: `PRODUCTOS_URL: http://productos:8081`.
5. En `gateway/src/main/resources/application.yml` agrega otra ruta:
   ```yaml
   - id: ventas
     uri: ${VENTAS_URL:http://localhost:8083}
     predicates:
       - Path=/api/ventas/**
   ```
   y en el compose, dentro de `gateway.environment`: `VENTAS_URL: http://ventas:8083`.
   Nunca enrutes `/internal/**` (llamadas entre micros).
6. `docker compose up --build`.

## CORS (frontend → gateway)
El CORS vive solo en el gateway (`gateway/.../CorsConfig.java`). Los orígenes permitidos salen de la variable
`FRONTEND_ORIGINS` del `.env` (separados por coma). Sin definirla se permite `http://localhost:*` (desarrollo).

## Desplegar en AWS (resumen)
1. **Frontend (bucket S3 con Static website hosting):**
   - En `frontend/.../.env.production` pon `VITE_API_URL=http://<IP-elastica-EC2>:8080` y corre `npm run build`.
   - Sube el **contenido** de `dist/` (no la carpeta): `aws s3 sync dist/ s3://<bucket>/` (sin `--delete`, para no borrar imágenes subidas después).
   - En el bucket: documento de índice **y** de error = `index.html` (React usa BrowserRouter).
2. **Backend (EC2 con Docker):**
   - Clona el repo, crea `Backend/.env` (desde `.env.example`) con `DB_PASSWORD` y
     `FRONTEND_ORIGINS=http://<bucket>.s3-website-<region>.amazonaws.com`.
   - `docker compose up -d --build`.
   - IP elástica asociada; security group: 8080 abierto, 22 solo desde tu IP. El 5432 nunca se abre.
3. **Respaldos:** la base vive en el volumen `pg-productos` del disco de la EC2; respáldala con `pg_dump` periódicamente.

## Comunicación entre microservicios (ventas → productos)
Solo ventas llama a productos; productos no conoce a ventas.

```
Frontend --POST /api/ventas--> gateway --> ventas --POST /internal/stock/descontar--> productos
                                          (X-Internal-Key)        valida + bloquea + descuenta
```
- **Endpoint interno de productos:** `POST /internal/stock/descontar` con header `X-Internal-Key` y body
  `{"idVenta": "...", "items": [{"idCodigo": "HER-001", "cantidad": 2}]}`.
  Responde nombre y precio de cada producto. Si falta stock de uno, no descuenta ninguno (409).
  Si el mismo `idVenta` llega de nuevo (reintento), devuelve lo ya descontado sin descontar otra vez.
- **No pasa por el gateway:** el gateway solo enruta `/api/**`. Ventas usa `CATALOGO_URL`
  (`http://localhost:8081` en local, `http://productos:8081` en Docker).
- **Clave compartida:** `INTERNAL_API_KEY` en el `.env`; debe ser la misma para productos y ventas.
- **Comprar desde el frontend:** `POST /api/ventas` con
  `{"items": [{"idProducto": "HER-001", "cantidad": 2}], "metodoPago": "...", "tipoEntrega": "..."}`, el header
  `Authorization: Bearer <token>`
  y, opcional, el header `Idempotency-Key` (un UUID por compra) para poder reintentar sin cobrar dos veces.
- **Sesión:** `/api/ventas` requiere el JWT del micro de usuarios; el comprador sale del token (`sub`), no del body.

## Autenticación (micro de usuarios → JWT)
```
Frontend --POST /api/auth/login--> gateway --> usuarios   (devuelve { token, usuario })
Frontend --Authorization: Bearer <token>--> gateway --> productos / ventas
productos y ventas --GET /api/auth/jwks--> usuarios       (llave pública para validar el token)
```
- Usuarios firma los tokens con una llave RSA guardada en `data/keys` (en Docker, volumen `usuarios-keys`).
- Productos: GET público; POST/PUT/DELETE solo rol ADMIN. Ventas: cualquier usuario con sesión.
  Usuarios: `/api/usuarios/**` solo ADMIN; login, registro y jwks públicos.
- Las tres apps deben usar el mismo issuer (`JWT_ISSUER`, por defecto `losmaestros-usuarios`).
- Usuarios de prueba (se crean solos si la tabla está vacía): `admin`/`admin123` y `usuario`/`user123`.
