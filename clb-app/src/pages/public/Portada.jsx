export default function Portada() {
  return (
    <main data-testid="portada" className="min-h-dvh bg-clb-navy px-6 py-10">
      <h1 className="font-display text-3xl font-black uppercase text-white">
        ¡Trabajemos Juntos por un Mejor Futuro Para Todos!
      </h1>
      <div className="mt-8 flex flex-col gap-3">
        <button type="button">¡Unirme al proyecto!</button>
        <button type="button">Iniciar sesión</button>
      </div>
    </main>
  )
}
