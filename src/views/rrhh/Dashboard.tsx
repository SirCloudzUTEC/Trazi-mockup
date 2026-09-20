import { AlertTriangle, ArrowDown, ArrowUp, FileBarChart } from 'lucide-react'
import { useTrazi } from '../../store/useTrazi'
import { ETAPAS } from '../../lib/stages'
import { activos, alertas, conteoPorEtapa, mesActual, mesPrevio, pct } from '../../lib/metrics'
import { fechaHora } from '../../lib/format'
import { Button } from '../../components/ui'
import { TraziMark } from '../../components/TraziMark'
import type { Etapa } from '../../types'

function Kpi({ label, valor, delta, bueno }: { label: string; valor: string; delta: string; bueno: boolean }) {
  const sube = delta.startsWith('▲')
  return (
    <div className="card-ops p-4">
      <p className="text-xs font-medium text-umbra">{label}</p>
      <p className="mt-1 font-mono text-[28px] leading-9 font-bold">{valor}</p>
      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${bueno ? 'bg-verde/12 text-verde' : 'bg-rojo/12 text-rojo'}`}>
        {sube ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
        {delta.slice(1)}
      </span>
    </div>
  )
}

export function Dashboard({ onVerEtapa, onReporte }: { onVerEtapa: (e: Etapa) => void; onReporte: () => void }) {
  const { candidatos, reportes, correos } = useTrazi()
  const cont = conteoPorEtapa(candidatos)
  const max = Math.max(...ETAPAS.map((e) => cont[e.id]), 1)
  const avisos = alertas(candidatos)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Postulantes activos" valor={String(activos(candidatos))} delta="▲12% semana" bueno />
        <Kpi label="Tiempo prom. contratación" valor={`${mesActual.dias} días`} delta={`▼${mesPrevio.dias - mesActual.dias} día menos`} bueno />
        <Kpi label="Tasa de abandono" valor={`${mesActual.abandono}%`} delta={`▼${Math.abs(pct(mesActual.abandono, mesPrevio.abandono))}% vs. mes ant.`} bueno />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="card-ops p-5">
          <h2 className="text-base font-semibold">Postulantes por etapa</h2>
          <div className="mt-4 space-y-2.5">
            {ETAPAS.map((e) => (
              <button key={e.id} onClick={() => onVerEtapa(e.id)} className="group grid w-full grid-cols-[92px_1fr_36px] items-center gap-3 text-left" aria-label={`Ver ${e.corto}`}>
                <span className="text-sm text-umbra group-hover:text-tinta">{e.corto}</span>
                <span className="h-6 overflow-hidden rounded bg-crema">
                  <span className={`block h-full rounded transition-all ${e.id === 'contratado' ? 'bg-verde' : e.id === 'entrevista' ? 'bg-miel' : 'bg-rojo/80'}`} style={{ width: `${(cont[e.id] / max) * 100}%` }} />
                </span>
                <span className="text-right font-mono text-sm font-bold">{cont[e.id]}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-arena pt-4">
            <Button onClick={onReporte}><FileBarChart size={16} /> Generar reporte</Button>
            <span className="text-xs text-umbra">Semanal, mensual o por sede · PDF o Excel</span>
          </div>
        </section>

        <section className="card-ops p-5">
          <div className="flex items-center gap-2">
            <TraziMark size={24} />
            <h2 className="text-base font-semibold">Trazi te avisa</h2>
          </div>
          {avisos.length === 0 ? (
            <p className="mt-3 text-sm text-umbra">Todo al día: ningún candidato supera los tiempos esperados.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {avisos.map((a) => (
                <li key={a.etapa}>
                  <button onClick={() => onVerEtapa(a.etapa)} className="flex w-full items-start gap-2.5 rounded-lg border-l-[3px] border-rojo bg-rojo/6 p-3 text-left text-sm hover:bg-rojo/10">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rojo" />
                    <span>{a.texto}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card-ops p-5">
          <h2 className="text-base font-semibold">Últimos reportes</h2>
          {reportes.length === 0 ? (
            <p className="mt-3 text-sm text-umbra">Aún no generaste reportes en esta sesión.</p>
          ) : (
            <ul className="mt-3 divide-y divide-arena">
              {reportes.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{r.nombre}</span>
                  <span className="shrink-0 font-mono text-xs text-umbra">{r.formato} · {fechaHora(r.fecha)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card-ops p-5">
          <h2 className="text-base font-semibold">Correos recientes</h2>
          {correos.length === 0 ? (
            <p className="mt-3 text-sm text-umbra">No hay correos enviados todavía. Prueba enviar uno desde Candidatos.</p>
          ) : (
            <ul className="mt-3 divide-y divide-arena">
              {correos.slice(0, 4).map((m) => (
                <li key={m.id} className="py-2 text-sm">
                  <p className="truncate font-medium">{m.asunto}</p>
                  <p className="font-mono text-xs text-umbra">{candidatos.find((c) => c.id === m.candidatoId)?.nombre} · {fechaHora(m.fecha)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
