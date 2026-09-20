import { FileText, Mail, MapPin, Phone } from 'lucide-react'
import type { Candidato } from '../../types'
import { sedePorId, VACANTES } from '../../data/seed'
import { ETAPA_LABEL } from '../../lib/stages'
import { Stamp, TicketButton } from '../../components/ui'
import { Gondola } from './FondoInicio'
import { HeroSeccion } from './HeroSeccion'

export function Perfil({ c, onVerPostulacion }: { c: Candidato; onVerPostulacion: () => void }) {
  const sede = sedePorId(c.sedeId)
  const vac = VACANTES.find((v) => v.id === c.vacanteId)
  const fila = 'flex items-center gap-3 border-b-[1.5px] border-dashed border-perfora py-3 last:border-0'
  return (
    <section>
      <HeroSeccion
        eyebrow="Mi perfil"
        titulo={<>Hola, {c.nombre.split(' ')[0]}.</>}
        tituloNube="Tus datos"
        mensaje={<>Revisa que estén correctos: los usaremos para avisarte de tu entrevista y armar tu comprobante.</>}
        franja={[`DNI ${c.dni}`, c.telefono, sede.distrito]}
      />
      <Gondola titulo="Mostrador · Tus datos" />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-10">
        <div className="ticket-wrap">
          <div className="ticket p-5 sm:p-7" style={{ mask: 'none', WebkitMask: 'none' } as React.CSSProperties}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Datos personales</p>
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

        <div className="ticket-wrap max-w-[420px]">
          <div className="ticket p-5" style={{ mask: 'none', WebkitMask: 'none' } as React.CSSProperties}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Mi postulación</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-[0.02em]">{c.folio}</p>
            <p className="text-sm">{vac?.titulo} · {sede.nombre}</p>
            <div className="mt-3"><Stamp tono={c.etapa === 'rechazado' ? 'rojo' : 'verde'}>{ETAPA_LABEL[c.etapa]}</Stamp></div>
            <div className="tear mt-5 mb-4" />
            <TicketButton onClick={onVerPostulacion} className="w-full">Ver mi postulación</TicketButton>
          </div>
        </div>
      </div>
      <Gondola titulo="Caja 2 · Gracias por mantener tu perfil al día" />
    </section>
  )
}
