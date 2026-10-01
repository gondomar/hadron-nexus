import { useState } from 'react'
import { ChevronRight, Layers, Mail, Sparkles, TriangleAlert, User, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AnyResult, Person, PersonResult, Project, ProjectResult } from '../types.ts'
import type { SearchResults } from '../engine/match.ts'
import { Avatar } from './Avatar.tsx'
import { Breakdown, Modal, ScoreBadge, SourceBadge, StatusPill, Tag } from './ui.tsx'

interface Handlers {
  onOpenPerson: (p: Person) => void
  onOpenProject: (p: Project) => void
  onContact: (p: Person) => void
}

/** One-line summary shown on compact project cards. */
function brief(r: ProjectResult): string {
  if (r.kind === 'synergy') return `Reuse: ${r.project.reuseShort ?? r.project.reuse}`
  if (r.kind === 'duplicate') return 'Already underway · talk to this team first'
  return r.matchedConcepts.length ? `Covers ${r.matchedConcepts.slice(0, 3).join(', ')}` : r.project.departments.join(' · ')
}

function CompactScore({ score, tone }: { score: number; tone: 'brand' | 'sky' | 'amber' | 'slate' }) {
  const cls = { brand: 'bg-brand-600', sky: 'bg-sky-600', amber: 'bg-amber-500', slate: 'bg-slate-900' }[tone]
  return (
    <span className={`shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-white ${cls}`} title="Relevance score (not a probability)">
      {score}%
    </span>
  )
}

