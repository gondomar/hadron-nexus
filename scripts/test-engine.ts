// Quick engine sanity check: node --experimental-strip-types scripts/test-engine.ts
import { search } from '../src/engine/match.ts'
import { SEED_PEOPLE } from '../src/data/people.ts'
import { SEED_PROJECTS } from '../src/data/projects.ts'
import type { Person } from '../src/types.ts'

const integration: Person = {
  id: 'u1', name: 'Alex Rivera', department: 'Finance Technology', role: 'Senior Data Engineer – Financial Systems',
  email: 'alex.rivera@hadron.demo', expertise: ['Data Engineering', 'Financial Systems', 'Premium', 'Reconciliation', 'Snowflake', 'dbt', 'MGA Data'],
  background: 'Builds financial data systems and works across Finance and Technology to automate insurance data processing, reconciliation, and reporting.',
  projectIds: [], userCreated: true,
}
const program: Person = {
  id: 'u2', name: 'Morgan Taylor', department: 'Programs', role: 'Senior Program Manager', email: 'morgan.taylor@hadron.demo',
  expertise: ['MGA Management', 'Commercial Property', 'Underwriting', 'Program Launches', 'MGA Onboarding', 'Risk Assessment'],
  background: 'Works with MGA partners to launch and manage insurance programs, coordinating underwriting, pricing, operations, and technology throughout the program lifecycle.',
  projectIds: [], userCreated: true,
}

const scenarios: [string, Person[]][] = [
  ['I want to develop an estimation process for a new commercial property MGA.', SEED_PEOPLE],
  ["We need a better way to predict how much we'll ultimately pay for claims that are still developing.", SEED_PEOPLE],
  ['We want to automate reconciliation of premium received from our MGA partners against expected policy-level premium.', [...SEED_PEOPLE, integration]],
  ["We're considering launching a new commercial property program with an MGA and need to understand what work we've already done and who should be involved.", [...SEED_PEOPLE, program]],
  ...(process.argv[2] ? [[process.argv[2], SEED_PEOPLE] as [string, Person[]]] : []),
]

for (const [q, people] of scenarios) {
  const r = search(q, people, SEED_PROJECTS)
  console.log('\n=== ' + q)
  console.log('concepts:', [...r.query.direct].join(', '), '| inferred:', [...r.query.inferred].join(', '))
  console.log('PEOPLE:', r.people.map((p) => `${p.person.name} ${p.score}`).join(' | '))
  console.log('SYNERGY:', r.synergy.map((p) => `${p.project.title} ${p.score}`).join(' | '))
  console.log('DUPLICATE:', r.duplicate.map((p) => `${p.project.title} ${p.score}`).join(' | '))
  console.log('WORK:', r.work.map((p) => `${p.project.title} ${p.score}`).join(' | '))
}
