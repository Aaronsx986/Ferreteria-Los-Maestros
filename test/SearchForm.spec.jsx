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
})
