# Validation record

Current interface checked on October 1, 2026. Earlier records below describe superseded interfaces.

## Precision and navigation update

The current release passes TypeScript, content, blueprint, contextual-play, game, film and position checks. All 105 lesson mappings are audited: 99 bounded films have publisher chapter or short-topic evidence, and six unverified mappings have no fallback embed. The audit checks actual generated embed/source URLs, start/end bounds, duration, availability metadata, coverage and exclusions. Evidence limits and excluded topics are detailed in `precision-update.md`.

All 2,310 scene actors resolve to 40 position profiles. Browser checks cover every profile, direct position URLs, current and post-snap node clicks, thumbnail keyboard navigation, correct TE/OLB/line/special-team mappings, returning to an originating lesson, and preserving a drafted route through position navigation and browser Back. No player buttons are nested inside tile buttons.

The full contextual browser suite passed all 105 lessons at all five playback stages, reversible scrubbing, both teams moving, contact/caption synchronization, hover playback, reduced motion and 320/375/414/768/1440-pixel layouts. The precision suite measured approximately half a simulated second during one second of default playback, checked previous/next event stepping, exact 12-personnel embed and attribution timestamps, withheld-film behavior, and dashed pre-snap versus solid post-snap paths. The retained navigation suite also passed focus trapping, source/backlink navigation, film chapters and game entry.

The game suite passed pause/resume during execution, mouse and native touch drawing, undo, keyboard presets, package changes, successful level advancement, three failures/restart and review scrubbing. All browser suites completed without application runtime errors. Screenshots of the position deep dive and mobile playback controls were reviewed. Production build passed; Vite retains its non-blocking large-main-chunk warning (610 kB minified, 194 kB gzip).


## Contextual play overhaul — previous release

All 105 lessons now have distinct authored 11-on-11 sequences rendered by `PlayCanvas`. Validation requires both complete units, unique player IDs and scene geometry, movement by both sides, valid timed contacts/reads/highlights, a ball outcome and at least four different phase captions. Forty-three samples per lesson check finite field positions and contact spacing; repeated samples prove backward scrubbing is deterministic. Normal assignments hold until SNAP; explicitly authored pre-snap motion is exempt. Combination blockers have separate shoulder positions.

Targeted assertions cover the Y–ER chip at 0.8s, RT takeover and Y's flat release, tackle/TE climbs against linebackers in both zone schemes, and the safety entering the box against 12 personnel. Tactical Draft tests also require distinct blocker assignments, reciprocal contact while the pocket holds and released contact when pressure arrives.

The contextual Playwright suite passed all 105 lessons through PRE-SNAP, SNAP, DEVELOPMENT and RESULT, checked both teams moving and exact backward restoration, and verified hover playback, chip contact/captions, reduced motion, and layouts at 320, 375, 414, 768 and 1440 pixels. Visual review covered Chip, Inside Zone, 12 Personnel, Cover 3 and Tex; contact-player guide clutter was removed and labels avoid active bodies. The retained library browser suite passed film chapters, backlinks, navigation, focus trapping and keyboard controls. Game checks passed mouse and native touch drawing, winning/losing progression, keyboard review scrubbing and the shared canvas at mobile widths. No application runtime errors occurred.

Production TypeScript/build and the content, blueprint, play and game checks passed. The new lesson scenarios are authored coaching examples with simplified contact constraints; the game remains a geometric simulation. Neither claims to predict live football. Coaching references and timing scope are recorded in `contextual-plays.md`.


## Engine expansion and Tactical Draft — previous release

The current library contains 105 individually defined blueprints across 15 content categories and 16 navigation sections. New modules cover formations, tackle/end games, cross-dog and fire-zone pressure, gap letters, one/two-gap fits, field-goal rush, punt protection, gunner releases and wall returns. All 105 coaching notes are at most two sentences; all 315 related references resolve. Twenty-three of the 25 added lessons have verified topic films; two field-goal variants have diagram previews and sources. See `expansion-sources.md` and `expansion-film-sources.json` for clip scope and verification limits.

`npm run check` passes TypeScript, concise-content/source/link checks, explicit blueprint coverage and uniqueness, finite/bounded geometry, route starts and clean shaft/cap joins. Formation/personnel tests require eleven players, seven on the line, four in the backfield and uncovered eligible ends. Fire-zone checks require five rushers and the proper deep structure; stunt loopers have delayed movement. Blueprint geometry rejects missing concepts rather than returning a placeholder.

