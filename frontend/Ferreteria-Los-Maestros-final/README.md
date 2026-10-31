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
- **Detalle de producto** (`/producto/:id`): ficha, cantidad a elegir y productos relacionados.
- **Ofertas** (`/ofertas`): productos con descuento (campo `discount` en `products.json`); el precio con descuento es el que se cobra.
- **Carrito** persistente, limitado al stock disponible.
- **Checkout** (`/checkout`): datos del cliente y dirección de entrega (se completan solos con la sesión), forma de pago y validaciones.
- **Resultado del pago**: `/compra-exitosa/:id` (comprobante con boleta) o `/compra-fallida` (con opción de reintentar). El pago es una simulación: las tarjetas que terminan en `0000` son rechazadas.
- **Compra**: descuenta stock y guarda la orden → aparece en **Mi historial** (con detalle de productos).
- **Página 404** para rutas que no existen.
- **Arriendo y servicio técnico**: se guardan y aparecen en el historial del usuario.
- **Admin**: Dashboard, Ventas y Reportes leen las ventas/stock reales. **Inventario, Usuarios y Proveedores tienen CRUD completo** (crear, editar y eliminar con confirmación y validaciones).

Todo se guarda en `localStorage` (no hay backend). Los archivos JSON de `src/data/` son solo la semilla inicial: apenas el administrador crea, edita o elimina algo, el catálogo (`flm_catalog`), los proveedores (`flm_suppliers`) y los cambios de usuarios (`flm_user_changes`) pasan a vivir en el navegador. Para reiniciar datos: borrar localStorage del sitio.

## Imágenes
Están en `public/img/` con nombres limpios y `products.json` apunta a ellas (`/img/...`).

## Pruebas unitarias (Jasmine + Karma)

Herramientas: **Jasmine** (describe/it/expect, espías y reloj simulado), **Karma** (ejecuta las pruebas en Chrome), **React Testing Library** + **user-event** (renderizar componentes y simular al usuario), **karma-coverage / Istanbul** (cobertura), **webpack + Babel** (empaquetan JSX para Karma).

```bash
npm install            # instala también las herramientas de prueba
npm test               # ejecuta todas las pruebas una vez (Chrome sin ventana)
npm run test:coverage  # pruebas + informe de cobertura en coverage/html/index.html
npm run test:watch     # vuelve a correr al guardar cambios
```

Requiere Google Chrome instalado (en Linux/CI: variable `CHROME_BIN`).

Las pruebas están en `test/` (un archivo `*.spec.jsx` por componente o módulo). `test/setup.js` limpia `localStorage` y desmonta los componentes entre pruebas; `test/helpers.jsx` monta los componentes con Router y los providers reales.
