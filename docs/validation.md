# Validation record

Checked on September 28, 2026.

## Paper & ink redesign

The redesign preserves the 80 lessons and replaces the visual system with Newsreader/DM Sans, warm paper, solid ink paths, an editorial split, a searchable library drawer and paper film cards. No persistent sidebar or ambient glow remains.

The updated browser check passed with zero application runtime errors: correct assignment highlighting and dimming on hover, eased selection tracing, repeated keyboard route replay, full-play animation and pause/reset, coverage comparison, pan/zoom/fullscreen, bookmark persistence, searchable browsing, source expansion, coverage/route film chapters, official companion film, mobile destinations and reduced motion. Controls remain within the viewport at 320, 375, 414, 768 and 1280 pixels. All four required mobile/tablet screenshots, desktop, drawer and film views were visually reviewed. Source metadata and timestamps are unchanged.


## Original content and deployment checks

- `npm run check`: 80 unique lessons, 11 categories, required taxonomy, linked sources, valid film segment bounds, 11 players per side, finite diagram coordinates and routes starting at their assigned players.
- `npm run build`: TypeScript and Vite production build passed.
- Browser interaction checks: playback, pause/reset, scrubbing, defense/label toggles, player assignments, zoom/reset, bookmark persistence, saved view, search, lesson navigation, expandable sources, coverage and route film timestamps, official NFL companion film, close/Escape behavior, mobile navigation and reduced motion. No application runtime errors.
- Responsive checks at 320, 375, 414, 768 and 1280 pixels. Desktop and mobile screenshots inspected for hierarchy, readable explanations and field/control layout.
- All 36 distinct videos used by lessons returned available, embeddable publisher player metadata. See `film-sources.json` for the source identities and per-lesson segment record.


Diagrams simplify match rules and movement. Chapter timestamps are verified where publishers provide them; unchaptered breakdowns start at their introduction, and related overview films are labeled. Metadata availability does not guarantee playback in every browser or region. Full authentication, cross-device storage and a physics simulation are outside this implementation.