The library browser check passes home and category navigation, all 105 reachable lessons, filled caps without SVG markers, diagram play/pause/scrubbing/reset, film chapters, inline Cover 1 backlinks, URL/back-button restoration, modal focus and inert background, reduced motion, and game entry. Visual and bounds checks cover 320, 375, 414, 768 and desktop. A live media-query hook handles reduced-motion changes during the visit. Header bounds and distinct field-goal titles received an additional responsive check.

Tactical Draft engine checks compare useful calls with empty/backward routes, verify deterministic results, legal personnel, eleven defenders, protection and blocker effects, bounded coordinates, arrow caps, passing-lane clearance, progression, three-loss run completion, seed variety and a winnable late-level defense. The browser checks verify real pointer drawing, undo, keyboard route selection, personnel resets, SNAP and a successful advance, three failed plays and restart, reduced motion, and native CDP touch dragging. Mobile game screenshots at all four required widths and desktop/result views were reviewed. Both browser suites completed with zero application runtime errors.

The game uses geometric teaching rules for coverage and pressure. It does not simulate contact blocking or claim to predict a real football play. Formation and film teaching examples remain source-linked; publisher introductions and overview clips are labeled honestly.


## Complete toy-block rebuild

Home now contains only OFFENSE and DEFENSE, each with eleven X/O markers. Syne block typography, native paper grain and borderless muted tiles replace the editorial layout. The library drawer, long notes, bookmarks and full-play controls were removed. The 80 concepts and researched film records remain available across eleven categories.

The browser check verifies two-choice navigation, seven offense categories, four defense categories, all thirteen route glyphs, logo and container ink states, selected route replay on click/Enter, concise film-card contents, Mesh coaching text, route and coverage chapter timestamps, Escape dismissal and focus restoration, inert modal background, section URL restoration, reduced motion and touch-style selection. Coverage vectors originate at their corresponding eleven defensive X nodes. No application runtime errors occurred.

Screenshots of the home and route grid at 320, 375, 414 and 768 pixels were inspected, along with desktop hover, coverage and film views. Home labels fit every tested width and the page has no horizontal scroll. A loaded Mesh embed was visually confirmed; the early screenshot captured before the iframe loaded is not the playback evidence.

`npm run check` validates the retained 80-concept dataset and TypeScript. `npm run build` compiles the production bundle. Existing Hosting HTML revalidation and immutable fingerprinted assets remain in place.


## Paper & ink redesign

The redesign preserves the 80 lessons and replaces the visual system with Newsreader/DM Sans, warm paper, solid ink paths, an editorial split, a searchable library drawer and paper film cards. No persistent sidebar or ambient glow remains.

The updated browser check passed with zero application runtime errors: correct assignment highlighting and dimming on hover, eased selection tracing, repeated keyboard route replay, full-play animation and pause/reset, coverage comparison, pan/zoom/fullscreen, bookmark persistence, searchable browsing, source expansion, coverage/route film chapters, official companion film, mobile destinations and reduced motion. Controls remain within the viewport at 320, 375, 414, 768 and 1280 pixels. All four required mobile/tablet screenshots, desktop, drawer and film views were visually reviewed. Source metadata and timestamps are unchanged.

Hosting now serves the root page and HTML with `Cache-Control: no-cache` so visits revalidate the page after deployments. Hashed assets retain immutable caching. An existing session with the prior one-hour HTML cache needs its first reload to pick up this policy.


## Original content and deployment checks

- `npm run check`: 80 unique lessons, 11 categories, required taxonomy, linked sources, valid film segment bounds, 11 players per side, finite diagram coordinates and routes starting at their assigned players.
- `npm run build`: TypeScript and Vite production build passed.
- Browser interaction checks: playback, pause/reset, scrubbing, defense/label toggles, player assignments, zoom/reset, bookmark persistence, saved view, search, lesson navigation, expandable sources, coverage and route film timestamps, official NFL companion film, close/Escape behavior, mobile navigation and reduced motion. No application runtime errors.
- Responsive checks at 320, 375, 414, 768 and 1280 pixels. Desktop and mobile screenshots inspected for hierarchy, readable explanations and field/control layout.
- All 36 distinct videos used by lessons returned available, embeddable publisher player metadata. See `film-sources.json` for the source identities and per-lesson segment record.


Diagrams simplify match rules and movement. Chapter timestamps are verified where publishers provide them; unchaptered breakdowns start at their introduction, and related overview films are labeled. Metadata availability does not guarantee playback in every browser or region. Full authentication, cross-device storage and a physics simulation are outside this implementation.
