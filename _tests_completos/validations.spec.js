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
  it('rechaza correos sin @, sin dominio o vacíos', () => {
    ;['', 'abc', 'a@b', '@b.cl', 'a b@c.cl', undefined].forEach((v) => expect(isEmail(v)).toBeFalse())
  })
})

describe('validateProduct()', () => {
  it('un producto completo no tiene errores', () => {
    expect(validateProduct(productoOk, [])).toEqual({})
  })

  it('marca como obligatorios código, nombre, categoría y marca', () => {
    const e = validateProduct({ price: '1', buyPrice: '1', stock: '1', minStock: '1' }, [])
    expect(Object.keys(e).sort()).toEqual(['brand', 'category', 'code', 'name'])
  })

  it('rechaza un código repetido (sin distinguir mayúsculas)', () => {
    expect(validateProduct({ ...productoOk, code: 'mc001' }, [{ id: 1, code: 'MC001' }]).code).toContain('Ya existe')
  })

  it('al editar, el propio código del producto no cuenta como repetido', () => {
    expect(validateProduct({ ...productoOk, code: 'MC001' }, [{ id: 1, code: 'MC001' }], 1)).toEqual({})
  })

  it('el precio debe ser un entero mayor a 0', () => {
    ;['0', '-5', 'abc', '', '10.5'].forEach((v) => expect(validateProduct({ ...productoOk, price: v }, []).price).toBeDefined())
  })

  it('el stock no puede ser negativo ni decimal', () => {
    expect(validateProduct({ ...productoOk, stock: '-1' }, []).stock).toBeDefined()
    expect(validateProduct({ ...productoOk, stock: '1.5' }, []).stock).toBeDefined()
    expect(validateProduct({ ...productoOk, stock: '0' }, []).stock).toBeUndefined()
  })

  it('el descuento debe estar entre 0 y 90 (vacío se toma como 0)', () => {
    expect(validateProduct({ ...productoOk, discount: '91' }, []).discount).toBeDefined()
    expect(validateProduct({ ...productoOk, discount: '-1' }, []).discount).toBeDefined()
    expect(validateProduct({ ...productoOk, discount: '90' }, []).discount).toBeUndefined()
    expect(validateProduct({ ...productoOk, discount: '' }, []).discount).toBeUndefined()
  })
})

describe('validateUser()', () => {
  it('un usuario completo no tiene errores', () => {
    expect(validateUser(usuarioOk, [])).toEqual({})
  })

  it('rechaza usuario y correo ya usados', () => {
    const existentes = [{ username: 'ARojas', email: 'ANA@correo.cl' }]
    const e = validateUser(usuarioOk, existentes)
    expect(e.username).toContain('en uso')
    expect(e.email).toContain('Ya existe')
  })

  it('al crear la contraseña es obligatoria y de mínimo 6 caracteres', () => {
    expect(validateUser({ ...usuarioOk, password: '' }, []).password).toBeDefined()
    expect(validateUser({ ...usuarioOk, password: '123' }, []).password).toContain('Mínimo')
  })

  it('al editar, la contraseña vacía es válida (no se cambia) pero una corta no', () => {
    expect(validateUser({ ...usuarioOk, password: '' }, [], 'arojas').password).toBeUndefined()
    expect(validateUser({ ...usuarioOk, password: '123' }, [], 'arojas').password).toBeDefined()
  })

  it('al editar, su propio correo no cuenta como repetido', () => {
    expect(validateUser(usuarioOk, [{ username: 'arojas', email: 'ana@correo.cl' }], 'arojas').email).toBeUndefined()
  })

  it('rechaza nombres de usuario cortos o con espacios y roles desconocidos', () => {
    expect(validateUser({ ...usuarioOk, username: 'ab' }, []).username).toBeDefined()
    expect(validateUser({ ...usuarioOk, username: 'a b c' }, []).username).toBeDefined()
    expect(validateUser({ ...usuarioOk, role: 'root' }, []).role).toBeDefined()
  })
})

describe('validateSupplier()', () => {
  it('un proveedor completo no tiene errores', () => {
    expect(validateSupplier(proveedorOk, [])).toEqual({})
  })

  it('rechaza un nombre repetido y respeta la edición del mismo proveedor', () => {
    const lista = [{ id: 1, name: 'nuevo s.a.' }]
    expect(validateSupplier(proveedorOk, lista).name).toContain('Ya existe')
    expect(validateSupplier(proveedorOk, lista, 1).name).toBeUndefined()
  })

  it('la evaluación debe estar entre 0 y 5', () => {
    expect(validateSupplier({ ...proveedorOk, rating: '5.1' }, []).rating).toBeDefined()
    expect(validateSupplier({ ...proveedorOk, rating: '' }, []).rating).toBeDefined()
    expect(validateSupplier({ ...proveedorOk, rating: '0' }, []).rating).toBeUndefined()
  })

  it('exige contacto y correo válido', () => {
    const e = validateSupplier({ ...proveedorOk, contactName: '', contactEmail: 'x' }, [])
    expect(e.contactName).toBeDefined()
    expect(e.contactEmail).toBeDefined()
  })
})

describe('validateCheckout()', () => {
  it('retiro + efectivo solo pide nombre, apellido y correo', () => {
    expect(validateCheckout(checkoutOk)).toEqual({})
    expect(Object.keys(validateCheckout({ ...checkoutOk, nombre: '', apellido: '', correo: '' })).sort()).toEqual(['apellido', 'correo', 'nombre'])
  })

  it('con despacho exige calle, región y comuna', () => {
    expect(Object.keys(validateCheckout({ ...checkoutOk, delivery: 'despacho' })).sort()).toEqual(['calle', 'comuna', 'region'])
  })

  it('con tarjeta exige 16 dígitos (ignora espacios y guiones)', () => {
    const base = { ...checkoutOk, payment: 'credito' }
    expect(validateCheckout({ ...base, tarjeta: '4111 1111-1111 1111' }).tarjeta).toBeUndefined()
    expect(validateCheckout({ ...base, tarjeta: '4111' }).tarjeta).toBeDefined()
  })
})

describe('services/pago — procesarPago()', () => {
  it('soloDigitos quita todo lo que no sea número', () => {
    expect(soloDigitos('4111-1111 abcd')).toBe('41111111')
  })

  it('aprueba un pago normal', () => {
    expect(procesarPago({ metodo: 'debito', monto: 5000, tarjeta: '4111 1111 1111 1111' }).ok).toBeTrue()
  })

  it('rechaza las tarjetas terminadas en 0000 (débito y crédito)', () => {
    ;['debito', 'credito'].forEach((metodo) => {
      const r = procesarPago({ metodo, monto: 5000, tarjeta: '4000 0000 0000 0000' })
      expect(r.ok).toBeFalse()
      expect(r.motivo).toContain('rechazó')
    })
  })

  it('transferencia y efectivo no usan tarjeta, así que no se rechazan por ella', () => {
    expect(procesarPago({ metodo: 'transferencia', monto: 5000, tarjeta: '0000' }).ok).toBeTrue()
    expect(procesarPago({ metodo: 'efectivo', monto: 5000 }).ok).toBeTrue()
  })

  it('rechaza un monto de 0 o negativo', () => {
    expect(procesarPago({ metodo: 'efectivo', monto: 0 }).ok).toBeFalse()
    expect(procesarPago({ metodo: 'efectivo', monto: -1 }).ok).toBeFalse()
  })
})
