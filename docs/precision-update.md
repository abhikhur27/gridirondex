# Film, playback, and position precision

Checked October 1, 2026.

## Film coverage and evidence

The 105 lessons now have 99 verified film mappings: 64 of 65 offense lessons and 35 of 40 defense/special-teams lessons. Each mapping has explicit start/end bounds, a source link, a verification method, and the publisher evidence supporting its topic. The audit preserves the previous mapping and explains replacements or withheld clips.

Long videos require an actual publisher chapter or a usable timed transcript. Start zero is accepted only for an entire, topic-specific upload shorter than 120 seconds. This audit used public YouTube player metadata, publisher descriptions, and chapter listings. Caption requests did not yield usable timed transcripts; none of these records claims transcript verification or independent viewing of every video frame. Player metadata reported the selected videos as available and embeddable when checked, which does not guarantee future availability or playback in every region.

Six lessons retain their authored animation and written sources without a film embed: **00 personnel, Dollar, field-goal edge overload, field-goal A-gap push, safe field-goal block, and pro-style punt**. Their candidate videos did not establish a defensible topic-specific segment. Generic category videos and made-up offsets are not used as substitutes.

Specific checks include the publisher's 12-personnel chapter at **4:45–6:09** in Armchair Coach Justin's personnel lesson, and a **73-second** Spread Offense clip whose description explicitly distinguishes one-high/closed-middle from two-high/open-middle reads. Trips uses a **16-second** upload explicitly titled as Shotgun Trips Right with three receivers to one side. High-low uses a **60-second** Drive example whose description identifies the shallow cross, dig, and flat; its note identifies it as the same route family as the diagram.

The full records are in [the offense audit](film-audit-offense.json) and [the defense and special-teams audit](film-audit-defense.json). The application imports only the audited mappings.

## Playback and navigation

Lesson playback defaults to half speed, with quarter-speed and normal-speed controls. A single simulation clock drives player positions, contact intervals, the ball, overlays, and captions. Previous/next keyframe controls use sorted, deduplicated times from movement frames, contact boundaries, captions, ball release/arrival, and the labeled playback stages.

Pre-snap motion is visually distinct from post-snap assignments. Players without an authored pre-snap movement hold their alignment through the snap. Position nodes open the corresponding position lesson; returning to Tactical Draft preserves the current run and authored routes.

Tactical Draft distinguishes a node tap from drawing: a tap opens the position lesson, while dragging from an eligible receiver creates a route. Independent browser checks exercised preset assignment, node navigation, browser Back, and route dragging. These checks establish the interaction behavior; simulation and full-browser regression results are recorded by the accompanying check scripts.
