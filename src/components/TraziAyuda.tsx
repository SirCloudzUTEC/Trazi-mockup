import { useEffect, useRef, useState } from 'react'

export type PoseTrazi = 'saluda' | 'sonrie'
const FOTO: Record<PoseTrazi, string> = {
  saluda: '/trazi-saluda.png',
  sonrie: '/trazi-sonrie.png',
}

export function TraziAvatar({ pose = 'saluda', size = 44, className = '' }: { pose?: PoseTrazi; size?: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full border-[1.5px] border-tinta bg-[#ecebe7] ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={FOTO[pose]}
        alt="Trazi"
        draggable={false}
        className="h-full w-full origin-[50%_30%] scale-[1.55] object-cover"
      />
    </span>
  )
}

/** Nube de ayuda con cola: texto corto dicho por Trazi. */
function Nube({ children, cola = 'izquierda', lado = 'izquierda', className = '' }: { children: React.ReactNode; cola?: 'izquierda' | 'arriba'; lado?: 'izquierda' | 'derecha'; className?: string }) {
  return (
    <div className={`relative rounded-2xl border-[1.5px] border-tinta bg-papel px-3.5 py-2.5 text-sm leading-snug shadow-[3px_3px_0_#2B2420] ${className}`}>
      <span
        aria-hidden
        className={`absolute h-3 w-3 rotate-45 border-tinta bg-papel ${
          cola === 'izquierda' ? '-left-[7px] top-4 border-b-[1.5px] border-l-[1.5px]' : `-top-[7px] border-t-[1.5px] border-l-[1.5px] ${lado === 'izquierda' ? 'left-3' : 'right-3'}`
        }`}
      />
      {children}
    </div>
  )
}

/** Ayuda siempre visible: avatar de Trazi + nube. */
export function TraziAyuda({ children, pose = 'saluda', titulo }: { children: React.ReactNode; pose?: PoseTrazi; titulo?: string }) {
  return (
    <aside className="flex items-start gap-3" aria-label="Ayuda de Trazi">
      <TraziAvatar pose={pose} size={48} />
      <Nube className="flex-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rojo">{titulo ?? 'Trazi te ayuda'}</p>
        <div className="mt-0.5 text-tinta">{children}</div>
      </Nube>
    </aside>
  )
}

/** Punto de ayuda: botón con la carita de Trazi que abre una nube al tocarlo. */
export function TraziPunto({ children, pose = 'saluda', lado = 'izquierda', etiqueta = 'Ayuda de Trazi' }: { children: React.ReactNode; pose?: PoseTrazi; lado?: 'izquierda' | 'derecha'; etiqueta?: string }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierto(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={etiqueta}
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
        className="relative rounded-full transition hover:scale-110"
      >
        <TraziAvatar pose={pose} size={28} />
        <span className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-tinta bg-miel font-mono text-[9px] leading-none font-bold">?</span>
      </button>
      {abierto && (
        <span role="tooltip" className={`absolute top-full z-30 mt-3 block w-64 max-w-[78vw] animate-trazi-in normal-case ${lado === 'izquierda' ? 'left-0' : 'right-0'}`}>
          <Nube cola="arriba" lado={lado} className="font-sans text-sm font-normal tracking-normal text-tinta">
            {children}
          </Nube>
        </span>
      )}
    </span>
  )
}
