import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Project, ScoreBreakdown } from '../types.ts'

export function Modal({ title, onClose, children, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:p-10" onMouseDown={onClose}>
      <div
        className={`animate-fade-up w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="font-display text-xl font-semibold text-brand-800">{title}</div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ScoreBadge({ score, tone = 'brand' }: { score: number; tone?: 'brand' | 'sky' | 'amber' | 'slate' }) {
  const cls = {
    brand: 'bg-brand-600 text-white',
    sky: 'bg-sky-600 text-white',
    amber: 'bg-amber-500 text-white',
    slate: 'bg-slate-900 text-white',
  }[tone]
  return (
    <div className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-1.5 ${cls}`} title="Relevance score (not a probability)">
      <span className="text-lg leading-tight font-bold">{score}%</span>
      <span className="text-[10px] font-medium tracking-wide uppercase opacity-80">Match</span>
    </div>
  )
}

export function Tag({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        active ? 'bg-brand-50 text-brand-800 ring-brand-200' : 'bg-slate-50 text-slate-600 ring-slate-200'
      }`}
    >
      {children}
    </span>
  )
}

const STATUS_STYLE: Record<Project['status'], string> = {
  'In Progress': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Planned: 'bg-violet-50 text-violet-700 ring-violet-200',
  Completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  'On Hold': 'bg-orange-50 text-orange-700 ring-orange-200',
}

export function StatusPill({ status }: { status: Project['status'] }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>{status}</span>
}

export function SourceBadge({ project }: { project: Project }) {
  const jira = project.source === 'Jira'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
        jira ? 'bg-blue-50 text-blue-700' : 'bg-fuchsia-50 text-fuchsia-700'
      }`}
      title={`Source: ${project.source}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${jira ? 'bg-blue-600' : 'bg-fuchsia-500'}`} />
      {project.source} · {project.sourceId}
    </span>
  )
}

export function Breakdown({ items, note }: { items: ScoreBreakdown[]; note?: string }) {
  return (
    <div className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-xs">
      {items.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="w-60 shrink-0 text-slate-600">
            {b.label} <span className="text-slate-400">({Math.round(b.weight * 100)}%)</span>
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.round(Math.min(1, b.value) * 100)}%` }} />
          </div>
          <span className="w-8 text-right font-medium text-slate-700">{Math.round(Math.min(1, b.value) * 100)}</span>
        </div>
      ))}
      {note && <div className="pt-1 text-slate-500">Recency adjustment: {note}</div>}
    </div>
  )
}

export const fmtDate = (d?: string) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'
