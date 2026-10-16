// PRUEBAS UNITARIAS — src/utils.js (funciones puras + persistencia segura)
import { norm, clp, formatDate, load, save } from '../src/utils.js'

describe('utils.norm()', () => {
  it('convierte a minúsculas y elimina tildes', () => {
    expect(norm('Cerámica ÁÉÍÓÚ')).toBe('ceramica aeiou')
  })

  it('permite que "ceramica" encuentre "cerámica" (búsqueda sin tildes)', () => {
    expect(norm('Mortero cola cerámica').includes(norm('CERAMICA'))).toBeTrue()
  })

  it('devuelve cadena vacía si no recibe argumento', () => {
    expect(norm()).toBe('')
  })

  it('convierte números a texto', () => {
    expect(norm(123)).toBe('123')
  })
})

describe('utils.clp()', () => {
  it('formatea pesos chilenos con separador de miles', () => {
    expect(clp(5990)).toBe('$5.990')
    expect(clp(1250000)).toBe('$1.250.000')
  })

  it('devuelve $0 para null, undefined o texto no numérico', () => {
    expect(clp(null)).toBe('$0')
    expect(clp(undefined)).toBe('$0')
    expect(clp('abc')).toBe('$0')
  })

  it('acepta números en formato texto', () => {
    expect(clp('7490')).toBe('$7.490')
  })
})

describe('utils.formatDate()', () => {
  it('devuelve guion largo si no hay fecha', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('devuelve el mismo texto si la fecha es inválida', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha')
  })

  it('formatea una fecha ISO válida en español con el año', () => {
    const out = formatDate('2025-03-05T12:00:00Z')
    expect(out).toMatch(/05/)
    expect(out).toMatch(/2025/)
  })
})

describe('utils.load() / utils.save() (localStorage)', () => {
  it('load devuelve el valor por defecto si la clave no existe', () => {
    expect(load('no-existe', ['x'])).toEqual(['x'])
  })

  it('save + load hacen un viaje de ida y vuelta (ida y vuelta JSON)', () => {
    save('prueba', { a: 1, lista: [1, 2, 3] })
    expect(load('prueba', null)).toEqual({ a: 1, lista: [1, 2, 3] })
  })

  it('load devuelve el valor por defecto si el JSON está corrupto', () => {
    localStorage.setItem('roto', '{esto no es json')
    expect(load('roto', 'respaldo')).toBe('respaldo')
  })

  it('save NO lanza error si el almacenamiento está lleno (mock de setItem)', () => {
    // MOCK: reemplazamos setItem por un espía que simula "cuota excedida"
    const espia = spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError')
    expect(() => save('k', 1)).not.toThrow()
    expect(espia).toHaveBeenCalledTimes(1)
  })

  it('load NO lanza error si getItem falla (mock)', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('bloqueado')
    expect(load('k', 'seguro')).toBe('seguro')
  })
})
