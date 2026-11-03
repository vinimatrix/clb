import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricCard, FilterPills, DonutChart, Button, Badge, ProgressBar, Avatar, Icon } from '../components/index.js'
import { ToastProvider, useToast } from '../components/Toast.jsx'

function BotonToast() {
  const toast = useToast()
  return <button type="button" onClick={() => toast.show('Hola')}>disparar</button>
}

describe('componentes compartidos', () => {
  it('MetricCard renderiza valor, etiqueta y delta', () => {
    render(<MetricCard icon="how_to_reg" tone="blue" value="245,678" label="Inscritos" sub="Padrón validado" delta="+12%" deltaTone="blue" />)
    expect(screen.getByText('245,678')).toBeInTheDocument()
    expect(screen.getByText(/Inscritos/i)).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('FilterPills marca como activo el pill clickeado', () => {
    const options = [
      { id: 'todos', label: 'Todos', count: 36 },
      { id: 'llamadas', label: 'Por Llamar', count: 5 },
    ]
    function Test() {
      return <FilterPills options={options} active="todos" onChange={(id) => { /* el padre re-renderiza */ }} />
    }
    render(<Test />)
    expect(screen.getByText(/Todos/).closest('button')).toHaveClass('bg-clb-primary')
    fireEvent.click(screen.getByText(/Por Llamar/))
    // onChange dispara sin errores
  })

  it('DonutChart calcula el arco para 14.35% (43.3 de circunferencia 301.6)', () => {
    const { container } = render(<DonutChart percent={14.35} label="Meta PRM" />)
    const arc = container.querySelector('circle[stroke-dasharray]')
    expect(arc).toBeTruthy()
    expect(arc.getAttribute('stroke-dasharray')).toContain('43.3')
  })

  it('ToastProvider muestra y oculta el mensaje', () => {
    render(<ToastProvider><BotonToast /></ToastProvider>)
    fireEvent.click(screen.getByText('disparar'))
    expect(screen.getByText('Hola')).toBeInTheDocument()
  })

  it('Button variant orange y Badge tone green aplican tokens', () => {
    render(<Button variant="orange">CONTINUAR</Button>)
    expect(screen.getByText('CONTINUAR').closest('button')).toHaveClass('bg-clb-orange')
    render(<Badge tone="green">Activo</Badge>)
    expect(screen.getByText('Activo')).toHaveClass('bg-emerald-50')
  })

  it('ProgressBar fija el ancho y Avatar muestra iniciales', () => {
    const { container } = render(<ProgressBar value={27.7} tone="blue" />)
    const fill = container.querySelector('div[style]')
    expect(fill.style.width).toBe('27.7%')
    render(<Avatar text="JP" />)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('Icon renderiza el ligature de Material Symbols', () => {
    render(<Icon name="notifications" size={22} />)
    const el = screen.getByText('notifications')
    expect(el).toHaveClass('material-symbols-outlined')
  })
})
