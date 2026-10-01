import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy, Mail, Pencil, Plus, Search, X } from 'lucide-react'
import { DEPARTMENTS, EMAIL_DOMAIN } from '../config.ts'
import type { Person, Project } from '../types.ts'
import { Avatar } from './Avatar.tsx'
import { Modal, SourceBadge, StatusPill, Tag } from './ui.tsx'

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none'

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {hint && <span className="font-normal text-slate-400">· {hint}</span>}
      </span>
      {children}
    </label>
  )
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.some((v) => v.toLowerCase() === p.toLowerCase()))])
    setDraft('')
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 ring-1 ring-brand-200">
          {t}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} className="text-brand-400 hover:text-brand-700">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
        }}
        onBlur={add}
        placeholder={value.length ? 'Add another…' : placeholder}
        className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
      />
    </div>
  )
}

export function ProfileForm({
  initial, projects, onSave, onClose,
}: { initial?: Person; projects: Project[]; onSave: (p: Person) => void; onClose: () => void }) {
  const [form, setForm] = useState<Person>(
    initial ?? { id: '', name: '', department: 'Data', role: '', email: '', expertise: [], background: '', projectIds: [], customProjects: [] },
  )
  const [projectFilter, setProjectFilter] = useState('')
  const [customDraft, setCustomDraft] = useState('')
  const set = <K extends keyof Person>(k: K, v: Person[K]) => setForm((f) => ({ ...f, [k]: v }))
  const filtered = useMemo(
    () => projects.filter((p) => p.title.toLowerCase().includes(projectFilter.toLowerCase())).sort((a, b) => a.title.localeCompare(b.title)),
    [projects, projectFilter],
  )
  const valid = form.name.trim() && form.role.trim() && form.expertise.length > 0

  const save = () => {
    if (!valid) return
    const email = form.email.trim() || `${form.name.trim().toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${EMAIL_DOMAIN}`
    onSave({ ...form, name: form.name.trim(), email, id: form.id || `user-${Date.now()}`, userCreated: initial ? initial.userCreated : true })
  }

  return (
    <Modal title={initial ? `Edit profile · ${initial.name}` : 'Add a profile'} onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" autoFocus />
        </Field>
        <Field label="Department">
          <select className={inputCls} value={form.department} onChange={(e) => set('department', e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Role">
          <input className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Senior Data Engineer – Financial Systems" />
        </Field>
        <Field label="Email" hint="auto-generated if blank">
          <input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={`first.last@${EMAIL_DOMAIN}`} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Areas of expertise" hint="press Enter or comma after each">
            <TagInput value={form.expertise} onChange={(v) => set('expertise', v)} placeholder="Data Engineering, Premium, Reconciliation…" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Background" hint="2–4 sentences">
            <textarea className={inputCls} rows={3} value={form.background} onChange={(e) => set('background', e.target.value)} placeholder="What do you work on? What problems have you solved?" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Projects I've worked on <span className="font-normal text-slate-400">· {form.projectIds.length} selected</span>
          </span>
          <div className="rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} placeholder="Filter projects…" className="flex-1 text-sm focus:outline-none" />
            </div>
            <div className="max-h-44 overflow-y-auto p-1">
              {filtered.map((p) => {
                const on = form.projectIds.includes(p.id)
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => set('projectIds', on ? form.projectIds.filter((id) => id !== p.id) : [...form.projectIds, p.id])}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${on ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1">{p.title}</span>
                    <span className="text-xs text-slate-400">{p.source}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {(form.customProjects ?? []).map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {c}
                <button type="button" onClick={() => set('customProjects', (form.customProjects ?? []).filter((x) => x !== c))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDraft.trim()) {
                  e.preventDefault()
                  set('customProjects', [...(form.customProjects ?? []), customDraft.trim()])
                  setCustomDraft('')
                }
              }}
              placeholder="+ Add a custom project (Enter)"
              className="min-w-[14rem] flex-1 rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button onClick={save} disabled={!valid} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {initial ? 'Save changes' : 'Save profile'}
        </button>
      </div>
    </Modal>
  )
}

export function ContactModal({ person, onClose }: { person: Person; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(person.email).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Modal title="Reach out" onClose={onClose}>
      <div className="flex items-center gap-4">
        <Avatar name={person.name} department={person.department} size={56} />
        <div>
          <div className="font-semibold text-slate-900">{person.name}</div>
          <div className="text-sm text-slate-500">{person.role}</div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
        <Mail className="h-4 w-4 text-brand-600" />
        <span className="flex-1 font-mono text-sm text-slate-800">{person.email}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:text-brand-700">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Tip: mention what you're working on and which of their projects caught your eye.
      </p>
      <div className="mt-5 flex justify-end">
        <a
          href={`mailto:${person.email}?subject=${encodeURIComponent('Quick question about your experience')}`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Mail className="h-4 w-4" /> Open email draft
        </a>
      </div>
    </Modal>
  )
}

export function PersonModal({
  person, projects, onClose, onEdit, onContact, onOpenProject,
}: {
  person: Person
  projects: Project[]
  onClose: () => void
  onEdit: () => void
  onContact: () => void
  onOpenProject: (p: Project) => void
}) {
  const own = projects.filter((p) => person.projectIds.includes(p.id))
  return (
    <Modal title="Profile" onClose={onClose} wide>
      <div className="flex flex-wrap items-start gap-5">
        <Avatar name={person.name} department={person.department} size={80} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-3xl font-semibold text-brand-800">{person.name}</h2>
          <div className="text-slate-600">
            {person.role} · {person.department}
          </div>
          <div className="mt-1 font-mono text-sm text-slate-400">{person.email}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
          <button onClick={onContact} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            <Mail className="h-4 w-4" /> Contact
          </button>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Areas of expertise</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {person.expertise.map((t) => (
            <Tag key={t} active>
              {t}
            </Tag>
          ))}
        </div>
      </div>
      {person.background && (
        <div className="mt-5">
          <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Background</div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{person.background}</p>
        </div>
      )}
      <div className="mt-5">
        <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Projects ({own.length + (person.customProjects?.length ?? 0)})</div>
        <div className="mt-2 space-y-2">
          {own.map((p) => (
            <button key={p.id} onClick={() => onOpenProject(p)} className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-brand-300 hover:bg-brand-50/40">
              <span className="flex-1 text-sm font-medium text-slate-800">{p.title}</span>
              <StatusPill status={p.status} />
              <SourceBadge project={p} />
            </button>
          ))}
          {person.customProjects?.map((c) => (
            <div key={c} className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-600">
              {c} <span className="text-xs text-slate-400">· self-reported</span>
            </div>
          ))}
          {!own.length && !person.customProjects?.length && <p className="text-sm text-slate-400">No projects linked yet.</p>}
        </div>
      </div>
    </Modal>
  )
}

export function AddProfileButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gold-600">
      <Plus className="h-4 w-4" /> Add Profile
    </button>
  )
}
