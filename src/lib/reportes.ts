import type { Reporte } from '../types'
import { useTrazi } from '../store/useTrazi'
import { ETAPA_LABEL } from './stages'
import { sedePorId, VACANTES } from '../data/seed'

/** Descarga simulada: un CSV real de los candidatos filtrados (el "PDF" es texto de muestra). */
export function descargarReporte(r: Reporte) {
  const { candidatos } = useTrazi.getState()
  const filas = candidatos.filter((c) => r.sedes.length === 0 || r.sedes.includes(c.sedeId))
  let contenido: string
  let ext: string
  let tipo: string
  if (r.formato === 'Excel') {
    const cab = 'Folio;Nombre;DNI;Vacante;Sede;Etapa'
    const cuerpo = filas.map((c) => [c.folio, c.nombre, c.dni, VACANTES.find((v) => v.id === c.vacanteId)?.titulo ?? '', sedePorId(c.sedeId).nombre, ETAPA_LABEL[c.etapa]].join(';'))
    contenido = '﻿' + [cab, ...cuerpo].join('\n')
    ext = 'csv'
    tipo = 'text/csv;charset=utf-8'
  } else {
    contenido = `TRAZI · ${r.nombre}\nPeríodo: ${r.desde} a ${r.hasta}\nCandidatos incluidos: ${filas.length}\n\n(Documento PDF simulado para la maqueta)`
    ext = 'txt'
    tipo = 'text/plain'
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  a.download = `${r.nombre.replace(/\s+/g, '_')}.${ext}`
  a.click()
  URL.revokeObjectURL(a.href)
}
