import type { VerifiedFilm } from './filmModel.ts'

// Every segment is independently tied to publisher chapter boundaries or a
// complete, topic-specific upload shorter than two minutes. No category fallback.
// Full per-lesson audit: docs/film-audit-offense.json.
export const offenseFilms: Record<string, VerifiedFilm> = {
  "flat": {
    "id": "2exkTbFboDw",
    "title": "Flat route",
    "channel": "Fourth and Film",
    "start": 20,
    "end": 131,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Flat route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Flat route at 20s and the next section (Slant) at 131s.",
      "checkedOn": "2026-10-01"
    }
  },
  "slant": {
    "id": "2exkTbFboDw",
    "title": "Slant route",
    "channel": "Fourth and Film",
    "start": 131,
    "end": 220,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Slant route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Slant route at 131s and the next section (Comeback) at 220s.",
      "checkedOn": "2026-10-01"
    }
  },
  "comeback": {
    "id": "2exkTbFboDw",
    "title": "Comeback route",
    "channel": "Fourth and Film",
    "start": 220,
    "end": 332,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Comeback route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Comeback route at 220s and the next section (Curl) at 332s.",
      "checkedOn": "2026-10-01"
    }
  },
  "curl": {
    "id": "2exkTbFboDw",
    "title": "Curl route",
    "channel": "Fourth and Film",
    "start": 332,
    "end": 405,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Curl route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Curl route at 332s and the next section (Hitch) at 405s.",
      "checkedOn": "2026-10-01"
    }
  },
  "out": {
    "id": "2exkTbFboDw",
    "title": "Out route",
    "channel": "Fourth and Film",
    "start": 467,
    "end": 555,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Out route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Out route at 467s and the next section (Dig) at 555s.",
      "checkedOn": "2026-10-01"
    }
  },
  "dig": {
    "id": "2exkTbFboDw",
    "title": "Dig route",
    "channel": "Fourth and Film",
    "start": 555,
    "end": 611,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Dig route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Dig route at 555s and the next section (Drag) at 611s.",
      "checkedOn": "2026-10-01"
    }
  },
  "corner": {
    "id": "2exkTbFboDw",
    "title": "Corner route",
    "channel": "Fourth and Film",
    "start": 730,
    "end": 789,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Corner route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Corner route at 730s and the next section (Post) at 789s.",
      "checkedOn": "2026-10-01"
    }
  },
  "post": {
    "id": "2exkTbFboDw",
    "title": "Post route",
    "channel": "Fourth and Film",
    "start": 789,
    "end": 871,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Post route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Post route at 789s and the next section (Go) at 871s.",
      "checkedOn": "2026-10-01"
    }
  },
  "go": {
    "id": "2exkTbFboDw",
    "title": "Go route",
    "channel": "Fourth and Film",
    "start": 871,
    "end": 957,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Go route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Go route at 871s and the next section (Wheel) at 957s.",
      "checkedOn": "2026-10-01"
    }
  },
  "wheel": {
    "id": "2exkTbFboDw",
    "title": "Wheel route",
    "channel": "Fourth and Film",
    "start": 957,
    "end": 982,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Wheel route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Wheel route at 957s and the next section (Seam) at 982s.",
      "checkedOn": "2026-10-01"
    }
  },
  "option": {
    "id": "2exkTbFboDw",
    "title": "Option route",
    "channel": "Fourth and Film",
    "start": 1067,
    "end": 1096,
    "durationSeconds": 1152,
    "note": "Publisher chapter: Option route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=2exkTbFboDw",
      "excerpt": "Publisher description places Option route at 1067s and the next section (Stop-and-go) at 1096s.",
      "checkedOn": "2026-10-01"
    }
  },
  "angle": {
    "id": "gBHQZOulvIY",
    "title": "Angle route",
    "channel": "Everything Explained",
    "start": 113,
    "end": 122,
    "durationSeconds": 263,
    "note": "Publisher chapter: Angle route.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=gBHQZOulvIY",
      "excerpt": "Publisher description places Angle route at 113s and the next section (Hitch) at 122s.",
      "checkedOn": "2026-10-01"
    }
  },
  "mesh": {
    "id": "Ebn6c1jNZbo",
    "title": "Mesh",
    "channel": "Fourth and Film",
    "start": 20,
    "end": 85,
    "durationSeconds": 771,
    "note": "Publisher chapter: Mesh.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Mesh at 20s and the next section (Levels) at 85s.",
      "checkedOn": "2026-10-01"
    }
  },
  "mesh-crossers": {
    "id": "Ebn6c1jNZbo",
    "title": "Mesh crossers",
    "channel": "Fourth and Film",
    "start": 20,
    "end": 85,
    "durationSeconds": 771,
    "note": "Publisher chapter: Mesh crossers.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Mesh crossers at 20s and the next section (Levels) at 85s.",
      "checkedOn": "2026-10-01"
    }
  },
  "flood": {
    "id": "Ebn6c1jNZbo",
    "title": "Flood",
    "channel": "Fourth and Film",
    "start": 152,
    "end": 210,
    "durationSeconds": 771,
    "note": "Publisher chapter: Flood.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Flood at 152s and the next section (Smash) at 210s.",
      "checkedOn": "2026-10-01"
    }
  },
  "smash": {
    "id": "Ebn6c1jNZbo",
    "title": "Smash",
    "channel": "Fourth and Film",
    "start": 210,
    "end": 265,
    "durationSeconds": 771,
    "note": "Publisher chapter: Smash.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Smash at 210s and the next section (Y-Cross) at 265s.",
      "checkedOn": "2026-10-01"
    }
  },
  "y-cross": {
    "id": "Ebn6c1jNZbo",
    "title": "Y-Cross",
    "channel": "Fourth and Film",
    "start": 265,
    "end": 331,
    "durationSeconds": 771,
    "note": "Publisher chapter: Y-Cross.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Y-Cross at 265s and the next section (Four Verticals) at 331s.",
      "checkedOn": "2026-10-01"
    }
  },
  "four-verticals": {
    "id": "Ebn6c1jNZbo",
    "title": "Four Verticals",
    "channel": "Fourth and Film",
    "start": 331,
    "end": 395,
    "durationSeconds": 771,
    "note": "Publisher chapter: Four Verticals.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Four Verticals at 331s and the next section (Stick) at 395s.",
      "checkedOn": "2026-10-01"
    }
  },
  "drive": {
    "id": "Ebn6c1jNZbo",
    "title": "Drive",
    "channel": "Fourth and Film",
    "start": 459,
    "end": 522,
    "durationSeconds": 771,
    "note": "Publisher chapter: Drive.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Drive at 459s and the next section (Dagger) at 522s.",
      "checkedOn": "2026-10-01"
    }
  },
  "dagger": {
    "id": "Ebn6c1jNZbo",
    "title": "Dagger",
    "channel": "Fourth and Film",
    "start": 522,
    "end": 578,
    "durationSeconds": 771,
    "note": "Publisher chapter: Dagger.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Ebn6c1jNZbo",
      "excerpt": "Publisher description places Dagger at 522s and the next section (Slant-Flat) at 578s.",
      "checkedOn": "2026-10-01"
    }
  },
  "hi-lo": {
    "id": "RWilD1L4EBU",
    "title": "Chiefs high-low: shallow cross and dig",
    "channel": "RGR Football - Kansas City Chiefs",
    "start": 0,
    "end": 60,
    "durationSeconds": 60,
    "note": "This Drive example uses the same shallow/dig high-low family as the diagram.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=RWilD1L4EBU",
      "excerpt": "60-second Chiefs high-low breakdown; publisher explicitly identifies a shallow cross paired with a basic dig, with a back in the flat and a deep clear-out.",
      "checkedOn": "2026-10-01"
    }
  },
  "scissors": {
    "id": "2zV4rLnfzJ4",
    "title": "Eagles Scissors cutup",
    "channel": "Bobby Peters",
    "start": 0,
    "end": 31,
    "durationSeconds": 31,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=2zV4rLnfzJ4",
      "excerpt": "31-second football cutup; publisher labels this single play 2017 Eagles Scissors 2.",
      "checkedOn": "2026-10-01"
    }
  },
  "boot": {
    "id": "fZzsR_7xbpc",
    "title": "Boot pass: first All-22 example",
    "channel": "American Football Academy",
    "start": 105,
    "end": 220,
    "durationSeconds": 669,
    "note": "Publisher chapter: Boot pass: first All-22 example.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=fZzsR_7xbpc",
      "excerpt": "Publisher description places Boot pass: first All-22 example at 105s and the next section (Second All-22 example) at 220s.",
      "checkedOn": "2026-10-01"
    }
  },
  "inside-zone": {
    "id": "Of_TwCsCETs",
    "title": "Inside zone",
    "channel": "Fourth and Film",
    "start": 512,
    "end": 719,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Inside zone.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Inside zone at 512s and the next section (Split zone) at 719s.",
      "checkedOn": "2026-10-01"
    }
  },
  "outside-zone": {
    "id": "Of_TwCsCETs",
    "title": "Outside zone",
    "channel": "Fourth and Film",
    "start": 809,
    "end": 950,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Outside zone.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Outside zone at 809s and the next section (Jet zone) at 950s.",
      "checkedOn": "2026-10-01"
    }
  },
  "power": {
    "id": "Of_TwCsCETs",
    "title": "Power O",
    "channel": "Fourth and Film",
    "start": 998,
    "end": 1185,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Power O.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Power O at 998s and the next section (Counter) at 1185s.",
      "checkedOn": "2026-10-01"
    }
  },
  "counter": {
    "id": "Of_TwCsCETs",
    "title": "Counter",
    "channel": "Fourth and Film",
    "start": 1185,
    "end": 1222,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Counter.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Counter at 1185s and the next section (Duo) at 1222s.",
      "checkedOn": "2026-10-01"
    }
  },
  "duo": {
    "id": "Of_TwCsCETs",
    "title": "Duo",
    "channel": "Fourth and Film",
    "start": 1222,
    "end": 1364,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Duo.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Duo at 1222s and the next section (Trap) at 1364s.",
      "checkedOn": "2026-10-01"
    }
  },
  "trap": {
    "id": "Of_TwCsCETs",
    "title": "Trap",
    "channel": "Fourth and Film",
    "start": 1364,
    "end": 1498,
    "durationSeconds": 1631,
    "note": "Publisher chapter: Trap.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=Of_TwCsCETs",
      "excerpt": "Publisher description places Trap at 1364s and the next section (Wham) at 1498s.",
      "checkedOn": "2026-10-01"
    }
  },
  "slide": {
    "id": "NnRR6K-xt9k",
    "title": "Full slide protection",
    "channel": "Thinking Football",
    "start": 224,
    "end": 276,
    "durationSeconds": 895,
    "note": "Publisher chapter: Full slide protection.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=NnRR6K-xt9k",
      "excerpt": "Publisher description places Full slide protection at 224s and the next section (Half slide protection) at 276s.",
      "checkedOn": "2026-10-01"
    }
  },
  "man-protection": {
    "id": "NnRR6K-xt9k",
    "title": "5-0 / B.O.B protection",
    "channel": "Thinking Football",
    "start": 146,
    "end": 224,
    "durationSeconds": 895,
    "note": "Publisher chapter: 5-0 / B.O.B protection.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=NnRR6K-xt9k",
      "excerpt": "Publisher description places 5-0 / B.O.B protection at 146s and the next section (Full slide protection) at 224s.",
      "checkedOn": "2026-10-01"
    }
  },
  "chip": {
    "id": "kdFkHSkszkM",
    "title": "Chip block",
    "channel": "The QB Nerd",
    "start": 0,
    "end": 76,
    "durationSeconds": 76,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=kdFkHSkszkM",
      "excerpt": "76-second instructional upload by The QB Nerd, titled CHIP BLOCK; the upload is dedicated to that block.",
      "checkedOn": "2026-10-01"
    }
  },
  "play-action": {
    "id": "_WXKHRTSMm4",
    "title": "NFL 101: The Play-Action Pass",
    "channel": "NFL",
    "start": 0,
    "end": 103,
    "durationSeconds": 103,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=_WXKHRTSMm4",
      "excerpt": "103-second NFL lesson; publisher identifies Solomon Wilcots explaining the play-action pass.",
      "checkedOn": "2026-10-01"
    }
  },
  "personnel-10": {
    "id": "A-HH3Ws1Nw4",
    "title": "10 personnel",
    "channel": "Armchair Coach Justin",
    "start": 82,
    "end": 121,
    "durationSeconds": 528,
    "note": "Publisher chapter: 10 personnel.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=A-HH3Ws1Nw4",
      "excerpt": "Publisher description places 10 personnel at 82s and the next section (11 personnel) at 121s.",
      "checkedOn": "2026-10-01"
    }
  },
  "personnel-11": {
    "id": "A-HH3Ws1Nw4",
    "title": "11 personnel",
    "channel": "Armchair Coach Justin",
    "start": 121,
    "end": 223,
    "durationSeconds": 528,
    "note": "Publisher chapter: 11 personnel.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=A-HH3Ws1Nw4",
      "excerpt": "Publisher description places 11 personnel at 121s and the next section (21 personnel) at 223s.",
      "checkedOn": "2026-10-01"
    }
  },
  "personnel-21": {
    "id": "A-HH3Ws1Nw4",
    "title": "21 personnel",
    "channel": "Armchair Coach Justin",
    "start": 223,
    "end": 285,
    "durationSeconds": 528,
    "note": "Publisher chapter: 21 personnel.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=A-HH3Ws1Nw4",
      "excerpt": "Publisher description places 21 personnel at 223s and the next section (12 personnel) at 285s.",
      "checkedOn": "2026-10-01"
    }
  },
  "personnel-12": {
    "id": "A-HH3Ws1Nw4",
    "title": "12 personnel",
    "channel": "Armchair Coach Justin",
    "start": 285,
    "end": 369,
    "durationSeconds": 528,
    "note": "Publisher chapter: 12 personnel.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=A-HH3Ws1Nw4",
      "excerpt": "Publisher description places 12 personnel at 285s and the next section (22 personnel) at 369s.",
      "checkedOn": "2026-10-01"
    }
  },
  "personnel-22": {
    "id": "A-HH3Ws1Nw4",
    "title": "22 personnel",
    "channel": "Armchair Coach Justin",
    "start": 369,
    "end": 441,
    "durationSeconds": 528,
    "note": "Publisher chapter: 22 personnel.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=A-HH3Ws1Nw4",
      "excerpt": "Publisher description places 22 personnel at 369s and the next section (13 personnel) at 441s.",
      "checkedOn": "2026-10-01"
    }
  },
  "quarterback": {
    "id": "KA_EFlU0CWY",
    "title": "Quarterback",
    "channel": "Lurks Lessons",
    "start": 35,
    "end": 60,
    "durationSeconds": 642,
    "note": "Publisher chapter: Quarterback.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=KA_EFlU0CWY",
      "excerpt": "Publisher description places Quarterback at 35s and the next section (Running back) at 60s.",
      "checkedOn": "2026-10-01"
    }
  },
  "running-back": {
    "id": "KA_EFlU0CWY",
    "title": "Running back",
    "channel": "Lurks Lessons",
    "start": 60,
    "end": 81,
    "durationSeconds": 642,
    "note": "Publisher chapter: Running back.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=KA_EFlU0CWY",
      "excerpt": "Publisher description places Running back at 60s and the next section (Fullback) at 81s.",
      "checkedOn": "2026-10-01"
    }
  },
  "fullback": {
    "id": "KA_EFlU0CWY",
    "title": "Fullback",
    "channel": "Lurks Lessons",
    "start": 81,
    "end": 107,
    "durationSeconds": 642,
    "note": "Publisher chapter: Fullback.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=KA_EFlU0CWY",
      "excerpt": "Publisher description places Fullback at 81s and the next section (Wide receiver) at 107s.",
      "checkedOn": "2026-10-01"
    }
  },
  "tight-end": {
    "id": "KA_EFlU0CWY",
    "title": "Tight end",
    "channel": "Lurks Lessons",
    "start": 223,
    "end": 259,
    "durationSeconds": 642,
    "note": "Publisher chapter: Tight end.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=KA_EFlU0CWY",
      "excerpt": "Publisher description places Tight end at 223s and the next section (Defensive line) at 259s.",
      "checkedOn": "2026-10-01"
    }
  },
  "x-receiver": {
    "id": "wtr9X6HGDkU",
    "title": "X receiver: boundary double move",
    "channel": "SpreadOffense",
    "start": 0,
    "end": 15,
    "durationSeconds": 15,
    "note": "A complete X-receiver example, showing the boundary alignment and route.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=wtr9X6HGDkU",
      "excerpt": "15-second X-receiver example; publisher identifies an X boundary post-and-go with maximum protection.",
      "checkedOn": "2026-10-01"
    }
  },
  "z-receiver": {
    "id": "IP-vp9T1BBE",
    "title": "Z receiver: motion into a shallow route",
    "channel": "SpreadOffense",
    "start": 0,
    "end": 16,
    "durationSeconds": 16,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=IP-vp9T1BBE",
      "excerpt": "16-second Z-receiver example; publisher describes presnap motion improving the angle against man/Cover 1 and confirming coverage.",
      "checkedOn": "2026-10-01"
    }
  },
  "slot": {
    "id": "gA3bQrIkxA8",
    "title": "Slot receiver coaching detail",
    "channel": "First Down Training",
    "start": 0,
    "end": 60,
    "durationSeconds": 60,
    "note": "A short coaching lesson aimed specifically at slot receivers.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=gA3bQrIkxA8",
      "excerpt": "60-second First Down Training coaching short exclusively addressed to slot wide receivers in its publisher title.",
      "checkedOn": "2026-10-01"
    }
  },
  "safety-count": {
    "id": "6jIUfw0ISUM",
    "title": "One-high vs. two-high: Josh Gattis read",
    "channel": "SpreadOffense",
    "start": 0,
    "end": 73,
    "durationSeconds": 73,
    "note": "A short coaching comparison of one-high and two-high safety structures.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=6jIUfw0ISUM",
      "excerpt": "73-second Josh Gattis coaching excerpt: publisher explicitly contrasts one-high/closed middle with two-high/open middle and the corresponding receiver read.",
      "checkedOn": "2026-10-01"
    }
  },
  "hot-read": {
    "id": "fWQk9BOYPn0",
    "title": "Hot answer against edge pressure",
    "channel": "Cover 1",
    "start": 0,
    "end": 46,
    "durationSeconds": 46,
    "note": "The quarterback gets the ball out against pressure; the receiver drops it.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=fWQk9BOYPn0",
      "excerpt": "46-second Cover 1 analysis: publisher identifies edge pressure, a required quick release, correct leverage placement, and the tight end dropping the pass.",
      "checkedOn": "2026-10-01"
    }
  },
  "leverage": {
    "id": "mLS-BvxIKFM",
    "title": "Attack the defender’s leverage",
    "channel": "First Down Training",
    "start": 0,
    "end": 114,
    "durationSeconds": 114,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=mLS-BvxIKFM",
      "excerpt": "114-second First Down Training lesson; publisher says it teaches attacking leverage and creating route separation with a vertical set.",
      "checkedOn": "2026-10-01"
    }
  },
  "apex": {
    "id": "GyJ5lfIJ34E",
    "title": "Read the apex defender",
    "channel": "CoachLasker",
    "start": 0,
    "end": 119,
    "durationSeconds": 119,
    "note": "A short interactive coaching demonstration focused on the apex read.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=GyJ5lfIJ34E",
      "excerpt": "119-second coaching demonstration; publisher specifically describes teaching quarterbacks to read movement of the apex/conflict defender.",
      "checkedOn": "2026-10-01"
    }
  },
  "conflict-linebacker": {
    "id": "xrpX3Qy8Vu8",
    "title": "Drive: the high-low read",
    "channel": "SpreadOffense",
    "start": 0,
    "end": 19,
    "durationSeconds": 19,
    "note": "A high-low variation uses a deeper cross instead of the dig.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=xrpX3Qy8Vu8",
      "excerpt": "19-second Drive high-low cutup; publisher identifies the cross-country route used instead of a dig in a trips-bunch variation.",
      "checkedOn": "2026-10-01"
    }
  },
  "press-check": {
    "id": "CaRErLtTPww",
    "title": "The defensive answer to a stack check",
    "channel": "The DB Network",
    "start": 0,
    "end": 86,
    "durationSeconds": 86,
    "note": "A defensive coaching view of the stack adjustment and its man-coverage answer.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=CaRErLtTPww",
      "excerpt": "86-second coaching lesson about defending stacked receivers; publisher discusses the man-coverage response to the stack and avoiding in/out exchanges.",
      "checkedOn": "2026-10-01"
    }
  },
  "zero-beater": {
    "id": "tLx-yfYD5AQ",
    "title": "Hoss Y-Juke: Cover 0 check",
    "channel": "Noah Riley",
    "start": 0,
    "end": 44,
    "durationSeconds": 44,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=tLx-yfYD5AQ",
      "excerpt": "44-second cutup dedicated to a Hoss Y-Juke Cover 0 check, explicitly identified in the publisher title.",
      "checkedOn": "2026-10-01"
    }
  },
  "box-count": {
    "id": "fvaR530daz8",
    "title": "Box count: give or pull",
    "channel": "SpreadOffense",
    "start": 0,
    "end": 29,
    "durationSeconds": 29,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=fvaR530daz8",
      "excerpt": "29-second cutup; publisher explicitly shows two presnap box-count decisions, giving the ball versus pulling and throwing.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-i": {
    "id": "sRaIlyv95hs",
    "title": "I-formation",
    "channel": "Fourth and Film",
    "start": 107,
    "end": 249,
    "durationSeconds": 1086,
    "note": "Publisher chapter: I-formation.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=sRaIlyv95hs",
      "excerpt": "Publisher description places I-formation at 107s and the next section (Single back) at 249s.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-singleback": {
    "id": "sRaIlyv95hs",
    "title": "Single back",
    "channel": "Fourth and Film",
    "start": 249,
    "end": 351,
    "durationSeconds": 1086,
    "note": "Publisher chapter: Single back.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=sRaIlyv95hs",
      "excerpt": "Publisher description places Single back at 249s and the next section (Pro set) at 351s.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-pistol": {
    "id": "sRaIlyv95hs",
    "title": "Pistol",
    "channel": "Fourth and Film",
    "start": 564,
    "end": 669,
    "durationSeconds": 1086,
    "note": "Publisher chapter: Pistol.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=sRaIlyv95hs",
      "excerpt": "Publisher description places Pistol at 564s and the next section (Spread) at 669s.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-empty": {
    "id": "sRaIlyv95hs",
    "title": "Empty",
    "channel": "Fourth and Film",
    "start": 876,
    "end": 971,
    "durationSeconds": 1086,
    "note": "Publisher chapter: Empty.",
    "verification": {
      "kind": "publisher-chapter",
      "sourceUrl": "https://www.youtube.com/watch?v=sRaIlyv95hs",
      "excerpt": "Publisher description places Empty at 876s and the next section (Jumbo) at 971s.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-trips": {
    "id": "GhCDEK3Go8k",
    "title": "Shotgun Trips Right alignment",
    "channel": "Football Flex",
    "start": 0,
    "end": 16,
    "durationSeconds": 16,
    "note": "A short alignment example: three receivers on the right and the back opposite.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=GhCDEK3Go8k",
      "excerpt": "16-second alignment clip; publisher explicitly identifies Shotgun Trips Right as three WRs on one side, with the running back aligned opposite.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-flexbone": {
    "id": "HDv2EcqpDcU",
    "title": "Flexbone triple option",
    "channel": "FirstDown PlayBook",
    "start": 0,
    "end": 64,
    "durationSeconds": 64,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=HDv2EcqpDcU",
      "excerpt": "64-second FirstDown PlayBook lesson specifically installing triple option from the FlexBone formation.",
      "checkedOn": "2026-10-01"
    }
  },
  "formation-wishbone": {
    "id": "G4CvyWoWVwE",
    "title": "Wishbone dive example",
    "channel": "Chris Cole",
    "start": 0,
    "end": 13,
    "durationSeconds": 13,
    "note": "A short Wishbone alignment and dive example.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=G4CvyWoWVwE",
      "excerpt": "13-second standalone play upload explicitly titled Wishbone Dive by its publisher.",
      "checkedOn": "2026-10-01"
    }
  },
  "gap-b": {
    "id": "FQDh04WRz7M",
    "title": "B-gap: open and closed",
    "channel": "Coach and Coordinator Network",
    "start": 0,
    "end": 14,
    "durationSeconds": 14,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=FQDh04WRz7M",
      "excerpt": "14-second Coach and Coordinator Network drill, explicitly titled B-Gap Opened & Closed and credited to Keith Grabowski.",
      "checkedOn": "2026-10-01"
    }
  },
  "gap-a": {
    "id": "u7sjtJfJuAk",
    "title": "Tom Brady explains the A-gap",
    "channel": "NFL",
    "start": 0,
    "end": 22,
    "durationSeconds": 22,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=u7sjtJfJuAk",
      "excerpt": "22-second official NFL short specifically titled Brady explaining the A Gap.",
      "checkedOn": "2026-10-01"
    }
  },
  "gap-c": {
    "id": "aQGZUzThaMM",
    "title": "Press the C-gap",
    "channel": "Championship Productions",
    "start": 0,
    "end": 62,
    "durationSeconds": 62,
    "note": "The complete short clip covers this specific topic.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=aQGZUzThaMM",
      "excerpt": "62-second coach Brad Seaburg clinic excerpt specifically teaching the quarterback to press the C-gap in inside veer.",
      "checkedOn": "2026-10-01"
    }
  },
  "gap-d": {
    "id": "0yJPC-_gHFs",
    "title": "Outside veer: the D-gap keep",
    "channel": "CFBK - Coaching Football with Brian Klee",
    "start": 0,
    "end": 36,
    "durationSeconds": 36,
    "note": "Three outside-veer examples show keep, give, and keep for a touchdown.",
    "verification": {
      "kind": "short-topic",
      "sourceUrl": "https://www.youtube.com/watch?v=0yJPC-_gHFs",
      "excerpt": "36-second Coach Brian Klee cutup; publisher explicitly identifies the fullback give in C-gap versus the quarterback keep in D-gap.",
      "checkedOn": "2026-10-01"
    }
  }
}
