const TONES = {
  blue: 'bg-clb-primary text-white',
  orange: 'bg-clb-orange text-white',
  light: 'bg-clb-blueLight text-clb-primaryDeep',
}

/** Avatar circular con iniciales. */
export function Avatar({ text, size = 40, tone = 'blue', className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold ${TONES[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {text}
    </div>
  )
}
