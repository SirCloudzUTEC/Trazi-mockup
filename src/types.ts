export type Marca = 'PVP' | 'VVD'
export type Etapa = 'recibido' | 'revision' | 'entrevista' | 'oferta' | 'contratado' | 'rechazado'
export type Turno = 'Part-Time' | 'Full-Time'

export interface Sede {
  id: string
  nombre: string
  marca: Marca
  distrito: string
}

export interface Vacante {
  id: string
  titulo: string
  sedeId: string
  turno: Turno
  tarifaHora: number
  sinExperiencia: boolean
  requisitos: string[]
  publicada: string
}

export interface Entrevista {
  fecha: string // ISO
  sedeId: string
  confirmada: boolean
}

export interface EventoHistorial {
  fecha: string
  texto: string
}

export interface Candidato {
  id: string
  folio: string
  nombre: string
  dni: string
  telefono: string
  email: string
  vacanteId: string
  sedeId: string
  etapa: Etapa
  fechaEtapa: string
  entrevista?: Entrevista
  historial: EventoHistorial[]
}

export type PlantillaId = 'recibida' | 'revision' | 'entrevista' | 'oferta' | 'rechazo'

export interface CorreoEnviado {
  id: string
  candidatoId: string
  plantilla: PlantillaId
  asunto: string
  cuerpo: string
  fecha: string
}

export interface Reporte {
  id: string
  nombre: string
  formato: 'PDF' | 'Excel'
  desde: string
  hasta: string
  sedes: string[]
  fecha: string
}

export interface TraziMensaje {
  id: string
  texto: string
}
