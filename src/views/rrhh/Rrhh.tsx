import { useEffect, useState } from 'react'
import { FileBarChart } from 'lucide-react'
import type { Etapa, PlantillaId } from '../../types'
import { useTrazi } from '../../store/useTrazi'
import { Button } from '../../components/ui'
import { Dashboard } from './Dashboard'
import { Kanban } from './Kanban'
import { TablaCandidatos } from './TablaCandidatos'
import { PanelCandidato } from './PanelCandidato'
import { ModalCorreo } from './ModalCorreo'
import { PanelReporte } from './PanelReporte'
import { fechaHora } from '../../lib/format'
import { FondoRrhh } from './FondoRrhh'

type Tab = 'resumen' | 'pipeline' | 'candidatos' | 'enviados'
const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'candidatos', label: 'Candidatos' },
  { id: 'enviados', label: 'Correos enviados' },
]

export function Rrhh() {
  const notify = useTrazi((s) => s.notify)
  const { correos, candidatos } = useTrazi()
  const [tab, setTab] = useState<Tab>('resumen')
  const [etapa, setEtapa] = useState<Etapa | 'todas'>('todas')
  const [panelId, setPanelId] = useState<string | null>(null)
  const [correo, setCorreo] = useState<{ ids: string[]; plantilla?: PlantillaId } | null>(null)
  const [reporte, setReporte] = useState(false)

  useEffect(() => {
    notify('Llevas 3 días sin actualizar dashboards. ¿Generamos el reporte semanal?')
  }, [notify])

  return (
    <div data-theme="rrhh" className="relative min-h-[calc(100vh-64px)] overflow-x-clip bg-crema">
      <FondoRrhh />
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 pt-6 pb-8 sm:px-6 lg:px-10 lg:pt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] leading-9 font-bold sm:text-[36px] sm:leading-[44px]">Panel de reclutamiento</h1>
            <p className="text-sm text-umbra">Plaza Vea y Vivanda · datos simulados</p>
          </div>
          <Button variante="secundario" onClick={() => setReporte(true)}><FileBarChart size={16} /> Generar reporte</Button>
        </div>

        <nav className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-arena" aria-label="Secciones RRHH">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t.id ? 'border-rojo text-tinta' : 'border-transparent text-umbra hover:text-tinta'}`}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'resumen' && <Dashboard onReporte={() => setReporte(true)} onVerEtapa={(e) => { setEtapa(e); setTab('candidatos') }} />}
        {tab === 'pipeline' && <Kanban onAbrir={setPanelId} onAgendar={(id) => setCorreo({ ids: [id], plantilla: 'entrevista' })} />}
        {tab === 'candidatos' && <TablaCandidatos etapa={etapa} setEtapa={setEtapa} onAbrir={setPanelId} onCorreo={(ids) => setCorreo({ ids })} />}
        {tab === 'enviados' && (
          <div className="card-ops divide-y divide-arena">
            {correos.length === 0 && <p className="p-8 text-center text-sm text-umbra">Aún no se han enviado correos. Ve a Candidatos y usa el ícono de sobre.</p>}
            {correos.map((m) => (
              <details key={m.id} className="p-4">
                <summary className="cursor-pointer text-sm">
                  <b>{m.asunto}</b>
                  <span className="ml-2 font-mono text-xs text-umbra">{candidatos.find((c) => c.id === m.candidatoId)?.nombre} · {fechaHora(m.fecha)}</span>
                </summary>
                <pre className="mt-3 font-sans text-sm whitespace-pre-wrap text-umbra">{m.cuerpo}</pre>
              </details>
            ))}
          </div>
        )}
      </main>

      {panelId && <PanelCandidato id={panelId} onCerrar={() => setPanelId(null)} onCorreo={(id) => setCorreo({ ids: [id] })} />}
      {correo && <ModalCorreo ids={correo.ids} plantillaInicial={correo.plantilla} onCerrar={() => setCorreo(null)} />}
      {reporte && <PanelReporte onCerrar={() => setReporte(false)} />}
    </div>
  )
}
