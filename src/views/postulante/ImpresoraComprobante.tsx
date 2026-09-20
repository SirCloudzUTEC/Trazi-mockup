import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, Scissors, X } from 'lucide-react'
import type { Comprobante } from '../../lib/comprobante'
import { TraziAvatar } from '../../components/TraziAyuda'
import { ComprobanteEntrevista } from './ComprobanteEntrevista'

const DURACION_MS = 5200
const CORTE_MS = 650
const RETIRO_MS = 1000
const ESCALA_MIN = 0.6
const ESCALA_MAX_FINAL = 1.3
const CINTA = 'repeating-linear-gradient(-45deg, #E4572E 0 10px, #FFFBF3 10px 20px)'
const CURVA_ACERCA = 'cubic-bezier(0.22, 0.9, 0.3, 1.06)'

const esAngosto = () => window.innerWidth < 640

/** Avance del papel: arranca suave, va constante y frena al final. */
const suave = (p: number) => 0.5 - Math.cos(Math.PI * p) / 2
/** El papel baja por la ranura: al inicio está todo arriba (oculto) y termina con el encabezado junto a la impresora. */
const desliza = (avance: number) => (avance >= 1 ? 'translateY(0)' : `translateY(${-(1 - avance) * 100}%)`)

type Fase = 'imprimiendo' | 'corte' | 'retiro' | 'listo' | 'volviendo'
interface Final { escala: number; ty: number; alto: number }

/**
 * Modal del comprobante: una mini impresora térmica saca la boleta por la ranura (primero el pie, al final el encabezado),
 * la corta, se retira y deja la boleta cortada acercándose a la pantalla.
 */
