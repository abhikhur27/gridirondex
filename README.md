# GridironDex

See the play. Understand the game. A paper-and-ink football field guide built with React, TypeScript and Vite. Newsreader headings, warm field paper and solid blue/goldenrod routes frame the learning experience.

**Live:** https://gridirondex.web.app

**Repository:** https://github.com/abhikhur27/gridirondex

## Run locally

Node.js 24 or newer is used for the content validation script.

```sh
npm ci
npm run dev
```

## Build and deploy

```sh
npm run check
npm run build
npm run preview
npm run deploy
```

The deploy command builds `dist/` and deploys only the `gridirondex` Hosting site in the authenticated Firebase project `brickbrickholdingsllc`. Install the Firebase CLI with `npm install -g firebase-tools` and authenticate with `firebase login` if deploying from another machine. Firebase configuration targets this dedicated site explicitly.

## What is included

- 80 searchable lessons across 11 offensive and defensive topics, covering football formations, routes, and coverages.
- SVG routes and blocking paths with curved breaks, moving players, pause/replay, scrubbing and playback speed. Select a player or route to redraw its assignment; hover or keyboard focus highlights it while dimming unrelated elements.
- Cover 0, 1, 2, 3, 4 and 6 alignment and territory comparisons; 11 players per side.
- Pan, zoom, fullscreen, optional labels, and keyboard-accessible player assignments.
- Film dialogs using privacy-enhanced YouTube embeds, with direct-watch fallbacks, published chapter segments for routes and Cover 1–4, and companion official NFL route film.
- Coaching explanations, defender reads, tactical responses and linked sources for every lesson.
- Local saved plays and display preferences, shareable concept/coverage URLs, a field guide and film index.
- A focused editorial layout with a searchable library drawer, floating playback controls and paper film dialogs. Responsive desktop/mobile layout, trapped dialog focus, Escape dismissal, visible keyboard focus and reduced-motion support.

## Content conventions

These diagrams are teaching examples, not an NFL team's playbook or a physics simulation. Defensive paths demonstrate spot-drop or man responsibilities; the selectable shell does not model every match rule. Personnel describes player types, not formation. Route numbering and position letters vary among coaching systems. The play clock is illustrative, not measured game-film timing.

Video identities, availability and embed permission were checked against the publishers' public player metadata on September 28, 2026. Published chapters supply exact starts/ends where available; a dedicated concept breakdown without chapters starts from its introduction at 0:00. Related overview films are identified in their captions. Publishers can later restrict or remove embeds; the same segment is always linked on YouTube. Source pages may challenge automated requests.

No backend, accounts, API keys or billing services are required. Bookmarks are stored in this browser's local storage and are not synchronized between devices.

## Project structure

```text
src/App.tsx                 Application navigation and lesson views
src/components/Field.tsx    SVG field and animation
src/components/FilmModal.tsx Accessible film dialog
src/data/concepts.ts        Lessons and taxonomy
src/data/diagrams.ts        Route geometry, players and zones
src/data/sources.ts         Sources and verified film segments
src/hooks.ts               Playback and local preferences
src/tokens.css              Shared design tokens
scripts/check-content.ts   Content and diagram integrity checks
docs/                      Design and validation records
firebase.json              Production Hosting configuration
```


