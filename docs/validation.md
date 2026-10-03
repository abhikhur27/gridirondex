# Validation

## Automated checks

```sh
npm run check
npm run build
```

The check command runs TypeScript and the following regression coverage:

| Area | Coverage |
| --- | --- |
| Content | Unique lesson IDs, category coverage, concise notes, source references and related links |
| Blueprints | Explicit lesson geometry, unique diagrams, bounded coordinates, player counts, legal alignments and clean arrow joins |
| Lesson playback | Complete offensive and defensive units, finite sampled positions, contact spacing, timed reads and highlights, ball outcomes and deterministic scrubbing |
| Player navigation | Scene actors resolve to position profiles; profile lessons and related links exist |
| Formations and routes | Legal personnel, 23 alignments, route presets, depth editing and stable route origins |
| Game mechanics | Coverage shells, moving-quarterback pressure, throwing lanes, run schemes, blocking contacts, RPO decisions and end-zone bounds |
| Drive progression | Signed gains, downs, first downs, incompletions, sacks, touchdowns, safeties, terminal state and complete simulated drives |
| Film | Per-lesson evidence and exclusions, timestamp bounds, generated source/embed URLs and player error handling |

`npm run build` compiles the production bundle. Vite may report a non-blocking warning about the main bundle's size.

## Browser checks

The `scripts/*browser-check.cjs` files contain Playwright CLI `run-code` functions for a running application. They supplement the offline checks with real browser input and layout assertions.

| Script | Coverage |
| --- | --- |
| `browser-check.cjs` | Library navigation, lesson links, modal focus, keyboard controls and reduced motion |
| `context-browser-check.cjs` | All lesson timelines, both teams moving, contacts, captions, hover playback and backward scrubbing |
| `positions-browser-check.cjs` | Position pages, player links, direct URLs, browser Back and retained game routes |
| `precision-browser-check.cjs` | Playback speed, event stepping, source timestamps, motion styles and mobile controls |
| `game-browser-check.cjs` | Drawing, undo, presets, level progression, restart and result review |
| `gameplay-browser-check.cjs` | Formation changes, route handles and depth, QB movement, RPO reads, run settings, drive history, replay and retained mode state |

Responsive checks cover 320, 375, 414, 768 and 1440-pixel viewports across these suites. Gameplay checks include native touch input at 320 and 375 pixels, keyboard handle editing, pointer release outside the field and a normal-motion pause/resume cycle. Control bounds are compared with the document's visible width.

On Windows Chromium, a full-page screenshot can reflow the page while clipping the scrollbar width. Use viewport screenshots and measured element bounds together when checking narrow layouts.

## Film availability

```sh
npm run check:films-live
```

This separate network check inspects public YouTube watch, oEmbed and embedded-player preview metadata. Its report distinguishes unavailable videos from incomplete checks caused by network errors or rate limits. It does not start media playback in a browser.

An HTTP 200 response or a watch-page `playableInEmbed` flag does not prove that a third-party iframe can play a video. Publisher restrictions, region, browser state and later changes can affect playback. The [offensive](film-audit-offense.json) and [defensive](film-audit-defense.json) records identify the evidence used for each lesson; chapter or description checks should not be interpreted as full video viewing. Keep exclusions explicit when instructional relevance or playback cannot be established.

## Model limits

Lesson animations are teaching examples. Team terminology, coverage adjustments and blocking assignments vary. The games use geometric coverage, contact and throwing rules rather than a physics model or a prediction of real football outcomes. See [gameplay mechanics](gameplay-mechanics.md) and [contextual plays](contextual-plays.md) for the rules, references and scope.
