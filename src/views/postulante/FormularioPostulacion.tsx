import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, Paperclip } from 'lucide-react'
import type { Vacante } from '../../types'
import { sedePorId } from '../../data/seed'
import { BrandFlag, TicketButton } from '../../components/ui'
import { TraziPunto } from '../../components/TraziAyuda'
import { soles } from '../../lib/format'
import { HeroSeccion } from './HeroSeccion'
import { Gondola } from './FondoInicio'

interface Props {
  vacante: Vacante
  onVolver: () => void
  onEnviar: (d: { nombre: string; dni: string; telefono: string; email: string; cv?: string }) => void
}

const campo =
  'w-full rounded-[4px] border-[1.5px] border-tinta bg-papel px-3 py-2.5 text-sm outline-none focus:border-rojo focus:ring-2 focus:ring-rojo/25'
const etiqueta = 'mb-1 block font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-tinta'

export function FormularioPostulacion({ vacante, onVolver, onEnviar }: Props) {
  const sede = sedePorId(vacante.sedeId)
  const [v, setV] = useState({ nombre: '', dni: '', telefono: '', email: '' })
  const [cv, setCv] = useState<string | null>(null)
  const [acepta, setAcepta] = useState(false)
  const [intento, setIntento] = useState(false)
  const tearRef = useRef<HTMLDivElement>(null)
  const [notchY, setNotchY] = useState(140)

  // Alinea la muesca lateral con la línea de corte que separa los datos de la autorización.
  useLayoutEffect(() => {
    const medir = () => tearRef.current && setNotchY(tearRef.current.offsetTop)
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  const errores = {
    nombre: v.nombre.trim().split(/\s+/).length < 2 ? 'Escribe nombre y apellido' : '',
    dni: /^\d{8}$/.test(v.dni) ? '' : 'El DNI tiene 8 dígitos',
    telefono: /^\d{9}$/.test(v.telefono.replace(/\s/g, '')) ? '' : 'El celular tiene 9 dígitos',
    email: /^\S+@\S+\.\S+$/.test(v.email) ? '' : 'Correo no válido',
  }
  const ok = Object.values(errores).every((e) => !e) && acepta

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value })

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setIntento(true)
    if (!ok) return
    onEnviar({ ...v, telefono: v.telefono.replace(/\s/g, ''), cv: cv ?? undefined })
  }

  const err = (k: keyof typeof errores) => intento && errores[k] && <p className="mt-1 font-mono text-[11px] text-rojo-fuerte">{errores[k]}</p>

  return (
    <section>
      <button onClick={onVolver} className="mb-4 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.04em] text-umbra hover:text-rojo">
        <ArrowLeft size={14} /> Volver a las ofertas
      </button>
      <HeroSeccion
        eyebrow={`Postulación · ${vacante.id}`}
        titulo={<>Postula a {vacante.titulo}</>}
        tituloNube="Solo 2 minutos"
        mensaje={<>Completa tus datos y listo. Toca la carita con <b>«?»</b> junto a cada campo si necesitas ayuda.</>}
        franja={[sede.nombre, vacante.turno, `${soles(vacante.tarifaHora, 2)}/h`]}
      >
        <BrandFlag marca={sede.marca} />
      </HeroSeccion>
      <Gondola titulo="Mostrador · Llena tu boleta" />
      <div className="ticket-wrap mx-auto mt-8 max-w-[760px]">
        <form onSubmit={enviar} noValidate className="ticket p-5 sm:p-7" style={{ ['--notch-y' as string]: `${notchY}px` }}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-umbra">Formulario de postulación</p>
          <h2 className="mt-1 text-[24px] leading-8 font-bold sm:text-[28px] sm:leading-9">Cuéntanos sobre ti</h2>
          <div className="tear mt-6 mb-5" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={etiqueta} htmlFor="nombre">Nombre completo</label>
              <input id="nombre" className={campo} value={v.nombre} onChange={set('nombre')} placeholder="Ej. Ana Torres Vega" autoComplete="name" />
              {err('nombre')}
            </div>
            <div>
              <label className={`${etiqueta} flex items-center gap-2`} htmlFor="dni">DNI / CE <TraziPunto etiqueta="Ayuda sobre el DNI">Escribe los 8 dígitos de tu DNI. Lo pediremos en la entrada de personal el día de tu entrevista.</TraziPunto></label>
              <input id="dni" inputMode="numeric" maxLength={8} className={`${campo} font-mono`} value={v.dni} onChange={set('dni')} placeholder="12345678" />
              {err('dni')}
            </div>
            <div>
              <label className={`${etiqueta} flex items-center gap-2`} htmlFor="tel">Celular <TraziPunto pose="sonrie" etiqueta="Ayuda sobre el celular">Usaremos este número para avisarte de tu entrevista. Solo 9 dígitos, sin +51.</TraziPunto></label>
              <input id="tel" inputMode="tel" className={`${campo} font-mono`} value={v.telefono} onChange={set('telefono')} placeholder="987 654 321" autoComplete="tel" />
              {err('telefono')}
            </div>
            <div className="sm:col-span-2">
              <label className={etiqueta} htmlFor="email">Correo</label>
              <input id="email" type="email" className={campo} value={v.email} onChange={set('email')} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
              {err('email')}
            </div>
            <div className="sm:col-span-2">
              <span className={`${etiqueta} flex items-center gap-2`}>Tu CV (opcional) <TraziPunto lado="derecha" etiqueta="Ayuda sobre el CV">No es obligatorio, pero con CV la revisión suele ser más rápida. Puedes subirlo después desde tu perfil.</TraziPunto></span>
              <button
                type="button"
                onClick={() => setCv(cv ? null : `CV_${v.nombre.trim().split(' ')[0] || 'postulante'}.pdf`)}
                className="flex w-full items-center gap-2 rounded-[4px] border-[1.5px] border-dashed border-tinta bg-crema px-3 py-3 text-left font-mono text-xs text-umbra hover:bg-chip"
              >
                <Paperclip size={14} />
                {cv ? `${cv} · adjunto (clic para quitar)` : 'Adjuntar CV (simulado)'}
              </button>
            </div>
          </div>
          <div ref={tearRef} className="tear mt-6 mb-4" />
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] accent-rojo" />
            <span>Autorizo el tratamiento de mis datos personales para este proceso de selección.</span>
          </label>
          {intento && !acepta && <p className="mt-1 font-mono text-[11px] text-rojo-fuerte">Debes aceptar para continuar</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <TicketButton type="submit" className="sm:flex-1">Enviar solicitud</TicketButton>
            <TicketButton type="button" variante="secundario" onClick={onVolver}>Cancelar</TicketButton>
          </div>
        </form>
      </div>
      <Gondola titulo="Caja · Revisa tus datos antes de enviar" />
    </section>
  )
}
