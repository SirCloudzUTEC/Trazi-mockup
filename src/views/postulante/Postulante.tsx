import { useMemo, useState } from 'react'
import { useTrazi } from '../../store/useTrazi'
import { SEDES, VACANTES, sedePorId } from '../../data/seed'
import type { Marca } from '../../types'
import { JobReceiptCard } from './JobReceiptCard'
import { FormularioPostulacion } from './FormularioPostulacion'
import { BoletaSeguimiento } from './BoletaSeguimiento'
import { Perfil } from './Perfil'
import { FondoInicio, Gondola } from './FondoInicio'
import { HeroInicio } from './HeroInicio'
import { HeroSeccion } from './HeroSeccion'
import { ETAPA_LABEL } from '../../lib/stages'

type Vista = 'ofertas' | 'form' | 'boleta' | 'perfil'

const TABS: { id: Vista; label: string }[] = [
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'boleta', label: 'Mi postulación' },
  { id: 'perfil', label: 'Perfil' },
]

const chipBase = 'rounded-full border-[1.5px] border-tinta px-3 py-1 text-sm font-semibold transition'

export function Postulante() {
  const { candidatos, miPostulacionId, elegirPostulacion, postular } = useTrazi()
  const [vista, setVista] = useState<Vista>('ofertas')
  const [vacanteId, setVacanteId] = useState<string | null>(null)
  const [marca, setMarca] = useState<Marca | 'todas'>('todas')
  const [turno, setTurno] = useState<'todos' | 'Part-Time' | 'Full-Time'>('todos')
  const [sinExp, setSinExp] = useState(false)
  const [sedeId, setSedeId] = useState('todas')

  const vacantes = useMemo(
    () =>
      VACANTES.filter((v) => {
        const s = sedePorId(v.sedeId)
        return (marca === 'todas' || s.marca === marca) && (turno === 'todos' || v.turno === turno) && (!sinExp || v.sinExperiencia) && (sedeId === 'todas' || v.sedeId === sedeId)
      }),
    [marca, turno, sinExp, sedeId],
  )

  const mias = candidatos.filter((c) => c.id === 'c-482' || c.propia)
  const actual = candidatos.find((c) => c.id === miPostulacionId) ?? mias[0]
  const vacante = VACANTES.find((v) => v.id === vacanteId)
  const tabActiva: Vista = vista === 'form' ? 'ofertas' : vista

  return (
    <div data-theme="postulante" className="relative min-h-[calc(100vh-64px)] overflow-x-clip bg-crema">
      <FondoInicio />
      <main className="relative z-10 mx-auto max-w-[1160px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <nav className="mb-6 flex gap-2 overflow-x-auto" aria-label="Secciones">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setVista(t.id)}
              aria-current={tabActiva === t.id ? 'page' : undefined}
              className={`${chipBase} whitespace-nowrap ${tabActiva === t.id ? 'bg-tinta text-crema' : 'bg-papel hover:bg-chip'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {vista === 'ofertas' && (
          <section>
            <HeroInicio onVer={() => document.getElementById('vacantes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
            <Gondola titulo="Pasillo 01 · Vacantes abiertas" />

            <div id="vacantes" className="mt-8 flex scroll-mt-24 flex-wrap items-center gap-2">
              {(['todas', 'PVP', 'VVD'] as const).map((m) => (
                <button key={m} onClick={() => setMarca(m)} className={`${chipBase} ${marca === m ? 'bg-miel' : 'bg-papel hover:bg-chip'}`}>
                  {m === 'todas' ? 'Todas las marcas' : m === 'PVP' ? 'Plaza Vea' : 'Vivanda'}
                </button>
              ))}
              {(['todos', 'Part-Time', 'Full-Time'] as const).map((t) => (
                <button key={t} onClick={() => setTurno(t)} className={`${chipBase} ${turno === t ? 'bg-miel' : 'bg-papel hover:bg-chip'}`}>
                  {t === 'todos' ? 'Todos los turnos' : t}
                </button>
              ))}
              <button onClick={() => setSinExp(!sinExp)} aria-pressed={sinExp} className={`${chipBase} ${sinExp ? 'bg-verde text-white' : 'bg-papel hover:bg-chip'}`}>
                Sin experiencia previa
              </button>
              <select
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                aria-label="Filtrar por sede"
                className="rounded-full border-[1.5px] border-tinta bg-papel px-3 py-1 font-mono text-xs font-bold"
              >
                <option value="todas">Todas las sedes</option>
                {SEDES.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {vacantes.length === 0 ? (
              <p className="mt-10 rounded-[4px] border-[1.5px] border-dashed border-tinta p-6 text-center text-umbra">
                No hay vacantes con esos filtros. Prueba quitando alguno.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {vacantes.map((v) => (
                  <JobReceiptCard key={v.id} vacante={v} onPostular={() => { setVacanteId(v.id); setVista('form') }} />
                ))}
              </div>
            )}
            <Gondola titulo="Fin del pasillo · ¡Gracias por visitar Trazi!" />
          </section>
        )}

        {vista === 'form' && vacante && (
          <FormularioPostulacion
            vacante={vacante}
            onVolver={() => setVista('ofertas')}
            onEnviar={(d) => {
              postular({ ...d, vacanteId: vacante.id })
              setVista('boleta')
              window.scrollTo({ top: 0 })
            }}
          />
        )}

        {vista === 'boleta' && actual && (
          <section>
            <HeroSeccion
              eyebrow="Seguimiento · Boleta de postulación"
              titulo="Mi postulación"
              tituloNube="Así vas"
              mensaje={<>Aquí ves en qué etapa está tu proceso. Toca el <b>«?»</b> junto a <b>Postulación</b> si tienes dudas sobre los sellos.</>}
              franja={[actual.folio, ETAPA_LABEL[actual.etapa], `${VACANTES.find((v) => v.id === actual.vacanteId)?.titulo ?? ''} · ${sedePorId(actual.sedeId).distrito}`]}
            >
              {mias.length > 1 && (
                <label className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.04em]">
                  Ver
                  <select
                    value={actual.id}
                    onChange={(e) => elegirPostulacion(e.target.value)}
                    className="max-w-full rounded-[4px] border-[1.5px] border-tinta bg-papel px-2 py-1.5 normal-case"
                  >
                    {mias.map((m) => (
                      <option key={m.id} value={m.id}>{m.propia ? `Mi nueva postulación (${m.folio})` : `Demo: ${m.nombre.split(' ')[0]} (${m.folio})`}</option>
                    ))}
                  </select>
                </label>
              )}
            </HeroSeccion>
            <Gondola titulo="Tu recorrido · Cada sello cuenta" />
            <div className="mt-8">
            <BoletaSeguimiento c={actual} />
            </div>
            <Gondola titulo="Caja 1 · Gracias por postular" />
          </section>
        )}

        {vista === 'perfil' && actual && <Perfil c={actual} onVerPostulacion={() => setVista('boleta')} />}
      </main>
    </div>
  )
}
