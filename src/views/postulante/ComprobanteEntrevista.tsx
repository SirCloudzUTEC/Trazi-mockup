import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CalendarDays, ExternalLink, MapPin, Printer, QrCode, X } from 'lucide-react'
import type { Comprobante } from '../../lib/comprobante'
import { urlComprobante } from '../../lib/comprobante'
import { fechaLargaCap, hora } from '../../lib/format'
import { BrandFlag, Stamp, TicketButton } from '../../components/ui'
import { sedePorId } from '../../data/seed'
import { TraziAyuda } from '../../components/TraziAyuda'

function Fila({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-[1.5px] border-dashed border-perfora py-2 last:border-0">
      <dt className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-umbra">{k}</dt>
      <dd className={`text-right text-sm font-semibold break-words ${mono ? 'font-mono' : ''}`}>{v}</dd>
    </div>
  )
}

/** Comprobante completo: QR + todos los datos del postulante y de la entrevista. */
export function ComprobanteEntrevista({ c, imprimible = true }: { c: Comprobante; imprimible?: boolean }) {
  const marca = sedePorId(c.sedeId).marca
  const url = urlComprobante(c)
  return (
    <div className="ticket-wrap mx-auto w-full max-w-[520px]">
      <article className="ticket saw-bottom pb-4" style={{ ['--notch-y' as string]: '112px' }}>
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between">
            <BrandFlag marca={marca} />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Cód. {c.codigo}</span>
          </div>
          <h2 className="mt-3 text-[22px] leading-7 font-bold">Comprobante de entrevista</h2>
          <p className="font-mono text-sm font-bold tracking-[0.02em]">{c.folio}</p>
          <div className="mt-3 h-8">
            <Stamp tono={c.confirmada ? 'verde' : 'rojo'}>{c.confirmada ? 'Asistencia confirmada' : 'Por confirmar'}</Stamp>
          </div>
        </div>
        <div className="tear mx-5 mt-1" />

        <div className="flex flex-col items-center gap-3 px-5 py-5 sm:flex-row sm:items-start">
          <div className="rounded-[4px] border-[1.5px] border-tinta bg-white p-2.5">
            <QRCodeSVG value={url} size={148} level="L" marginSize={0} fgColor="#2B2420" title={`QR de entrevista ${c.folio}`} />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 text-lg leading-6 font-bold sm:justify-start"><CalendarDays size={18} className="shrink-0 text-rojo" />{fechaLargaCap(c.fecha)}</p>
            <p className="font-mono text-2xl font-bold">{hora(c.fecha)}</p>
            <p className="mt-2 flex items-start justify-center gap-2 text-sm sm:justify-start"><MapPin size={16} className="mt-0.5 shrink-0 text-umbra" /><span>{c.sede}<br /><span className="font-mono text-xs text-umbra">{c.sedeId} · {c.distrito}</span></span></p>
          </div>
        </div>

        <div className="tear mx-5" />
        <dl className="px-5 pt-3">
          <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-rojo">Datos del postulante</p>
          <Fila k="Nombre" v={c.nombre} />
          <Fila k="DNI" v={c.dni} mono />
          <Fila k="Celular" v={c.telefono} mono />
          <Fila k="Correo" v={c.email} />
          <p className="mt-4 mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-rojo">Vacante y entrevista</p>
          <Fila k="Puesto" v={c.puesto} />
          <Fila k="Requisición" v={c.vacanteId} mono />
          <Fila k="Turno" v={c.turno} />
          <Fila k="Fecha" v={fechaLargaCap(c.fecha)} />
          <Fila k="Hora" v={hora(c.fecha)} mono />
          <Fila k="Lugar" v={`${c.sede} (${c.distrito})`} />
          <Fila k="Emitido" v={new Date(c.emitido).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })} mono />
        </dl>

        <div className="mt-4 px-5">
          <TraziAyuda pose="sonrie" titulo="Al llegar">
            Muestra este QR o tu DNI en la entrada de personal. El equipo de Talento validará tus datos con el código <b className="font-mono">{c.codigo}</b>.
          </TraziAyuda>
        </div>
        {imprimible && (
          <div className="no-print mt-4 flex flex-col gap-2 px-5 sm:flex-row">
            <TicketButton variante="secundario" onClick={() => window.print()} className="flex-1"><Printer size={15} /> Imprimir / guardar PDF</TicketButton>
            <a href={url} target="_blank" rel="noreferrer" className="hard-shadow hard-press inline-flex flex-1 items-center justify-center gap-2 rounded-[4px] border-[1.5px] border-tinta bg-papel px-4 py-2.5 text-sm font-bold">
              <ExternalLink size={15} /> Abrir en pestaña nueva
            </a>
          </div>
        )}
      </article>
    </div>
  )
}

