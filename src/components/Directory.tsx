import { useMemo, useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import type { Person, Project } from '../types.ts'
import { Avatar } from './Avatar.tsx'
import { Modal, SourceBadge, StatusPill, Tag, fmtDate } from './ui.tsx'

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
      <Search className="h-4 w-4 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 text-sm focus:outline-none" />
    </div>
  )
}

const matches = (q: string, ...fields: string[]) => {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const hay = fields.join(' ').toLowerCase()
  return terms.every((t) => hay.includes(t))
}

export function PeopleView({ people, onOpen }: { people: Person[]; onOpen: (p: Person) => void }) {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('All')
  const depts = useMemo(() => ['All', ...[...new Set(people.map((p) => p.department))].sort()], [people])
  const list = people
    .filter((p) => (dept === 'All' || p.department === dept) && matches(q, p.name, p.role, p.department, ...p.expertise, p.background))
    .sort((a, b) => Number(!!b.userCreated) - Number(!!a.userCreated) || a.name.localeCompare(b.name))
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-brand-800">People</h1>
          <p className="mt-1 text-slate-500">{people.length} colleagues across Hadron and what they know.</p>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search by name, role, or expertise…" />
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {depts.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${dept === d ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300'}`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <button key={p.id} onClick={() => onOpen(p)} className="animate-fade-up flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <Avatar name={p.name} department={p.department} size={64} />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">
                  {p.name}
                  {p.userCreated && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-emerald-700 uppercase">New</span>}
                </div>
                <div className="truncate text-sm text-slate-500">{p.role}</div>
                <div className="text-xs text-slate-400">{p.department}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.expertise.slice(0, 4).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </button>
        ))}
        {!list.length && <p className="text-slate-500">No one matches that search.</p>}
      </div>
    </div>
  )
}

export function ProjectsView({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project) => void }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const list = projects
    .filter((p) => (status === 'All' || p.status === status) && matches(q, p.title, p.description, p.source, p.sourceId, ...p.tags, ...p.departments))
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-brand-800">Projects</h1>
          <p className="mt-1 text-slate-500">{projects.length} work items synced from Jira and Monday.com (simulated).</p>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search projects, tags, departments…" />
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {['All', 'In Progress', 'Planned', 'Completed', 'On Hold'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${status === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <button key={p.id} onClick={() => onOpen(p)} className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={p.status} />
              <SourceBadge project={p} />
            </div>
            <div className="mt-2 font-semibold text-slate-900">{p.title}</div>
            <div className="text-xs text-slate-500">{p.departments.join(' · ')}</div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.slice(0, 5).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProjectModal({ project, people, onClose, onOpenPerson }: { project: Project; people: Person[]; onClose: () => void; onOpenPerson: (p: Person) => void }) {
  const participants = people.filter((p) => p.projectIds.includes(project.id))
  return (
    <Modal title="Project details" onClose={onClose} wide>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={project.status} />
        <SourceBadge project={project} />
      </div>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h2>
      <div className="text-sm text-slate-500">{project.departments.join(' · ')}</div>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">{project.description}</p>
      {project.reuse && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900">
          <span className="font-semibold">Reusable asset:</span> {project.reuse}
        </div>
      )}
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ['Started', fmtDate(project.startDate)],
          ['Completed', fmtDate(project.completedDate)],
          ['Last activity', fmtDate(project.lastActivity)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" /> {k}
            </div>
            <div className="font-medium text-slate-800">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <Tag key={t} active>
            {t}
          </Tag>
        ))}
        {project.technologies.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="mt-5">
        <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Participants ({participants.length})</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {participants.map((p) => (
            <button key={p.id} onClick={() => onOpenPerson(p)} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-brand-300">
              <Avatar name={p.name} department={p.department} size={36} />
              <div>
                <div className="text-sm font-medium text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500">{p.role}</div>
              </div>
            </button>
          ))}
          {!participants.length && <p className="text-sm text-slate-400">No participants recorded.</p>}
        </div>
      </div>
    </Modal>
  )
}
