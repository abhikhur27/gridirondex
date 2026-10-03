# GridironDex

An interactive football playbook with editable routes, coordinated X/O animations and two play-calling games.

[Live app](https://gridiron-dex.com) · [Firebase mirror](https://gridirondex.web.app) · [Repository](https://github.com/abhikhur27/gridirondex)

## Development

Requires Node.js 24 or later.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

`npm run check` runs TypeScript and the content, diagram, animation, game, film, player and drive checks. See [validation](docs/validation.md) for coverage and browser checks.

## Playbook

The library contains 105 lessons across 15 football categories, including routes, concepts, formations, coverages, stunts, gap fits and special teams. Each lesson has a distinct diagram, a short coaching takeaway and related lessons. Both teams, the ball, blocking contacts and coverage landmarks follow one animation clock.

Breakdowns include playback speeds, scrubbing and event stepping. Player markers open one of 40 position profiles with alignment, technique and assignment notes. Position pages support links such as `#positions/tight-end` and `/positions/tight-end`; returning to a game preserves the call and progress. Keyboard controls and reduced motion are supported.

Selected lessons include bounded coaching videos with visible source credits. The [offensive](docs/film-audit-offense.json) and [defensive](docs/film-audit-defense.json) film records document the evidence, timestamps and exclusions for each mapping. Lessons without a suitable clip retain their diagrams and written references. YouTube availability can change, and metadata alone does not guarantee embedded playback.

## Tactical Draft

Choose 10, 11 or 12 personnel, or 5-wide, and build a call against a generated defense. The game offers 23 formations, editable route presets, draggable route bends and a depth slider. Quarterback routes support rollouts. Passing results account for separation, throwing lanes, spacing and protection; identical calls against the same look produce identical results.

Run plays include Zone Read, Power, Draw and Counter, with editable running-back paths and blocking assignments. RPO calls pair the mesh with a quick route and react to the conflict defender. Successful calls advance to harder looks; three failed plays end the run. Mouse, touch and keyboard controls are available.

## The Drive

The mode at `#drive` starts first-and-10 at your own 25. Gains and losses move the ball, reaching the line to gain resets the downs, and each new snap changes the defensive look. Touchdowns, safeties and fourth-down failures end the drive. Replay does not consume a down, and switching modes preserves each game's state.

Both modes use simplified geometric coverage and contact rules. See [gameplay mechanics](docs/gameplay-mechanics.md) for controls, football references and model limits.

## Project structure

| Location | Purpose |
| --- | --- |
| `src/data/concepts.ts`, `expansion.ts`, `sources.ts` | Lessons, related topics and source metadata |
| `src/data/blueprints.ts` | Pre-snap alignments and assignment geometry |
| `src/data/offensivePlays.ts`, `defensivePlays.ts` | Timed lesson scenarios |
| `src/data/playModel.ts`, `playBuilders.ts`, `playScenes.ts`, `playEngine.ts` | Scene types, construction and timeline sampling |
| `src/components/PlayCanvas.tsx` | Shared SVG renderer for lessons and games |
| `src/data/vectorGeometry.ts` | Arrow and path geometry |
| `src/game/` | Personnel, formations, route editing, simulation and drive progression |
| `src/data/filmAuditOffense.ts`, `filmAuditDefense.ts` | Per-lesson film mappings |

The app uses React, TypeScript, Vite, Tailwind, Lucide and Framer Motion. It runs without a backend or API key. [Design](docs/design.md) documents the visual system; [contextual plays](docs/contextual-plays.md) describes lesson animation behavior and references.

## Deployment

With Firebase CLI access to the configured project:

```sh
npm run deploy
```

This builds the app and deploys the `gridirondex` Hosting site in Firebase project `brickbrickholdingsllc`. HTML revalidates on visits; fingerprinted assets use immutable caching.
