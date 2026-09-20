import { FileText, Mail, MapPin, Phone } from 'lucide-react'
import type { Candidato } from '../../types'
import { sedePorId } from '../../data/seed'

export function Perfil({ c }: { c: Candidato }) {
  const sede = sedePorId(c.sedeId)
  const fila = 'flex items-center gap-3 border-b-[1.5px] border-dashed border-perfora py-3 last:border-0'
  return (
    <div className="mx-auto max-w-[560px]">
      <div className="ticket-wrap">
        <div className="ticket p-5 sm:p-7" style={{ mask: 'none', WebkitMask: 'none' } as React.CSSProperties}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Mi perfil</p>
          <h2 className="mt-1 text-[24px] leading-8 font-bold">{c.nombre}</h2>
          <p className="font-mono text-xs uppercase tracking-[0.04em] text-umbra">DNI {c.dni}</p>
          <div className="mt-4">
            <div className={fila}><Phone size={16} className="text-umbra" /><span className="font-mono text-sm">{c.telefono}</span></div>
            <div className={fila}><Mail size={16} className="text-umbra" /><span className="text-sm">{c.email}</span></div>
            <div className={fila}><MapPin size={16} className="text-umbra" /><span className="text-sm">Sede de interés: {sede.nombre}</span></div>
            <div className={fila}><FileText size={16} className="text-umbra" /><span className="font-mono text-sm">CV_{c.nombre.split(' ')[0]}.pdf</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
