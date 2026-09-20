import { Clock, MapPin } from 'lucide-react'
import type { Vacante } from '../../types'
import { sedePorId } from '../../data/seed'
import { BrandFlag, Chip, TicketButton } from '../../components/ui'
import { soles } from '../../lib/format'

export function JobReceiptCard({ vacante, onPostular }: { vacante: Vacante; onPostular: () => void }) {
  const sede = sedePorId(vacante.sedeId)
  return (
    <div className="ticket-wrap mx-auto w-full max-w-[360px]">
      <article className="ticket" style={{ ['--notch-y' as string]: 'calc(100% - 76px)' }}>
        <div className="flex items-center justify-between px-4 pt-4">
          <BrandFlag marca={sede.marca} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-umbra">{vacante.id}</span>
        </div>
        <div className="tear mx-4 mt-3" />
        <div className="px-4 pt-3 pb-4">
          <h3 className="text-[22px] leading-7 font-bold">{vacante.titulo}</h3>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.04em] text-umbra">
            <MapPin size={12} /> {sede.id} · {sede.distrito}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip>
              <Clock size={12} /> {vacante.turno}
            </Chip>
            {vacante.sinExperiencia && <Chip tono="verde">Sin experiencia previa</Chip>}
          </div>
          <div className="mt-4 flex items-end justify-between border-y-[1.5px] border-dashed border-perfora py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-umbra">Tarifa por hora</span>
            <span className="font-mono text-xl font-bold text-rojo">{soles(vacante.tarifaHora, 2)}</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-on-surface-variant" style={{ color: '#59413b' }}>
            {vacante.requisitos.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-verde">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="tear flex h-[76px] items-center px-4">
          <TicketButton onClick={onPostular} className="w-full">
            Postular
          </TicketButton>
        </div>
      </article>
    </div>
  )
}
