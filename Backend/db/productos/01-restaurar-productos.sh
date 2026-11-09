#!/bin/bash
# Lo ejecuta PostgreSQL SOLO la primera vez que crea la base (volumen pg-productos vacío).
# Carga productos.dump, un respaldo en formato "custom" de pg_dump (binario: no se puede
# ejecutar como .sql, por eso se restaura con pg_restore).
set -e
DUMP=/docker-entrypoint-initdb.d/productos.dump
if [ -f "$DUMP" ]; then
  echo "Restaurando $DUMP en la base $POSTGRES_DB..."
  pg_restore --no-owner --no-privileges --exit-on-error \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$DUMP"
  echo "Respaldo restaurado."
else
  echo "No hay productos.dump: la base parte vacía (Hibernate crea las tablas)."
fi
