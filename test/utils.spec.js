// PRUEBAS UNITARIAS — src/utils.js (funciones puras + persistencia segura)
import { norm, clp, formatDate, load, save } from '../src/utils.js'

describe('utils.norm()', () => {
  it('convierte a minúsculas y elimina tildes', () => {
    expect(norm('Cerámica ÁÉÍÓÚ')).toBe('ceramica aeiou')
  })
})

describe('utils.clp()', () => {
  it('formatea pesos chilenos con separador de miles', () => {
    expect(clp(5990)).toBe('$5.990')
    expect(clp(1250000)).toBe('$1.250.000')
  })
})

describe('utils.formatDate()', () => {
  it('devuelve guion largo si no hay fecha', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})

describe('utils.load() / utils.save() (localStorage)', () => {
  it('load devuelve el valor por defecto si la clave no existe', () => {
    expect(load('no-existe', ['x'])).toEqual(['x'])
  })
})
