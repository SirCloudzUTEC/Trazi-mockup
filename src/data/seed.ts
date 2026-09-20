import type { Candidato, Etapa, Sede, Vacante } from '../types'
import { enDias, folio, haceDias } from '../lib/format'

export const SEDES: Sede[] = [
  { id: 'TIENDA-042', nombre: 'Plaza Vea San Isidro', marca: 'PVP', distrito: 'San Isidro' },
  { id: 'TIENDA-015', nombre: 'Plaza Vea Primavera', marca: 'PVP', distrito: 'Surco' },
  { id: 'TIENDA-027', nombre: 'Plaza Vea Los Olivos', marca: 'PVP', distrito: 'Los Olivos' },
  { id: 'TIENDA-033', nombre: 'Plaza Vea San Miguel', marca: 'PVP', distrito: 'San Miguel' },
  { id: 'TIENDA-051', nombre: 'Plaza Vea Independencia', marca: 'PVP', distrito: 'Independencia' },
  { id: 'TIENDA-064', nombre: 'Plaza Vea Callao', marca: 'PVP', distrito: 'Callao' },
  { id: 'TIENDA-101', nombre: 'Vivanda Miraflores', marca: 'VVD', distrito: 'Miraflores' },
  { id: 'TIENDA-108', nombre: 'Vivanda Benavides', marca: 'VVD', distrito: 'Surco' },
  { id: 'TIENDA-112', nombre: 'Vivanda San Borja', marca: 'VVD', distrito: 'San Borja' },
]

export const sedePorId = (id: string): Sede => SEDES.find((s) => s.id === id) ?? SEDES[0]

export const VACANTES: Vacante[] = [
  { id: 'REQ-2041', titulo: 'Cajero/a', sedeId: 'TIENDA-042', turno: 'Part-Time', tarifaHora: 8.5, sinExperiencia: true, requisitos: ['Mayor de 18 años', 'Estudiante o egresado', 'Disponibilidad fines de semana'], publicada: haceDias(6) },
  { id: 'REQ-2042', titulo: 'Reponedor/a', sedeId: 'TIENDA-015', turno: 'Full-Time', tarifaHora: 7.9, sinExperiencia: true, requisitos: ['Secundaria completa', 'Buen estado físico', 'Turno rotativo'], publicada: haceDias(9) },
  { id: 'REQ-2043', titulo: 'Atención al cliente', sedeId: 'TIENDA-101', turno: 'Part-Time', tarifaHora: 9.2, sinExperiencia: false, requisitos: ['Experiencia en atención', 'Trato cordial', 'Disponibilidad tardes'], publicada: haceDias(4) },
  { id: 'REQ-2044', titulo: 'Panadería y pastelería', sedeId: 'TIENDA-027', turno: 'Full-Time', tarifaHora: 9.8, sinExperiencia: false, requisitos: ['Manejo de hornos', 'Carné sanitario vigente'], publicada: haceDias(12) },
  { id: 'REQ-2045', titulo: 'Cajero/a', sedeId: 'TIENDA-033', turno: 'Full-Time', tarifaHora: 8.7, sinExperiencia: true, requisitos: ['Mayor de 18 años', 'Manejo básico de efectivo'], publicada: haceDias(3) },
  { id: 'REQ-2046', titulo: 'Reponedor/a nocturno', sedeId: 'TIENDA-051', turno: 'Part-Time', tarifaHora: 9.5, sinExperiencia: true, requisitos: ['Disponibilidad nocturna', 'Trabajo en equipo'], publicada: haceDias(7) },
  { id: 'REQ-2047', titulo: 'Atención al cliente', sedeId: 'TIENDA-064', turno: 'Part-Time', tarifaHora: 8.4, sinExperiencia: true, requisitos: ['Estudiante universitario', 'Buena comunicación'], publicada: haceDias(2) },
  { id: 'REQ-2048', titulo: 'Cajero/a', sedeId: 'TIENDA-108', turno: 'Part-Time', tarifaHora: 9.4, sinExperiencia: true, requisitos: ['Mayor de 18 años', 'Disponibilidad tardes y fines de semana'], publicada: haceDias(5) },
  { id: 'REQ-2049', titulo: 'Carnicería y charcutería', sedeId: 'TIENDA-112', turno: 'Full-Time', tarifaHora: 10.6, sinExperiencia: false, requisitos: ['Experiencia en corte', 'Carné sanitario vigente'], publicada: haceDias(10) },
  { id: 'REQ-2050', titulo: 'Reponedor/a', sedeId: 'TIENDA-042', turno: 'Part-Time', tarifaHora: 8.1, sinExperiencia: true, requisitos: ['Secundaria completa', 'Disponibilidad mañanas'], publicada: haceDias(1) },
]

const NOMBRES = ['Valeria', 'Diego', 'Camila', 'Renzo', 'Fiorella', 'Mateo', 'Andrea', 'Luis', 'Daniela', 'Jhon', 'Lucía', 'Kevin', 'Milagros', 'Sebastián', 'Rosa', 'Bryan', 'Paola', 'César', 'Nicole', 'Alexander', 'Karen', 'Joaquín', 'Ximena', 'Óscar', 'Yesenia', 'Thiago', 'Brenda', 'Marco', 'Sofía', 'Ángel']
const APELLIDOS = ['Quispe', 'Huamán', 'Flores', 'Ramírez', 'Torres', 'Mendoza', 'Castillo', 'Chávez', 'Rojas', 'Vargas', 'Salazar', 'Paredes', 'Cárdenas', 'Herrera', 'Gutiérrez', 'Cruz', 'Aguilar', 'Zapata', 'Ríos', 'Palomino']

