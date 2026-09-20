import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Candidato, CorreoEnviado, Etapa, PlantillaId, Reporte, TraziMensaje } from '../types'
import { crearCandidatos, sedePorId, VACANTES } from '../data/seed'
import { ETAPA_LABEL } from '../lib/stages'
import { enDias, folio } from '../lib/format'
import { armarCorreo, PLANTILLAS } from '../lib/correos'

interface PostularInput {
  nombre: string
  dni: string
  telefono: string
  email: string
  cv?: string
  vacanteId: string
}

interface EnviarInput {
  ids: string[]
  plantilla: PlantillaId
  fecha?: string
  sedeId?: string
  /** Si se editó el texto en el modal, se usa tal cual para un único destinatario. */
  asunto?: string
  cuerpo?: string
}

interface ReporteInput {
  formato: 'PDF' | 'Excel'
  desde: string
  hasta: string
  sedes: string[]
}

interface State {
  candidatos: Candidato[]
  correos: CorreoEnviado[]
  reportes: Reporte[]
  miPostulacionId: string
  toasts: TraziMensaje[]

  notify: (texto: string) => void
  dismissToast: (id: string) => void
  postular: (i: PostularInput) => string
  moverEtapa: (id: string, etapa: Etapa, nota?: string) => void
  avanzarPostulacion: (id: string) => void
  enviarCorreo: (i: EnviarInput) => void
  confirmarEntrevista: (id: string) => void
  generarReporte: (i: ReporteInput) => Reporte
  elegirPostulacion: (id: string) => void
  reset: () => void
}

let toastSeq = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`

export const useTrazi = create<State>()(
  persist(
    (set, get) => ({
      candidatos: crearCandidatos(),
      correos: [],
      reportes: [],
      miPostulacionId: '',
      toasts: [],

      notify: (texto) => {
        if (get().toasts.some((t) => t.texto === texto)) return
        const id = `t-${++toastSeq}`
        set((s) => ({ toasts: [...s.toasts.slice(-1), { id, texto }] }))
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      postular: (i) => {
        const vac = VACANTES.find((v) => v.id === i.vacanteId) ?? VACANTES[0]
        const sede = sedePorId(vac.sedeId)
        const numero = 500 + get().candidatos.length
        const ahora = new Date().toISOString()
        const nuevo: Candidato = {
          id: uid('c'),
          folio: folio(numero, sede.marca),
          nombre: i.nombre,
          dni: i.dni,
          telefono: i.telefono,
          email: i.email,
          cv: i.cv,
          vacanteId: vac.id,
          sedeId: vac.sedeId,
          etapa: 'recibido',
          fechaEtapa: ahora,
          historial: [{ fecha: ahora, texto: 'Postulación recibida' }],
          propia: true,
        }
        set((s) => ({ candidatos: [nuevo, ...s.candidatos], miPostulacionId: nuevo.id }))
        get().notify('Trazi guardó tu postulación. Te avisamos apenas haya novedades.')
        return nuevo.id
      },

      moverEtapa: (id, etapa, nota) => {
        const c = get().candidatos.find((x) => x.id === id)
        if (!c || c.etapa === etapa) return
        const ahora = new Date().toISOString()
        set((s) => ({
          candidatos: s.candidatos.map((x) =>
            x.id === id
              ? { ...x, etapa, fechaEtapa: ahora, historial: [...x.historial, { fecha: ahora, texto: nota ?? `Pasó a ${ETAPA_LABEL[etapa]}` }] }
              : x,
          ),
        }))
        const primero = c.nombre.split(' ')[0]
        get().notify(id === get().miPostulacionId ? `Tu postulación avanzó a ${ETAPA_LABEL[etapa]}.` : `${primero} avanzó a ${ETAPA_LABEL[etapa]}.`)
      },

      /** Avanza la postulación propia a la siguiente etapa (demo en vivo). */
      avanzarPostulacion: (id) => {
        const c = get().candidatos.find((x) => x.id === id)
        if (!c) return
        const siguiente: Partial<Record<Etapa, Etapa>> = { recibido: 'revision', revision: 'entrevista' }
        const etapa = siguiente[c.etapa]
        if (!etapa) return
        if (etapa === 'entrevista') {
          set((s) => ({ candidatos: s.candidatos.map((x) => (x.id === id ? { ...x, entrevista: { fecha: enDias(2, 10), sedeId: x.sedeId, confirmada: false } } : x)) }))
        }
        get().moverEtapa(id, etapa)
      },

      enviarCorreo: ({ ids, plantilla, fecha, sedeId, asunto, cuerpo }) => {
        const p = PLANTILLAS.find((x) => x.id === plantilla)
        if (!p) return
        const ahora = new Date().toISOString()
        const nuevos: CorreoEnviado[] = []
        set((s) => {
          const candidatos = s.candidatos.map((c) => {
            if (!ids.includes(c.id)) return c
            const armado = armarCorreo(plantilla, c, { fecha, sedeId })
            nuevos.push({
              id: uid('m'),
              candidatoId: c.id,
              plantilla,
              asunto: ids.length === 1 && asunto ? asunto : armado.asunto,
              cuerpo: ids.length === 1 && cuerpo ? cuerpo : armado.cuerpo,
              fecha: ahora,
            })
            let actualizado: Candidato = {
              ...c,
              historial: [...c.historial, { fecha: ahora, texto: `Correo enviado: ${p.nombre}` }],
            }
            if (p.destino && c.etapa !== p.destino) {
              actualizado = {
                ...actualizado,
                etapa: p.destino,
                fechaEtapa: ahora,
                historial: [...actualizado.historial, { fecha: ahora, texto: `Pasó a ${ETAPA_LABEL[p.destino]}` }],
              }
            }
            if (plantilla === 'entrevista' && fecha) {
              actualizado.entrevista = { fecha, sedeId: sedeId ?? c.sedeId, confirmada: false }
            }
            return actualizado
          })
          return { candidatos, correos: [...nuevos, ...s.correos] }
        })
        get().notify(ids.length === 1 ? `Correo «${p.nombre}» enviado.` : `${ids.length} correos «${p.nombre}» enviados.`)
      },

      confirmarEntrevista: (id) => {
        set((s) => ({
          candidatos: s.candidatos.map((c) =>
            c.id === id && c.entrevista
              ? {
                  ...c,
                  entrevista: { ...c.entrevista, confirmada: true },
                  historial: [...c.historial, { fecha: new Date().toISOString(), texto: 'Asistencia a entrevista confirmada' }],
                }
              : c,
          ),
        }))
        get().notify('¡Vas bien! Confirmaste tu asistencia a la entrevista.')
      },

      generarReporte: (i) => {
        const r: Reporte = {
          id: uid('r'),
          nombre: `Reporte de reclutamiento ${i.desde} a ${i.hasta}`,
          formato: i.formato,
          desde: i.desde,
          hasta: i.hasta,
          sedes: i.sedes,
          fecha: new Date().toISOString(),
        }
        set((s) => ({ reportes: [r, ...s.reportes] }))
        get().notify('Reporte listo. Lo dejé en tu bandeja de descargas.')
        return r
      },

      elegirPostulacion: (id) => set({ miPostulacionId: id }),

      reset: () =>
        set({ candidatos: crearCandidatos(), correos: [], reportes: [], miPostulacionId: '', toasts: [] }),
    }),
    {
      name: 'trazi-demo-v1',
      partialize: (s) => ({
        candidatos: s.candidatos,
        correos: s.correos,
        reportes: s.reportes,
        miPostulacionId: s.miPostulacionId,
      }),
    },
  ),
)
