import { CalendarDays, Mail, Phone, X } from 'lucide-react'
import { useTrazi } from '../../store/useTrazi'
import { sedePorId, VACANTES } from '../../data/seed'
import { ETAPAS, ETAPA_LABEL } from '../../lib/stages'
import { diasEnEtapa } from '../../lib/metrics'
import { fechaHora } from '../../lib/format'
import { BrandFlag, Button, EtapaChip } from '../../components/ui'
import type { Etapa } from '../../types'

export function PanelCandidato({ id, onCerrar, onCorreo }: { id: string; onCerrar: () => void; onCorreo: (id: string) => void }) {
  const { candidatos, correos, moverEtapa } = useTrazi()
  const c = candidatos.find((x) => x.id === id)
  if (!c) return null
  const sede = sedePorId(c.sedeId)
  const vac = VACANTES.find((v) => v.id === c.vacanteId)
  const mios = correos.filter((m) => m.candidatoId === c.id)
  const etapas: Etapa[] = [...ETAPAS.map((e) => e.id), 'rechazado']

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-tinta/40" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <aside role="dialog" aria-modal="true" aria-label={`Candidato ${c.nombre}`} className="flex h-full w-full max-w-[460px] flex-col bg-papel shadow-[0_16px_32px_-4px_rgba(43,36,32,0.14)] sm:rounded-l-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-arena px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold leading-tight">{c.nombre}</h2>
            <p className="mt-0.5 font-mono text-xs text-umbra">{c.folio} · DNI {c.dni}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2"><EtapaChip etapa={c.etapa} /><BrandFlag marca={sede.marca} /><span className="font-mono text-xs text-umbra">{diasEnEtapa(c)} d en etapa</span></div>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-2 text-umbra hover:bg-crema"><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold">{vac?.titulo} · {vac?.turno}</p>
            <p className="text-umbra">{sede.nombre} <span className="font-mono text-xs">({sede.id})</span></p>
            <p className="flex items-center gap-2 text-umbra"><Phone size={14} /> <span className="font-mono">{c.telefono}</span></p>
            <p className="flex items-center gap-2 text-umbra"><Mail size={14} /> {c.email}</p>
            {c.entrevista && (
              <p className="flex items-center gap-2 rounded-lg bg-miel/20 px-3 py-2"><CalendarDays size={14} />
                Entrevista {fechaHora(c.entrevista.fecha)} · {c.entrevista.confirmada ? 'confirmada' : 'sin confirmar'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="mover" className="mb-1 block text-xs font-medium text-umbra">Mover a etapa</label>
            <select id="mover" value={c.etapa} onChange={(e) => moverEtapa(c.id, e.target.value as Etapa)} className="w-full rounded-lg border border-arena bg-papel px-3 py-2 text-sm">
              {etapas.map((e) => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
            </select>
          </div>
          <Button onClick={() => onCorreo(c.id)} className="w-full"><Mail size={16} /> Enviar correo</Button>

          <section>
            <h3 className="mb-2 text-sm font-semibold">Correos enviados ({mios.length})</h3>
            {mios.length === 0 ? <p className="text-sm text-umbra">Todavía no le has escrito.</p> : (
              <ul className="space-y-1.5">
                {mios.map((m) => (
                  <li key={m.id}>
                    <details className="rounded-lg border border-arena p-2.5 text-sm">
                      <summary className="cursor-pointer font-medium">{m.asunto}<span className="ml-2 font-mono text-[11px] font-normal text-umbra">{fechaHora(m.fecha)}</span></summary>
                      <pre className="mt-2 font-sans text-xs whitespace-pre-wrap text-umbra">{m.cuerpo}</pre>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">Historial</h3>
            <ol className="space-y-2 border-l border-arena pl-4">
              {[...c.historial].reverse().map((h, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-rojo" />
                  {h.texto}
                  <span className="block font-mono text-[11px] text-umbra">{fechaHora(h.fecha)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  )
}
