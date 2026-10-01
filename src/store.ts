import { useEffect, useState } from 'react'
import { SEED_PEOPLE } from './data/people.ts'
import { STORAGE_KEY } from './config.ts'
import type { Person } from './types.ts'

function load(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Person[]
  } catch {
    /* fall through to seed data */
  }
  return SEED_PEOPLE
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>(load)
  const [dirty, setDirty] = useState(() => localStorage.getItem(STORAGE_KEY) !== null)

  useEffect(() => {
    if (dirty) localStorage.setItem(STORAGE_KEY, JSON.stringify(people))
  }, [people, dirty])

  const savePerson = (person: Person) => {
    setDirty(true)
    setPeople((prev) => (prev.some((p) => p.id === person.id) ? prev.map((p) => (p.id === person.id ? person : p)) : [...prev, person]))
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setDirty(false)
    setPeople(SEED_PEOPLE)
  }

  return { people, savePerson, reset }
}
