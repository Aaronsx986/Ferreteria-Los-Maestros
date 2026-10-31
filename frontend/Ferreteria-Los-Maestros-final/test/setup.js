// Preparación global de Jasmine: se ejecuta antes/después de CADA prueba.
import { cleanup } from '@testing-library/react'

// Matchers personalizados (Jasmine no trae toBeInTheDocument como jest-dom)
const customMatchers = {
  toBeInTheDocument() {
    return {
      compare(el) {
        const pass = !!el && el.ownerDocument?.body.contains(el)
        return { pass, message: pass ? 'Se esperaba que el elemento NO estuviera en el documento' : 'Se esperaba que el elemento estuviera en el documento' }
      },
    }
  },
  toBeDisabled() {
    return {
      compare(el) {
        const pass = !!el && el.disabled === true
        return { pass, message: `Se esperaba que el elemento ${pass ? 'NO ' : ''}estuviera deshabilitado` }
      },
    }
  },
  toHaveTextContent() {
    return {
      compare(el, expected) {
        const text = el?.textContent ?? ''
        const pass = expected instanceof RegExp ? expected.test(text) : text.includes(expected)
        return { pass, message: `Se esperaba que el texto "${text}" ${pass ? 'NO ' : ''}contuviera ${expected}` }
      },
    }
  },
}

beforeEach(() => {
  jasmine.addMatchers(customMatchers)
  localStorage.clear()
})

afterEach(() => {
  cleanup() // desmonta los componentes renderizados
  localStorage.clear() // una prueba no deja sesión/carrito que afecte a otra
})
