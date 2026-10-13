# Ferretería Los Maestros — React + Bootstrap

Aplicación web de la ferretería, construida en React (Vite) con React Router y Bootstrap / React-Bootstrap.

## Instalación y ejecución

```bash
npm install
npm run dev
```

## Usuarios de prueba

No hay backend: la sesión se valida contra `src/data/users.json` y se guarda en `localStorage`.

| Usuario | Contraseña | Rol    |
|---------|-----------|--------|
| admin   | admin123  | admin  |
| usuario | user123   | user   |

## Estructura

```
src/
  components/   Header, Footer, ProductCard, AdminSidebar, ProtectedRoute
  context/      AuthContext (sesión), CartContext (carrito)
  data/         products.json, users.json, suppliers.json
  pages/        una página por ruta (ver tabla abajo)
  App.jsx       definición de rutas
  main.jsx      punto de entrada, providers y estilos globales
public/img/     imágenes de productos
```

## Páginas y rutas

| Ruta            | Página        | Acceso          |
|-----------------|---------------|-----------------|
| `/`              | Home          | Público         |
| `/catalogo`      | Catalogo      | Público         |
| `/login`         | Login         | Público         |
| `/crear-usuario` | CrearUsuario  | Público         |
| `/carrito`       | Carrito       | Con sesión      |
| `/arriendo`      | Arriendo      | Con sesión      |
| `/reparacion`    | Reparacion    | Con sesión      |
| `/historial`     | Historial     | Con sesión      |
| `/dashboard`     | Dashboard     | Solo admin      |
| `/inventario`    | Inventario    | Solo admin      |
| `/usuarios`      | Usuarios      | Solo admin      |
| `/proveedores`   | Proveedores   | Solo admin      |
| `/ventas`        | Ventas        | Solo admin      |
| `/reportes`      | Reportes      | Solo admin      |

## Notas

- `Ventas.jsx` y `Reportes.jsx` usan datos de ejemplo (no hay backend de ventas todavía).
- Algunas imágenes en `public/img/` tienen nombres con caracteres corruptos (vienen así del zip original). `ProductCard.jsx` usa por ahora los íconos de Bootstrap Icons que trae `products.json`, en vez de las fotos.
