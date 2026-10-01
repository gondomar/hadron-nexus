import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME, APP_TAGLINE } from './config.ts'
import { SEED_PROJECTS } from './data/projects.ts'
import { usePeople } from './store.ts'
import { search } from './engine/match.ts'
import type { Person, Project } from './types.ts'
import { Discover, EMPTY_DISCOVER } from './components/Discover.tsx'
import type { DiscoverState } from './components/Discover.tsx'
import { PeopleView, ProjectModal, ProjectsView } from './components/Directory.tsx'
import { AddProfileButton, ContactModal, PersonModal, ProfileForm } from './components/Profiles.tsx'
import { Modal } from './components/ui.tsx'
import { HadronLogo } from './components/Brand.tsx'

type View = 'discover' | 'people' | 'projects'
type ModalState =
  | { type: 'person'; id: string }
  | { type: 'project'; project: Project }
  | { type: 'edit'; id?: string }
  | { type: 'contact'; person: Person }
  | { type: 'reset' }
  | null

export default function App() {
  const { people, savePerson, reset } = usePeople()
  const [view, setView] = useState<View>('discover')
  const [modal, setModal] = useState<ModalState>(null)
  // Optional deep link: ?q=your+idea runs a search on load.
  const [discover, setDiscover] = useState<DiscoverState>(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    return q ? { ...EMPTY_DISCOVER, query: q, results: search(q, people, SEED_PROJECTS) } : EMPTY_DISCOVER
  })
  const [toast, setToast] = useState('')
  const projects = SEED_PROJECTS

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }
  const openPerson = (p: Person) => setModal({ type: 'person', id: p.id })
  const openProject = (p: Project) => setModal({ type: 'project', project: p })
  const contact = (p: Person) => setModal({ type: 'contact', person: p })
  const close = () => setModal(null)

  const doReset = () => {
    reset()
    setDiscover(EMPTY_DISCOVER)
    setView('discover')
    setModal(null)
    flash(`${APP_NAME} has been reset to the original demo data.`)
  }

  const person = modal?.type === 'person' || modal?.type === 'edit' ? people.find((p) => p.id === modal.id) : undefined

  const navBtn = (v: View, label: string) => (
    <button
      onClick={() => setView(v)}
      className={`relative px-1 py-5 text-sm font-medium transition ${view === v ? 'text-white' : 'text-white/65 hover:text-white'}`}
    >
      {label}
      {view === v && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500" />}
    </button>
  )

  return (
    <div className="bg-hadron flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-brand-900 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6">
          <button onClick={() => setView('discover')} className="flex items-center gap-3" title={`${APP_NAME} — ${APP_TAGLINE}`}>
            <HadronLogo className="h-7" />
            <span className="h-6 w-px bg-white/25" />
            <span className="font-display text-xl font-semibold tracking-wide text-white">{APP_SHORT_NAME}</span>
          </button>
          <nav className="flex gap-6">
            {navBtn('discover', 'Discover')}
            {navBtn('people', 'People')}
            {navBtn('projects', 'Projects')}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setModal({ type: 'reset' })}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white"
              title="Restore original demo data"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
            </button>
            <AddProfileButton onClick={() => setModal({ type: 'edit' })} />
          </div>
        </div>
      </header>

      {view === 'discover' && (
        <Discover
          people={people}
          projects={projects}
          state={discover}
          setState={setDiscover}
          onOpenPerson={openPerson}
          onOpenProject={openProject}
          onContact={contact}
        />
      )}
      {view === 'people' && <PeopleView people={people} onOpen={openPerson} />}
      {view === 'projects' && <ProjectsView projects={projects} onOpen={openProject} />}

      <footer className="mt-auto bg-brand-900">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <HadronLogo className="h-5 opacity-90" />
            <span className="h-4 w-px bg-white/20" />
            <span className="font-medium text-white/80">{APP_NAME}</span>
          </div>
          <span>Hackathon prototype · Simulated Jira &amp; Monday.com data · All employees are fictional</span>
        </div>
      </footer>

      {modal?.type === 'person' && person && (
        <PersonModal
          person={person}
          projects={projects}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', id: person.id })}
          onContact={() => contact(person)}
          onOpenProject={openProject}
        />
      )}
      {modal?.type === 'project' && <ProjectModal project={modal.project} people={people} onClose={close} onOpenPerson={openPerson} />}
      {modal?.type === 'edit' && (
        <ProfileForm
          key={person?.id ?? 'new'}
          initial={person}
          projects={projects}
          onClose={close}
          onSave={(p) => {
            savePerson(p)
            setModal({ type: 'person', id: p.id })
            flash(person ? `Saved changes to ${p.name}.` : `${p.name} is now discoverable in ${APP_NAME}.`)
          }}
        />
      )}
      {modal?.type === 'contact' && <ContactModal person={modal.person} onClose={close} />}
      {modal?.type === 'reset' && (
        <Modal title="Reset Demo" onClose={close}>
          <p className="text-slate-700">Reset {APP_NAME} to the original demo data?</p>
          <p className="mt-2 text-sm text-slate-500">
            This removes added profiles and edits and clears the current search.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={doReset} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Reset demo data
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="animate-fade-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
