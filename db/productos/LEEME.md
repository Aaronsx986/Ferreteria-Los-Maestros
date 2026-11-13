# Datos iniciales de la base de productos

| Archivo | Qué es |
|---|---|
| `01-productos.sql` | Script SQL estándar que crea la tabla `catalogo_prod` (si no existe) e inserta los 86 productos del catálogo inicial con la URL de sus imágenes. La categoría se guarda como **texto** (ej. `Herramientas`, `Mat. Construcción`), igual que en la base original. |
| `.gitattributes` | Obliga a que los scripts queden con saltos de línea LF (si se guardan con CRLF de Windows, Linux puede fallar al ejecutarlos). |

El script funciona en **cualquier versión de PostgreSQL** y se puede ejecutar más de una vez:
no duplica datos (`ON CONFLICT DO NOTHING`).

> **Si tu base `dblosmaestros` se creó con la versión que tenía la tabla `categoria`** (columna `categoria_id`),
> bórrala y créala de nuevo antes de ejecutar el script:
> `DROP DATABASE dblosmaestros;` y `CREATE DATABASE dblosmaestros;` (o en pgAdmin: Delete/Drop y Create → Database).
> Si tu base es la original (columna `categoria` de texto), no hay que hacer nada.

## Cargar los productos sin Docker (PostgreSQL instalado en el PC)

**pgAdmin:** clic derecho en la base `dblosmaestros` → *Query Tool* → abrir `01-productos.sql` → ejecutar (F5).

**psql** (desde la carpeta del backend):
```
psql -U postgres -d dblosmaestros -f db/productos/01-productos.sql
```

## Con Docker

Esta carpeta se monta en el contenedor `db-productos` como `/docker-entrypoint-initdb.d`.
PostgreSQL ejecuta los `.sql` **solo la primera vez** que crea la base (volumen `pg-productos` vacío).
Para empezar de cero:
```
docker compose down -v
docker compose up --build
```

## Actualizar el script con los datos de tu PostgreSQL local

Exporta solo los datos en formato de INSERT:
```
pg_dump -U postgres -d dblosmaestros -t catalogo_prod --data-only --inserts --column-inserts --no-owner --no-privileges -f productos_nuevos.sql
```
Revisa el archivo y reemplaza el bloque `INSERT` de `01-productos.sql` (conserva el `CREATE TABLE IF NOT EXISTS` del inicio).

## AWS
La base corre como contenedor dentro de la misma EC2 que el backend, así que se carga igual que en local
al hacer `docker compose up` por primera vez en la EC2.
