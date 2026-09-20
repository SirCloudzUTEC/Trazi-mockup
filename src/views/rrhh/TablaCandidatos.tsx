import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Mail, Search } from 'lucide-react'
import type { Etapa, Marca } from '../../types'
import { useTrazi } from '../../store/useTrazi'
import { SEDES, sedePorId, VACANTES } from '../../data/seed'
import { ETAPAS, ETAPA_LABEL, ETAPA_ORDEN } from '../../lib/stages'
import { diasEnEtapa, excedeSla } from '../../lib/metrics'
import { BrandFlag, Button, EtapaChip } from '../../components/ui'

type Orden = { col: 'nombre' | 'etapa' | 'dias'; asc: boolean }

const sel = 'rounded-lg border border-arena bg-papel px-3 py-2 text-sm outline-none focus:border-rojo focus:ring-[3px] focus:ring-rojo/15'

export function TablaCandidatos({
  etapa,
  setEtapa,
  onAbrir,
  onCorreo,
}: {
  etapa: Etapa | 'todas'
  setEtapa: (e: Etapa | 'todas') => void
  onAbrir: (id: string) => void
  onCorreo: (ids: string[]) => void
}) {
  const candidatos = useTrazi((s) => s.candidatos)
  const [q, setQ] = useState('')
  const [marca, setMarca] = useState<Marca | 'todas'>('todas')
  const [sedeId, setSedeId] = useState('todas')
  const [orden, setOrden] = useState<Orden>({ col: 'dias', asc: false })
  const [marcados, setMarcados] = useState<string[]>([])

  const filas = useMemo(() => {
    const t = q.trim().toLowerCase()
    const lista = candidatos.filter((c) => {
      const sede = sedePorId(c.sedeId)
      return (
        (etapa === 'todas' || c.etapa === etapa) &&
        (marca === 'todas' || sede.marca === marca) &&
        (sedeId === 'todas' || c.sedeId === sedeId) &&
        (!t || c.nombre.toLowerCase().includes(t) || c.dni.includes(t) || c.folio.toLowerCase().includes(t))
      )
    })
    const dir = orden.asc ? 1 : -1
    return lista.sort((a, b) => {
      if (orden.col === 'nombre') return a.nombre.localeCompare(b.nombre) * dir
      if (orden.col === 'etapa') return (ETAPA_ORDEN[a.etapa] - ETAPA_ORDEN[b.etapa]) * dir
      return (diasEnEtapa(a) - diasEnEtapa(b)) * dir
    })
  }, [candidatos, q, etapa, marca, sedeId, orden])

  const visiblesIds = filas.map((c) => c.id)
  const todos = visiblesIds.length > 0 && visiblesIds.every((id) => marcados.includes(id))
  const toggle = (id: string) => setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
  const ordenar = (col: Orden['col']) => setOrden((o) => (o.col === col ? { col, asc: !o.asc } : { col, asc: true }))
  const chev = (col: Orden['col']) => (orden.col === col ? orden.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <ChevronDown size={12} className="opacity-30" />)
  const th = 'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-umbra'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-umbra" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, DNI o folio" aria-label="Buscar candidatos" className={`${sel} w-full pl-9 ${/^\d/.test(q) ? 'font-mono' : ''}`} />
        </div>
        <select aria-label="Marca" value={marca} onChange={(e) => setMarca(e.target.value as Marca | 'todas')} className={sel}>
          <option value="todas">Todas las marcas</option>
          <option value="PVP">Plaza Vea</option>
          <option value="VVD">Vivanda</option>
        </select>
        <select aria-label="Sede" value={sedeId} onChange={(e) => setSedeId(e.target.value)} className={sel}>
          <option value="todas">Todas las sedes</option>
          {SEDES.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select aria-label="Etapa" value={etapa} onChange={(e) => setEtapa(e.target.value as Etapa | 'todas')} className={sel}>
          <option value="todas">Todas las etapas</option>
          {[...ETAPAS.map((e) => e.id), 'rechazado' as Etapa].map((e) => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
        </select>
      </div>

      {marcados.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-miel/25 px-4 py-2.5 text-sm">
          <b>{marcados.length}</b> seleccionado{marcados.length > 1 ? 's' : ''}
          <Button onClick={() => onCorreo(marcados)} className="!py-1.5"><Mail size={14} /> Enviar correo</Button>
          <Button variante="ghost" onClick={() => setMarcados([])} className="!py-1.5">Limpiar</Button>
        </div>
      )}

      <div className="card-ops hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-crema">
            <tr>
              <th className="w-10 px-3"><input type="checkbox" aria-label="Seleccionar todos" checked={todos} onChange={() => setMarcados(todos ? [] : visiblesIds)} className="h-4 w-4 accent-rojo" /></th>
              <th className={th}><button onClick={() => ordenar('nombre')} className="flex items-center gap-1 uppercase">Candidato {chev('nombre')}</button></th>
              <th className={th}>Puesto</th>
              <th className={th}>Sede</th>
              <th className={th}><button onClick={() => ordenar('etapa')} className="flex items-center gap-1 uppercase">Etapa {chev('etapa')}</button></th>
              <th className={`${th} text-right`}><button onClick={() => ordenar('dias')} className="ml-auto flex items-center gap-1 uppercase">Días {chev('dias')}</button></th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => {
              const sede = sedePorId(c.sedeId)
              return (
                <tr key={c.id} onClick={() => onAbrir(c.id)} className="h-12 cursor-pointer border-t border-arena hover:bg-crema/85">
                  <td className="px-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Seleccionar ${c.nombre}`} checked={marcados.includes(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 accent-rojo" /></td>
                  <td className="px-3"><span className="block font-semibold leading-tight">{c.nombre}</span><span className="font-mono text-[11px] text-umbra">{c.folio}</span></td>
                  <td className="px-3 text-umbra">{VACANTES.find((v) => v.id === c.vacanteId)?.titulo}</td>
                  <td className="px-3"><span className="flex items-center gap-2"><BrandFlag marca={sede.marca} /><span className="text-umbra">{sede.distrito}</span></span></td>
                  <td className="px-3"><EtapaChip etapa={c.etapa} /></td>
                  <td className={`px-3 text-right font-mono font-bold ${excedeSla(c) ? 'text-rojo' : 'text-umbra'}`}>{diasEnEtapa(c)}</td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><button aria-label={`Enviar correo a ${c.nombre}`} onClick={() => onCorreo([c.id])} className="rounded-lg p-2 text-umbra hover:bg-rojo/8 hover:text-rojo"><Mail size={16} /></button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filas.length === 0 && <p className="p-8 text-center text-sm text-umbra">No hay candidatos con esos filtros.</p>}
      </div>

      <ul className="space-y-2 md:hidden">
        {filas.map((c) => {
          const sede = sedePorId(c.sedeId)
          return (
            <li key={c.id} className={`card-ops p-3 ${excedeSla(c) ? 'border-l-[3px] border-l-rojo' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onAbrir(c.id)} className="text-left">
                  <span className="block text-sm font-bold">{c.nombre}</span>
                  <span className="font-mono text-[11px] text-umbra">{c.folio}</span>
                </button>
                <EtapaChip etapa={c.etapa} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-umbra">
                <span className="flex items-center gap-2"><BrandFlag marca={sede.marca} />{sede.distrito}</span>
                <span className="font-mono font-bold">{diasEnEtapa(c)} d</span>
              </div>
            </li>
          )
        })}
        {filas.length === 0 && <p className="p-6 text-center text-sm text-umbra">No hay candidatos con esos filtros.</p>}
      </ul>
      <p className="font-mono text-xs text-umbra">{filas.length} de {candidatos.length} candidatos</p>
    </div>
  )
}
