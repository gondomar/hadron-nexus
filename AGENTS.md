# Hadron Nexus (hackathon prototype)

- Run: `npm install && npm run dev` → http://localhost:5173 (deep link: `/?q=your+idea`)
- Build/typecheck: `npm run build`
- Engine sanity check (4 scripted demo scenarios + optional custom query):
  `node --experimental-strip-types --no-warnings scripts/test-engine.ts ["custom query"]`
- App name/branding: `src/config.ts` (`APP_NAME`, `APP_SHORT_NAME`); brand colours/fonts in `src/index.css` `@theme`
  (Hadron deep green `#0c473b`, green `#2e796a`, gold `#cc9139`, cyan `#6de4fa`; Playfair Display + Inter);
  official logos in `public/brand/`.
- Seed data: `src/data/people.ts` (fictional employees), `src/data/projects.ts`. The two live-demo personas
  (Finance Technology senior data engineer, Programs senior program manager) are intentionally NOT seeded.
- Concept/synonym map: `src/engine/concepts.ts`; scoring + synergy/duplicate classification: `src/engine/match.ts`
- User-created/edited profiles persist in localStorage key `hadron-nexus:people:v2`; Reset Demo clears it.
