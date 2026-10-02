import type { VerifiedFilm } from './filmModel.ts'

const checkedOn = '2026-10-02'
function chapter(id: string, title: string, channel: string, durationSeconds: number, start: number, end: number, excerpt: string, note = 'Starts at the named instructional chapter.'): VerifiedFilm {
  return { id, title, channel, start, end, durationSeconds, note, verification: { kind: 'publisher-chapter', sourceUrl: `https://www.youtube.com/watch?v=${id}`, excerpt, checkedOn } }
}
function short(id: string, title: string, channel: string, durationSeconds: number, excerpt: string): VerifiedFilm {
  return { id, title, channel, start: 0, end: durationSeconds, durationSeconds, note: 'Complete short coaching lesson.', verification: { kind: 'short-topic', sourceUrl: `https://www.youtube.com/watch?v=${id}`, excerpt, checkedOn } }
}

// Every mapping has instructional evidence and explicit topic boundaries.
// Preview metadata permits embedding; it is not proof of actual browser playback.
// The companion audit preserves all 40 decisions, including omitted cutups.
export const defenseFilms: Record<string, VerifiedFilm> = {
  "cover-0": chapter("ROliJ27Br9A", "Cover 0: no safety help", "Fourth and Film", 906, 0, 73, "0:00 Cover 0; 1:13 begins Cover 1. The opening chapter is the coverage lesson, not an intro."),
  "cover-1": chapter("ywFXMI1X-Ys", "Cover 1 · Joel Klatt", "The Joel Klatt Show", 1794, 71, 430, "1:11–7:10 Cover 1", "Starts at the publisher’s named chapter."),
  "cover-2": chapter("ywFXMI1X-Ys", "Cover 2 · Joel Klatt", "The Joel Klatt Show", 1794, 431, 925, "7:11–15:25 Cover 2", "Starts at the publisher’s named chapter."),
  "cover-3": chapter("ywFXMI1X-Ys", "Cover 3 · Joel Klatt", "The Joel Klatt Show", 1794, 926, 1260, "15:26–21:00 Cover 3", "Starts at the publisher’s named chapter."),
  "cover-4": chapter("ywFXMI1X-Ys", "Cover 4 · Joel Klatt", "The Joel Klatt Show", 1794, 1261, 1771, "21:01–29:31 Cover 4", "Starts at the publisher’s named chapter."),
  "cover-6": chapter("3H85mWMTdME", "Cover 6 whiteboard breakdown", "MatchQuarters · Cody Alexander", 471, 129, 214, "02:09 Whiteboard: Breaking Down Cover 6; 03:34 begins Cover 8.", "Starts at the publisher’s named chapter."),
  "4-3": chapter("Q6iuu58jLgU", "4–3 defensive formation", "Fourth and Film", 726, 348, 421, "5:48 4-3; 7:01 46 Bear", "Starts at the publisher’s named chapter."),
  "3-4": chapter("Q6iuu58jLgU", "3–4 defensive formation", "Fourth and Film", 726, 279, 348, "4:39 3-4; 5:48 4-3", "Starts at the publisher’s named chapter."),
  "bear": chapter("Q6iuu58jLgU", "46 Bear front", "Fourth and Film", 726, 421, 503, "7:01 46 Bear; 8:23 Nickel", "Starts at the publisher’s named chapter."),
  "penny": chapter("uNHJIwlkPMk", "Penny front against wide zone", "MatchQuarters · Cody Alexander", 2420, 1130, 1245, "18:50 Defending Wide Zone with a 5-1 Front; next chapter 20:45.", "Starts at the publisher’s named chapter."),
  "techniques": chapter("6WJaRaY69KY", "Defensive line techniques and alignments", "Chris Haddad · vIQtory", 322, 18, 223, "0:18 Diagram; 3:43 Example. Dedicated coaching guide to defensive line techniques and alignments."),
  "stunt-tex": chapter("5m66Ru_8N5Y", "Tackle first, end loops", "Chris Haddad · vIQtory", 559, 265, 374, "4:25 TE Stunt; 6:14 begins Boss Twist. Coaching installation of the tackle-end game."),
  "stunt-ext": chapter("5m66Ru_8N5Y", "End first, tackle loops", "Chris Haddad · vIQtory", 559, 198, 265, "3:18 ET Stunt; 4:25 begins TE Stunt. Coaching installation of the end-tackle game."),
  "stunt-loop": chapter("5zTXCj_j-LQ", "Looping stunts from a Bear front", "MatchQuarters · Cody Alexander", 982, 319, 378, "05:19 Using Looping Stunts in a Bear Front; next chronological chapter is 06:18.", "Starts at the publisher’s named chapter."),
  "blitz-cross-dog": chapter("6j74uknbvHE", "Cross Dog at the snap", "MatchQuarters · Cody Alexander", 422, 148, 251, "02:28 Film Breakdown: At the Snap; 04:11 The Key Mechanic: Attacking the Running Back", "Starts at the publisher’s named chapter."),
  "blitz-fire-zone": chapter("bgFECnsRvrw", "Fire zone: five rush, three under, three deep", "MatchQuarters · Cody Alexander", 932, 63, 164, "01:03 Defining Fire Zone: 5-Man Rush & 3-Under/3-Deep Shell; 02:44 begins the protection-overload explanation."),
  "fit-two-gap": short("d7e7EvKq6DA", "Two-gap stance and technique", "iCoach App · Chris Rumph", 84, "Publisher describes Florida defensive line coach Chris Rumph illustrating two-gap technique, including the stance. Full 84-second teaching clip."),
  "edge": chapter("KA_EFlU0CWY", "EDGE: rush or contain", "Lurks Lessons", 643, 362, 386, "6:02 EDGE; 6:26 begins Cornerback. The guide explains football positions and their responsibilities."),
  "cornerback": chapter("KA_EFlU0CWY", "Cornerback responsibilities", "Lurks Lessons", 643, 386, 410, "6:26 Cornerback; 6:50 begins Safety. The guide explains football positions and their responsibilities."),
  "strong-safety": short("h9i5oXwbkrc", "How to play strong safety", "eHowSports", 75, "Publisher describes teaching strong-safety play through drills using dummies. Complete 75-second football instruction clip."),
  "nickel": chapter("Q6iuu58jLgU", "Nickel: the fifth defensive back", "Fourth and Film", 726, 503, 617, "8:23 Nickel; 10:17 begins Dime. Named chapter in the defensive-formations teaching guide.", "This chapter explains nickel personnel and alignment; the animation follows the slot defender."),
  "creeping-safety": chapter("eibqDMAkOrc", "Safety down in a weak rotation", "MatchQuarters · Cody Alexander", 498, 65, 120, "1:05 Variation 1: 5-Man Safety Blitz (Weak Rotation); next chapter 2:00.", "Starts at the publisher’s named chapter."),
  "motion-adjustment": chapter("viD-K_vFcWc", "Changing coverage with motion", "MatchQuarters · Cody Alexander", 668, 86, 150, "01:26 Adjusting Coverage: Man Away, Zone To; next chapter 02:30.", "This clip shows a man-away/zone-to adjustment; the animation shows a defender following the motion."),
  "coverage-roll": chapter("uNHJIwlkPMk", "Weak rotation and spinning safeties", "MatchQuarters · Cody Alexander", 2420, 1500, 2180, "25:00 Coverage: Weak Rotation Cover 3 & Spinning Safeties; next chapter 36:20.", "Starts at the publisher’s named chapter."),
  "two-gap": short("d7e7EvKq6DA", "Two-gap stance and technique", "iCoach App · Chris Rumph", 84, "Publisher describes Florida defensive line coach Chris Rumph illustrating two-gap technique, including the stance. Full 84-second teaching clip."),
  "punt-gunner": chapter("4hVh4-GEQdA", "The gunner’s job on punt coverage", "Isaac Punts", 188, 40, 72, "0:40 Gunner Position; 1:12 begins Long Snapper Position. The publisher describes teaching each punt-team responsibility."),
}