// Reparto por etapa y días en etapa: crea cuellos de botella visibles (entrevistas con +5 días).
const REPARTO: [Etapa, number[]][] = [
  ['recibido', [0, 0, 1, 1, 1, 2, 2, 3, 4, 5, 0, 1]],
  ['revision', [1, 1, 2, 3, 3, 4, 5, 6, 2]],
  ['entrevista', [1, 2, 2, 3, 6, 7, 8, 1]],
  ['oferta', [1, 2, 3, 5]],
  ['contratado', [3, 6, 9, 12, 15]],
  ['rechazado', [2, 5, 8]],
]

function rand(seed: number): number {
  const x = Math.sin(seed * 9973) * 10000
  return x - Math.floor(x)
}

const ETIQUETA: Record<Etapa, string> = {
  recibido: 'Postulación recibida',
  revision: 'CV pasó a revisión',
  entrevista: 'Entrevista agendada',
  oferta: 'Oferta enviada',
  contratado: 'Contratación confirmada',
  rechazado: 'Proceso cerrado',
}

export const CANDIDATO_PROTAGONISTA_ID = 'c-482'

export function crearCandidatos(): Candidato[] {
  const lista: Candidato[] = []
  let n = 0

  // Protagonista de la demo: coincide con el wireframe de context.md.
  lista.push({
    id: CANDIDATO_PROTAGONISTA_ID,
    folio: 'FOLIO-00482-PV',
    nombre: 'Valeria Quispe Rojas',
    dni: '74382915',
    telefono: '987 654 321',
    email: 'valeria.quispe@utec.edu.pe',
    vacanteId: 'REQ-2041',
    sedeId: 'TIENDA-042',
    etapa: 'entrevista',
    fechaEtapa: haceDias(1),
    entrevista: { fecha: enDias(2, 10), sedeId: 'TIENDA-042', confirmada: false },
    historial: [
      { fecha: haceDias(6), texto: 'Postulación recibida' },
      { fecha: haceDias(4), texto: 'CV pasó a revisión' },
      { fecha: haceDias(1), texto: 'Entrevista agendada' },
    ],
  })

  for (const [etapa, dias] of REPARTO) {
    for (const d of dias) {
      n++
      const vac = VACANTES[Math.floor(rand(n + 3) * VACANTES.length)]
      const nombre = NOMBRES[(n * 7) % NOMBRES.length]
      const ap1 = APELLIDOS[(n * 3) % APELLIDOS.length]
      const ap2 = APELLIDOS[(n * 11 + 5) % APELLIDOS.length]
      const sede = sedePorId(vac.sedeId)
      const numero = 400 + n
      const fechaEtapa = haceDias(d)
      const hist = [{ fecha: haceDias(d + 5), texto: 'Postulación recibida' }]
      if (etapa !== 'recibido') hist.push({ fecha: fechaEtapa, texto: ETIQUETA[etapa] })
      lista.push({
        id: `c-${numero}`,
        folio: folio(numero, sede.marca),
        nombre: `${nombre} ${ap1} ${ap2}`,
        dni: String(40000000 + Math.floor(rand(n + 50) * 39999999)),
        telefono: `9${Math.floor(rand(n + 9) * 89 + 10)} ${Math.floor(rand(n + 1) * 899 + 100)} ${Math.floor(rand(n + 2) * 899 + 100)}`,
        email: `${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${ap1.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@correo.pe`,
        vacanteId: vac.id,
        sedeId: vac.sedeId,
        etapa,
        fechaEtapa,
        entrevista: etapa === 'entrevista' ? { fecha: enDias(1 + (n % 4), 9 + (n % 6)), sedeId: vac.sedeId, confirmada: n % 3 === 0 } : undefined,
        historial: hist,
      })
    }
  }
  return lista
}

export interface MesMetricas {
  mes: string
  contrataciones: number
  costo: number
  dias: number
  abandono: number
  porSede: Record<string, number>
}

// Últimos 6 meses (ficticios). El mes actual suma en vivo las contrataciones que RRHH confirme en la demo.
export const HISTORICO: MesMetricas[] = [
  { mes: 'Abr', contrataciones: 58, costo: 2780, dias: 21, abandono: 13, porSede: { PVP: 41, VVD: 17 } },
  { mes: 'May', contrataciones: 61, costo: 2710, dias: 20, abandono: 12, porSede: { PVP: 43, VVD: 18 } },
  { mes: 'Jun', contrataciones: 66, costo: 2650, dias: 20, abandono: 12, porSede: { PVP: 46, VVD: 20 } },
  { mes: 'Jul', contrataciones: 70, costo: 2590, dias: 19, abandono: 11, porSede: { PVP: 49, VVD: 21 } },
  { mes: 'Ago', contrataciones: 74, costo: 2660, dias: 18, abandono: 10, porSede: { PVP: 51, VVD: 23 } },
  { mes: 'Sep', contrataciones: 77, costo: 2450, dias: 17, abandono: 9, porSede: { PVP: 53, VVD: 24 } },
]

/** Contrataciones del mes actual por sede (base ficticia). */
export const CONTRATACIONES_SEDE_BASE: Record<string, number> = {
  'TIENDA-042': 14,
  'TIENDA-015': 11,
  'TIENDA-027': 9,
  'TIENDA-033': 8,
  'TIENDA-051': 6,
  'TIENDA-064': 5,
  'TIENDA-101': 10,
  'TIENDA-108': 8,
  'TIENDA-112': 6,
}
