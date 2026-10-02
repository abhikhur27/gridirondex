# Film quality and playback audit — 2026-10-02

All 105 lesson mappings were reviewed. The library now has 79 instructional clips from 30 videos, with 26 lessons explicitly using their animation and written sources only. Compared with the previous release, 19 segments were replaced or retimed and 20 weak clips were removed. No lesson or diagram was removed.

## Corrections

- A/B/C/D gaps use Lineman University's whiteboard explanation. B-gap starts at 0:18 and ends at 0:39, replacing the 14-second QB drill. The replacement was played on an HTTPS Firebase preview; visible labels and burned-in captions were inspected around 0:08, 0:18, 0:23, 0:28 and 0:38. This is recorded as visual review, not a retrieved transcript.
- NFL content in `_WXKHRTSMm4` (play action), `u7sjtJfJuAk` (A-gap), and `gBHQZOulvIY` (angle route, uploaded by Everything Explained) returned explicit embedding restrictions even though watch-page flags allowed embedding. Play action and A-gap have replacements; the angle-route film is withheld.
- TEX/ET, fire zone, two-gap technique, defensive alignments, and other lessons now use instructional chapters or substantive short coaching lessons. Raw highlights, unannotated practice cutups, and title-only matches do not qualify.
- Opening chapters may start at zero when the publisher explicitly identifies that opening section as the lesson. No arbitrary one-second offsets are used to disguise generic introductions.

## Playback behavior

`FilmPlayer` uses the official YouTube IFrame API and the current site's origin. Publisher restrictions, removed videos, and loading failures produce a readable fallback with retry. Every film also has a direct YouTube link preserving its starting timestamp. Changing lessons or formats destroys the previous player.

The production-built component was exercised on an HTTPS preview: a known NFL block showed the fallback; retry preserved it; switching to Fourth and Film's Mesh chapter recovered and played. The B-gap replacement also played inside the full lesson drawer with `start=18`, `end=39`, and matching source links. Localhost cross-origin iframe loading was unreliable in the available browser, so actual playback was checked on HTTPS. No mobile browser playback claim is made.

## Evidence and limits

- `film-audit-offense.json` and `film-audit-defense.json` retain all 105 decisions, the instructional evidence, rejected candidates, and reasons for omissions.
- `film-link-health.json` records a successful final live check of every retained video: watch metadata, oEmbed, and the embedded-player preview each passed for all 30 videos. No blocked or incomplete checks remained.
- The full library's relevance review uses publisher descriptions and exact chapter boundaries; it does not claim that every video was watched in full. Direct browser playback was sampled separately, as described above. YouTube restrictions can change or vary by viewer.
- `npm run check:films-live` repeats the live checks with bounded concurrency, timeouts, and per-host rate-limit handling. Offline film checks require a matching successful embed audit, preserve source timestamps, and reject the known bad clips.

Validation: `npm run check`, the four new SDK lifecycle/error tests, and `npm run build` passed. The pre-existing large-bundle warning remains.
