import type { Candidato, Etapa } from '../types'
import { sedePorId, VACANTES } from '../data/seed'

/** Datos completos que muestra el comprobante; viajan dentro del QR para que cualquier dispositivo pueda abrirlos. */
export interface Comprobante {
  folio: string
  nombre: string
  dni: string
  telefono: string
  email: string
  vacanteId: string
  puesto: string
  turno: string
  sedeId: string
  sede: string
  distrito: string
  fecha: string
  confirmada: boolean
  etapa: Etapa
  emitido: string
  codigo: string
}

function codigoVerificacion(folio: string, fecha: string): string {
  let h = 0
  for (const ch of `${folio}|${fecha}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h.toString(36).toUpperCase().padStart(6, '0').slice(-6)
}

function armar(v: {
  folio: string; nombre: string; dni: string; telefono: string; email: string
  vacanteId: string; sedeId: string; fecha: string; confirmada: boolean; etapa: Etapa; emitido: string
}): Comprobante {
  const vac = VACANTES.find((x) => x.id === v.vacanteId)
  const sede = sedePorId(v.sedeId)
  return {
    ...v,
    puesto: vac?.titulo ?? 'Vacante',
    turno: vac?.turno ?? '',
    sede: sede.nombre,
    distrito: sede.distrito,
    codigo: codigoVerificacion(v.folio, v.fecha),
  }
}

export function comprobanteDe(c: Candidato): Comprobante | null {
  if (!c.entrevista) return null
  return armar({
    folio: c.folio,
    nombre: c.nombre,
    dni: c.dni,
    telefono: c.telefono,
    email: c.email,
    vacanteId: c.vacanteId,
    sedeId: c.entrevista.sedeId,
    fecha: c.entrevista.fecha,
    confirmada: c.entrevista.confirmada,
    etapa: c.etapa,
    emitido: c.historial[c.historial.length - 1]?.fecha ?? c.fechaEtapa,
  })
}

const aB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const deB64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0)))

export function urlComprobante(c: Comprobante): string {
  const d = aB64(JSON.stringify([c.folio, c.nombre, c.dni, c.telefono, c.email, c.vacanteId, c.sedeId, c.fecha, c.confirmada ? 1 : 0, c.etapa, Date.parse(c.emitido)]))
  return `${window.location.origin}/comprobante?d=${d}`
}

export function leerComprobante(d: string | null): Comprobante | null {
  if (!d) return null
  try {
    const [folio, nombre, dni, telefono, email, vacanteId, sedeId, fecha, conf, etapa, emitido] = JSON.parse(deB64(d))
    if (!folio || !nombre || !fecha) return null
    return armar({ folio, nombre, dni, telefono, email, vacanteId, sedeId, fecha, confirmada: conf === 1, etapa, emitido: new Date(emitido).toISOString() })
  } catch {
    return null
  }
}
