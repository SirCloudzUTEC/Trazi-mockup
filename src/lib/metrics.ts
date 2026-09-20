import type { Candidato, Etapa } from '../types'
import { ACTIVAS, ETAPA_LABEL, SLA_DIAS } from './stages'
import { diasDesde } from './format'
import { CONTRATACIONES_SEDE_BASE, HISTORICO, SEDES, crearCandidatos } from '../data/seed'

export function conteoPorEtapa(cs: Candidato[]): Record<Etapa, number> {
  const r: Record<Etapa, number> = { recibido: 0, revision: 0, entrevista: 0, oferta: 0, contratado: 0, rechazado: 0 }
  for (const c of cs) r[c.etapa]++
  return r
}

export function activos(cs: Candidato[]): number {
  return cs.filter((c) => ACTIVAS.includes(c.etapa)).length
}

export function diasEnEtapa(c: Candidato): number {
  return diasDesde(c.fechaEtapa)
}

export function excedeSla(c: Candidato): boolean {
  return diasEnEtapa(c) > SLA_DIAS[c.etapa]
}

export interface Alerta {
  etapa: Etapa
  cantidad: number
  umbral: number
  texto: string
}

export function alertas(cs: Candidato[]): Alerta[] {
  return ACTIVAS.map((etapa) => {
    const cantidad = cs.filter((c) => c.etapa === etapa && excedeSla(c)).length
    const umbral = SLA_DIAS[etapa]
    return {
      etapa,
      cantidad,
      umbral,
      texto: `${cantidad} candidato${cantidad === 1 ? ' lleva' : 's llevan'} +${umbral} días sin respuesta en ${ETAPA_LABEL[etapa]}.`,
    }
  })
    .filter((a) => a.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
}

const SEED_CONTRATADOS = (() => {
  const r: Record<string, number> = {}
  for (const c of crearCandidatos()) if (c.etapa === 'contratado') r[c.sedeId] = (r[c.sedeId] ?? 0) + 1
  return r
})()

/** Contrataciones del mes actual por sede: base ficticia + las que se confirmen en vivo durante la demo. */
export function contratacionesSede(cs: Candidato[]): Record<string, number> {
  const vivo: Record<string, number> = {}
  for (const c of cs) if (c.etapa === 'contratado') vivo[c.sedeId] = (vivo[c.sedeId] ?? 0) + 1
  const r: Record<string, number> = {}
  for (const s of SEDES) {
    const delta = Math.max(0, (vivo[s.id] ?? 0) - (SEED_CONTRATADOS[s.id] ?? 0))
    r[s.id] = CONTRATACIONES_SEDE_BASE[s.id] + delta
  }
  return r
}

export function totalContratacionesMes(cs: Candidato[]): number {
  return Object.values(contratacionesSede(cs)).reduce((a, b) => a + b, 0)
}

export const mesActual = HISTORICO[HISTORICO.length - 1]
export const mesPrevio = HISTORICO[HISTORICO.length - 2]

export function pct(actual: number, previo: number): number {
  return Math.round(((actual - previo) / previo) * 100)
}
