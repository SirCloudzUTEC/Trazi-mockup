import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTrazi } from '../store/useTrazi'
import { TraziAvatar } from './TraziAyuda'

function Toast({ id, texto }: { id: string; texto: string }) {
  const dismiss = useTrazi((s) => s.dismissToast)
  useEffect(() => {
    const t = setTimeout(() => dismiss(id), 5200)
    return () => clearTimeout(t)
  }, [id, dismiss])
  return (
    <div
      role="status"
      className="pointer-events-auto flex animate-trazi-in items-start gap-3 rounded-lg border-[1.5px] border-tinta bg-papel p-3 pr-2 shadow-[3px_3px_0_#2B2420]"
    >
      <TraziAvatar pose="saluda" size={36} />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rojo">Trazi</p>
        <p className="text-sm leading-snug text-tinta">{texto}</p>
      </div>
      <button aria-label="Cerrar aviso" onClick={() => dismiss(id)} className="rounded p-1 text-umbra hover:bg-crema">
        <X size={14} />
      </button>
    </div>
  )
}

export function TraziToaster() {
  const toasts = useTrazi((s) => s.toasts)
  return (
    <div className="no-print pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  )
}
