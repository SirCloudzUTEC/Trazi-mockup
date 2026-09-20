import { Link, useSearchParams } from 'react-router-dom'
import { leerComprobante } from '../../lib/comprobante'
import { ComprobanteEntrevista } from './ComprobanteEntrevista'
import { TraziAyuda } from '../../components/TraziAyuda'
import { TicketButton } from '../../components/ui'

export function ComprobantePage() {
  const [params] = useSearchParams()
  const c = leerComprobante(params.get('d'))
  return (
    <div data-theme="postulante" className="min-h-[calc(100vh-64px)] bg-crema">
      <main className="mx-auto max-w-[1160px] px-4 py-8 sm:px-6">
        {c ? (
          <ComprobanteEntrevista c={c} />
        ) : (
          <div className="mx-auto max-w-[520px] space-y-5">
            <TraziAyuda titulo="No pude leer este QR">El comprobante está incompleto o el enlace se cortó. Vuelve a abrirlo desde «Mi postulación».</TraziAyuda>
            <Link to="/"><TicketButton>Ir a Trazi</TicketButton></Link>
          </div>
        )}
      </main>
    </div>
  )
}
