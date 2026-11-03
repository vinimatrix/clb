import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

describe('App smoke', () => {
  it('renderiza la portada con sus dos acciones', () => {
    render(<App />)
    expect(screen.getByTestId('portada')).toBeInTheDocument()
    expect(screen.getByText(/Unirme al proyecto/i)).toBeInTheDocument()
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument()
  })
})
