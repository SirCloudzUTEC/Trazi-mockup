import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2, X } from 'lucide-react'
import { SEDES } from '../../data/seed'
import { useTrazi } from '../../store/useTrazi'
import { Button } from '../../components/ui'
import { haceDias, inputDate } from '../../lib/format'
import type { Reporte } from '../../types'
import { descargarReporte } from '../../lib/reportes'

const campo = 'w-full rounded-lg border border-arena bg-papel px-3 py-2 text-sm font-mono outline-none focus:border-rojo focus:ring-[3px] focus:ring-rojo/15'

export function PanelReporte({ onCerrar }: { onCerrar: () => void }) {
  const generar = useTrazi((s) => s.generarReporte)
  const [desde, setDesde] = useState(inputDate(haceDias(7)))
  const [hasta, setHasta] = useState(inputDate(new Date().toISOString()))
  const [sedes, setSedes] = useState<string[]>([])
  const [formato, setFormato] = useState<'PDF' | 'Excel'>('PDF')
  const [estado, setEstado] = useState<'form' | 'generando' | 'listo'>('form')
  const [reporte, setReporte] = useState<Reporte | null>(null)

  const toggle = (id: string) => setSedes((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const invalido = !desde || !hasta || desde > hasta

  function crear() {
    setEstado('generando')
    setTimeout(() => {
      setReporte(generar({ formato, desde, hasta, sedes }))
      setEstado('listo')
    }, 1400)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-tinta/40" onMouseDown={(e) => e.target === e.currentTarget && estado !== 'generando' && onCerrar()}>
      <aside role="dialog" aria-modal="true" aria-label="Generar reporte" className="flex h-full w-full max-w-[420px] flex-col bg-papel shadow-[0_16px_32px_-4px_rgba(43,36,32,0.14)]">
        <div className="flex items-center justify-between border-b border-arena px-5 py-4">
          <h2 className="text-xl font-semibold">Generar reporte</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-2 text-umbra hover:bg-crema"><X size={18} /></button>
        </div>

        {estado === 'form' && (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-umbra">Desde<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={`${campo} mt-1`} /></label>
                <label className="text-xs font-medium text-umbra">Hasta<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={`${campo} mt-1`} /></label>
              </div>
              {desde > hasta && <p className="-mt-3 text-xs text-rojo-fuerte">La fecha inicial debe ser anterior a la final.</p>}

              <fieldset>
                <legend className="mb-2 text-xs font-medium text-umbra">Sedes <span className="font-normal">({sedes.length === 0 ? 'todas' : sedes.length})</span></legend>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-arena p-2">
                  {SEDES.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-crema">
                      <input type="checkbox" checked={sedes.includes(s.id)} onChange={() => toggle(s.id)} className="h-[18px] w-[18px] accent-rojo" />
                      {s.nombre}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-medium text-umbra">Formato</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['PDF', 'Excel'] as const).map((f) => (
                    <button key={f} onClick={() => setFormato(f)} aria-pressed={formato === f} className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${formato === f ? 'border-rojo bg-rojo/6' : 'border-arena hover:border-tinta'}`}>
                      {f === 'PDF' ? <FileText size={16} /> : <FileSpreadsheet size={16} />} {f}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="border-t border-arena px-5 py-3">
              <Button onClick={crear} disabled={invalido} className="w-full">Generar reporte</Button>
            </div>
          </>
        )}

        {estado === 'generando' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Loader2 className="animate-spin text-rojo" size={32} />
            <p className="font-semibold">Trazi está armando tu reporte…</p>
            <p className="text-sm text-umbra">Reuniendo postulantes, etapas y tiempos.</p>
          </div>
        )}

        {estado === 'listo' && reporte && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-verde/12 text-verde"><Download /></span>
            <div>
              <p className="text-lg font-semibold">Reporte listo</p>
              <p className="mt-1 font-mono text-xs text-umbra">{reporte.nombre} · {reporte.formato === 'PDF' ? 'PDF (simulado)' : 'CSV'}</p>
            </div>
            <Button onClick={() => descargarReporte(reporte)}><Download size={16} /> Descargar</Button>
            <Button variante="ghost" onClick={onCerrar}>Cerrar</Button>
          </div>
        )}
      </aside>
    </div>
  )
}
