import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { Nube } from '../../components/TraziAyuda'
import { TicketButton } from '../../components/ui'
import { SEDES, VACANTES } from '../../data/seed'

const CINTA = 'repeating-linear-gradient(-45deg, #E4572E 0 10px, #FFFBF3 10px 20px)'

function EtiquetaPrecio({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`absolute z-10 rounded-[3px] border-[1.5px] border-tinta bg-papel px-2 py-1 font-mono text-[11px] font-bold tracking-[0.04em] shadow-[2px_2px_0_#2B2420] ${className}`}>
      {children}
    </span>
  )
}

export function HeroInicio({ onVer }: { onVer: () => void }) {
  const tearRef = useRef<HTMLDivElement>(null)
  const [notchY, setNotchY] = useState(320)

  // La muesca lateral se alinea con la línea de corte sobre la franja de datos.
  useLayoutEffect(() => {
    const medir = () => tearRef.current && setNotchY(tearRef.current.offsetTop)
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  return (
    <section aria-label="Bienvenida" className="ticket-wrap">
      <div className="ticket saw-bottom overflow-hidden pb-1.5" style={{ background: '#FFC857', ['--notch-y' as string]: `${notchY}px` }}>
        <div className="h-2.5 w-full" style={{ background: CINTA }} />

        <div className="grid items-center gap-6 px-5 pt-6 pb-6 sm:px-8 md:grid-cols-[1fr_300px] md:gap-8">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-tinta/70">Plaza Vea · Vivanda · Trazi</p>
            <h1 className="mt-2 text-[30px] leading-9 font-extrabold sm:text-[40px] sm:leading-[48px]">
              Tu primer paso en{' '}
              <span className="inline-block -rotate-1 rounded-[3px] border-[1.5px] border-tinta bg-crema px-2 text-rojo-fuerte shadow-[3px_3px_0_#2B2420]">Plaza Vea</span>{' '}
              y Vivanda empieza aquí.
            </h1>
            <p className="mt-3 max-w-lg text-base text-tinta/85">Elige una vacante, postula en 2 minutos y sigue tu proceso con tu boleta de postulación.</p>
            <div className="mt-5">
              <TicketButton onClick={onVer}>
                Ver vacantes <ArrowDown size={16} />
              </TicketButton>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[300px] flex-col items-center pt-2">
            <Nube cola="abajo" className="z-20 mb-4 max-w-[250px] text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rojo">Hola, soy Trazi</p>
              Te acompaño en cada paso. Filtra por <b>sede</b> y elige la tienda más cerca de ti.
            </Nube>
            <div className="relative">
              <span className="block h-[220px] w-[220px] rotate-2 overflow-hidden rounded-full border-[1.5px] border-tinta bg-[#ecebe7] shadow-[3px_3px_0_#2B2420] md:h-[236px] md:w-[236px]">
                <img src="/trazi-saluda.png" alt="Trazi, tu guía en el proceso de postulación" className="h-full w-full origin-[50%_38%] scale-[1.12] object-cover" draggable={false} />
              </span>
              <EtiquetaPrecio className="-top-1 -left-8 -rotate-6">S/ 8.50/h</EtiquetaPrecio>
              <EtiquetaPrecio className="right-[-26px] bottom-8 rotate-6 text-verde">SIN EXPERIENCIA</EtiquetaPrecio>
            </div>
          </div>
        </div>

        <div ref={tearRef} className="tear border-tinta/40 px-5 py-3 sm:px-8">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs font-bold uppercase tracking-[0.04em]">
            <li>{VACANTES.length} vacantes abiertas</li>
            <li>{SEDES.length} tiendas</li>
            <li>Respuesta en ~5 días</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
