import type { VerifiedFilm } from './filmModel.ts'

const checkedOn = '2026-10-01'
function chapter(id: string, title: string, channel: string, durationSeconds: number, start: number, end: number, excerpt: string): VerifiedFilm {
  return { id, title, channel, start, end, durationSeconds, note: 'Starts at the publisher’s named chapter.', verification: { kind: 'publisher-chapter', sourceUrl: `https://www.youtube.com/watch?v=${id}`, excerpt, checkedOn } }
}
function short(id: string, title: string, channel: string, durationSeconds: number, excerpt: string): VerifiedFilm {
  return { id, title, channel, start: 0, end: durationSeconds, durationSeconds, note: `Complete ${durationSeconds}-second clip on this topic.`, verification: { kind: 'short-topic', sourceUrl: `https://www.youtube.com/watch?v=${id}`, excerpt, checkedOn } }
}

// No category fallback: each entry has its own topic-and-time evidence.
// All listed videos returned public player status OK and playableInEmbed=true.
// The companion audit records rejected mappings and the replacement research.
export const defenseFilms: Record<string, VerifiedFilm> = {
  'cover-0': short('LSYsJmhnw5k', 'Cover 0: no deep safety', 'Football IQ', 20, 'Publisher describes only Cover 0: no safeties and man assignments; player duration is 20 seconds.'),
  'cover-1': chapter('ywFXMI1X-Ys', 'Cover 1 · Joel Klatt', 'The Joel Klatt Show', 1794, 71, 430, '1:11–7:10 Cover 1'),
  'cover-2': chapter('ywFXMI1X-Ys', 'Cover 2 · Joel Klatt', 'The Joel Klatt Show', 1794, 431, 925, '7:11–15:25 Cover 2'),
  'cover-3': chapter('ywFXMI1X-Ys', 'Cover 3 · Joel Klatt', 'The Joel Klatt Show', 1794, 926, 1260, '15:26–21:00 Cover 3'),
  'cover-4': chapter('ywFXMI1X-Ys', 'Cover 4 · Joel Klatt', 'The Joel Klatt Show', 1794, 1261, 1771, '21:01–29:31 Cover 4'),
  'cover-6': chapter('3H85mWMTdME', 'Cover 6 whiteboard breakdown', 'MatchQuarters · Cody Alexander', 471, 129, 214, '02:09 Whiteboard: Breaking Down Cover 6; 03:34 begins Cover 8.'),
  '4-3': chapter('Q6iuu58jLgU', '4–3 defensive formation', 'Fourth and Film', 726, 348, 421, '5:48 4-3; 7:01 46 Bear'),
  '3-4': chapter('Q6iuu58jLgU', '3–4 defensive formation', 'Fourth and Film', 726, 279, 348, '4:39 3-4; 5:48 4-3'),
  bear: chapter('Q6iuu58jLgU', '46 Bear front', 'Fourth and Film', 726, 421, 503, '7:01 46 Bear; 8:23 Nickel'),
  penny: chapter('uNHJIwlkPMk', 'Penny front against wide zone', 'MatchQuarters · Cody Alexander', 2420, 1130, 1245, '18:50 Defending Wide Zone with a 5-1 Front; next chapter 20:45.'),
  techniques: short('_4xylByLjbs', 'Defensive line alignment numbers', 'Coach Peters', 37, 'Dedicated alignment-number explanation; public player duration is 37 seconds.'),
  'stunt-tex': short('hDhaF_cw11U', 'Tackle–end exchange', 'Inside the Pylon', 23, 'Publisher identifies a TEX exchange between the tackle and end; public player duration is 23 seconds.'),
  'stunt-ext': short('4rye0ch5QGM', 'End first, tackle second', 'vIQtory Sports · Football Coaching Education', 18, 'Publisher specifies end first and tackle second, with the tackle looping outside after occupying the guard; duration 18 seconds.'),
  'stunt-loop': chapter('5zTXCj_j-LQ', 'Looping stunts from a Bear front', 'MatchQuarters · Cody Alexander', 982, 319, 378, '05:19 Using Looping Stunts in a Bear Front; next chronological chapter is 06:18.'),
  'blitz-cross-dog': chapter('6j74uknbvHE', 'Cross Dog at the snap', 'MatchQuarters · Cody Alexander', 422, 148, 251, '02:28 Film Breakdown: At the Snap; 04:11 The Key Mechanic: Attacking the Running Back'),
  'blitz-fire-zone': short('wRu-ESzYeo4', 'Three deep, three under fire zone', 'Rich Madrid', 44, 'Publisher identifies a disguised three-deep, three-under Packers fire zone against Dallas; public player duration is 44 seconds.'),
  'fit-one-gap': short('k0giC2Xvw2I', 'One-gap defense cutup', 'Charles Fischer', 20, 'Video title and description identify only one-gap defense; public player duration is 20 seconds.'),
  'fit-two-gap': short('GZPfV9ecnmg', 'Two-gap defense cutup', 'Charles Fischer', 17, 'Video title and description identify only two-gap defense; public player duration is 17 seconds.'),
  nose: short('43klhpDGg-8', 'Nose tackle: control the interior', 'Football IQ', 25, 'Publisher describes the nose over the center, taking multiple blockers and stopping inside runs; public player duration is 25 seconds.'),
  edge: short('E4upsl2iK9Y', 'Defensive end: keep contain', 'ExpertVillage', 43, 'Dedicated defensive-end containment instruction; public player duration is 43 seconds.'),
  mike: short('ivGrYaVD6b8', 'Mike linebacker responsibilities', 'Linebacker Prototype Academy', 82, 'Publisher title identifies the Mike / middle-linebacker position alone; public player duration is 82 seconds.'),
  will: short('PoN6M6xFQUw', 'Will linebacker: weakside range', 'Raiders Allegiance', 24, 'Publisher identifies Devin White as a Will and describes weakside pursuit, range and coverage; public player duration is 24 seconds.'),
  sam: short('6e28ha1rrws', 'Sam linebacker responsibilities', 'Munster High School Football', 57, 'Dedicated SAM linebacker role clip; public player duration is 57 seconds.'),
  cornerback: short('-8j04Kevotg', 'Cornerback press technique with Darius Slay', 'All Eyes DB Camp · Chad Wilson', 27, 'Publisher identifies press-man work with Slay and coach Chad Wilson; public player duration is 27 seconds.'),
  'free-safety': short('SALBQ-p647I', 'Free safety: reading the throw', 'The DB Network', 111, 'Dedicated free-safety interception instruction; public player duration is 111 seconds.'),
  'strong-safety': short('oEoIqSWZpLU', 'Strong safety responsibilities', 'Decyfr Sport', 58, 'Dedicated strong-safety position explanation; public player duration is 58 seconds.'),
  nickel: short('B5JLA-j7QDA', 'Nickel: hold the seam before the flat', 'MatchQuarters · Cody Alexander', 13, 'Publisher instructs the nickel to protect the seam first against Sail; public player duration is 13 seconds.'),
  'creeping-safety': chapter('eibqDMAkOrc', 'Safety down in a weak rotation', 'MatchQuarters · Cody Alexander', 498, 65, 120, '1:05 Variation 1: 5-Man Safety Blitz (Weak Rotation); next chapter 2:00.'),
  'motion-adjustment': { ...chapter('viD-K_vFcWc', 'Changing coverage with motion', 'MatchQuarters · Cody Alexander', 668, 86, 150, '01:26 Adjusting Coverage: Man Away, Zone To; next chapter 02:30.'), note: 'This clip shows a man-away/zone-to adjustment; the animation shows a defender following the motion.' },
  'coverage-roll': chapter('uNHJIwlkPMk', 'Weak rotation and spinning safeties', 'MatchQuarters · Cody Alexander', 2420, 1500, 2180, '25:00 Coverage: Weak Rotation Cover 3 & Spinning Safeties; next chapter 36:20.'),
  'one-gap': short('k0giC2Xvw2I', 'One-gap defense cutup', 'Charles Fischer', 20, 'Video title and description identify only one-gap defense; public player duration is 20 seconds.'),
  'two-gap': short('GZPfV9ecnmg', 'Two-gap defense cutup', 'Charles Fischer', 17, 'Video title and description identify only two-gap defense; public player duration is 17 seconds.'),
  'punt-spread': short('Zc_KqP5SCZw', 'Shield punt: protection and coverage', 'Championship Productions · Courtney Messingham', 95, 'Publisher specifies shield-punt formation, protection and coverage; public player duration is 95 seconds.'),
  'punt-gunner': short('9wAktmBDotQ', 'Gunner shimmy release drill', 'Coach Staff', 50, 'Dedicated punt-gunner shimmy drill; public player duration is 50 seconds.'),
  'punt-return-wall': short('NTUSG3aQ04I', 'WPI wall-return drill', 'Mike Kuchar', 22, 'Publisher identifies a WPI wall-punt-return practice cutup; public player duration is 22 seconds.'),
}