export function ModalComprobante({ c, onCerrar }: { c: Comprobante; onCerrar: () => void }) {
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
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-tinta/50 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div role="dialog" aria-modal="true" aria-label="Comprobante de entrevista" className="relative mx-auto max-w-[540px] pt-10">
        <button onClick={onCerrar} aria-label="Cerrar comprobante" className="no-print absolute top-0 right-0 flex items-center gap-1 rounded-full border-[1.5px] border-tinta bg-papel px-3 py-1 text-xs font-bold hard-shadow"><X size={14} /> Cerrar</button>
        <ComprobanteEntrevista c={c} />
      </div>
    </div>
  )
}

/** Sección al pie de "Mi postulación": QR resumido + botón para abrir el comprobante completo. */
export function SeccionComprobante({ c, onAbrir }: { c: Comprobante | null; onAbrir: () => void }) {
  if (!c) {
    return (
      <section className="rounded-[4px] border-[1.5px] border-dashed border-tinta bg-papel p-5" aria-label="Comprobante de entrevista">
        <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.04em] text-umbra"><QrCode size={18} /> Comprobante de entrevista</div>
        <div className="mt-4">
          <TraziAyuda titulo="Aún no disponible">
            Cuando RRHH agende tu entrevista, aquí aparecerá tu código QR con la fecha, la hora y la tienda.
          </TraziAyuda>
        </div>
      </section>
    )
  }
  const url = urlComprobante(c)
  return (
    <section aria-label="Comprobante de entrevista" className="ticket-wrap">
      <div className="ticket p-5 sm:p-6" style={{ mask: 'none', WebkitMask: 'none' } as React.CSSProperties}>
        <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr] sm:gap-7">
          <button onClick={onAbrir} aria-label="Abrir comprobante de entrevista" className="mx-auto rounded-[4px] border-[1.5px] border-tinta bg-white p-2.5 transition hover:scale-[1.03]">
            <QRCodeSVG value={url} size={148} level="L" marginSize={0} fgColor="#2B2420" />
          </button>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Comprobante de entrevista</p>
            <p className="mt-1 text-xl leading-7 font-bold">{fechaLargaCap(c.fecha)}</p>
            <p className="font-mono text-lg font-bold">{hora(c.fecha)}</p>
            <p className="mt-1 flex items-start gap-2 text-sm"><MapPin size={15} className="mt-0.5 shrink-0 text-umbra" />{c.sede} · <span className="font-mono text-xs leading-5 text-umbra">{c.sedeId}</span></p>
            <div className="mt-2"><Stamp tono={c.confirmada ? 'verde' : 'rojo'}>{c.confirmada ? 'Asistencia confirmada' : 'Por confirmar'}</Stamp></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <TicketButton onClick={onAbrir}><QrCode size={15} /> Abrir comprobante</TicketButton>
            </div>
          </div>
        </div>
        <div className="mt-5"><TraziAyuda pose="sonrie" titulo="Guarda tu QR">Muéstralo en la entrada de personal el día de tu entrevista. Al abrirlo verás todos tus datos.</TraziAyuda></div>
      </div>
    </section>
  )
}
