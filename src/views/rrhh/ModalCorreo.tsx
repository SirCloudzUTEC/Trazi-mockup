import { useEffect, useState } from 'react'
import { Loader2, Send, X } from 'lucide-react'
import type { PlantillaId } from '../../types'
import { PLANTILLAS, armarCorreo } from '../../lib/correos'
import { SEDES, sedePorId } from '../../data/seed'
import { useTrazi } from '../../store/useTrazi'
import { Button } from '../../components/ui'
import { enDias, inputDate } from '../../lib/format'
import { ETAPA_LABEL } from '../../lib/stages'

interface Props {
  ids: string[]
  plantillaInicial?: PlantillaId
  onCerrar: () => void
}

const campo = 'w-full rounded-lg border border-arena bg-papel px-3 py-2 text-sm outline-none focus:border-rojo focus:ring-[3px] focus:ring-rojo/15'

export function ModalCorreo({ ids, plantillaInicial = 'recibida', onCerrar }: Props) {
  const candidatos = useTrazi((s) => s.candidatos)
  const enviar = useTrazi((s) => s.enviarCorreo)
  const destinatarios = candidatos.filter((c) => ids.includes(c.id))
  const primero = destinatarios[0]

  const [plantilla, setPlantilla] = useState<PlantillaId>(plantillaInicial)
  const [dia, setDia] = useState(inputDate(enDias(2)))
  const [horaSel, setHoraSel] = useState('10:00')
  const [sedeId, setSedeId] = useState(primero?.sedeId ?? SEDES[0].id)
  const [enviando, setEnviando] = useState(false)
  const [editado, setEditado] = useState<{ clave: string; asunto: string; cuerpo: string } | null>(null)

  const def = PLANTILLAS.find((p) => p.id === plantilla)!
  const fechaIso = new Date(`${dia}T${horaSel}:00`).toISOString()
  const vars = def.requiereFecha ? { fecha: fechaIso, sedeId } : {}
  const base = primero ? armarCorreo(plantilla, primero, vars) : { asunto: '', cuerpo: '' }

  // La edición manual solo vale mientras no cambien plantilla, fecha o tienda, para no mandar texto desfasado.
  const clave = `${plantilla}|${fechaIso}|${sedeId}`
  const texto = editado?.clave === clave ? editado : base
  const editar = (parte: Partial<typeof base>) => setEditado({ clave, ...texto, ...parte })

  useEffect(() => {
    const cerrar = (e: KeyboardEvent) => e.key === 'Escape' && !enviando && onCerrar()
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [onCerrar, enviando])

  if (!primero) return null
  const unico = destinatarios.length === 1

  function confirmar() {
    setEnviando(true)
    setTimeout(() => {
      enviar({
        ids,
        plantilla,
        fecha: def.requiereFecha ? fechaIso : undefined,
        sedeId: def.requiereFecha ? sedeId : undefined,
        asunto: unico ? texto.asunto : undefined,
        cuerpo: unico ? texto.cuerpo : undefined,
      })
      onCerrar()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !enviando && onCerrar()}>
      <div role="dialog" aria-modal="true" aria-label="Enviar correo" className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-3xl bg-papel shadow-[0_16px_32px_-4px_rgba(43,36,32,0.14)] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-arena px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">Enviar correo</h2>
            <p className="text-sm text-umbra">Envío simulado · no se manda ningún correo real</p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-2 text-umbra hover:bg-crema"><X size={18} /></button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <span className="mb-1 block text-xs font-medium text-umbra">Para</span>
            <div className="flex flex-wrap gap-1.5">
              {destinatarios.slice(0, 6).map((c) => (
                <span key={c.id} className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-medium">{c.nombre}</span>
              ))}
              {destinatarios.length > 6 && <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs">+{destinatarios.length - 6} más</span>}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-umbra">Plantilla</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlantilla(p.id)}
                  aria-pressed={plantilla === p.id}
                  className={`rounded-lg border p-2.5 text-left transition ${plantilla === p.id ? 'border-rojo bg-rojo/6' : 'border-arena hover:border-tinta'}`}
                >
                  <span className="block text-sm font-semibold">{p.nombre}</span>
                  <span className="block text-xs text-umbra">{p.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          {def.requiereFecha && (
            <div className="grid gap-3 rounded-lg bg-crema p-3 sm:grid-cols-3">
              <label className="text-xs font-medium text-umbra">Fecha
                <input type="date" value={dia} min={inputDate(new Date().toISOString())} onChange={(e) => setDia(e.target.value)} className={`${campo} mt-1 font-mono`} />
              </label>
              <label className="text-xs font-medium text-umbra">Hora
                <input type="time" value={horaSel} onChange={(e) => setHoraSel(e.target.value)} className={`${campo} mt-1 font-mono`} />
              </label>
              <label className="text-xs font-medium text-umbra">Tienda
                <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} className={`${campo} mt-1`}>
                  {SEDES.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
            </div>
          )}

          <div>
            <span className="mb-1 block text-xs font-medium text-umbra">
              Vista previa {!unico && <span className="text-umbra">(ejemplo con {primero.nombre.split(' ')[0]}; cada persona recibe su versión)</span>}
            </span>
            <input aria-label="Asunto" value={texto.asunto} readOnly={!unico} onChange={(e) => editar({ asunto: e.target.value })} className={`${campo} mb-2 font-semibold`} />
            <textarea aria-label="Cuerpo del correo" rows={9} value={texto.cuerpo} readOnly={!unico} onChange={(e) => editar({ cuerpo: e.target.value })} className={`${campo} resize-none leading-relaxed`} />
            {def.destino && <p className="mt-1.5 text-xs text-umbra">Al enviar, la postulación pasará a <b>{ETAPA_LABEL[def.destino]}</b> y el postulante lo verá en Trazi.</p>}
            {plantilla === 'entrevista' && <p className="mt-1 text-xs text-umbra">Tienda: {sedePorId(sedeId).nombre}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-arena px-5 py-3">
          <Button variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Button>
          <Button onClick={confirmar} disabled={enviando || (def.requiereFecha && !dia)}>
            {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {enviando ? 'Enviando…' : `Enviar${destinatarios.length > 1 ? ` a ${destinatarios.length}` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