export function ModalComprobante({ c, onCerrar }: { c: Comprobante; onCerrar: () => void }) {
  const [corrida, setCorrida] = useState(0)
  const [reducido] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [fase, setFase] = useState<Fase>(reducido ? 'listo' : 'imprimiendo')
  const [medida, setMedida] = useState<{ escala: number; alto: number } | null>(null)
  const [final, setFinal] = useState<Final | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bloqueRef = useRef<HTMLDivElement>(null)
  const impresoraRef = useRef<HTMLDivElement>(null)
  const papelRef = useRef<HTMLDivElement>(null)
  const salidaRef = useRef<HTMLDivElement>(null)
  const escalaRef = useRef(1)
  const temporizadores = useRef<number[]>([])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', esc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = prev
    }
  }, [onCerrar])

  // Encoge impresora + boleta para que quepan en la ventana: se ve todo el proceso sin desplazarse.
  useLayoutEffect(() => {
    const bloque = bloqueRef.current
    if (!bloque) return
    const ajustar = () => {
      const alto = bloque.offsetHeight
      // En pantallas angostas no se encoge: la boleta se lee a tamaño real y el modal se desplaza.
      const escala = esAngosto() ? 1 : Math.max(ESCALA_MIN, Math.min(1, (window.innerHeight - 120) / alto))
      escalaRef.current = escala
      setMedida({ escala, alto: alto * escala })
    }
    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(bloque)
    window.addEventListener('resize', ajustar)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', ajustar)
    }
  }, [])

  /** Con la impresora fuera, la boleta sube al borde superior y se agranda hasta ocupar la pantalla. */
  function medirFinal(): Final | null {
    const imp = impresoraRef.current
    const sal = salidaRef.current
    if (!imp || !sal) return null
    const cabe = esAngosto()
      ? Math.min(1, (window.innerWidth - 24) / sal.offsetWidth)
      : Math.min(ESCALA_MAX_FINAL, (window.innerHeight - 110) / sal.offsetHeight, (window.innerWidth - 24) / sal.offsetWidth)
    const escala = Math.max(escalaRef.current, cabe)
    return { escala, ty: -(imp.offsetHeight - 12) * escala, alto: sal.offsetHeight * escala }
  }

  // Cada impresión: el papel se desliza de forma continua por la ranura; sale primero el pie y al final el encabezado.
  useLayoutEffect(() => {
    const papel = papelRef.current
    const salida = salidaRef.current
    const cont = scrollRef.current
    if (!papel || !salida || !cont) return
    const ms = reducido ? 0 : DURACION_MS
    papel.style.transform = desliza(ms ? 0 : 1)
    cont.scrollTop = 0

    const plan = (fn: () => void, espera: number) => { temporizadores.current.push(window.setTimeout(fn, espera)) }
    const limpiarPlan = () => { temporizadores.current.forEach(clearTimeout); temporizadores.current = [] }

    const cortarYRetirar = () => {
      setFase('corte')
      plan(() => {
        cont.scrollTop = 0
        setFinal(medirFinal())
        setFase('retiro')
      }, CORTE_MS)
      plan(() => setFase('listo'), CORTE_MS + RETIRO_MS)
    }

    if (!ms) {
      plan(() => { setFinal(medirFinal()); setFase('listo') }, 60)
      return limpiarPlan
    }

    let manual = false
    const parar = () => { manual = true }
    cont.addEventListener('wheel', parar, { passive: true })
    cont.addEventListener('touchstart', parar, { passive: true })

    const t0 = performance.now()
    let raf = 0
    const cuadro = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / ms)
      const avance = suave(p)
      papel.style.transform = desliza(avance)
      // Solo en ventanas muy bajitas: acompaña el borde delantero del papel hacia abajo (nunca vuelve arriba).
      if (!manual) {
        const r = salida.getBoundingClientRect()
        const c0 = cont.getBoundingClientRect()
        const borde = r.top - c0.top + cont.scrollTop + r.height * avance
        const objetivo = borde - cont.clientHeight + 40
        if (objetivo > cont.scrollTop) cont.scrollTop = objetivo
      }
      if (p < 1) raf = requestAnimationFrame(cuadro)
      else cortarYRetirar()
    }
    raf = requestAnimationFrame(cuadro)

    return () => {
      cancelAnimationFrame(raf)
      limpiarPlan()
      cont.removeEventListener('wheel', parar)
      cont.removeEventListener('touchstart', parar)
    }
  }, [corrida, reducido])

  function reimprimir() {
    setFase('volviendo')
    temporizadores.current.push(
      window.setTimeout(() => {
        setFinal(null)
        setFase('imprimiendo')
        setCorrida((n) => n + 1)
      }, 1000),
    )
  }
  useEffect(() => () => temporizadores.current.forEach(clearTimeout), [])

  const retirada = (fase === 'retiro' || fase === 'listo') && final !== null
  const conTransicion = !reducido && (fase === 'retiro' || fase === 'listo' || fase === 'volviendo')
  const cortado = fase === 'corte' || fase === 'retiro' || fase === 'listo'
  const trabajando = fase === 'imprimiendo'
  const estado = fase === 'imprimiendo' ? 'IMPRIMIENDO…' : fase === 'corte' ? 'CORTANDO…' : 'LISTO · TOMA TU BOLETA'

  return createPortal(
    <div ref={scrollRef} className="modal-comprobante fixed inset-0 z-50 overflow-y-auto bg-tinta/55 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div role="dialog" aria-modal="true" aria-label="Impresión del comprobante de entrevista" className="relative mx-auto max-w-[580px] pt-10">
        <button onClick={onCerrar} aria-label="Cerrar comprobante" className="no-print hard-shadow absolute top-0 right-0 z-20 flex items-center gap-1 rounded-full border-[1.5px] border-tinta bg-papel px-3 py-1 text-xs font-bold"><X size={14} /> Cerrar</button>
        <button
          onClick={reimprimir}
          disabled={fase !== 'listo'}
          className="no-print hard-shadow absolute top-0 left-0 z-20 flex items-center gap-1 rounded-full border-[1.5px] border-tinta bg-papel px-3 py-1 text-xs font-bold enabled:hover:bg-chip disabled:opacity-40"
        >
          <RotateCcw size={13} /> Reimprimir
        </button>
        <p className="sr-only" role="status" aria-live="polite">{estado}</p>

        <div className="print-reset" style={{ height: retirada ? final.alto : medida?.alto }}>
          <div
            ref={bloqueRef}
            className="print-reset"
            style={{
              transform: retirada ? `translateY(${final.ty}px) scale(${final.escala})` : `scale(${medida?.escala ?? 1})`,
              transformOrigin: 'top center',
              visibility: medida ? 'visible' : 'hidden',
              transition: conTransicion ? `transform ${RETIRO_MS}ms ${CURVA_ACERCA}, filter ${RETIRO_MS}ms ease-out` : 'none',
              filter: retirada ? 'drop-shadow(0 22px 26px rgba(43,36,32,0.38))' : 'none',
            }}
          >
            {/* Impresora: al terminar de cortar se retira hacia arriba */}
            <div
              ref={impresoraRef}
              className="no-print relative z-10"
              style={{
                transform: retirada ? 'translateY(-135%)' : 'translateY(0)',
                opacity: retirada ? 0 : 1,
                pointerEvents: retirada ? 'none' : 'auto',
                transition: conTransicion ? 'transform 650ms cubic-bezier(0.5, 0, 0.9, 0.4), opacity 520ms ease-in' : 'none',
              }}
            >
              <div className={`rounded-[16px] border-[1.5px] border-tinta bg-crema shadow-[3px_3px_0_#2B2420] ${trabajando ? 'impresora-trabajando' : fase === 'corte' ? 'impresora-corta' : ''}`}>
                <div className="h-3 w-full rounded-t-[14px]" style={{ background: CINTA }} />
                <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <TraziAvatar pose="sonrie" size={38} />
                    <div className="leading-tight">
                      <p className="font-mono text-[13px] font-bold tracking-[0.06em]">TRAZI PRINT</p>
                      <p className="font-mono text-[10px] tracking-[0.04em] text-umbra">Mini impresora térmica</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-[6px] border-[1.5px] border-tinta bg-tinta px-2.5 py-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${trabajando ? 'led-trabajando bg-miel' : fase === 'corte' ? 'bg-rojo' : 'bg-[#5fd39b]'}`} />
                    <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-miel">{estado}</span>
                  </div>
                </div>
                <div className="mx-4 mb-4 sm:mx-5">
                  <span className="flex gap-1.5 pb-1.5" aria-hidden>
                    <span className="h-2 w-2 rounded-full border border-tinta bg-miel" />
                    <span className="h-2 w-2 rounded-full border border-tinta bg-rojo" />
                  </span>
                  {/* Ranura de salida */}
                  <div className="relative h-3.5 rounded-full bg-tinta shadow-[inset_0_2px_0_rgba(255,255,255,0.15)]">
                    <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-crema/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Papel saliendo bajo la ranura */}
            <div ref={salidaRef} className="print-salida relative z-0 -mt-3 overflow-hidden px-3 sm:px-6">
              {fase === 'corte' && (
                <div aria-hidden className="pointer-events-none absolute inset-x-3 top-[18px] z-10 sm:inset-x-6">
                  <span className="absolute inset-x-0 top-0 h-[3px] origin-left rounded bg-tinta" style={{ animation: `cut-line ${CORTE_MS}ms ease-in-out forwards` }} />
                  <Scissors size={20} className="absolute -top-[9px] -ml-2.5 text-rojo" style={{ animation: `cut-scissors ${CORTE_MS}ms ease-in-out forwards` }} />
                </div>
              )}
              <div
                ref={papelRef}
                key={corrida}
                className={`print-papel pt-4 pb-3 ${cortado ? 'saw-top' : ''}`}
                style={{ willChange: 'transform', opacity: fase === 'volviendo' ? 0 : 1, transition: 'opacity 350ms ease-out' }}
              >
                <ComprobanteEntrevista c={c} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
