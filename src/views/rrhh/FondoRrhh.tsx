import { useTrazi } from '../../store/useTrazi'
import { ETAPAS } from '../../lib/stages'
import { conteoPorEtapa, excedeSla } from '../../lib/metrics'

const K = 0.866
const S = 22

/** Proyección isométrica: x baja a la derecha, y baja a la izquierda, z sube. */
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * K * S, (x + y) * 0.5 * S - z * S]
const pts = (ps: [number, number][]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')

function Prisma({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) {
  const top = pts([iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)])
  const izq = pts([iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)])
  const der = pts([iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)])
  return (
    <g stroke="#2B2420" strokeOpacity="0.32" strokeWidth="1" strokeLinejoin="round">
      <polygon points={izq} fill="#2B2420" fillOpacity="0.05" />
      <polygon points={der} fill="#2B2420" fillOpacity="0.1" />
      <polygon points={top} fill="#FFFFFF" fillOpacity="0.6" />
    </g>
  )
}

const COLOR = { rojo: '#E4572E', miel: '#FFC857', verde: '#3A7D63', gris: '#A69A8C' }

/**
 * Plano isométrico de tienda: cada góndola es una etapa del proceso (las cajas registradoras son «Contratado»).
 * El número de cada góndola es el mismo conteo de la línea superior; el color indica cuántos casos llevan demora.
 */
const FILAS: { etapa: 'recibido' | 'revision' | 'entrevista' | 'oferta'; y: number; x: number }[] = [
  { etapa: 'recibido', y: 0.8, x: 7 },
  { etapa: 'revision', y: 2.3, x: 3 },
  { etapa: 'entrevista', y: 3.8, x: 7 },
  { etapa: 'oferta', y: 5.3, x: 3 },
]

function PlanoTienda() {
  const candidatos = useTrazi((s) => s.candidatos)
  const cont = conteoPorEtapa(candidatos)
  const puntos = [
    ...FILAS.map((f) => ({ ...f, z: 2.05, ax: f.x, ay: f.y + 0.35, base: 1 })),
    { etapa: 'contratado' as const, y: 6.7, x: 5, z: 1.7, ax: 5, ay: 7, base: 0.6 },
  ].map((f) => {
    const demorados = candidatos.filter((c) => c.etapa === f.etapa && excedeSla(c)).length
    const color = f.etapa === 'contratado' ? COLOR.verde : cont[f.etapa] === 0 ? COLOR.gris : demorados >= 2 ? COLOR.rojo : demorados === 1 ? COLOR.miel : COLOR.verde
    return { ...f, color, alerta: f.etapa !== 'contratado' && demorados >= 2, nombre: ETAPAS.find((e) => e.id === f.etapa)?.corto ?? '' }
  })
  const suelo = pts([iso(0, 0), iso(10, 0), iso(10, 8), iso(0, 8)])
  return (
    <div className="flex flex-col items-end">
      <p className="mb-1 flex items-center gap-4 font-mono text-[11px] font-bold tracking-[0.05em] text-tinta/80 uppercase">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-tinta/40" style={{ background: COLOR.rojo }} />Con demora</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-tinta/40" style={{ background: COLOR.miel }} />Atención</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-tinta/40" style={{ background: COLOR.verde }} />Al día</span>
      </p>
      <svg viewBox="-160 -58 380 262" className="w-[300px]" role="img" aria-label="Plano de tienda: cada góndola es una etapa y muestra cuántos candidatos hay en ella">
        <polygon points={suelo} fill="#FFFBF3" fillOpacity="0.7" stroke="#2B2420" strokeOpacity="0.3" />
        {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
          <g key={i} stroke="#2B2420" strokeOpacity="0.07">
            <line x1={iso(i, 0)[0]} y1={iso(i, 0)[1]} x2={iso(i, 8)[0]} y2={iso(i, 8)[1]} />
            {i <= 7 && <line x1={iso(0, i)[0]} y1={iso(0, i)[1]} x2={iso(10, i)[0]} y2={iso(10, i)[1]} />}
          </g>
        ))}
        {FILAS.map((f) => <Prisma key={f.etapa} x={1} y={f.y} w={8} d={0.7} h={1} />)}
        {[1.5, 3.2, 4.9, 6.6].map((x) => <Prisma key={x} x={x} y={6.7} w={0.9} d={0.6} h={0.6} />)}
        {puntos.map((p) => {
          const [bx, by] = iso(p.ax, p.ay, p.base)
          const [tx, ty] = iso(p.ax, p.ay, p.z)
          const claro = p.color === COLOR.miel || p.color === COLOR.gris
          return (
            <g key={p.etapa}>
              <line x1={bx} y1={by} x2={tx} y2={ty + 9} stroke="#2B2420" strokeOpacity="0.4" strokeDasharray="2 2" />
              {p.alerta && <circle cx={tx} cy={ty} r="9.5" fill={p.color} className="dot-ping" />}
              <circle cx={tx} cy={ty} r="9.5" fill={p.color} stroke="#2B2420" strokeOpacity="0.7" strokeWidth="1.2" />
              <text x={tx} y={ty + 3.8} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Space Mono, monospace" fill={claro ? '#2B2420' : '#FFFFFF'}>{cont[p.etapa]}</text>
              <text x={tx + 14} y={ty + 3} fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="Space Mono, monospace" fill="#2B2420" fillOpacity="0.75">{p.nombre.toUpperCase()}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Hilo de trazabilidad: el nodo y la línea del logo recorren las etapas, con el conteo real de cada una. */
function FlujoTraza() {
  const candidatos = useTrazi((s) => s.candidatos)
  const cont = conteoPorEtapa(candidatos)
  const relleno: Record<string, string> = { recibido: 'bg-rojo/75', revision: 'bg-rojo/55', entrevista: 'bg-miel', oferta: 'bg-rojo/35', contratado: 'bg-verde' }
  return (
    <div className="flex items-center gap-3 font-mono text-[11.5px] font-bold tracking-[0.08em] text-tinta/80 uppercase">
      {ETAPAS.map((e, i) => (
        <div key={e.id} className={`flex items-center gap-3 ${i < ETAPAS.length - 1 ? 'flex-1' : ''}`}>
          <span className="flex shrink-0 items-center gap-2">
            <i className={`h-3.5 w-3.5 rounded-full border-[1.5px] border-tinta/50 ${relleno[e.id]}`} />
            {e.corto}
            <b className="rounded-full bg-papel/85 px-1.5 py-px text-[11px] text-tinta shadow-[0_0_0_1px_rgba(43,36,32,0.12)]">{cont[e.id]}</b>
          </span>
          {i < ETAPAS.length - 1 && <span className="h-0 flex-1 border-t-2 border-dashed border-tinta/35" />}
        </div>
      ))}
    </div>
  )
}

/** Capa decorativa de RRHH: papel milimetrado, hilo de etapas y plano de tienda con las sedes en vivo. */
export function FondoRrhh() {
  return (
    <div aria-hidden className="no-print pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(43,36,32,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(43,36,32,0.022) 1px, transparent 1px), linear-gradient(rgba(43,36,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(43,36,32,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[460px]" style={{ background: 'radial-gradient(55% 100% at 50% 0%, rgba(255,200,87,0.26), transparent 70%)' }} />
      <div className="absolute inset-x-0 top-0 mx-auto hidden h-[340px] max-w-[1440px] px-10 lg:block">
        <div className="pt-3"><FlujoTraza /></div>
        <div className="absolute top-11 right-[200px]"><PlanoTienda /></div>
      </div>
    </div>
  )
}
