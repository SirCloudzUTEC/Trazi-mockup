import { useState } from 'react'
import { CalendarDays, Check, Download, MapPin } from 'lucide-react'
import type { Candidato, Etapa } from '../../types'
import { sedePorId, VACANTES } from '../../data/seed'
import { ETAPA_ORDEN } from '../../lib/stages'
import { fechaLarga, hora } from '../../lib/format'
import { BrandFlag, Stamp, TicketButton } from '../../components/ui'
import { TraziAvatar, TraziPunto } from '../../components/TraziAyuda'
import { comprobanteDe } from '../../lib/comprobante'
import { ModalComprobante, SeccionComprobante } from './ComprobanteEntrevista'
import { useTrazi } from '../../store/useTrazi'

const SELLO: Record<Etapa, string> = {
  recibido: 'Recibido',
  revision: 'En evaluación',
  entrevista: 'Entrevista',
  oferta: 'Oferta',
  contratado: 'Contratado',
  rechazado: 'No continúa',
}

function diasHasta(iso: string): number {
  const a = new Date(iso)
  const b = new Date()
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

function mensajeTrazi(c: Candidato): string {
  switch (c.etapa) {
    case 'recibido':
      return 'Trazi guardó tu postulación. Te avisamos apenas haya novedades.'
    case 'revision':
      return 'Estamos revisando tu CV. Suele tomar entre 2 y 4 días.'
    case 'entrevista': {
      if (!c.entrevista) return 'Tu postulación avanzó a Entrevista. Pronto te confirmamos el horario.'
      const d = diasHasta(c.entrevista.fecha)
      const cuando = d <= 0 ? 'es hoy' : d === 1 ? 'es mañana' : `es en ${d} días`
      return `¡Vas bien! Tu entrevista ${cuando}.`
    }
    case 'oferta':
      return 'Tienes una oferta esperando. Revisa tu correo para aceptarla.'
    case 'contratado':
      return '¡Bienvenido/a al equipo! Pronto recibirás los detalles de tu ingreso.'
    case 'rechazado':
      return 'Gracias por postular. Guardamos tu perfil para futuras vacantes.'
  }
}

type Estado = 'hecho' | 'actual' | 'pendiente'

function pasos(c: Candidato): { label: string; sub?: string; estado: Estado }[] {
  const idx = c.etapa === 'rechazado' ? 3 : Math.min(ETAPA_ORDEN[c.etapa], 4)
  const est = (i: number): Estado => (i < idx ? 'hecho' : i === idx ? 'actual' : 'pendiente')
  const final =
    c.etapa === 'oferta' ? 'Oferta enviada' : c.etapa === 'contratado' ? '¡Contratado/a!' : c.etapa === 'rechazado' ? 'Proceso cerrado' : undefined
  return [
    { label: 'Postulación recibida', estado: est(0) },
    { label: 'CV en revisión', estado: est(1) },
    {
      label: 'Entrevista agendada',
      sub: c.entrevista ? `${fechaLarga(c.entrevista.fecha)} · ${hora(c.entrevista.fecha)}` : 'Por agendar',
      estado: est(2),
    },
    { label: 'Resultado final', sub: final, estado: c.etapa === 'contratado' ? 'hecho' : est(3) },
  ]
}

function descargar(c: Candidato) {
  const vac = VACANTES.find((v) => v.id === c.vacanteId)
  const sede = sedePorId(c.sedeId)
  const txt = [
    '=== TRAZI · BOLETA DE POSTULACIÓN ===',
    `N°: ${c.folio}`,
    `Postulante: ${c.nombre}`,
    `Puesto: ${vac?.titulo ?? '-'} (${vac?.id ?? '-'})`,
    `Sede: ${sede.nombre} (${sede.id})`,
    `Estado: ${SELLO[c.etapa].toUpperCase()}`,
    '-------------------------------------',
    'Documento simulado de demostración.',
  ].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }))
  a.download = `${c.folio}.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function BoletaSeguimiento({ c }: { c: Candidato }) {
  const vac = VACANTES.find((v) => v.id === c.vacanteId)
  const sede = sedePorId(c.sedeId)
  const lista = pasos(c)
  const hechos = lista.filter((p) => p.estado === 'hecho').length
  const confirmar = useTrazi((s) => s.confirmarEntrevista)
  const puedeConfirmar = c.etapa === 'entrevista' && c.entrevista && !c.entrevista.confirmada
  const entrevistaSede = c.entrevista ? sedePorId(c.entrevista.sedeId) : sede
  const comprobante = comprobanteDe(c)
  const [verComprobante, setVerComprobante] = useState(false)

  return (
    <div className="space-y-8">
    <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr] lg:gap-10">
      <div className="ticket-wrap mx-auto w-full max-w-[400px]">
        <article className="ticket saw-bottom pb-3" style={{ ['--notch-y' as string]: '132px' }}>
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              <BrandFlag marca={sede.marca} />
              <div className="flex gap-1.5" aria-label={`${hechos} de 4 etapas completadas`}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full border-[1.5px] border-tinta ${i < hechos ? 'bg-verde' : i === hechos ? 'bg-miel' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">
              Postulación
              <TraziPunto etiqueta="¿Qué significan los sellos?">Cada sello es una etapa: <b>verde</b> ya la pasaste, <b>miel</b> es donde estás ahora y el círculo vacío es lo que viene.</TraziPunto>
            </p>
            <p className="font-mono text-[22px] leading-7 font-bold tracking-[0.02em]">N° {c.folio.replace('FOLIO-', '')}</p>
            <p className="mt-1 text-sm font-semibold">{c.nombre}</p>
            <p className="text-sm text-umbra">{vac?.titulo} · {sede.distrito}</p>
            <div className="mt-3 h-8"><Stamp tono={c.etapa === 'rechazado' ? 'rojo' : 'verde'}>{SELLO[c.etapa]}</Stamp></div>
          </div>
          <div className="tear mx-5 mt-2" />

          <ol className="relative px-5 pt-5 pb-3">
            <span aria-hidden className="absolute top-8 bottom-10 left-[33px] border-l-[1.5px] border-dashed border-tinta/40" />
            {lista.map((p) => (
              <li key={p.label} className="relative flex gap-3 pb-5 last:pb-1">
                <span
                  className={`z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-tinta text-xs ${
                    p.estado === 'hecho' ? 'bg-verde text-white' : p.estado === 'actual' ? 'bg-miel' : 'bg-papel'
                  }`}
                >
                  {p.estado === 'hecho' ? <Check size={14} strokeWidth={3} /> : p.estado === 'actual' ? '●' : ''}
                </span>
                <div className={p.estado === 'actual' ? 'rounded-[4px] border-[1.5px] border-tinta bg-miel/35 px-2.5 py-1.5 -my-1' : 'py-0.5'}>
                  <p className={`text-[15px] leading-5 font-semibold ${p.estado === 'pendiente' ? 'text-umbra' : ''}`}>{p.label}</p>
                  {p.sub && <p className="font-mono text-xs text-umbra">{p.sub}</p>}
                </div>
              </li>
            ))}
          </ol>

          <div className="tear mx-5" />
          <div className="flex items-start gap-3 px-5 pt-4">
            <TraziAvatar pose="sonrie" size={40} />
            <p className="text-sm leading-snug"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rojo">Trazi</span><br />“{mensajeTrazi(c)}”</p>
          </div>
          <div className="px-5 pt-4 pb-3">
            <TicketButton variante="mono" onClick={() => descargar(c)} className="w-full">
              <Download size={14} /> Descargar boleta de postulación
            </TicketButton>
          </div>
        </article>
      </div>

      <aside className="space-y-4">
        <div className="ticket-wrap">
          <div className="ticket p-5 sm:p-6" style={{ ['--notch-y' as string]: '0px', mask: 'none', WebkitMask: 'none' } as React.CSSProperties}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">
              {c.entrevista ? 'Tu entrevista' : 'Tu sede de interés'}
            </p>
            {c.entrevista && c.etapa === 'entrevista' ? (
              <>
                <div className="mt-2 flex items-start gap-3">
                  <CalendarDays className="mt-1 shrink-0 text-rojo" size={22} />
                  <div>
                    <p className="text-xl leading-7 font-bold first-letter:uppercase">{fechaLarga(c.entrevista.fecha)}</p>
                    <p className="font-mono text-lg font-bold">{hora(c.entrevista.fecha)}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-umbra" />
                  <span>{entrevistaSede.nombre}<br /><span className="font-mono text-xs text-umbra">{entrevistaSede.id} · {entrevistaSede.distrito}</span></span>
                </p>
                <p className="mt-3 text-sm text-umbra">Lleva tu DNI y llega 10 minutos antes. Pregunta por el equipo de Talento en la entrada de personal.</p>
                <div className="tear mt-4 mb-4" />
                {puedeConfirmar ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <TicketButton onClick={() => confirmar(c.id)} className="w-full sm:w-auto">Confirmar asistencia a entrevista</TicketButton>
                    <TraziPunto pose="sonrie" lado="derecha" etiqueta="¿Para qué confirmar?">Al confirmar reservamos tu cupo. Si no puedes asistir, avísanos respondiendo el correo de la entrevista.</TraziPunto>
                  </div>
                ) : (
                  <Stamp>Asistencia confirmada</Stamp>
                )}
              </>
            ) : (
              <>
                <p className="mt-2 text-xl leading-7 font-bold">{sede.nombre}</p>
                <p className="font-mono text-xs uppercase tracking-[0.04em] text-umbra">{sede.id} · {sede.distrito}</p>
                <p className="mt-3 text-sm text-umbra">
                  {c.etapa === 'contratado'
                    ? 'Tu equipo en tienda te espera. Recibirás por correo tu fecha de ingreso.'
                    : c.etapa === 'rechazado'
                      ? 'Tu proceso terminó, pero puedes postular a otras vacantes cuando quieras.'
                      : 'Aún no tienes una entrevista agendada. Cuando RRHH la programe, aparecerá aquí.'}
                </p>
              </>
            )}
          </div>
        </div>
        {vac && (
          <div className="rounded-[4px] border-[1.5px] border-tinta bg-papel p-4 text-sm">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Vacante</p>
            <p className="mt-1 font-bold">{vac.titulo} · {vac.turno}</p>
            <p className="font-mono text-xs text-umbra">{vac.id}</p>
          </div>
        )}
      </aside>
    </div>
    <SeccionComprobante c={comprobante} onAbrir={() => setVerComprobante(true)} />
    {verComprobante && comprobante && <ModalComprobante c={comprobante} onCerrar={() => setVerComprobante(false)} />}
    </div>
  )
}
