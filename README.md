# GridironDex

A minimal football toy: choose offense or defense, trace a pattern, and watch it on film.

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

`npm run deploy` also builds and deploys. Hosting targets the dedicated `gridirondex` site in `brickbrickholdingsllc`. HTML revalidates on visits; fingerprinted assets use immutable caching.

## Interface

- Two borderless home blocks with eleven O/X alignment markers each.
- 80 visual concepts across 11 offensive and defensive categories.
- Muted vector routes that turn blue/red and draw on hover, keyboard focus or selection.
- Compact film popups containing only a YouTube embed and a one- or two-sentence coaching takeaway.
- Syne block typography, off-white paper texture, tactile states, mobile layouts, keyboard navigation and reduced-motion support.

The previous dashboard, long explanation panels, library drawer, bookmarks, full-play clock and field controls were removed from the interface as part of the complete rebuild. Coaching sources and researched metadata remain in `src/data` and `docs/film-sources.json`.

## Content

Diagrams are teaching examples. Coverage and personnel rules vary by team. Video identities and embed permission were checked on September 28, 2026; publishers can change availability. Published chapters provide exact segments where available. Dedicated unchaptered breakdowns start at their introduction; related overview sources remain identified in the dataset.

The app uses React, TypeScript, Vite, Tailwind, Lucide and Framer Motion. No backend or API keys are required. All commits go directly to `main`.
