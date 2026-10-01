# Contextual animation engine

The library uses authored teaching plays with both teams. They illustrate a specified defensive response and its consequence; they are not predictions that a particular personnel package will always force the same response. The seeded game uses reactive man/zone rules and protection assignments instead.

## Runtime

All lesson motion samples a 4.2-second clock. Each player has timed waypoints. Engagements constrain both actors to opposite sides of a moving contact point, with shoulder spacing for double teams. Releasing blockers resume their next assignment after contact; a deterministic separation pass gives unengaged players a body-width corridor. Sampling an earlier time recreates that exact state without depending on prior playback.

The same sample drives player positions, ball flight or handoff, active reads, lane/zone shading, contact seals and the current coaching caption. Hover playback and the breakdown scrubber use the same scene. Reduced-motion users can jump to stages or scrub directly.

Tactical Draft uses the same SVG component with its game simulation frames. Its line sets into contact, extra blockers pick up rushers, and contact ends before the pressure reaches the QB. Protection choice changes the pocket time used by scoring. Result review scrubs the same saved frames used during execution.

## Coaching references

- [USA Football: zone combination questions](https://blogs.usafootball.com/blog/1344/answering-the-5-most-common-questions-in-zone-combinations) — combinations identify both the down defender and a linebacker; the climb depends on the block and linebacker movement.
- [USA Football: attacking the Tite front with inside zone](https://blogs.usafootball.com/blog/7458/attacking-the-tite-front-with-inside-zone) — examples of tackle/TE combinations, second-level climbs, and a handoff/pass choice based on the overhang defender.
- [Philadelphia Eagles: offense against Miami](https://www.philadelphiaeagles.com/news/eagle-eye-how-the-offense-took-flight-against-miami-19259248) — an E–T stunt sends the end first and loops the tackle behind him.

Existing concept-level coaching sources and film citations remain available in each breakdown. Exact timing and simplified coordinates are authored teaching examples; they do not claim frame-for-frame reproduction of the linked film.
