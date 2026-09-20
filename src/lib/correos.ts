import type { Candidato, Etapa, PlantillaId } from '../types'
import { sedePorId, VACANTES } from '../data/seed'
import { fechaLarga, hora } from './format'

export interface Plantilla {
  id: PlantillaId
  nombre: string
  descripcion: string
  /** Etapa a la que avanza el candidato al enviar este correo. */
  destino?: Etapa
  requiereFecha?: boolean
}

export const PLANTILLAS: Plantilla[] = [
  { id: 'recibida', nombre: 'Postulación recibida', descripcion: 'Confirma que su postulación llegó a Trazi.' },
  { id: 'revision', nombre: 'CV en revisión', descripcion: 'Avisa que RRHH está revisando su perfil.', destino: 'revision' },
  { id: 'entrevista', nombre: 'Agendar entrevista', descripcion: 'Propone fecha, hora y tienda.', destino: 'entrevista', requiereFecha: true },
  { id: 'oferta', nombre: 'Oferta de trabajo', descripcion: 'Comunica la oferta y tarifa por hora.', destino: 'oferta' },
  { id: 'rechazo', nombre: 'No continúa en el proceso', descripcion: 'Cierra el proceso con amabilidad.', destino: 'rechazado' },
]

export interface Variables {
  fecha?: string // ISO de la entrevista
  sedeId?: string
}

export function armarCorreo(id: PlantillaId, c: Candidato, v: Variables = {}): { asunto: string; cuerpo: string } {
  const vac = VACANTES.find((x) => x.id === c.vacanteId)
  const puesto = vac?.titulo ?? 'la vacante'
  const sede = sedePorId(v.sedeId ?? c.sedeId)
  const nombre = c.nombre.split(' ')[0]
  const pie = `\n\nUn abrazo,\nEquipo de Talento ${sede.marca === 'PVP' ? 'Plaza Vea' : 'Vivanda'}\nSigue tu proceso con tu folio ${c.folio} en Trazi.`

  switch (id) {
    case 'recibida':
      return {
        asunto: `Recibimos tu postulación a ${puesto}`,
        cuerpo: `Hola ${nombre},\n\nGracias por postular a ${puesto} en ${sede.nombre}. Ya guardamos tu postulación y te avisaremos apenas haya novedades.${pie}`,
      }
    case 'revision':
      return {
        asunto: `Estamos revisando tu CV — ${puesto}`,
        cuerpo: `Hola ${nombre},\n\nTu perfil pasó a revisión con el equipo de ${sede.nombre}. Tendrás noticias en los próximos días.${pie}`,
      }
    case 'entrevista': {
      const cuando = v.fecha ? `${fechaLarga(v.fecha)} a las ${hora(v.fecha)}` : 'la fecha por confirmar'
      return {
        asunto: `Agenda tu entrevista — ${puesto}`,
        cuerpo: `Hola ${nombre},\n\n¡Buenas noticias! Queremos conocerte. Tu entrevista para ${puesto} es el ${cuando} en ${sede.nombre} (${sede.distrito}).\n\nLleva tu DNI y confirma tu asistencia desde Trazi.${pie}`,
      }
    }
    case 'oferta':
      return {
        asunto: `Tenemos una oferta para ti — ${puesto}`,
        cuerpo: `Hola ${nombre},\n\nNos gustó mucho tu entrevista. Te ofrecemos ${puesto} (${vac?.turno ?? 'turno por definir'}) en ${sede.nombre} con una tarifa de S/ ${vac?.tarifaHora.toFixed(2) ?? '—'} por hora.\n\nResponde este correo para aceptar y coordinar tu ingreso.${pie}`,
      }
    case 'rechazo':
      return {
        asunto: `Sobre tu postulación a ${puesto}`,
        cuerpo: `Hola ${nombre},\n\nGracias por tu tiempo. En esta ocasión no continuaremos con tu postulación a ${puesto}, pero conservaremos tu perfil para futuras vacantes.${pie}`,
      }
  }
}
