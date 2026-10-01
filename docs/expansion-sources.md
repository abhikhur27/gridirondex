# Expansion content and film checks

Checked 2026-10-01. The expansion adds 25 lessons, bringing the library to 105. Each new lesson has a custom playable diagram, a short coaching takeaway and three related concept IDs. All 315 related links resolve to existing lessons.

## Coaching references

- Formations: [NFL Football Operations](https://operations.nfl.com/rules-officiating/nfl-football-basics/formations), [X&O Labs Pistol Formation Study](https://www.xandolabs.com/wp-content/uploads/2023/12/The-Pistol-Formation-Study-small.pdf), [USA Football / FirstDown PlayBook](https://assets.usafootball.com/documents/fdpb/FDPB-DEFENSE-PLAYBOOK_final.pdf), and the [Flexbone Association](https://flexboneassociation.wordpress.com/2014/02/05/flexbone-and-triple-option-basic-formational-utilization/).
- Tackle/end games: [Brandon Thorn’s USA Football explanation](https://blogs.usafootball.com/blog/6442/how-the-coffeehouse-stunt-can-help-your-defense) distinguishes tackle-first T/E and end-first E/T. The visual sequence follows that distinction.
- Cross Dog: [Philadelphia Eagles film analysis](https://www.philadelphiaeagles.com/news/eagle-eye-inside-the-td-that-has-fans-excited-for-the-season-19174558) identifies the crossing inside linebackers and A-gap targets.
- Fire zone: [USA Football’s Manny Diaz breakdown](https://blogs.usafootball.com/blog/6996/learn-how-manny-diaz-s-fire-zone-s-helped-miami-lead-the-country-in-tfl-s) and [Jon Heacock’s clinic excerpt](https://www.championshipproductions.com/news/2016/11/10/fire-zone-defense-scheme-from-jon-heacock/) support the five-rush, three-under, three-deep structure.
- Gaps and fits: [Coach Jay Freeman’s gap lettering](https://lineplayfootball.com/trench-dictionary/a-gap) and [Mike Kuchar’s defensive line coaching](https://blogs.usafootball.com/blog/583/defensive-line-techniques-for-defeating-one-on-one-blocks). C is outside the tackle; with an attached tight end, D is outside the tight end. Front alignment does not by itself determine one-gap or two-gap technique.
- Field-goal block: [Southwest Baptist scouting report](https://www.coachallen.com/PDFs/MWSU-st.pdf) records overloads, edge rush and fake coverage; the [Ravens’ Campbell block breakdown](https://www.baltimoreravens.com/news/calais-campbell-wins-afc-special-teams-player-week) identifies his A-gap penetration.
- Punt protection and coverage: [Chris Fore’s shield installation](https://coachchrisfore.wordpress.com/2012/04/05/shield-punt-maximizing-field-position-minimizing-blocks-and-returns/), [Christopher Smithley’s pro-style punt](https://www.xandolabs.com/the-lab/special-teams/punt/installing-a-pro-style-spread-punt/), [Fore on gunners](https://coachfore.org/2015/09/07/neutralizing-the-punt-team-gunners/), and [Human Kinetics’ wall return](https://coachesinsider.com/football/wall-punt-return-article/).

## Video verification

23 of the 25 added lessons have a film option, using 16 distinct verified videos. `expansion-film-sources.json` records the exact titles, channels, durations, concept associations, offsets and verification method. Public YouTube player metadata returned `OK` and `playableInEmbed: true` for each included video. This confirms the publisher’s embed setting when checked; playback can still vary by region or later publisher changes.

I-Formation, Singleback, Pistol and Empty use exact publisher chapter starts from Fourth and Film’s formation guide: 1:47, 4:09, 9:24 and 14:36. Cross Dog uses MatchQuarters’ “Film Breakdown: At the Snap” chapter at 2:28. No unverified timestamp is labeled as an exact play.

Other videos begin at zero and are labeled as a dedicated introduction, clinic excerpt, overview or practice cutup. The shared gap and run-fit videos explicitly cover multiple gap types; they are not represented as separate isolated plays. Trips uses a coaching breakdown of how a defense adjusts to that formation. The gunner release clip is TJ Weist’s coaching excerpt shared by James Light, with that attribution retained.

The Philadelphia Eagles’ T/E video was excluded because its player metadata disallows embedding. Tex uses Inside the Pylon’s dedicated T/E exchange clip instead. Field-goal edge overload and safe rush remain vector-only; no sufficiently specific, embeddable clip was verified for those two lessons.

Captions did not return usable transcripts through the public metadata request. Topic verification therefore used publisher titles, descriptions, chapter lists and the coaching references above. Film identities and offsets were validated in code against the retrieved metadata; no claim is made that every full video was watched end to end.
