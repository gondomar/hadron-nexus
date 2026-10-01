// Hadron brand elements: official logo, hero backdrop and loader.

export function HadronLogo({ className = 'h-7', variant = 'white' }: { className?: string; variant?: 'white' | 'color' }) {
  return (
    <img
      src={variant === 'white' ? '/brand/hadron-logo-white.svg' : '/brand/hadron-logo.svg'}
      alt="Hadron"
      className={className}
    />
  )
}

/** Particle-collider motif: orbital ellipses and particles, drawn very faintly. */
function Orbits({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden fill="none">
      <g stroke="#6de4fa" strokeWidth="1.2" opacity="0.35">
        <ellipse cx="300" cy="300" rx="280" ry="110" transform="rotate(-25 300 300)" />
        <ellipse cx="300" cy="300" rx="280" ry="110" transform="rotate(35 300 300)" />
        <ellipse cx="300" cy="300" rx="280" ry="110" transform="rotate(90 300 300)" />
      </g>
      <g stroke="#ffffff" strokeWidth="1" opacity="0.12">
        <circle cx="300" cy="300" r="200" />
        <circle cx="300" cy="300" r="140" />
      </g>
      <circle cx="300" cy="300" r="10" fill="#6de4fa" opacity="0.6" />
      <circle cx="548" cy="186" r="6" fill="#cc9139" />
      <circle cx="140" cy="512" r="5" fill="#6de4fa" />
      <circle cx="300" cy="21" r="4" fill="#ffffff" opacity="0.7" />
    </svg>
  )
}

/** Deep-green hero backdrop with the collider motif. */
export function HeroBackdrop({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(109,228,250,0.18),transparent_55%)]" />
      <Orbits className={`absolute -top-24 -right-32 ${compact ? 'h-[420px] w-[420px]' : 'h-[620px] w-[620px]'}`} />
      {!compact && <Orbits className="absolute -bottom-56 -left-40 h-[520px] w-[520px] opacity-60" />}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
    </div>
  )
}

/** Orbiting-particle loader shown while searching. */
export function HadronLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-brand-800">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand-100 border-t-brand-500" />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-gold-100 border-b-gold-500 [animation-direction:reverse]" />
        <div className="absolute inset-[22px] rounded-full bg-cyan-brand" />
      </div>
      <p className="font-display text-lg">Connecting people and work across Hadron…</p>
    </div>
  )
}
