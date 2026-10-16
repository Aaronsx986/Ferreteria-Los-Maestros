// PRUEBAS UNITARIAS — validaciones y simulador de pago (funciones puras)
import { isEmail, validateProduct, validateUser, validateSupplier, validateCheckout } from '../src/validations.js'
import { procesarPago, soloDigitos } from '../src/services/pago.js'

const productoOk = {
  code: 'ZZ001', name: 'Producto', category: 'madera', brand: 'Marca',
  price: '1000', buyPrice: '500', stock: '10', minStock: '2', discount: '0',
}
const usuarioOk = { name: 'Ana Rojas', username: 'arojas', email: 'ana@correo.cl', password: 'secreto1', role: 'user' }
const proveedorOk = { name: 'Nuevo S.A.', contactName: 'Pedro', contactEmail: 'p@nuevo.cl', paymentTerms: '30 días', deliveryTime: '2 días', rating: '4.5' }
const checkoutOk = { nombre: 'Ana', apellido: 'Rojas', correo: 'ana@correo.cl', delivery: 'retiro', payment: 'efectivo' }

describe('isEmail()', () => {
  it('acepta correos válidos', () => expect(isEmail('a@b.cl')).toBeTrue())
})

describe('validateProduct()', () => {
  it('un producto completo no tiene errores', () => {
    expect(validateProduct(productoOk, [])).toEqual({})
  })
})

describe('validateUser()', () => {
  it('un usuario completo no tiene errores', () => {
    expect(validateUser(usuarioOk, [])).toEqual({})
  })
})

describe('validateSupplier()', () => {
  it('un proveedor completo no tiene errores', () => {
    expect(validateSupplier(proveedorOk, [])).toEqual({})
  })
})

describe('validateCheckout()', () => {
  it('retiro + efectivo solo pide nombre, apellido y correo', () => {
    expect(validateCheckout(checkoutOk)).toEqual({})
    expect(Object.keys(validateCheckout({ ...checkoutOk, nombre: '', apellido: '', correo: '' })).sort()).toEqual(['apellido', 'correo', 'nombre'])
  })
})

describe('services/pago — procesarPago()', () => {
  it('soloDigitos quita todo lo que no sea número', () => {
    expect(soloDigitos('4111-1111 abcd')).toBe('41111111')
  })
})
