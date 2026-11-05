import QRCode from 'qrcode'

/**
 * Genera un código QR con los datos del elector para escaneo rápido.
 * Incluye: cédula, nombres, apellidos, recinto, mesa.
 *
 * @param {Object} elector - Objeto con datos del elector
 * @param {Number} size - Tamaño del canvas en píxeles (default 256)
 */
export default function QrGenerator({ elector, size = 256 }) {
  const [qrUrl, setQrUrl] = useState(null)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!elector || !elector.cedula) return

    const qrData = JSON.stringify({
      cedula: elector.cedula,
      nombres: elector.nombres,
      apellidos: elector.apellidos,
      recinto: elector.recinto,
      mesa: elector.mesa,
      tipo: 'elector_clb',
    })

    QRCode.toDataURL(qrData, {
      width: size,
      margin: 2,
      color: {
        dark: '#0D47A1', // clb-primary
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrUrl(url)
        setError(null)
      })
      .catch((err) => {
        setError('Error generando código QR')
        console.error(err)
      })
  }, [elector, size])

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm border border-red-200">
        {error}
      </div>
    )
  }

  if (!qrUrl) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-slate-100 rounded-lg">
        <span className="material-symbols-outlined text-[48px] text-slate-400">qr_code</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg bg-white p-2 shadow-card border border-slate-200"
      />
      <button
        type="button"
        onClick={() => {
          const canvas = canvasRef.current
          if (!canvas) return
          const link = document.createElement('a')
          link.download = `clb-elector-${elector.cedula}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
        }}
        className="rounded-lg bg-clb-primary px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep"
      >
        <span className="material-symbols-outlined text-[18px] mr-1">download</span>
        Descargar QR
      </button>
    </div>
  )
}
