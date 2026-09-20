import { useMemo, useState } from 'react'
import { useTrazi } from '../../store/useTrazi'
import { SEDES, VACANTES, sedePorId } from '../../data/seed'
import type { Marca } from '../../types'
import { JobReceiptCard } from './JobReceiptCard'
import { FormularioPostulacion } from './FormularioPostulacion'
import { BoletaSeguimiento } from './BoletaSeguimiento'
import { Perfil } from './Perfil'
import { TraziAyuda } from '../../components/TraziAyuda'

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
    <div data-theme="postulante" className="min-h-[calc(100vh-64px)] bg-crema">
      <main className="mx-auto max-w-[1160px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
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
            <h1 className="max-w-2xl text-[30px] leading-9 font-extrabold sm:text-[40px] sm:leading-[48px]">
              Tu primer paso en <span className="text-rojo">Plaza Vea</span> y Vivanda empieza aquí.
            </h1>
            <p className="mt-2 max-w-xl text-on-surface-variant" style={{ color: '#59413b' }}>
              Elige una vacante, postula en 2 minutos y sigue tu proceso con tu boleta de postulación.
            </p>
            <div className="mt-5 max-w-xl">
              <TraziAyuda titulo="Hola, soy Trazi">
                Filtra por <b>sede</b> para ver las tiendas más cerca de ti. Las vacantes con «Sin experiencia previa» son ideales para tu primer empleo.
              </TraziAyuda>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[24px] leading-8 font-bold sm:text-[32px] sm:leading-10">Mi postulación</h1>
              {mias.length > 1 && (
                <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.04em]">
                  Ver
                  <select
                    value={actual.id}
                    onChange={(e) => elegirPostulacion(e.target.value)}
                    className="rounded-[4px] border-[1.5px] border-tinta bg-papel px-2 py-1.5 normal-case"
                  >
                    {mias.map((m) => (
                      <option key={m.id} value={m.id}>{m.propia ? `Mi nueva postulación (${m.folio})` : `Demo: ${m.nombre.split(' ')[0]} (${m.folio})`}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <BoletaSeguimiento c={actual} />
          </section>
        )}

        {vista === 'perfil' && actual && <Perfil c={actual} />}
      </main>
    </div>
  )
}
