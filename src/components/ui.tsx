import type { ReactNode } from 'react'
import type { Etapa, Marca } from '../types'
import { ETAPA_LABEL } from '../lib/stages'

export function BrandFlag({ marca }: { marca: Marca }) {
  return marca === 'PVP' ? (
    <span className="inline-flex items-center rounded-full bg-rojo/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rojo-fuerte">
      Plaza Vea
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-miel/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-miel-fuerte">
      Vivanda
    </span>
  )
}

const ETAPA_TONO: Record<Etapa, string> = {
  recibido: 'bg-arena text-umbra',
  revision: 'bg-miel/25 text-tinta',
  entrevista: 'bg-miel/40 text-tinta',
  oferta: 'bg-rojo/12 text-rojo-fuerte',
  contratado: 'bg-verde/12 text-verde',
  rechazado: 'bg-tinta/8 text-umbra',
}

export function EtapaChip({ etapa }: { etapa: Etapa }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${ETAPA_TONO[etapa]}`}>
      {ETAPA_LABEL[etapa]}
    </span>
  )
}

export function Chip({ children, tono = 'neutro' }: { children: ReactNode; tono?: 'neutro' | 'verde' | 'miel' | 'rojo' }) {
  const t = {
    neutro: 'bg-chip text-tinta',
    verde: 'bg-verde/12 text-verde',
    miel: 'bg-miel/25 text-tinta',
    rojo: 'bg-rojo/12 text-rojo-fuerte',
  }[tono]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>
}

/** Sello de goma inclinado 2° (vista postulante). */
export function Stamp({ children, tono = 'verde' }: { children: ReactNode; tono?: 'verde' | 'rojo' }) {
  const c = tono === 'verde' ? 'text-verde border-verde' : 'text-rojo border-rojo'
  return (
    <span
      className={`inline-block -rotate-2 animate-stamp rounded-[3px] border-[3px] border-double px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.06em] ${c}`}
    >
      {children}
    </span>
  )
}

export function Button({
  variante = 'primario',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'ghost' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
  const v = {
    primario: 'bg-rojo text-white hover:bg-rojo-hover',
    secundario: 'border border-arena bg-papel text-tinta hover:border-tinta hover:bg-crema',
    ghost: 'text-umbra hover:bg-rojo/8 hover:text-rojo',
  }[variante]
  return <button {...props} className={`${base} ${v} ${className}`} />
}

/** Botón estilo ticket (vista postulante): borde 1.5px + sombra dura. */
export function TicketButton({
  variante = 'primario',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'mono' }) {
  const base = 'hard-press inline-flex items-center justify-center gap-2 rounded-[4px] border-[1.5px] border-tinta px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50'
  const v = {
    primario: 'hard-shadow bg-rojo text-crema',
    secundario: 'hard-shadow bg-papel text-tinta',
    mono: 'bg-transparent font-mono text-xs font-bold uppercase tracking-[0.04em] text-tinta hover:bg-chip',
  }[variante]
  return <button {...props} className={`${base} ${v} ${className}`} />
}
