# GridironDex

A paper-and-ink football playbook with a route-drawing game.

[Live app](https://gridirondex.web.app) · [Repository](https://github.com/abhikhur27/gridirondex)

## Develop

Node.js 24+.

```sh
npm ci
npm run dev
```

## Validate and deploy

```sh
npm run check
npm run build
firebase deploy --only hosting
```

`npm run check` runs TypeScript, content/link checks, the diagram validator, contextual play checks and the deterministic Tactical Draft engine checks. `scripts/browser-check.cjs`, `scripts/context-browser-check.cjs` and `scripts/game-browser-check.cjs` are Playwright CLI `run-code` functions for the local application. `npm run deploy` builds and deploys the dedicated `gridirondex` Hosting site in `brickbrickholdingsllc`.

## Playbook

- 105 concepts across 15 football categories: routes, passing concepts, formations, blocking, gaps, personnel, positions, reads, situations, coverages, fronts, stunts, reactions and special teams.
- Every concept has its own explicit vector blueprint. Missing diagrams fail validation instead of falling back to a repeated placeholder.
- Every animation uses a two-team `PlayCanvas`: offensive routes/blocks and defensive coverage/run fits share a single clock. Contact constraints hold engaged players together and keep combination blockers on separate shoulders.
- Trimmed shafts meet filled arrow caps. Defensive assignments use dashed paths between solid pre-snap X markers and faded destinations.
- Breakdowns open with a playable, scrubbable diagram. PRE-SNAP, SNAP, DEVELOPMENT and RESULT controls jump through the sequence; captions, contact seals, read lines, gap/zone fills and ball movement update together. Linked terms and related pills open the corresponding concept; the URL can be copied to share it.
- Film tabs retain researched coaching clips and chapter timestamps. Field-goal edge overload and safe rush use diagram previews with coaching sources.
- Off-white `#F2F0EC`, Syne block typography, muted-to-ink hover states and minimal controls. Keyboard navigation and reduced motion are supported.

## Tactical Draft

Choose 11 personnel, 12 personnel or 5-wide against a randomized defensive look. Drag from an eligible O to draw a route. The player picker and route presets provide a keyboard alternative. Choose balanced protection or slide toward an edge threat, then hit SNAP.

Receivers follow the same smoothed paths that are rendered. Defenders follow man, zone or rush rules. The quarterback looks for a catch window before pressure arrives; separation at the catch, throwing-lane clearance, yards, route spacing and protection time determine the result. Keeping a back or tight end in buys protection time. Score enough with a five-yard completion to advance. Higher levels tighten reaction time, speed and the required score. Three failed plays end the run; editing, replay and restart are built in.

Protection assignments now move the blockers into reciprocal contact with rushers; a held-in back or tight end can pick up an extra defender. Contact seals, a read line and a target window explain the live play. The result has a review scrubber. This is a teaching game with geometric coverage and simplified blocking constraints, not a professional play-prediction model. The score is deterministic for the same routes, personnel, protection and defensive look; only the sequence of looks is randomized.

## Structure and content

`src/data/blueprints.ts` owns base alignments. `offensivePlays.ts` and `defensivePlays.ts` author the timed tactical scenarios; `playModel.ts`, `playBuilders.ts`, `playScenes.ts` and `playEngine.ts` define, build and sample them. `PlayCanvas.tsx` is the shared SVG renderer for library thumbnails, breakdowns and Tactical Draft. `vectorGeometry.ts` owns arrow and path geometry. `src/game/engine.ts` owns game rules independently from React. `src/data/expansion.ts` contains concise coaching notes, expansion lessons and related IDs. Source metadata lives in `sources.ts`, with verification records in `docs/film-sources.json`, `docs/expansion-sources.md`, `docs/expansion-film-sources.json` and `docs/contextual-plays.md`.

Published chapters supply exact timestamps where available. Other relevant clips start at their introduction and carry a note explaining their scope. Publishers can change availability. Playbook diagrams show teaching examples; terminology and assignments vary by team.

Hosting HTML revalidates on visits; fingerprinted assets use immutable caching. React, TypeScript, Vite, Tailwind, Lucide and Framer Motion are used. No backend or API key is required. 
