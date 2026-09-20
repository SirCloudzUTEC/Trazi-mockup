import type { Etapa } from '../types'

export const ETAPAS: { id: Etapa; label: string; corto: string }[] = [
  { id: 'recibido', label: 'Postulación recibida', corto: 'Recibido' },
  { id: 'revision', label: 'CV en revisión', corto: 'Revisión' },
  { id: 'entrevista', label: 'Entrevista', corto: 'Entrevista' },
  { id: 'oferta', label: 'Oferta', corto: 'Oferta' },
  { id: 'contratado', label: 'Contratado', corto: 'Contratado' },
]

export const ETAPA_LABEL: Record<Etapa, string> = {
  recibido: 'Recibido',
  revision: 'En revisión',
  entrevista: 'Entrevista',
  oferta: 'Oferta',
  contratado: 'Contratado',
  rechazado: 'No continúa',
}

export const ETAPA_ORDEN: Record<Etapa, number> = {
  recibido: 0,
  revision: 1,
  entrevista: 2,
  oferta: 3,
  contratado: 4,
  rechazado: -1,
}

/** Días máximos aceptables en cada etapa antes de marcar el caso como demora. */
export const SLA_DIAS: Record<Etapa, number> = {
  recibido: 3,
  revision: 4,
  entrevista: 5,
  oferta: 4,
  contratado: Infinity,
  rechazado: Infinity,
}

export const ACTIVAS: Etapa[] = ['recibido', 'revision', 'entrevista', 'oferta']
