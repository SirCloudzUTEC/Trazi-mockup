import { SEDES } from '../../data/seed'

/** Grano de papel: ruido fractal casi imperceptible. */
const GRANO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .17  0 0 0 0 .14  0 0 0 0 .12  .55 0 0 0 -.12'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

/** Curva cerrada suave (tipo curva de nivel) alrededor de (cx, cy). */
function curva(cx: number, cy: number, R: number, fase: number): string {
  const n = 40
  const p = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    const r = R * (1 + 0.17 * Math.sin(2 * t + fase) + 0.09 * Math.sin(3 * t + 1.7 + fase * 0.6) + 0.05 * Math.sin(5 * t + 0.4))
    return [cx + r * Math.cos(t), cy + r * 0.82 * Math.sin(t)] as const
  })
  const mid = (a: readonly [number, number], b: readonly [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(p[n - 1], p[0])
  let d = `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const a = p[i]
    const m = mid(a, p[(i + 1) % n])
    d += ` Q${a[0].toFixed(1)},${a[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`
  }
  return d + 'Z'
}

const ANILLOS = Array.from({ length: 13 }, (_, k) => k + 1)

function CurvasDeNivel({ className, fase }: { className: string; fase: number }) {
  return (
    <svg viewBox="0 0 640 540" className={className} fill="none" stroke="#2B2420" strokeWidth="1">
      {ANILLOS.map((k) => (
        <path key={k} d={curva(320, 270, 22 + k * 22, fase + k * 0.07)} strokeOpacity={k % 4 === 0 ? 0.11 : 0.065} />
      ))}
    </svg>
  )
}

/** Fondo editorial de Dirección: papel con grano, doble filete de margen y curvas de nivel en las esquinas. */
export function FondoDireccion() {
  return (
    <div aria-hidden className="no-print pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: GRANO, backgroundSize: '180px 180px', opacity: 0.6 }} />
      <div className="absolute inset-x-0 top-0 h-[420px]" style={{ background: 'radial-gradient(60% 100% at 20% 0%, rgba(255,255,255,0.75), transparent 70%)' }} />
      <CurvasDeNivel fase={0.4} className="absolute -top-28 -right-40 w-[720px]" />
      <CurvasDeNivel fase={2.3} className="absolute -bottom-24 -left-44 w-[640px]" />

      <div className="absolute inset-0 mx-auto hidden max-w-[1440px] xl:block">
        <span className="absolute top-0 bottom-0 left-[12px] w-px bg-tinta/[0.10]" />
        <span className="absolute top-0 bottom-0 left-[18px] w-[5px]" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(43,36,32,0.16) 0 1px, transparent 1px 12px)' }} />
        <span className="absolute top-0 right-[12px] bottom-0 w-px bg-tinta/[0.10]" />
        <p className="absolute top-32 left-[30px] origin-top-left rotate-90 font-mono text-[10px] tracking-[0.22em] whitespace-nowrap text-tinta/35 uppercase">
          Trazi · Informe ejecutivo · Septiembre
        </p>
      </div>
    </div>
  )
}

/** Silueta abstracta de Lima con las 9 tiendas; el tamaño de cada punto sigue las contrataciones del mes. */
const POSICION: Record<string, [number, number, string]> = {
  'TIENDA-027': [170, 45, 'Los Olivos'],
  'TIENDA-051': [235, 72, 'Independencia'],
  'TIENDA-064': [98, 108, 'Callao'],
  'TIENDA-033': [142, 138, 'San Miguel'],
  'TIENDA-042': [208, 162, 'San Isidro'],
  'TIENDA-101': [168, 212, 'Miraflores'],
  'TIENDA-112': [256, 198, 'San Borja'],
  'TIENDA-015': [262, 252, 'Surco'],
  'TIENDA-108': [214, 258, 'Surco'],
}

export function MapaSedes({ porSede }: { porSede: Record<string, number> }) {
  return (
    <svg aria-hidden viewBox="0 0 320 300" className="pointer-events-none absolute top-14 right-2 bottom-2 z-0 hidden h-[calc(100%-4rem)] w-auto sm:block" fill="none">
      <path d="M72 0 H310 V300 H120 C132 246 92 208 112 176 C62 154 74 94 44 72 C32 42 58 20 72 0Z" fill="#2B2420" fillOpacity="0.02" stroke="#2B2420" strokeOpacity="0.12" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${34 - i * 9} ${70 + i * 8} C ${18 - i * 9} ${110 + i * 8} ${40 - i * 9} ${150 + i * 8} ${28 - i * 9} ${210 + i * 8}`} stroke="#2B2420" strokeOpacity={0.12 - i * 0.03} strokeDasharray="3 4" />
      ))}
      <text x="8" y="284" fontSize="7" fontFamily="Space Mono, monospace" letterSpacing="1.5" fill="#2B2420" fillOpacity="0.35">OCÉANO PACÍFICO</text>
      {SEDES.map((s) => {
        const [x, y, nombre] = POSICION[s.id]
        const r = 3.5 + Math.sqrt(porSede[s.id] ?? 0) * 1.5
        const c = s.marca === 'PVP' ? '#E4572E' : '#FFC857'
        return (
          <g key={s.id}>
            <circle cx={x} cy={y} r={r} fill={c} fillOpacity="0.16" stroke={c} strokeOpacity="0.42" />
            <text x={x + r + 3} y={y + 2.5} fontSize="7" fontFamily="Space Mono, monospace" fill="#2B2420" fillOpacity="0.3">{nombre}</text>
          </g>
        )
      })}
    </svg>
  )
}
