/* =========================================================
   FERRETERÍA LOS MAESTROS — common.js
   Funciones compartidas por todas las páginas del sitio
   ========================================================= */

const FLM_CART_KEY = 'flm_cart';
const FLM_USER_KEY = 'currentUser';

/* ---------- Autenticación ---------- */
function flmGetCurrentUser() {
  try { return JSON.parse(localStorage.getItem(FLM_USER_KEY)); }
  catch (e) { return null; }
}

function flmRequireAuth() {
  const user = flmGetCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function flmRequireAdmin() {
  const user = flmRequireAuth();
  if (user && user.role !== 'admin') {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function flmLogout() {
  localStorage.removeItem(FLM_USER_KEY);
  window.location.href = 'login.html';
}

/* ---------- Encabezado: nombre de usuario + carrito ---------- */
function flmPaintUserBadge() {
  const user = flmGetCurrentUser();
  const nameEl = document.getElementById('flmNavUserName');
  const adminLinks = document.querySelectorAll('.flm-admin-only');
  if (user && nameEl) {
    nameEl.textContent = user.name ? user.name.split(' ')[0] : user.username;
  }
  if (user && user.role === 'admin') {
    adminLinks.forEach(el => el.classList.remove('d-none'));
  }
}

function flmCartCount() {
  const cart = JSON.parse(localStorage.getItem(FLM_CART_KEY)) || [];
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

function flmPaintCartBadge() {
  const badge = document.getElementById('flmCartBadge');
  if (badge) badge.textContent = flmCartCount();
}

/* ---------- Formateo ---------- */
function flmMoney(n) {
  return '$' + Number(n || 0).toLocaleString('es-CL');
}

function flmFormatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ---------- Sidebar admin (mobile toggle) ---------- */
function flmToggleSidebar() {
  const sb = document.querySelector('.flm-sidebar');
  if (sb) sb.classList.toggle('show');
}

/* ---------- Buscador del header (barra de búsqueda global) ----------
   El formulario de búsqueda del header aparece en todas las páginas de
   cliente (index, catálogo, arriendo, carrito, historial, reparación),
   pero antes tenía onsubmit="return false" y ningún JS asociado, por lo
   que nunca hacía nada. Ahora, al enviar el formulario, redirige a
   catalogo.html?q=<texto> y catalogo.html usa ese parámetro para
   precargar su propio filtro de búsqueda (ver DOMContentLoaded de
   catalogo.html). */
function flmGoToSearch(query) {
  const q = (query || '').trim();
  if (!q) return;
  window.location.href = 'catalogo.html?q=' + encodeURIComponent(q);
}

function flmInitSearchForms() {
  document.querySelectorAll('#navSearchForm, #navSearchFormMobile').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="search"]');
      flmGoToSearch(input ? input.value : '');
    });
  });
}

/* ---------- Inicialización común ---------- */
document.addEventListener('DOMContentLoaded', function () {
  flmPaintUserBadge();
  flmPaintCartBadge();
  flmInitSearchForms();

  const logoutBtns = document.querySelectorAll('[data-flm-logout]');
  logoutBtns.forEach(btn => btn.addEventListener('click', flmLogout));

  const sidebarToggle = document.querySelector('[data-flm-sidebar-toggle]');
  if (sidebarToggle) sidebarToggle.addEventListener('click', flmToggleSidebar);
});
