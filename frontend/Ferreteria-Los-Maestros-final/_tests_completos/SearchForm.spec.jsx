// PRUEBAS DE COMPONENTE — SearchForm (componente controlado: props de entrada y callbacks)
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchForm from '../src/components/SearchForm.jsx'

describe('SearchForm', () => {
  it('renderiza un formulario de búsqueda accesible con su placeholder', () => {
    render(<SearchForm value="" onChange={() => {}} onSubmit={() => {}} placeholder="Buscar..." />)
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('muestra el valor recibido por props (componente controlado)', () => {
    render(<SearchForm value="taladro" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.getByRole('searchbox').value).toBe('taladro')
  })

  it('llama a onChange con el texto escrito (espía/mock de Jasmine)', async () => {
    const onChange = jasmine.createSpy('onChange')
    render(<SearchForm value="" onChange={onChange} onSubmit={() => {}} />)
    await userEvent.setup().type(screen.getByRole('searchbox'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('llama a onSubmit al enviar el formulario', () => {
    const onSubmit = jasmine.createSpy('onSubmit').and.callFake((e) => e.preventDefault())
    render(<SearchForm value="x" onChange={() => {}} onSubmit={onSubmit} />)
    fireEvent.submit(screen.getByRole('search'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('aplica la clase extra recibida en className', () => {
    render(<SearchForm value="" onChange={() => {}} onSubmit={() => {}} className="d-none d-md-flex" />)
    expect(screen.getByRole('search').className).toContain('d-md-flex')
  })
})
