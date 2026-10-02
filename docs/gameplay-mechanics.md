# GridironDex gameplay

Tactical Draft and The Drive use the same field, route editor, and six-second play simulation. Tactical Draft asks whether a call creates a useful opening against the current look. The Drive starts at your own 25 and moves the chains using the yards the ball actually gains.

## Build the call

- Choose 10, 11, or 12 personnel, or a five-receiver empty set. Personnel fixes the players' roles; the formation changes where those players line up. Each set has a quarterback, five offensive linemen, and five eligible receivers, with seven players on the line.
- Choose a formation, then drag from a receiver or the quarterback to draw a path. Presets give you a starting shape. A route's bend and end handles move independently; the depth control scales its upfield travel while its starting point stays fixed. Formation and personnel changes clear paths so the play starts from the new alignment.
- Quarterback rollout paths move the release point. Rushers pursue that moving quarterback. A throw back across the quarterback's movement takes longer to set and travel.
- Runs include Zone Read, Power, Draw, and Counter in either direction. The back follows the drawn run path. Pullers and other blockers move into their assignments, and a run ends at the first unblocked defender's contact or the six-second limit.
- An RPO pairs the run with a quick route. The marked defender's movement at the mesh determines whether the quarterback gives the ball or pulls to throw. A pull still needs an open route behind the vacated fit; the checkbox does not guarantee a completion.

## What the field shows

The defense has eleven players on every snap. Cover 2 uses two deep halves, Cover 3 uses three deep thirds and a Sky rotation, Cover 4 uses four deep quarters, and Cover 6 combines a half with two quarters. Underneath defenders react to routes near their assignments. An added blitz removes an underneath assignment while preserving the deep shell.

All players, the ball, blocks, and read markers share one simulation clock. Pausing or scrubbing changes that same clock. Reduced motion jumps directly to the result, which remains available for manual replay and review. A replay reuses the recorded play and does not consume another down.

## The Drive

The opening situation is first-and-10 at your own 25. Reaching the line to gain resets the down to first and sets the next target ten yards ahead, capped at the goal line. Incompletions gain zero; sacks lose yards. Failing to reach the target on fourth down ends the drive. Reaching the opponent's goal line scores a touchdown; reaching your own goal line with a loss ends it as a safety.

Each completed play records the starting down, start and end spots, credited gain, outcome, and time to throw or hand off. Runs stop when the ball reaches the goal line. A catch can finish inside the ten-yard end zone, but a target beyond its back boundary cannot complete the pass. A legal touchdown credits only the remaining distance to the goal line. A new snap gets a new seeded coverage/front combination; replay keeps the original look. Tactical Draft and The Drive retain their own call and progress when switching modes or opening a position page.

## Simulation limits

This is a geometric teaching game. Route spacing, throwing lanes, pressure, run lanes, and defender leverage determine the result. It does not model a full NFL game: no penalties, interceptions, fumbles, substitutions, fatigue, clock management, punts, or field goals occur in a drive. The visual field uses a fixed scale of twelve drawing units per yard; the drive's absolute field position is tracked separately.

## Football references

- [NFL Football Operations: football terms](https://operations.nfl.com/rules-officiating/nfl-football-basics/football-terms) — downs, line to gain, touchdown, and turnover on downs.
- [USA Football: Inside zone run-pass options](https://blogs.usafootball.com/blog/992/inside-zone-run-pass-options) — combining a run with a quarterback's read and a pass answer.
- [USA Football: RPO — how to defend the run-pass option](https://blogs.usafootball.com/blog/4162/rcfamilies.com) — a defender's competing run-fit and pass-coverage responsibilities, plus the limits of a simple RPO read.

These references support the football concepts. The timing, contact radii, and scoring weights are GridironDex teaching-game choices rather than measured player performance.
