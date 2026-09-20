import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import type { Candidato, Etapa } from '../../types'
import { useTrazi } from '../../store/useTrazi'
import { ETAPA_LABEL } from '../../lib/stages'
import { sedePorId, VACANTES } from '../../data/seed'
import { diasEnEtapa, excedeSla } from '../../lib/metrics'
import { BrandFlag } from '../../components/ui'

const COLUMNAS: Etapa[] = ['recibido', 'revision', 'entrevista', 'oferta', 'contratado', 'rechazado']

function CardBase({ c, sobreCursor = false }: { c: Candidato; sobreCursor?: boolean }) {
  const sede = sedePorId(c.sedeId)
  const vac = VACANTES.find((v) => v.id === c.vacanteId)
  const dias = diasEnEtapa(c)
  const critica = excedeSla(c)
  return (
    <div className={`rounded-lg border border-arena bg-papel p-3 ${critica ? 'border-l-[3px] border-l-rojo' : ''} ${sobreCursor ? 'shadow-[0_6px_16px_-2px_rgba(43,36,32,0.15)]' : ''}`}>
      <p className="text-sm font-bold leading-tight">{c.nombre}</p>
      <p className="mt-0.5 text-xs text-umbra">{vac?.titulo}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 truncate text-xs"><BrandFlag marca={sede.marca} /><span className="truncate text-umbra">{sede.distrito}</span></span>
        <span className={`shrink-0 font-mono text-[11px] font-bold ${critica ? 'rounded-full bg-rojo/12 px-2 py-0.5 text-rojo' : 'text-umbra'}`}>{dias} d</span>
      </div>
    </div>
  )
}

function CardArrastrable({ c, onAbrir }: { c: Candidato; onAbrir: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: c.id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAbrir(c.id)}
      className={`card-ops-hover cursor-grab touch-none rounded-lg active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
      <CardBase c={c} />
    </div>
  )
}

function Columna({ etapa, items, onAbrir }: { etapa: Etapa; items: Candidato[]; onAbrir: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })
  return (
    <section ref={setNodeRef} aria-label={ETAPA_LABEL[etapa]} className={`flex w-[264px] shrink-0 flex-col rounded-2xl bg-crema p-2.5 transition ${isOver ? 'ring-2 ring-rojo/40' : ''}`}>
      <header className="mb-2 flex items-center justify-between px-1.5">
        <h3 className="text-sm font-semibold">{ETAPA_LABEL[etapa]}</h3>
        <span className="font-mono text-xs font-bold text-umbra">{items.length}</span>
      </header>
      <div className="max-h-[calc(100vh-280px)] min-h-24 space-y-2 overflow-y-auto pr-0.5">
        {items.map((c) => <CardArrastrable key={c.id} c={c} onAbrir={onAbrir} />)}
        {items.length === 0 && <p className="rounded-lg border border-dashed border-perfora p-4 text-center text-xs text-umbra">Suelta aquí</p>}
      </div>
    </section>
  )
}

export function Kanban({ onAbrir, onAgendar }: { onAbrir: (id: string) => void; onAgendar: (id: string) => void }) {
  const { candidatos, moverEtapa } = useTrazi()
  const [activo, setActivo] = useState<Candidato | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))

  function fin(e: DragEndEvent) {
    setActivo(null)
    const destino = e.over?.id as Etapa | undefined
    const c = candidatos.find((x) => x.id === e.active.id)
    if (!c || !destino || c.etapa === destino) return
    moverEtapa(c.id, destino)
    if (destino === 'entrevista' && !c.entrevista) onAgendar(c.id)
  }

  return (
    <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setActivo(candidatos.find((c) => c.id === e.active.id) ?? null)} onDragEnd={fin} onDragCancel={() => setActivo(null)}>
      <p className="mb-3 text-sm text-umbra">Arrastra una tarjeta para cambiar la etapa; el postulante lo verá al instante. Borde rojo = supera el tiempo esperado.</p>
      <div className="scroll-x -mx-4 flex gap-3 px-4 pb-3 sm:mx-0 sm:px-0">
        {COLUMNAS.map((e) => (
          <Columna key={e} etapa={e} items={candidatos.filter((c) => c.etapa === e)} onAbrir={onAbrir} />
        ))}
      </div>
      <DragOverlay>{activo && <CardBase c={activo} sobreCursor />}</DragOverlay>
    </DndContext>
  )
}
