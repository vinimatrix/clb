/** Icono Material Symbols (ligadura por nombre). */
export function Icon({ name, size = 20, className = '', fill = false, style }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
