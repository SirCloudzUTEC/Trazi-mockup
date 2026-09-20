export function TraziMark({ size = 28, tone = 'rojo' }: { size?: number; tone?: 'rojo' | 'crema' }) {
  const fondo = tone === 'rojo' ? '#E4572E' : '#2B2420'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill={fondo} />
      <circle cx="9" cy="21" r="3.2" fill="#FFFBF3" />
      <circle cx="23" cy="11" r="3.2" fill="#FFC857" />
      <path d="M11.5 19.5 20.5 12.5" stroke="#FFFBF3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
