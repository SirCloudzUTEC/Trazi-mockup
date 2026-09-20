const DIA = 86_400_000

export function diasDesde(iso: string, ahora = Date.now()): number {
  return Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / DIA))
}

export function haceDias(n: number): string {
  return new Date(Date.now() - n * DIA).toISOString()
}

export function enDias(n: number, hora = 10): string {
  const d = new Date(Date.now() + n * DIA)
  d.setHours(hora, 0, 0, 0)
  return d.toISOString()
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function fechaHora(iso: string): string {
  return `${fechaCorta(iso)} · ${hora(iso)}`
}

export function soles(n: number, decimales = 0): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`
}

export function folio(n: number, marca: 'PVP' | 'VVD'): string {
  return `FOLIO-${String(n).padStart(5, '0')}-${marca === 'PVP' ? 'PV' : 'VV'}`
}

export function inputDate(iso: string): string {
  return iso.slice(0, 10)
}

export function fechaLargaCap(iso: string): string {
  const t = fechaLarga(iso)
  return t.charAt(0).toUpperCase() + t.slice(1)
}
