import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { TraziMark } from './TraziMark'
import { useTrazi } from '../store/useTrazi'

const SIGUIENTE: Record<string, { to: string; label: string }> = {
  '/': { to: '/rrhh', label: 'Vista RRHH' },
  '/rrhh': { to: '/direccion', label: 'Vista Gerencia' },
  '/direccion': { to: '/', label: 'Volver al inicio' },
  '/comprobante': { to: '/', label: 'Ir a Trazi' },
}

const ROL: Record<string, string> = {
  '/': 'Postulantes',
  '/rrhh': 'Equipo RRHH',
  '/direccion': 'Dirección',
  '/comprobante': 'Comprobante',
}

export function Header() {
  const { pathname } = useLocation()
  const reset = useTrazi((s) => s.reset)
  const sig = SIGUIENTE[pathname] ?? SIGUIENTE['/']
  const esTicket = pathname === '/' || pathname === '/comprobante'

  return (
    <header
      className={`no-print sticky top-0 z-40 ${
        esTicket ? 'border-b-[1.5px] border-dashed border-tinta bg-crema' : 'border-b border-arena bg-papel/95 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Trazi — inicio">
          <TraziMark />
          <span className="text-lg font-extrabold tracking-tight">Trazi</span>
          <span className="hidden rounded-full bg-chip px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-umbra sm:inline">
            {ROL[pathname] ?? ''}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => confirm('¿Reiniciar la demo con los datos originales?') && reset()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-umbra hover:bg-chip"
            title="Reiniciar demo"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Reiniciar demo</span>
          </button>
          <Link
            to={sig.to}
            className={
              esTicket
                ? 'hard-shadow hard-press inline-flex items-center gap-2 rounded-[4px] border-[1.5px] border-tinta bg-papel px-3.5 py-2 text-sm font-bold'
                : 'inline-flex items-center gap-2 rounded-lg bg-rojo px-4 py-2 text-sm font-semibold text-white hover:bg-rojo-hover'
            }
          >
            {sig.label}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  )
}
