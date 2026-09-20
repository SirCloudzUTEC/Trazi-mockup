import { useLayoutEffect, useRef, useState } from 'react'
import { Nube } from '../../components/TraziAyuda'
import type { PoseTrazi } from '../../components/TraziAyuda'

const CINTA = 'repeating-linear-gradient(-45deg, #E4572E 0 10px, #FFFBF3 10px 20px)'

interface Props {
  eyebrow: string
  titulo: React.ReactNode
  /** Mensaje de Trazi dentro de la nube. */
  mensaje: React.ReactNode
  tituloNube?: string
  pose?: PoseTrazi
  /** Datos de la franja inferior (tras la línea de corte). */
  franja: string[]
  children?: React.ReactNode
}

/** Encabezado miel tipo boleta para las secciones internas del postulante (versión compacta del hero de inicio). */
export function HeroSeccion({ eyebrow, titulo, mensaje, tituloNube = 'Trazi te ayuda', pose = 'sonrie', franja, children }: Props) {
  const tearRef = useRef<HTMLDivElement>(null)
  const [notchY, setNotchY] = useState(180)

  useLayoutEffect(() => {
    const medir = () => tearRef.current && setNotchY(tearRef.current.offsetTop)
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  return (
    <section className="ticket-wrap">
      <div className="ticket saw-bottom overflow-hidden pb-1.5" style={{ background: '#FFC857', ['--notch-y' as string]: `${notchY}px` }}>
        <div className="h-2.5 w-full" style={{ background: CINTA }} />
        <div className="grid items-center gap-5 px-5 pt-5 pb-5 sm:px-8 md:grid-cols-[1fr_minmax(0,400px)]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-tinta/70">{eyebrow}</p>
            <h1 className="mt-1.5 text-[28px] leading-9 font-extrabold sm:text-[36px] sm:leading-[44px]">{titulo}</h1>
            {children && <div className="mt-3">{children}</div>}
          </div>
          <div className="flex items-center gap-3">
            <span className="block h-[92px] w-[92px] shrink-0 -rotate-2 overflow-hidden rounded-full border-[1.5px] border-tinta bg-[#ecebe7] shadow-[3px_3px_0_#2B2420] sm:h-[112px] sm:w-[112px]">
              <img src={pose === 'saluda' ? '/trazi-saluda.png' : '/trazi-sonrie.png'} alt="Trazi" className="h-full w-full origin-[50%_32%] scale-[1.35] object-cover" draggable={false} />
            </span>
            <Nube cola="izquierda" className="flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rojo">{tituloNube}</p>
              {mensaje}
            </Nube>
          </div>
        </div>
        <div ref={tearRef} className="tear border-tinta/40 px-5 py-3 sm:px-8">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs font-bold uppercase tracking-[0.04em]">
            {franja.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
