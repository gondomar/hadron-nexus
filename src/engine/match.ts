import { CONCEPTS, CONCEPT_BY_ID, STOPWORDS } from './concepts.ts'
import type { Person, PersonResult, Project, ProjectResult, ResultKind, ScoreBreakdown } from '../types.ts'

// ---------------------------------------------------------------------------
// Text normalization & concept extraction
// ---------------------------------------------------------------------------

function stem(tok: string): string {
  if (tok.length > 4 && tok.endsWith('ies')) return tok.slice(0, -3) + 'y'
  if (tok.length > 4 && tok.endsWith('sses')) return tok.slice(0, -2)
  if (tok.length > 3 && tok.endsWith('s') && !/(ss|us|is|ux)$/.test(tok)) return tok.slice(0, -1)
  return tok
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(stem)
}

const norm = (text: string) => ` ${tokenize(text).join(' ')} `

const COMPILED = CONCEPTS.map((c) => ({ id: c.id, terms: [...new Set(c.terms.map((t) => norm(t)))] }))

export function conceptsIn(text: string): Set<string> {
  const n = norm(text)
  const found = new Set<string>()
  for (const c of COMPILED) if (c.terms.some((t) => t.trim() && n.includes(t))) found.add(c.id)
  return found
}

const conceptsInList = (items: string[]) => {
  const s = new Set<string>()
  items.forEach((i) => conceptsIn(i).forEach((c) => s.add(c)))
  return s
}

const union = (...sets: Set<string>[]) => new Set(sets.flatMap((s) => [...s]))

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  let na = 0
  let nb = 0
  a.forEach((v, k) => {
    na += v * v
    dot += v * (b.get(k) ?? 0)
  })
  b.forEach((v) => (nb += v * v))
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

function addVec(vec: Map<string, number>, concepts: Set<string>, w: number) {
  concepts.forEach((c) => vec.set(c, Math.max(vec.get(c) ?? 0, w)))
}

// ---------------------------------------------------------------------------
// Query analysis
// ---------------------------------------------------------------------------

export interface QueryAnalysis {
  text: string
  direct: Set<string>
  inferred: Set<string>
  expanded: Map<string, number>
  keywords: string[]
  depts: Set<string>
}

