import { VACANTES, sedePorId } from '../../data/seed'

/** Ilustraciones de línea fina de tienda; el trazo hereda `currentColor`. */
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Carrito({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} {...base} aria-hidden>
      <path d="M6 12h16l12 54h56l10-42H28" />
      <path d="M44 28v28M60 28v28M76 28v28" />
      <circle cx="42" cy="86" r="8" />
      <circle cx="84" cy="86" r="8" />
    </svg>
  )
}

function Caja({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} {...base} aria-hidden>
      <rect x="30" y="8" width="52" height="30" rx="4" />
      <path d="M40 22h32" />
      <path d="M16 96V58l10-16h68l10 16v38z" />
      <path d="M16 58h88" />
      <circle cx="38" cy="72" r="3" /><circle cx="52" cy="72" r="3" /><circle cx="66" cy="72" r="3" /><circle cx="80" cy="72" r="3" />
      <path d="M30 86h60" />
    </svg>
  )
}

function Estante({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 110" className={className} {...base} aria-hidden>
      <path d="M6 44h118M6 84h118M10 8v100M120 8v100" />
      <rect x="20" y="20" width="14" height="24" rx="3" /><rect x="40" y="14" width="18" height="30" rx="2" />
      <rect x="66" y="24" width="14" height="20" rx="7" /><rect x="88" y="18" width="20" height="26" rx="2" />
      <rect x="22" y="58" width="20" height="26" rx="2" /><rect x="50" y="64" width="14" height="20" rx="7" />
      <rect x="74" y="56" width="16" height="28" rx="3" /><rect x="96" y="66" width="16" height="18" rx="2" />
    </svg>
  )
}

function Bolsa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 120" className={className} {...base} aria-hidden>
      <path d="M22 36h66l6 74H16z" />
      <path d="M38 36c0-26 34-26 34 0" />
      <circle cx="55" cy="72" r="15" />
      <path d="M48 65h14M55 65v16" />
    </svg>
  )
}

function Etiqueta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} {...base} aria-hidden>
      <path d="M8 40 30 10h82v60H30z" />
      <circle cx="30" cy="40" r="4" />
      <path d="M52 30h44M52 44h30M52 56h38" />
    </svg>
  )
}

/** Tira continua de papel de boleta con las vacantes reales como renglones. */
function Tira({ lado }: { lado: 'izq' | 'der' }) {
  const bloque = VACANTES.map((v) => {
    const sede = sedePorId(v.sedeId)
    const nombre = v.titulo.toUpperCase().slice(0, 18)
    const precio = v.tarifaHora.toFixed(2)
    return { id: v.id, linea: `${nombre.padEnd(18, '.')} ${precio}`, sede: `${sede.id} ${sede.distrito.toUpperCase()}` }
  })
  const repeticiones = [0, 1, 2, 3]
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 bottom-0 hidden w-[210px] overflow-hidden lg:block ${lado === 'izq' ? 'left-[-18px] rotate-[1.2deg]' : 'right-[-18px] -rotate-[1.2deg]'}`}
      style={{ maskImage: 'linear-gradient(to bottom, #000 0, #000 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 0, #000 88%, transparent 100%)' }}
    >
      <div className="saw-bottom mx-auto h-full w-[178px] border-x-[1.5px] border-dashed border-perfora bg-papel/70 px-3 pt-16 font-mono text-[9.5px] leading-[15px] tracking-[0.04em] whitespace-pre text-tinta/[0.30]">
        {repeticiones.map((r) => (
          <div key={r} className="pb-8">
            <p className="text-center font-bold">** PLAZA VEA · TRAZI **</p>
            <p className="text-center">FOLIO-{String(482 + r * 17 + (lado === 'izq' ? 0 : 5)).padStart(5, '0')}-PV</p>
            <p className="my-1.5 border-t-[1.5px] border-dashed border-perfora" />
            {bloque.map((b) => (
              <div key={b.id}>
                <p>{b.linea}</p>
                <p className="text-tinta/[0.55]">  {b.sede}</p>
              </div>
            ))}
            <p className="my-1.5 border-t-[1.5px] border-dashed border-perfora" />
            <p className="font-bold">VACANTES ABIERTAS ......... 10</p>
            <p>GRACIAS POR POSTULAR</p>
            <div
              className="mt-3 h-11 w-full"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2B2420 0 2px, transparent 2px 4px, #2B2420 4px 5px, transparent 5px 9px, #2B2420 9px 12px, transparent 12px 14px)', opacity: 0.55 }}
            />
            <p className="mt-1 text-center">7 750482 {lado === 'izq' ? '000124' : '000731'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Capa decorativa detrás de la pantalla de inicio: puntos de papel y tiras de boleta a los lados. */
export function FondoInicio() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(43,36,32,0.10) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <div className="absolute inset-x-0 top-0 h-[520px]" style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,200,87,0.28), transparent 70%)' }} />
      <Tira lado="izq" />
      <Tira lado="der" />
    </div>
  )
}

/** Hilera de ilustraciones sobre una repisa: separa secciones con el motivo de tienda. */
export function Gondola({ titulo }: { titulo: string }) {
  const ico = 'h-14 w-auto text-tinta/45 sm:h-[72px]'
  return (
    <div aria-hidden className="mt-10">
      <div className="flex items-end justify-between gap-2 px-2 sm:px-6">
        <Carrito className={`${ico} -rotate-3`} />
        <Estante className={`${ico} hidden sm:block`} />
        <Caja className={`${ico} rotate-2`} />
        <Bolsa className={`${ico} -rotate-2`} />
        <Etiqueta className={`${ico} hidden sm:block rotate-3`} />
      </div>
      <div className="mt-1 h-[3px] rounded-full bg-tinta/25" />
      <p className="mt-1.5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-tinta/50">{titulo}</p>
    </div>
  )
}
