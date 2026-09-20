import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Download, Lock } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTrazi } from '../../store/useTrazi'
import { HISTORICO, SEDES, sedePorId } from '../../data/seed'
import { ACTIVAS, ETAPAS } from '../../lib/stages'
import { conteoPorEtapa, contratacionesSede, diasEnEtapa, excedeSla, mesActual, mesPrevio, pct, totalContratacionesMes } from '../../lib/metrics'
import { soles } from '../../lib/format'
import { Button } from '../../components/ui'
import { TraziMark } from '../../components/TraziMark'
import type { Marca } from '../../types'
import { FondoDireccion, MapaSedes } from './FondoDireccion'

const TICK = { fontFamily: 'Space Mono, monospace', fontSize: 11, fill: '#6B5E55' }

function Kpi({ label, valor, cambio, bueno, nota }: { label: string; valor: string; cambio: number; bueno: boolean; nota: string }) {
  return (
    <div className="card-exec min-w-[240px] shrink-0 snap-start p-5 sm:min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-espresso-meta">{label}</p>
      <p className="mt-2 font-mono text-[32px] leading-[38px] font-bold tracking-tight">{valor}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[13px] ${bueno ? 'bg-verde/12 text-verde' : 'bg-miel/20 text-miel-fuerte'}`}>
          {cambio < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}{Math.abs(cambio)}%
        </span>
        <span className="text-xs text-espresso-meta">{nota}</span>
      </div>
    </div>
  )
}

export function Direccion() {
  const notify = useTrazi((s) => s.notify)
  const candidatos = useTrazi((s) => s.candidatos)
  const [marca, setMarca] = useState<Marca | 'todas'>('todas')
  const [serie, setSerie] = useState<'contrataciones' | 'costo'>('contrataciones')

  useEffect(() => {
    notify('Aquí tienes el resumen de contrataciones del mes.')
  }, [notify])

  const porSede = useMemo(() => contratacionesSede(candidatos), [candidatos])
  const total = totalContratacionesMes(candidatos)
  const totalPrev = mesPrevio.contrataciones
  const cont = conteoPorEtapa(candidatos)

  const barras = SEDES.filter((s) => marca === 'todas' || s.marca === marca)
    .map((s) => ({ nombre: s.nombre, valor: porSede[s.id], marca: s.marca }))
    .sort((a, b) => b.valor - a.valor)

  const demoras = useMemo(
    () =>
      SEDES.map((s) => {
        const act = candidatos.filter((c) => c.sedeId === s.id && ACTIVAS.includes(c.etapa))
        const prom = act.length ? act.reduce((a, c) => a + diasEnEtapa(c), 0) / act.length : 0
        return { sede: s, enProceso: act.length, demorados: act.filter(excedeSla).length, prom }
      })
        .filter((d) => d.enProceso > 0)
        .sort((a, b) => b.prom - a.prom)
        .slice(0, 5),
    [candidatos],
  )

  const lider = [...SEDES].sort((a, b) => porSede[b.id] - porSede[a.id])[0]
  const demora = demoras[0]
  const dCosto = pct(mesActual.costo, mesPrevio.costo)
  const dContr = pct(total, totalPrev)
  const narrativa =
    `Este mes se concretaron ${total} contrataciones, ${Math.abs(dContr)}% ${dContr >= 0 ? 'más' : 'menos'} que el mes anterior. ` +
    `El costo por contratación ${dCosto <= 0 ? 'bajó' : 'subió'} ${Math.abs(dCosto)}% y el proceso tarda en promedio ${mesActual.dias} días (${mesPrevio.dias - mesActual.dias} menos que en agosto). ` +
    `${lider.nombre} lidera en contrataciones` +
    (demora ? `; ${demora.sede.nombre} concentra los procesos más lentos y conviene reforzarla.` : '.')

  const embudo = ETAPAS.map((e) => ({ ...e, n: cont[e.id] }))
  const maxEmb = Math.max(...embudo.map((e) => e.n), 1)
  const datosSerie = HISTORICO.map((m, i) => ({ mes: m.mes, valor: serie === 'costo' ? m.costo : i === HISTORICO.length - 1 ? total : m.contrataciones }))

  function descargar() {
    notify('Reporte listo. Elige «Guardar como PDF» en la ventana de impresión.')
    setTimeout(() => window.print(), 400)
  }

  return (
    <div data-theme="direccion" className="relative min-h-[calc(100vh-64px)] overflow-x-clip bg-crema">
      <FondoDireccion />
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-espresso-meta">Resumen ejecutivo · Septiembre</p>
            <h1 className="mt-1 text-[28px] leading-9 font-bold tracking-[-0.01em] sm:text-[36px] sm:leading-[44px] sm:tracking-[-0.02em]">Contratación de personal en tiendas</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-tinta/10 bg-[#F0EAE1] px-3 py-1 text-xs font-medium"><Lock size={12} /> Confidencial · solo Dirección</span>
        </div>

        <section className="card-exec mt-6 flex gap-4 p-5 sm:p-6">
          <TraziMark size={32} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-espresso-meta">Lo más importante del mes</p>
            <p className="mt-1 text-base leading-6">{narrativa}</p>
          </div>
        </section>

        <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          <Kpi label="Costo por contratación" valor={soles(mesActual.costo)} cambio={dCosto} bueno={dCosto <= 0} nota="vs. mes anterior" />
          <Kpi label="Tiempo promedio" valor={`${mesActual.dias} días`} cambio={pct(mesActual.dias, mesPrevio.dias)} bueno nota="vs. mes anterior" />
          <Kpi label="Contrataciones del mes" valor={String(total)} cambio={dContr} bueno={dContr >= 0} nota="vs. mes anterior" />
          <Kpi label="Abandono del proceso" valor={`${mesActual.abandono}%`} cambio={pct(mesActual.abandono, mesPrevio.abandono)} bueno nota="vs. mes anterior" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card-exec relative overflow-hidden p-5 sm:p-6">
            <MapaSedes porSede={porSede} />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[18px] leading-[26px] font-semibold">Contrataciones por sede</h2>
              <div className="no-print flex gap-1.5">
                {(['todas', 'PVP', 'VVD'] as const).map((m) => (
                  <button key={m} onClick={() => setMarca(m)} aria-pressed={marca === m} className={`rounded-full px-3 py-1 text-xs font-semibold ${marca === m ? 'bg-tinta text-crema' : 'bg-[#F0EAE1] hover:bg-arena'}`}>
                    {m === 'todas' ? 'Todas' : m === 'PVP' ? 'Plaza Vea' : 'Vivanda'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative z-10 mt-4" style={{ height: barras.length * 34 + 20 }} role="img" aria-label="Contrataciones por sede este mes">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barras} layout="vertical" margin={{ left: 0, right: 28, top: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(43,36,32,0.06)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nombre" width={150} tick={{ fontSize: 12, fill: '#2B2420' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(43,36,32,0.04)' }} formatter={(v) => [`${v} contrataciones`, '']} separator="" />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={18} label={{ position: 'right', fontFamily: 'Space Mono, monospace', fontSize: 12, fill: '#2B2420' }}>
                    {barras.map((b) => <Cell key={b.nombre} fill={b.marca === 'PVP' ? '#E4572E' : '#FFC857'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card-exec p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[18px] leading-[26px] font-semibold">Evolución en 6 meses</h2>
              <div className="no-print flex gap-1.5">
                {(['contrataciones', 'costo'] as const).map((s) => (
                  <button key={s} onClick={() => setSerie(s)} aria-pressed={serie === s} className={`rounded-full px-3 py-1 text-xs font-semibold ${serie === s ? 'bg-tinta text-crema' : 'bg-[#F0EAE1] hover:bg-arena'}`}>
                    {s === 'costo' ? 'Costo por contratación' : 'Contrataciones'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 h-[264px]" role="img" aria-label="Evolución de los últimos 6 meses">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosSerie} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(43,36,32,0.06)" />
                  <XAxis dataKey="mes" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={48} domain={serie === 'costo' ? [2200, 2900] : ['dataMin - 10', 'dataMax + 10']} tickFormatter={(v) => (serie === 'costo' ? `S/${v}` : String(v))} />
                  <Tooltip formatter={(v) => [serie === 'costo' ? soles(Number(v)) : `${v} contrataciones`, '']} separator="" />
                  <Line type="monotone" dataKey="valor" stroke={serie === 'costo' ? '#3A7D63' : '#E4572E'} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: serie === 'costo' ? '#3A7D63' : '#E4572E' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
          <section className="card-exec p-5 sm:p-6">
            <h2 className="text-[18px] leading-[26px] font-semibold">De la postulación a la contratación</h2>
            <div className="mt-4 space-y-3">
              {embudo.map((e) => (
                <div key={e.id}>
                  <div className="mb-1 flex items-baseline justify-between text-sm"><span>{e.corto}</span><span className="font-mono text-[13px]">{e.n}</span></div>
                  <div className="h-2.5 rounded-full bg-[#F0EAE1]"><div className={`h-full rounded-full ${e.id === 'contratado' ? 'bg-verde' : 'bg-rojo/80'}`} style={{ width: `${(e.n / maxEmb) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="card-exec overflow-hidden">
            <div className="p-5 pb-3 sm:p-6 sm:pb-3">
              <h2 className="text-[18px] leading-[26px] font-semibold">Sedes donde el proceso va más lento</h2>
              <p className="text-sm text-espresso-meta">Promedio de días que los postulantes esperan en su etapa actual.</p>
            </div>
            <div className="scroll-x">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-exec-head">
                  <tr className="border-b border-tinta/10 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-espresso-meta">
                    <th className="px-5 py-3 sm:px-6">Tienda</th><th className="px-3 py-3 text-right">En proceso</th><th className="px-3 py-3 text-right">Con demora</th><th className="px-5 py-3 text-right sm:px-6">Días prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {demoras.map((d) => (
                    <tr key={d.sede.id} className="h-[60px] border-b border-tinta/6 last:border-0 hover:bg-[#FAF6EE]">
                      <td className="px-5 sm:px-6"><span className="font-semibold">{sedePorId(d.sede.id).nombre}</span></td>
                      <td className="px-3 text-right font-mono text-[13px]">{d.enProceso}</td>
                      <td className="px-3 text-right font-mono text-[13px]">{d.demorados > 0 ? <span className="rounded-full bg-miel/20 px-2 py-0.5 text-miel-fuerte">{d.demorados}</span> : '0'}</td>
                      <td className="px-5 text-right font-mono text-[13px] font-bold sm:px-6">{d.prom.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="no-print mt-8 flex justify-end">
          <Button onClick={descargar} className="h-11 px-5"><Download size={16} /> Descargar reporte ejecutivo (PDF)</Button>
        </div>
      </main>
    </div>
  )
}