export function analyzeQuery(text: string): QueryAnalysis {
  const direct = conceptsIn(text)
  const expanded = new Map<string, number>()
  direct.forEach((c) => expanded.set(c, 1))
  const inferred = new Set<string>()
  direct.forEach((c) =>
    CONCEPT_BY_ID[c].related.forEach((r) => {
      if (!expanded.has(r)) {
        expanded.set(r, 0.35)
        inferred.add(r)
      }
    }),
  )
  const keywords = [...new Set(tokenize(text).filter((t) => t.length > 2 && !STOPWORDS.has(t)))]
  const depts = new Set([...direct].flatMap((c) => CONCEPT_BY_ID[c].depts))
  return { text, direct, inferred, expanded, keywords, depts }
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

const DAY = 86_400_000
const monthsSince = (date: string, now: Date) => (now.getTime() - new Date(date).getTime()) / (30.4 * DAY)
const isActive = (p: Project) => p.status === 'In Progress' || p.status === 'Planned'

/** Map a raw 0..1 score onto a 0..100 relevance percentage (monotonic, so ordering is preserved). */
const toPercent = (raw: number) => Math.round(Math.min(99, 100 * (1 - Math.pow(1 - Math.min(1, Math.max(0, raw)), 1.4))))

function coverage(q: string[], has: (c: string) => number): number {
  if (!q.length) return 0
  return q.reduce((s, c) => s + has(c), 0) / q.length
}

/** People rarely list every concept of a long query; full credit once ~2/3 of concepts (min 3) are covered. */
function softCoverage(q: string[], has: (c: string) => number): number {
  if (!q.length) return 0
  const denom = Math.min(q.length, Math.max(3, Math.round(q.length * 0.67)))
  return Math.min(1, q.reduce((s, c) => s + has(c), 0) / denom)
}

const kwOverlap = (keywords: string[], tokens: Set<string>) =>
  keywords.length ? keywords.filter((k) => tokens.has(k)).length / keywords.length : 0

const labels = (ids: Iterable<string>) => [...ids].map((c) => CONCEPT_BY_ID[c].label.split(' / ')[0])

export function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

// ---------------------------------------------------------------------------
// Project profiles & scoring
// ---------------------------------------------------------------------------

interface ProjectProfile {
  project: Project
  core: Set<string> // title + tags
  secondary: Set<string> // description + technologies
  all: Set<string>
  reuse: Set<string>
  vec: Map<string, number>
  tokens: Set<string>
}

function profileProject(project: Project): ProjectProfile {
  const core = union(conceptsIn(project.title), conceptsInList(project.tags))
  const secondary = union(conceptsIn(project.description), conceptsInList(project.technologies))
  const vec = new Map<string, number>()
  addVec(vec, secondary, 0.6)
  addVec(vec, core, 1)
  return {
    project,
    core,
    secondary,
    all: union(core, secondary),
    reuse: project.reuse ? conceptsIn(project.reuse) : new Set(),
    vec,
    tokens: new Set(tokenize([project.title, project.description, ...project.tags, ...project.technologies].join(' '))),
  }
}

interface Topical {
  topical: number
  T: number
  K: number
  Dm: number
  Tc: number
  Dept: number
  S: number
}

function projectTopical(pp: ProjectProfile, q: QueryAnalysis): Topical {
  const direct = [...q.direct]
  const K = kwOverlap(q.keywords, pp.tokens)
  const has = (c: string) => (pp.core.has(c) ? 1 : pp.secondary.has(c) ? 0.6 : 0)
  const T = direct.length ? coverage(direct, has) : K
  const domainQ = direct.filter((c) => CONCEPT_BY_ID[c].kind === 'domain')
  const techQ = direct.filter((c) => CONCEPT_BY_ID[c].kind === 'tech')
  const Dm = domainQ.length ? coverage(domainQ, has) : T
  const Tc = techQ.length ? coverage(techQ, has) : T
  const Dept = pp.project.departments.some((d) => q.depts.has(d)) ? 1 : 0
  const S = cosine(q.expanded, pp.vec)
  const topical = (0.3 * T + 0.1 * K + 0.15 * Dm + 0.1 * Tc + 0.05 * Dept + 0.2 * S) / 0.9
  return { topical, T, K, Dm, Tc, Dept, S }
}

const STATUS_VALUE: Record<Project['status'], number> = { 'In Progress': 1, Planned: 0.8, Completed: 0.7, 'On Hold': 0.4 }

function projectRecency(p: Project, now: Date): { factor: number; note: string } {
  if (p.status === 'In Progress') return { factor: 1.06, note: 'Active now' }
  if (p.status === 'Planned') return { factor: 1.03, note: 'Starting soon' }
  const m = monthsSince(p.lastActivity, now)
  const yr = new Date(p.completedDate ?? p.lastActivity).getFullYear()
  if (m <= 6) return { factor: 1.06, note: `Recent activity` }
  if (m <= 12) return { factor: 1.03, note: `Completed ${yr}` }
  if (m <= 24) return { factor: 1, note: `Completed ${yr}` }
  if (m <= 36) return { factor: 0.95, note: `Completed ${yr} · older work` }
  return { factor: 0.9, note: `Completed ${yr} · older work` }
}

// ---------------------------------------------------------------------------
// Person profiles & scoring
// ---------------------------------------------------------------------------

function personRecency(rel: { project: Project; topical: number }[], now: Date) {
  const relevant = rel.filter((r) => r.topical >= 0.3)
  if (!relevant.length) return { factor: 1, note: '' }
  const active = relevant.find((r) => isActive(r.project))
  if (active) return { factor: 1.1, note: `Currently active on ${active.project.title}` }
  const latest = Math.min(...relevant.map((r) => monthsSince(r.project.lastActivity, now)))
  const year = Math.max(...relevant.map((r) => new Date(r.project.lastActivity).getFullYear()))
  if (latest <= 6) return { factor: 1.1, note: 'Recent related experience' }
  if (latest <= 12) return { factor: 1.05, note: `Related work as recent as ${year}` }
  if (latest <= 24) return { factor: 1, note: `Related work as recent as ${year}` }
  if (latest <= 36) return { factor: 0.94, note: `Most related work is from ${year}` }
  return { factor: 0.88, note: `Most related work is from ${year} — may be dated` }
}

// ---------------------------------------------------------------------------
// Main search
// ---------------------------------------------------------------------------

export interface SearchResults {
  query: QueryAnalysis
  people: PersonResult[]
  synergy: ProjectResult[]
  duplicate: ProjectResult[]
  work: ProjectResult[]
}

export const PERSON_THRESHOLD = 40
export const PROJECT_THRESHOLD = 40

export function search(text: string, people: Person[], projects: Project[], now = new Date()): SearchResults {
  const q = analyzeQuery(text)
  const direct = [...q.direct]
  const profiles = projects.map(profileProject)
  const topicalById = new Map<string, Topical>()
  profiles.forEach((pp) => topicalById.set(pp.project.id, projectTopical(pp, q)))
  const projectById = new Map(projects.map((p) => [p.id, p]))
  const profileById = new Map(profiles.map((pp) => [pp.project.id, pp]))

  // ----- Projects -----
  const projectResults: ProjectResult[] = profiles.map((pp) => {
    const t = topicalById.get(pp.project.id)!
    const status = STATUS_VALUE[pp.project.status]
    const rec = projectRecency(pp.project, now)
    const raw = 0.9 * t.topical + 0.1 * status
    const score = toPercent(raw * rec.factor)
    const matched = direct.filter((c) => pp.all.has(c))
    const reuseHits = [...pp.reuse].filter((c) => q.expanded.has(c))

    let kind: ResultKind = 'standard'
    if (isActive(pp.project) && t.T >= 0.78 && score >= 70) kind = 'duplicate'
    else if (pp.project.reuse && score >= 50 && reuseHits.length > 0) kind = 'synergy'

    const covers = matched.length ? listJoin(labels(matched)) : 'related topics'
    let explanation: string
    if (kind === 'duplicate')
      explanation = `Significant overlap detected: this ${pp.project.status.toLowerCase()} initiative already covers ${covers}. It may address much of the same problem — consider connecting with its team before starting separate work.`
    else if (kind === 'synergy')
      explanation = `Already built: ${pp.project.reuse}. This may be reusable for your initiative instead of building from scratch.`
    else explanation = `${pp.project.status === 'Completed' ? 'Completed' : pp.project.status} work covering ${covers}.`

    const participants = people.filter((p) => p.projectIds.includes(pp.project.id))
    const breakdown: ScoreBreakdown[] = [
      { label: 'Topic similarity', value: t.T, weight: 0.27 },
      { label: 'Semantic / concept similarity', value: t.S, weight: 0.18 },
      { label: 'Insurance domain similarity', value: t.Dm, weight: 0.135 },
      { label: 'Shared technology / process', value: t.Tc, weight: 0.09 },
      { label: 'Keyword overlap', value: t.K, weight: 0.09 },
      { label: 'Department relevance', value: t.Dept, weight: 0.045 },
      { label: 'Status (active vs completed)', value: status, weight: 0.1 },
    ]
    const matchedTags = pp.project.tags.filter(
      (tag) => [...conceptsIn(tag)].some((c) => q.direct.has(c)) || tokenize(tag).some((tok) => q.keywords.includes(tok)),
    )
    return {
      type: 'project', project: pp.project, score, kind, explanation, matchedConcepts: labels(matched), matchedTags, participants,
      breakdown, recencyNote: rec.note, concepts: pp.all,
    }
  })

  // ----- People -----
  const personResults: PersonResult[] = people.map((person) => {
    const exp = conceptsInList(person.expertise)
    const role = conceptsIn(`${person.role} ${person.department}`)
    const bg = conceptsIn([person.background, ...(person.customProjects ?? [])].join('. '))
    const own = person.projectIds.map((id) => projectById.get(id)).filter((p): p is Project => !!p)
    const projC = union(...own.map((p) => profileById.get(p.id)!.core))
    const all = union(exp, role, bg, projC)
    const vec = new Map<string, number>()
    addVec(vec, projC, 0.4)
    addVec(vec, bg, 0.5)
    addVec(vec, role, 0.6)
    addVec(vec, exp, 1)

    const tagTokens = new Set(tokenize([...person.expertise, person.role].join(' ')))
    const kw = kwOverlap(q.keywords, tagTokens)
    const cov = softCoverage(direct, (c) => (exp.has(c) ? 1 : role.has(c) || bg.has(c) ? 0.5 : 0))
    const E = direct.length ? 0.85 * cov + 0.15 * kw : kw

    const rel = own
      .map((project) => ({ project, topical: topicalById.get(project.id)!.topical }))
      .sort((a, b) => b.topical - a.topical)
    const P = rel.length ? 0.65 * rel[0].topical + 0.35 * (rel[1]?.topical ?? 0) : 0.7 * E

    const domainQ = direct.filter((c) => CONCEPT_BY_ID[c].kind === 'domain')
    const D = domainQ.length ? softCoverage(domainQ, (c) => (all.has(c) ? 1 : 0)) : E
    const deptMatch = q.depts.has(person.department)
    const roleMatch = direct.some((c) => role.has(c))
    const R = deptMatch ? (roleMatch ? 1 : 0.8) : roleMatch ? 0.5 : 0
    const S = cosine(q.expanded, vec)

    const raw = 0.35 * E + 0.25 * P + 0.15 * D + 0.1 * R + 0.15 * S
    const rec = personRecency(rel, now)
    const score = toPercent(raw * rec.factor)

    const matchedTags = person.expertise.filter(
      (t) => [...conceptsIn(t)].some((c) => q.direct.has(c)) || tokenize(t).some((tok) => q.keywords.includes(tok)),
    )
    const related = rel.filter((r) => r.topical >= 0.3).slice(0, 3).map((r) => r.project)
    const first = person.name

    let explanation = matchedTags.length
      ? `${first} has hands-on expertise in ${listJoin(matchedTags.slice(0, 4))}`
      : `${first}'s ${person.department} background touches on ${listJoin(labels(direct.filter((c) => all.has(c))).slice(0, 3)) || 'related topics'}`
    if (related.length)
      explanation += ` and contributed to ${related.length === 1 ? 'a closely related initiative' : `${related.length} related initiatives`}.`
    else if (!own.length) explanation += '. No linked projects yet — matched on declared expertise and background.'
    else explanation += '.'

    const breakdown: ScoreBreakdown[] = [
      { label: 'Expertise similarity', value: E, weight: 0.35 },
      { label: 'Relevant project experience', value: P, weight: 0.25 },
      { label: 'Insurance domain relevance', value: D, weight: 0.15 },
      { label: 'Department / role relevance', value: R, weight: 0.1 },
      { label: 'Semantic / concept similarity', value: S, weight: 0.15 },
    ]
    return {
      type: 'person', person, score, kind: 'standard', explanation, matchedTags, relatedProjects: related, breakdown,
      recencyNote: rec.note ? `${rec.note} (recency ×${rec.factor.toFixed(2)})` : '', concepts: all,
    }
  })

  const byScore = <T extends { score: number }>(a: T, b: T) => b.score - a.score
  const shown = projectResults.filter((r) => r.score >= PROJECT_THRESHOLD).sort(byScore)
  return {
    query: q,
    people: personResults.filter((r) => r.score >= PERSON_THRESHOLD).sort(byScore).slice(0, 8),
    synergy: shown.filter((r) => r.kind === 'synergy').slice(0, 4),
    duplicate: shown.filter((r) => r.kind === 'duplicate').slice(0, 3),
    work: shown.filter((r) => r.kind === 'standard').slice(0, 6),
  }
}

// ---------------------------------------------------------------------------
// Conversational follow-up refinement (filters the current result set)
// ---------------------------------------------------------------------------

export interface Refinement {
  results: SearchResults
  message: string
}

export function refine(base: SearchResults, followUp: string): Refinement {
  const text = followUp.toLowerCase()
  const concepts = [...conceptsIn(followUp)]
  const wantsReuse = /reus|instead of build|leverage|synerg|already built/.test(text)
  const wantsDup = /duplicat|overlap|already doing|same thing/.test(text)
  const wantsPeople = /\b(people|person|who|expert|experts|talk|contact)\b/.test(text) && !wantsReuse
  const wantsWork = wantsReuse || wantsDup || /\b(project|projects|initiative|work item|jira|monday)\b/.test(text)
  const wantsActive = /\b(active|current|currently|in progress|ongoing)\b/.test(text)
  const wantsDone = /\b(completed|finished|past|previous|historical)\b/.test(text)

  const conceptOk = (c: Set<string>) => concepts.every((k) => c.has(k))
  const statusOk = (r: ProjectResult) =>
    (!wantsActive || isActive(r.project)) && (!wantsDone || r.project.status === 'Completed')

  const results: SearchResults = {
    query: base.query,
    people: wantsWork && !wantsPeople ? [] : base.people.filter((r) => conceptOk(r.concepts)),
    synergy: wantsPeople && !wantsWork ? [] : base.synergy.filter((r) => conceptOk(r.concepts) && statusOk(r)),
    duplicate: (wantsPeople && !wantsWork) || wantsReuse ? [] : base.duplicate.filter((r) => conceptOk(r.concepts) && statusOk(r)),
    work: (wantsPeople && !wantsWork) || wantsReuse || wantsDup ? [] : base.work.filter((r) => conceptOk(r.concepts) && statusOk(r)),
  }

  const parts: string[] = []
  if (wantsReuse) parts.push('reusable (synergistic) work')
  else if (wantsDup) parts.push('possible duplicates')
  else if (wantsPeople && !wantsWork) parts.push('people')
  else if (wantsWork && !wantsPeople) parts.push('related work')
  else parts.push('results')
  if (concepts.length) parts.push(`involving ${listJoin(labels(concepts))}`)
  if (wantsActive) parts.push('that are active')
  if (wantsDone) parts.push('that are completed')
  return { results, message: `Showing ${parts.join(' ')}.` }
}
