# Validation record

Checked on September 28, 2026.

- `npm run check`: 80 unique lessons, 11 categories, required taxonomy, linked sources, valid film segment bounds, 11 players per side, finite diagram coordinates and routes starting at their assigned players.
- `npm run build`: TypeScript and Vite production build passed.
- Browser interaction checks: playback, pause/reset, scrubbing, defense/label toggles, player assignments, zoom/reset, bookmark persistence, saved view, search, lesson navigation, expandable sources, coverage and route film timestamps, official NFL companion film, close/Escape behavior, mobile navigation and reduced motion. No application runtime errors.
- Responsive checks at 320, 375, 414, 768 and 1280 pixels. Desktop and mobile screenshots inspected for hierarchy, readable explanations and field/control layout.
- All 36 distinct videos used by lessons returned available, embeddable publisher player metadata. See `film-sources.json` for the source identities and per-lesson segment record.


Diagrams simplify match rules and movement. Chapter timestamps are verified where publishers provide them; unchaptered breakdowns start at their introduction, and related overview films are labeled. Metadata availability does not guarantee playback in every browser or region. Full authentication, cross-device storage and a physics simulation are outside this implementation.
