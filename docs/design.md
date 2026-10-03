# Design

GridironDex uses an off-white paper field, block typography and solid blue/red ink. Football alignments and movement provide the visual hierarchy. Controls stay compact so the field remains the main object on each screen.

## Tokens

The shared values live in `src/tokens.css`.

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F2F0EC` | Page and field background |
| Block | `#E6E4DF` | Hovered and selected surfaces |
| Card | `#FAF9F6` | Raised surfaces |
| Ink | `#252824` | Primary text |
| Muted | `#90928D` | Inactive content |
| Logo | `#9E9E9E` | Resting wordmark |
| Blue | `#0070F3` | Offense |
| Red | `#D32F2F` | Defense |
| Amber | `#FF8A00` | Secondary emphasis |

Syne supplies headings and block controls; DM Sans supplies body text. The spacing scale is 4, 8, 12, 16, 24, 32 and 48 pixels. A faint SVG grain adds texture to the paper surface.

## Layout and interaction

Home begins with large OFFENSE and DEFENSE alignment choices, alongside entries for special teams and the games. Categories lead to a visual lesson grid. Tiles are muted at rest and gain a darker paper surface and accent ink on hover or keyboard focus. The wordmark follows the same muted-to-color interaction.

Lesson breakdowns place a large playable diagram above a short takeaway, related-topic links and source credits. Film appears only where a suitable clip is mapped. Position profiles place alignment and technique notes below the diagram. Modal controls support Escape, focus containment and focus return.

## Field rendering

`PlayCanvas` renders both teams on a shared timeline. Player tracks, blocking contacts, gap and zone highlights, quarterback reads, ball movement and captions use the same sampled time. Offensive players use O markers; defensive players use X markers. Faded origins and destinations preserve the relationship between alignment and assignment.

Arrow shafts stop at the base of filled caps. Light dashed paths indicate pre-snap motion; solid paths indicate post-snap assignments. Labels sit near the action they explain. Playback defaults to half speed, with quarter-speed and full-speed options, a scrubber and event stepping. Reduced motion supports immediate results and manual timeline control.

## Games

Tactical Draft combines one large field with personnel, formation, protection and play controls. Selected routes expose bend and endpoint handles; presets and a depth slider provide alternatives to freehand drawing. Handles also respond to keyboard arrows. Player taps open position information, while dragging creates a route.

Coverage landmarks, rollout restrictions and RPO reads appear on the field. The Drive adds a compact field-position strip, down-and-distance and play history. Mode changes and position visits preserve the current call and progress. At narrow widths, controls wrap below the field and remain reachable without horizontal scrolling.
