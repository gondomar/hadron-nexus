export type ProjectStatus = 'Planned' | 'In Progress' | 'Completed' | 'On Hold'

export interface Person {
  id: string
  name: string
  department: string
  role: string
  email: string
  expertise: string[]
  background: string
  projectIds: string[]
  customProjects?: string[]
  userCreated?: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  source: 'Jira' | 'Monday'
  sourceId: string
  departments: string[]
  tags: string[]
  technologies: string[]
  status: ProjectStatus
  startDate: string
  completedDate?: string
  lastActivity: string
  /** What another team could reuse from this work (pipeline, dataset, model, process...). */
  reuse?: string
  /** 2–4 word label for the reusable asset, shown on compact cards. */
  reuseShort?: string
}

export type ResultKind = 'synergy' | 'duplicate' | 'standard'

export interface ScoreBreakdown {
  label: string
  value: number // 0..1
  weight: number
}

export interface PersonResult {
  type: 'person'
  person: Person
  score: number
  kind: ResultKind
  explanation: string
  matchedTags: string[]
  relatedProjects: Project[]
  breakdown: ScoreBreakdown[]
  recencyNote: string
  concepts: Set<string>
}

export interface ProjectResult {
  type: 'project'
  project: Project
  score: number
  kind: ResultKind
  explanation: string
  matchedConcepts: string[]
  matchedTags: string[]
  participants: Person[]
  breakdown: ScoreBreakdown[]
  recencyNote: string
  concepts: Set<string>
}

export type AnyResult = PersonResult | ProjectResult