function PersonCard({ r, onSelect, onContact }: { r: PersonResult; onSelect: () => void; onContact: (p: Person) => void }) {
  const p = r.person
  const tags = (r.matchedTags.length ? r.matchedTags : p.expertise).slice(0, 2)
  return (
    <div
      onClick={onSelect}
      className="animate-fade-up group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <Avatar name={p.name} department={p.department} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-slate-900">{p.name}</span>
          {p.userCreated && <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700 uppercase">New</span>}
        </div>
        <div className="truncate text-xs text-slate-500">{p.role}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((t) => (
            <Tag key={t} active={r.matchedTags.includes(t)}>
              {t}
            </Tag>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <CompactScore score={r.score} tone="brand" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContact(p)
          }}
          className="rounded-md p-1.5 text-brand-600 hover:bg-brand-50"
          title={`Contact ${p.name}`}
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const KIND = {
  synergy: { card: 'border-sky-300 bg-sky-50 hover:border-sky-500', label: 'SYNERGISTIC', chip: 'bg-sky-600 text-white', tone: 'sky' as const, Icon: Sparkles },
  duplicate: { card: 'border-amber-300 bg-amber-50 hover:border-amber-500', label: 'POSSIBLE DUPLICATE', chip: 'bg-amber-500 text-white', tone: 'amber' as const, Icon: TriangleAlert },
  standard: { card: 'border-slate-200 bg-white hover:border-brand-300', label: '', chip: '', tone: 'slate' as const, Icon: Layers },
}

function ProjectCard({ r, onSelect }: { r: ProjectResult; onSelect: () => void }) {
  const k = KIND[r.kind]
  return (
    <div onClick={onSelect} className={`animate-fade-up group flex cursor-pointer flex-col gap-2 rounded-xl border p-3.5 shadow-sm transition hover:shadow-md ${k.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {k.label && (
            <span className={`mb-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${k.chip}`}>
              <k.Icon className="h-3 w-3" /> {k.label}
            </span>
          )}
          <div className="font-semibold leading-snug text-slate-900">{r.project.title}</div>
        </div>
        <CompactScore score={r.score} tone={k.tone} />
      </div>
      <p className={`line-clamp-1 text-sm ${r.kind === 'standard' ? 'text-slate-600' : 'font-medium text-slate-800'}`}>{brief(r)}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <StatusPill status={r.project.status} />
          <span>{r.project.source}</span>
        </span>
        <span className="inline-flex items-center text-brand-700 opacity-0 transition group-hover:opacity-100">
          Details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">{children}</div>
}

function PersonDetail({ r, onOpenPerson, onOpenProject, onContact }: { r: PersonResult } & Handlers) {
  const p = r.person
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={p.name} department={p.department} size={64} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-2xl font-semibold text-brand-800">{p.name}</div>
          <div className="text-sm text-slate-500">
            {p.role} · {p.department}
          </div>
        </div>
        <ScoreBadge score={r.score} />
      </div>
      <div>
        <Label>Why this person</Label>
        <p className="text-sm leading-relaxed text-slate-700">{r.explanation}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {p.expertise.map((t) => (
          <Tag key={t} active={r.matchedTags.includes(t)}>
            {t}
          </Tag>
        ))}
      </div>
      {r.relatedProjects.length > 0 && (
        <div>
          <Label>Related experience</Label>
          <div className="space-y-1.5">
            {r.relatedProjects.map((pr) => (
              <button key={pr.id} onClick={() => onOpenProject(pr)} className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300">
                <span className="flex-1 font-medium text-slate-800">{pr.title}</span>
                <StatusPill status={pr.status} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label>How this score was calculated</Label>
        <Breakdown items={r.breakdown} note={r.recencyNote || 'none (no dated related projects)'} />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => onOpenPerson(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <User className="h-4 w-4" /> Full profile
        </button>
        <button onClick={() => onContact(p)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Mail className="h-4 w-4" /> Contact
        </button>
      </div>
    </div>
  )
}

function ProjectDetail({ r, onOpenPerson, onOpenProject }: { r: ProjectResult } & Handlers) {
  const k = KIND[r.kind]
  const pr = r.project
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {k.label && (
            <span className={`mb-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold tracking-wider ${k.chip}`}>
              <k.Icon className="h-3.5 w-3.5" /> {k.label}
            </span>
          )}
          <div className="font-display text-2xl font-semibold text-brand-800">{pr.title}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <StatusPill status={pr.status} />
            <SourceBadge project={pr} />
            <span>{pr.departments.join(' · ')}</span>
            <span className="text-slate-400">· {r.recencyNote}</span>
          </div>
        </div>
        <ScoreBadge score={r.score} tone={k.tone} />
      </div>
      <div className={`rounded-xl p-3 text-sm leading-relaxed ${r.kind === 'synergy' ? 'bg-sky-50 text-sky-900' : r.kind === 'duplicate' ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-700'}`}>
        {r.explanation}
      </div>
      <div>
        <Label>About this work</Label>
        <p className="text-sm leading-relaxed text-slate-700">{pr.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pr.tags.map((t) => (
          <Tag key={t} active={r.matchedTags.includes(t)}>
            {t}
          </Tag>
        ))}
      </div>
      {r.participants.length > 0 && (
        <div>
          <Label>Who to ask</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.participants.map((p) => (
              <button key={p.id} onClick={() => onOpenPerson(p)} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-brand-300">
                <Avatar name={p.name} department={p.department} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">{p.name}</div>
                  <div className="truncate text-xs text-slate-500">{p.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label>How this score was calculated</Label>
        <Breakdown items={r.breakdown} note={r.recencyNote} />
      </div>
      <div className="flex justify-end">
        <button onClick={() => onOpenProject(pr)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Full project record
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, subtitle, children, accent }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode; accent: string }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
        <h3 className="font-display text-lg font-semibold text-brand-900">{title}</h3>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
      {children}
    </section>
  )
}

export function ResultsView({ results, ...h }: { results: SearchResults } & Handlers) {
  const [selected, setSelected] = useState<AnyResult | null>(null)
  const { synergy, duplicate, people, work } = results
  if (!synergy.length && !duplicate.length && !people.length && !work.length)
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No strong connections found. Try describing the problem with a bit more insurance context.
      </div>
    )

  // Leaving the detail view for a full profile/project/contact modal closes this one first.
  const wrap = <T,>(fn: (x: T) => void) => (x: T) => {
    setSelected(null)
    fn(x)
  }
  const handlers = { onOpenPerson: wrap(h.onOpenPerson), onOpenProject: wrap(h.onOpenProject), onContact: wrap(h.onContact) }
  const grid = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div>
      {synergy.length > 0 && (
        <div className={`mt-8 ${grid}`}>
          {synergy.map((r) => <ProjectCard key={r.project.id} r={r} onSelect={() => setSelected(r)} />)}
        </div>
      )}
      {duplicate.length > 0 && (
        <div className={`mt-3 ${grid}`}>
          {duplicate.map((r) => <ProjectCard key={r.project.id} r={r} onSelect={() => setSelected(r)} />)}
        </div>
      )}
      {people.length > 0 && (
        <Section icon={<Users className="h-4 w-4" />} accent="bg-brand-800 text-white" title="People to talk to" subtitle="Click anyone to see why they were recommended">
          <div className={grid}>
            {people.map((r) => <PersonCard key={r.person.id} r={r} onSelect={() => setSelected(r)} onContact={h.onContact} />)}
          </div>
        </Section>
      )}
      {work.length > 0 && (
        <Section icon={<Layers className="h-4 w-4" />} accent="bg-brand-800 text-white" title="Related work" subtitle="From Jira and Monday.com">
          <div className={grid}>
            {work.map((r) => <ProjectCard key={r.project.id} r={r} onSelect={() => setSelected(r)} />)}
          </div>
        </Section>
      )}

      {selected && (
        <Modal title={selected.type === 'person' ? 'Why this person?' : 'Why this work?'} onClose={() => setSelected(null)} wide>
          {selected.type === 'person' ? <PersonDetail r={selected} {...handlers} /> : <ProjectDetail r={selected} {...handlers} />}
        </Modal>
      )}
    </div>
  )
}
