import { useState } from 'react'
import { ArrowRight, Lightbulb, MessageSquare, Search, Sparkles, X } from 'lucide-react'
import { HadronLoader, HeroBackdrop } from './Brand.tsx'
import { CONCEPT_BY_ID } from '../engine/concepts.ts'
import { refine, search } from '../engine/match.ts'
import type { SearchResults } from '../engine/match.ts'
import type { Person, Project } from '../types.ts'
import { ResultsView } from './Results.tsx'

export interface DiscoverState {
  query: string
  results: SearchResults | null
  followUp: string
  refined: { results: SearchResults; message: string; prompt: string } | null
}

export const EMPTY_DISCOVER: DiscoverState = { query: '', results: null, followUp: '', refined: null }

const EXAMPLES = [
  'I want to develop an estimation process for a new commercial property MGA.',
  "We need a better way to predict how much we'll ultimately pay for claims that are still developing.",
  'We want to automate reconciliation of premium received from our MGA partners against expected policy-level premium.',
  "We're considering launching a new commercial property program with an MGA and need to understand what work we've already done and who should be involved.",
]

const FOLLOW_UPS = [
  'Only show people with MGA experience.',
  'Has anyone done something specifically with commercial property?',
  'Which of these projects could we reuse instead of building something new?',
]

interface Props {
  people: Person[]
  projects: Project[]
  state: DiscoverState
  setState: (s: DiscoverState) => void
  onOpenPerson: (p: Person) => void
  onOpenProject: (p: Project) => void
  onContact: (p: Person) => void
}

export function Discover({ people, projects, state, setState, ...handlers }: Props) {
  const [loading, setLoading] = useState(false)
  const { query, results, followUp, refined } = state

  const run = (text = query) => {
    if (!text.trim()) return
    setLoading(true)
    // tiny delay so the "thinking" state is visible during demos
    setTimeout(() => {
      setState({ query: text, results: search(text, people, projects), followUp: '', refined: null })
      setLoading(false)
    }, 450)
  }

  const runFollowUp = (text = followUp) => {
    if (!results || !text.trim()) return
    setState({ ...state, followUp: '', refined: { ...refine(results, text), prompt: text } })
  }

  const shown = refined?.results ?? results
  const workCount = shown ? shown.synergy.length + shown.duplicate.length + shown.work.length : 0

  return (
    <div>
      <div className="relative overflow-hidden bg-brand-800">
        <HeroBackdrop compact={!!results} />
        <div className={`relative mx-auto max-w-6xl px-6 transition-all ${results ? 'pt-8 pb-12' : 'pt-14 pb-20 sm:pt-20'}`}>
          {!results && (
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/25">
                <Sparkles className="h-3.5 w-3.5 text-gold-300" /> {people.length} colleagues · {projects.length} Jira &amp; Monday.com projects
              </span>
            </div>
          )}
          <h1 className={`font-display text-center font-semibold text-white ${results ? 'text-3xl' : 'text-5xl sm:text-6xl'}`}>
            What are you working on?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-brand-100">
            Describe a project, problem, or idea. We'll find the people and previous work that can help.
          </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-400">
            <textarea
              value={query}
              onChange={(e) => setState({ ...state, query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                  e.preventDefault()
                  run()
                }
              }}
              rows={results ? 2 : 4}
              placeholder="I want to develop an estimation process for a new commercial property MGA..."
              className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-1">
              <span className="text-xs text-slate-400">Press Enter to search · Shift+Enter for a new line</span>
              <button
                onClick={() => run()}
                disabled={!query.trim() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Search className="h-4 w-4" />}
                {loading ? 'Searching…' : 'Find Connections'}
              </button>
            </div>
          </div>

          {!results && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/70 uppercase">
                <Lightbulb className="h-3.5 w-3.5 text-gold-300" /> Try an example
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setState({ ...state, query: ex })
                      run(ex)
                    }}
                    className="group flex items-start gap-2 rounded-xl bg-white/[0.07] px-4 py-3 text-left text-sm text-white/85 ring-1 ring-white/15 transition hover:bg-white/[0.14] hover:text-white"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-300 transition group-hover:translate-x-0.5" />
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
      {loading && <HadronLoader />}
      {results && shown && !loading && (
        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-brand-800">Connections &amp; Related Work</h2>
              <p className="mt-1 text-slate-600">
                We found <strong>{shown.people.length} {shown.people.length === 1 ? 'person' : 'people'}</strong> and{' '}
                <strong>
                  {workCount} {workCount === 1 ? 'piece' : 'pieces'} of related work
                </strong>{' '}
                that may help
                {shown.synergy.length > 0 && <>, including <span className="font-semibold text-sky-700">{shown.synergy.length} reuse {shown.synergy.length === 1 ? 'opportunity' : 'opportunities'}</span></>}
                {shown.duplicate.length > 0 && <> and <span className="font-semibold text-amber-600">{shown.duplicate.length} possible {shown.duplicate.length === 1 ? 'duplicate' : 'duplicates'}</span></>}.
              </p>
            </div>
          </div>

          {results.query.direct.size > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">We understood:</span>
              {[...results.query.direct].map((c) => (
                <span key={c} className="rounded-full bg-brand-600 px-2.5 py-1 font-medium text-white">
                  {CONCEPT_BY_ID[c].label}
                </span>
              ))}
              {results.query.inferred.size > 0 && (
                <span className="ml-1 text-slate-400">
                  + related: {[...results.query.inferred].map((c) => CONCEPT_BY_ID[c].label.split(' / ')[0]).join(', ')}
                </span>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              <MessageSquare className="h-4 w-4 shrink-0 text-brand-600" />
              <input
                value={followUp}
                onChange={(e) => setState({ ...state, followUp: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && runFollowUp()}
                placeholder="Refine: e.g. Only show people with MGA experience."
                className="flex-1 py-1 text-sm focus:outline-none"
              />
              <button onClick={() => runFollowUp()} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                Ask
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FOLLOW_UPS.map((f) => (
                <button key={f} onClick={() => runFollowUp(f)} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300">
                  {f}
                </button>
              ))}
            </div>
            {refined && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                <span>
                  <span className="font-semibold">“{refined.prompt}”</span> — {refined.message}
                </span>
                <button onClick={() => setState({ ...state, refined: null })} className="inline-flex items-center gap-1 text-xs font-semibold hover:underline">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
            )}
          </div>

          <ResultsView results={shown} {...handlers} />
        </div>
      )}
      </div>
    </div>
  )
}
