# Datos iniciales de la base de productos

Esta carpeta se monta en el contenedor `db-productos` como `/docker-entrypoint-initdb.d`.
PostgreSQL ejecuta sus scripts **solo la primera vez** que crea la base (volumen `pg-productos` vacío).

| Archivo | Qué es |
|---|---|
| `productos.dump` | Respaldo de la base local `dblosmaestros` (tabla `catalogo_prod` con productos y rutas de imágenes). Formato **custom** de `pg_dump` (binario), por eso no termina en `.sql` |
| `01-restaurar-productos.sh` | Restaura `productos.dump` con `pg_restore` |
| `.gitattributes` | Obliga a que el `.sh` quede con saltos de línea LF (si se guarda con CRLF de Windows, Linux no lo puede ejecutar) |

## Volver a cargar los datos
El respaldo solo se carga en una base nueva. Para empezar de cero:
```
docker compose down -v
docker compose up --build
```

## Actualizar el respaldo con los datos de tu PostgreSQL local
Desde la carpeta `Backend` (PowerShell o CMD):
```
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d dblosmaestros -Fc --no-owner --no-privileges -f db\productos\productos.dump
```
(`-Fc` = formato custom, el que espera el script.)

## AWS
La base corre como contenedor dentro de la misma EC2 que el backend, así que se carga igual que en local:
al hacer `docker compose up` por primera vez en la EC2.
