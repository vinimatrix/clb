/** Placeholder visible mientras se implementa cada pantalla (sin datos falsos). */
export default function Placeholder({ testId, nombre }) {
  return (
    <main data-testid={testId} className="flex min-h-dvh flex-col items-center justify-center bg-clb-surface px-6 text-center">
      <span className="rounded-full bg-clb-blueLight px-3 py-1 text-xs font-bold uppercase tracking-wider text-clb-primary">
        {nombre}
      </span>
      <p className="mt-3 text-sm text-clb-muted">Pantalla en construcción.</p>
    </main>
  )
}
