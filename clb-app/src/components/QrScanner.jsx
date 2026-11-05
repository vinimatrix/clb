import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

/**
 * Componente de escaneo de QR y código de barras usando la cámara del dispositivo.
 * Soporta: QR Code, Code 128, EAN-13, EAN-8, UPC-A, UPC-E, Codabar, ITF, Code 39, Code 93, Code 128.
 *
 * @param {Object} props
 * @param {Function} props.onScan - Callback con el resultado del escaneo (texto del código)
 * @param {Boolean} props.autoClose - Si cerrar automáticamente tras un escaneo exitoso
 * @param {String} props.facingMode - 'user' (selfie) o 'environment' (trasera)
 */
export default function QrScanner({ onScan, autoClose = true, facingMode = 'environment' }) {
  const [isScanning, setIsScanning] = useState(false)
  const [cameraId, setCameraId] = useState(null)
  const [error, setError] = useState(null)
  const qrCodeRef = useRef(null)
  const html5QrcodeRef = useRef(null)

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    setError(null)
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length) {
        // Preferir cámara trasera si se solicita environment
        const selectedDevice =
          facingMode === 'environment'
            ? devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')) ||
              devices[0]
            : devices.find((d) => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('selfie')) ||
              devices[0]
        setCameraId(selectedDevice.id)
      }

      html5QrcodeRef.current = new Html5Qrcode(qrCodeRef.current.id, {
        verboseLogging: false,
      })

      await html5QrcodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Validar que sea una cédula dominicana (11 dígitos) o cualquier texto
          const digitos = String(decodedText).replace(/\D/g, '')
          const resultado = digitos.length === 11 ? digitos : decodedText
          onScan(resultado)

          if (autoClose) {
            stopScanning()
          }
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo (no se encontró código todavía)
        }
      )
      setIsScanning(true)
    } catch (err) {
      setError(`No se pudo acceder a la cámara: ${err.message}`)
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
      } catch (_) {
        // Ignorar errores al detener
      }
      html5QrcodeRef.current.clear()
    }
    setIsScanning(false)
  }

  if (!isScanning && !cameraId) {
    return (
      <button
        type="button"
        onClick={startScanning}
        className="flex items-center gap-2 rounded-xl bg-clb-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
        Escanear QR o Código de Barras
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm border border-red-200">
          {error}
          <button
            type="button"
            onClick={() => {
              setError(null)
              stopScanning()
            }}
            className="ml-2 text-xs underline hover:text-red-900"
          >
            Cerrar
          </button>
        </div>
      )}
      <div
        ref={qrCodeRef}
        className="w-full max-w-md mx-auto aspect-square border-2 border-clb-primary rounded-lg overflow-hidden bg-black"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={stopScanning}
          className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
