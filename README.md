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

`npm run check` runs TypeScript, content/link checks, diagram and contextual play checks, deterministic game mechanics, formation and route editing checks, full-drive progression, the film audit and all player-to-position mappings. `scripts/*browser-check.cjs` are Playwright CLI `run-code` functions for the local application. `npm run deploy` builds and deploys the dedicated `gridirondex` Hosting site in `brickbrickholdingsllc`.

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

Choose 10, 11 or 12 personnel, or 5-wide, against a randomized defensive look. Twenty-three legal alignments include left/right 10-personnel 3×1 bunch, gun stacks, pistol, inline tight ends and wings. Drag from a player to draw a route, edit its bend/end handles, or change its depth with the slider. Slant, Out, Curl, Post, Flat, Wheel, Go, Drag and Comeback presets stay fully editable. Handles support arrow keys; the player picker and presets provide a keyboard alternative.

Draw a quarterback rollout or use the left/right presets. Rushers pursue the moving quarterback; throwing back across his movement adds release and flight time. Cover 2, Cover 3 Sky, Cover 4 Quarters and Cover 6 split-field show their zone landmarks. Separation when the ball arrives, throwing-lane clearance, yards, route spacing and protection time determine the result. Outcomes are deterministic for the same call and defensive look. Score enough with at least five yards to advance; three failed plays end the run.

Call Zone Read, Power, Draw or Counter and edit the back's path. Blockers engage defenders, pullers lead through the gap, and the first free defender's contact ends the run. RPO pairs the mesh with a quick receiver route; the conflict defender's movement determines give or pull. Contact seals, a read line, the ball and the target window share one clock. Half-speed playback, pause and scrubbing work during execution and result review. Tap a player for their position; drag to draw.

## The Drive

The alternate mode at `#drive` starts first-and-10 at your own 25. Actual gains and losses move the ball; reaching the line to gain resets the downs. Fourth-down failures, touchdowns and safeties end the drive. Each new snap changes the defensive look. The drive strip, field line to gain, down-and-distance, result and play history stay synchronized. Replay never consumes a down, and each mode keeps its call and progress during mode switches and position visits.

Both modes are geometric teaching games with simplified coverage and contact rules. See [gameplay mechanics](docs/gameplay-mechanics.md) for controls, football references and model limits.

## Structure and content

`src/data/blueprints.ts` owns base alignments. `offensivePlays.ts` and `defensivePlays.ts` author the timed tactical scenarios; `playModel.ts`, `playBuilders.ts`, `playScenes.ts` and `playEngine.ts` define, build and sample them. `PlayCanvas.tsx` is the shared SVG renderer for library thumbnails, breakdowns and both game modes. `vectorGeometry.ts` owns arrow and path geometry. `src/game/` separates shared types, formations, route editing, simulation and drive progression from React. `src/data/expansion.ts` contains concise coaching notes, expansion lessons and related IDs. Source metadata lives in `sources.ts`, with verification records in `docs/film-sources.json`, `docs/expansion-sources.md`, `docs/expansion-film-sources.json` and `docs/contextual-plays.md`.

Current film registries are `filmAuditOffense.ts` and `filmAuditDefense.ts`; evidence and exclusions are recorded in `docs/film-audit-offense.json` and `docs/film-audit-defense.json`. No category fallback or unverified long-video introduction is allowed. Verification uses public publisher chapters/descriptions and player duration/embed metadata, not a claim of frame-by-frame viewing. Publishers can change availability. Playbook diagrams show teaching examples; terminology and assignments vary by team.

Hosting HTML revalidates on visits; fingerprinted assets use immutable caching. React, TypeScript, Vite, Tailwind, Lucide and Framer Motion are used. No backend or API key is required. 
