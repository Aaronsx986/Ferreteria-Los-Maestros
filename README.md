# Ferretería Los Maestros — React + Bootstrap

Visual del proyecto *header* (Topbar, Navbar, barra de categorías, tarjetas con fotos) + funcionamiento del proyecto *main*.

## Ejecutar
```bash
npm install
npm run dev
```

## Usuarios de prueba
| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | admin |
| usuario | user123 | cliente |

Además puedes crear cuentas en `/crear-usuario` (se guardan en el navegador y quedan como clientes).

## Qué funciona
- **Búsqueda**: buscador del header y del catálogo (sin distinguir tildes; busca por nombre, código, marca y categoría).
- **Filtros** (en la URL, se pueden compartir): categoría, subcategoría, marca, rango de precio, solo con stock y orden.
- **Carrito** persistente, limitado al stock disponible.
- **Compra**: descuenta stock y guarda la orden → aparece en **Mi historial** (con detalle de productos).
- **Arriendo y servicio técnico**: se guardan y aparecen en el historial del usuario.
- **Admin**: Dashboard, Ventas, Reportes, Inventario y Usuarios leen las ventas/stock reales.

Todo se guarda en `localStorage` (no hay backend). Para reiniciar datos: borrar localStorage del sitio.

## Imágenes
Están en `public/img/` con nombres limpios y `products.json` apunta a ellas (`/img/...`).
