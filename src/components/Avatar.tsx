import {
  Calculator, ChartColumn, Code, Coins, Database, FileWarning, Handshake, Landmark, Package, Scale, Settings,
  ShieldCheck, Sigma, Umbrella, User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const DEPT_ICONS: Record<string, LucideIcon> = {
  Actuarial: Sigma,
  Pricing: Calculator,
  Underwriting: ShieldCheck,
  Claims: FileWarning,
  Programs: Handshake,
  Operations: Settings,
  Finance: Landmark,
  'Finance Technology': Coins,
  Data: Database,
  Engineering: Code,
  Compliance: Scale,
  Reinsurance: Umbrella,
  Product: Package,
  Analytics: ChartColumn,
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

// Hadron-palette tones (deep greens, teal, gold, slate) for initials avatars.
const TONES = [
  ['#0c473b', '#ffffff'],
  ['#2e796a', '#ffffff'],
  ['#185749', '#d5ece5'],
  ['#cc9139', '#ffffff'],
  ['#d5ece5', '#0c473b'],
  ['#334155', '#ffffff'],
  ['#f5e6c8', '#8a5a1c'],
  ['#1e5f74', '#ffffff'],
]

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?'

/** Initials avatar in Hadron colours with a department badge. */
export function Avatar({ name, department, size = 48 }: { name: string; department: string; size?: number }) {
  const [bg, fg] = TONES[hash(name) % TONES.length]
  const Icon = DEPT_ICONS[department] ?? User
  const badge = Math.max(16, size * 0.36)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-semibold tracking-wide shadow-sm ring-2 ring-white select-none"
        style={{ background: bg, color: fg, fontSize: size * 0.36 }}
        aria-label={name}
      >
        {initials(name)}
      </div>
      {size >= 36 && (
        <span
          className="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full bg-white text-brand-800 shadow ring-1 ring-slate-200"
          style={{ width: badge, height: badge }}
          title={department}
        >
          <Icon style={{ width: badge * 0.58, height: badge * 0.58 }} />
        </span>
      )}
    </div>
  )
}
