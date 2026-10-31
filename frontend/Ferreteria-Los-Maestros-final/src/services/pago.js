// Simulación de una pasarela de pago.
// No llama a ningún servicio real: la respuesta es determinista para poder probarla.
// Regla de la demo: las tarjetas cuyo número termina en 0000 son rechazadas por el "banco".

export function soloDigitos(valor = '') {
  return String(valor).replace(/\D/g, '')
}

export function procesarPago({ metodo, monto, tarjeta = '' }) {
  if (!(monto > 0)) {
    return { ok: false, motivo: 'El monto a pagar no es válido.' }
  }
  if (metodo === 'debito' || metodo === 'credito') {
    if (soloDigitos(tarjeta).endsWith('0000')) {
      return { ok: false, motivo: 'Tu banco rechazó la tarjeta. Prueba con otro medio de pago.' }
    }
  }
  return { ok: true }
}
