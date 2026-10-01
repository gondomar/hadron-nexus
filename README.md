# Hadron Nexus

Hackathon prototype: an internal knowledge-discovery tool that connects a new idea or problem with the
people, expertise, completed work and active projects most relevant to solving it.

> "Who should I talk to, and what work should I know about before I start this?"

## Run

```bash
npm install
npm run dev        # http://localhost:5173   (deep link: /?q=your+idea)
npm run build      # typecheck + production build
```

Engine sanity check (four scripted demo scenarios, optional custom query):

```bash
node --experimental-strip-types --no-warnings scripts/test-engine.ts ["custom query"]
```

## How it works

- **No backend, no AI dependency.** React + TypeScript + Vite + Tailwind; seed data is local, user-created
  profiles persist in `localStorage`, and **Reset Demo** restores the original data.
- **Semantic matching** via an insurance-domain concept map (`src/engine/concepts.ts`) — e.g. "claims that are
  still developing" maps to Reserving / IBNR / Loss Development.
- **Explainable relevance scores** (`src/engine/match.ts`): people are scored on expertise (35%), project
  experience (25%), insurance domain (15%), department/role (10%) and concept similarity (15%), adjusted for recency.
- **Synergistic** (blue) results flag reusable existing work; **Possible duplicate** (yellow) results flag active
  work that substantially overlaps the idea.

All employees, projects and Jira / Monday.com records are fictional.
