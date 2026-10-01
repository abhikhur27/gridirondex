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

`npm run check` runs TypeScript, content/link checks, diagram and contextual play checks, the deterministic Tactical Draft checks, the film audit and all player-to-position mappings. `scripts/*browser-check.cjs` are Playwright CLI `run-code` functions for the local application. `npm run deploy` builds and deploys the dedicated `gridirondex` Hosting site in `brickbrickholdingsllc`.

## Playbook

- 105 concepts across 15 football categories: routes, passing concepts, formations, blocking, gaps, personnel, positions, reads, situations, coverages, fronts, stunts, reactions and special teams.
- Every concept has its own explicit vector blueprint. Missing diagrams fail validation instead of falling back to a repeated placeholder.
- Every animation uses a two-team `PlayCanvas`: offensive routes/blocks and defensive coverage/run fits share a single clock. Contact constraints hold engaged players together and keep combination blockers on separate shoulders.
- Trimmed shafts meet filled arrow caps. Pre-snap motion uses light dashed paths; post-snap assignments use solid ink. Defensive X markers retain faded origins and destinations.
- Breakdowns default to half speed, with quarter/full-speed options, a scrubber, exact event stepping and five stages: PRE-SNAP, MOTION / RELEASE, SNAP / CONTACT, BREAK / DROP and RESULT. Captions, contact seals, read lines, gap/zone fills and ball movement update together.
- Every player opens a position deep dive with alignment, technique and assignment notes. Forty profiles cover both teams and special teams, through `#positions/tight-end` or `/positions/tight-end`. Game state survives position visits.
- All 105 film mappings were audited. Ninety-nine use publisher chapter boundaries or complete topic-specific videos shorter than two minutes. Six unverified clips are withheld; their diagrams and written sources remain. Visible source credits link to the exact timestamp below film and coaching notes.
- Off-white `#F2F0EC`, Syne block typography, muted-to-ink hover states and minimal controls. Keyboard navigation and reduced motion are supported.

## Tactical Draft

Choose 11 personnel, 12 personnel or 5-wide against a randomized defensive look. Drag from an eligible O to draw a route. The player picker and route presets provide a keyboard alternative. Choose balanced protection or slide toward an edge threat, then hit SNAP.

Receivers follow the same smoothed paths that are rendered. Defenders follow man, zone or rush rules. The quarterback looks for a catch window before pressure arrives; separation at the catch, throwing-lane clearance, yards, route spacing and protection time determine the result. Keeping a back or tight end in buys protection time. Score enough with a five-yard completion to advance. Higher levels tighten reaction time, speed and the required score. Three failed plays end the run; editing, replay and restart are built in.

Protection assignments move the blockers into reciprocal contact with rushers; a held-in back or tight end can pick up an extra defender. Contact seals, a read line and a target window explain the live play. Half-speed playback, pause, speed and timeline controls work during playback and result review. Tap a player for their position; drag an eligible player to draw. This is a teaching game with geometric coverage and simplified blocking constraints, not a professional play-prediction model. The score is deterministic for the same routes, personnel, protection and defensive look; only the sequence of looks is randomized.

## Structure and content

`src/data/blueprints.ts` owns base alignments. `offensivePlays.ts` and `defensivePlays.ts` author the timed tactical scenarios; `playModel.ts`, `playBuilders.ts`, `playScenes.ts` and `playEngine.ts` define, build and sample them. `PlayCanvas.tsx` is the shared SVG renderer for library thumbnails, breakdowns and Tactical Draft. `vectorGeometry.ts` owns arrow and path geometry. `src/game/engine.ts` owns game rules independently from React. `src/data/expansion.ts` contains concise coaching notes, expansion lessons and related IDs. Source metadata lives in `sources.ts`, with verification records in `docs/film-sources.json`, `docs/expansion-sources.md`, `docs/expansion-film-sources.json` and `docs/contextual-plays.md`.

Current film registries are `filmAuditOffense.ts` and `filmAuditDefense.ts`; evidence and exclusions are recorded in `docs/film-audit-offense.json` and `docs/film-audit-defense.json`. No category fallback or unverified long-video introduction is allowed. Verification uses public publisher chapters/descriptions and player duration/embed metadata, not a claim of frame-by-frame viewing. Publishers can change availability. Playbook diagrams show teaching examples; terminology and assignments vary by team.

Hosting HTML revalidates on visits; fingerprinted assets use immutable caching. React, TypeScript, Vite, Tailwind, Lucide and Framer Motion are used. No backend or API key is required. 
