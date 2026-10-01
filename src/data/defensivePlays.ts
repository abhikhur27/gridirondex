import type { BlueprintNode } from './blueprints.ts'
import type { PlayScene } from './playModel.ts'
import type { Point } from './vectorGeometry.ts'
import { sceneFrom, node, place, track, frames, engage, mark, read, notes, man, finish } from './playBuilders.ts'

// These are worked examples, not an assertion that a shell dictates one answer.
// Every lesson pairs a real offensive action with the defender's response.
export const defensiveSceneIds = [
  'cover-0', 'cover-1', 'cover-2', 'cover-3', 'cover-4', 'cover-6',
  '4-3', '3-4', 'bear', 'penny', 'dollar', 'techniques',
  'stunt-tex', 'stunt-ext', 'stunt-loop', 'blitz-cross-dog', 'blitz-fire-zone',
  'fit-one-gap', 'fit-two-gap', 'nose', 'edge', 'mike', 'will', 'sam', 'cornerback',
  'free-safety', 'strong-safety', 'nickel', 'creeping-safety', 'motion-adjustment',
  'coverage-roll', 'one-gap', 'two-gap', 'fg-edge-overload', 'fg-a-gap-push',
  'fg-block-safe', 'punt-spread', 'punt-pro', 'punt-gunner', 'punt-return-wall',
] as const

function fresh(id: string) {
  const s = sceneFrom(id)
  s.tracks = []; s.contacts = []; s.areas = []; s.reads = []
  return s
}
function r(s: PlayScene, id: string, ...points: Point[]) { track(s, id, points) }
function passSet(s: PlayScene, except: string[] = []) {
  const pairs = [['LT', 'EL', 330], ['LG', 'TL', 415], ['RG', 'TR', 515], ['RT', 'ER', 575]] as const
  for (const [ol, dl, x] of pairs) if (!except.includes(dl) && s.defensiveNodes.some(n => n.id === dl)) {
    engage(s, ol, dl, .8, 3.8, [x, 370], [x + (x < 450 ? -15 : 15), 395], 'Set the pocket')
  }
  track(s, 'C', [[450, 375]], .35, .8)
  track(s, 'QB', [[450, 470]], .35, 1)
}
function runSet(s: PlayScene, except: string[] = []) {
  const pairs = [['LT', 'EL', 325], ['LG', 'TL', 410], ['RG', 'TR', 515], ['RT', 'ER', 585]] as const
  for (const [ol, dl, x] of pairs) if (!except.includes(dl) && s.defensiveNodes.some(n => n.id === dl)) {
    engage(s, ol, dl, .7, 3.5, [x, 335], [x + (x < 450 ? -18 : 18), 320], 'Hold the run fit')
  }
  place(s, 'QB', 450, 402)
  track(s, 'QB', [[450, 430]], .35, .8)
  finish(s, 'QB', 'RB', .7, 1.05, 'handoff')
  r(s, 'X', [115, 265], [95, 190]); r(s, 'Z', [790, 270], [820, 190])
  man(s, 'CBL', 'X'); man(s, 'CBR', 'Z')
}
function shell(s: PlayScene) {
  r(s, 'CBL', [155, 160], [145, 90]); r(s, 'CBR', [755, 160], [755, 90])
  r(s, 'FS', [400, 105], [450, 70]); r(s, 'SS', [650, 225], [690, 265])
  r(s, 'N', [245, 275]); r(s, 'W', [360, 260]); r(s, 'M', [500, 240])
}
function coverage(id: string) {
  const s = fresh(id)
  passSet(s)
  if (id === 'cover-0') {
    r(s, 'X', [115, 305], [280, 220]); r(s, 'H', [245, 330], [110, 330])
    r(s, 'Y', [615, 220], [650, 100]); r(s, 'Z', [790, 260], [720, 245]); r(s, 'RB', [300, 435], [200, 400])
    man(s, 'CBL', 'X', [-12, -22]); man(s, 'N', 'H'); man(s, 'SS', 'Y'); man(s, 'CBR', 'Z'); man(s, 'W', 'RB')
    r(s, 'FS', [430, 330], [450, 435]); r(s, 'M', [480, 340], [470, 435])
    read(s, 'QB', 'FS', 'Six rush: throw now', .45, 2.1)
    mark(s, 175, 245, 115, 100, 'Quick slant window', .9, 2.8)
    finish(s, 'QB', 'X', 1.45, 2.05)
    notes(s, ['Cover 0 has no deep helper. The inside receivers have to win before six rushers arrive.', 'The linebackers come. X stems outside to make the corner turn his hips.', 'X breaks across the corner’s face; the QB throws while the extra rushers are still outside the pocket.', 'The quick slant beats the free rush. Holding the ball for a deep route would erase this window.'])
  } else if (id === 'cover-1') {
    r(s, 'H', [255, 285], [665, 285]); r(s, 'Y', [615, 250], [230, 250])
    r(s, 'X', [115, 170], [90, 70]); r(s, 'Z', [790, 220], [740, 205]); r(s, 'RB', [300, 435], [165, 390])
    man(s, 'CBL', 'X'); man(s, 'CBR', 'Z'); man(s, 'W', 'RB')
    frames(s, 'N', [{ at: 0, pos: [255, 340] }, { at: 1.2, pos: [285, 300] }, { at: 2, pos: [415, 315] }, { at: 3.8, pos: [610, 308] }])
    man(s, 'SS', 'Y', [25, -22]); r(s, 'M', [450, 280], [485, 265]); r(s, 'FS', [450, 80], [520, 100])
    read(s, 'QB', 'N', 'Trailing through traffic', 1.15, 3.2)
    mark(s, 485, 270, 170, 65, 'Crosser has a step', 2, 4.2)
    finish(s, 'QB', 'H', 2.6, 3.2)
    notes(s, ['Cover 1 puts a defender on each receiver with one safety over the top. Mesh tests the underneath matchups.', 'H and Y cross at different depths. Their man defenders follow through the same crowded middle.', 'The nickel takes the long path around the other crosser, giving H a step across the field.', 'The QB leads H away from the trailing nickel. The post safety cannot close this shallow throw in time.'])
  } else if (id === 'cover-2') {
    r(s, 'X', [115, 220], [100, 120]); r(s, 'H', [255, 285], [90, 285]); r(s, 'Y', [615, 185], [680, 75]); r(s, 'Z', [790, 280], [760, 285]); r(s, 'RB', [360, 360], [440, 315])
    frames(s, 'CBL', [{ at: 0, pos: [115, 325] }, { at: .85, pos: [125, 285] }, { at: 1.8, pos: [145, 245] }, { at: 3.5, pos: [95, 265] }])
    engage(s, 'X', 'CBL', .55, .9, [115, 305], [120, 290], 'Reroute the outside release')
    r(s, 'FS', [265, 100], [205, 100]); r(s, 'SS', [650, 100], [690, 90]); r(s, 'CBR', [795, 280]); r(s, 'N', [255, 230]); r(s, 'W', [375, 205]); r(s, 'M', [515, 195])
    read(s, 'QB', 'CBL', 'Corner sinks, then takes the flat', .5, 3)
    mark(s, 55, 120, 120, 105, 'Cover 2 honey hole', 1.5, 3.5)
    finish(s, 'QB', 'X', 2.2, 2.85)
    notes(s, ['The corner owns the flat; the safety owns the deep half. X and H stretch those two jobs apart.', 'The corner gets hands on X, then sinks underneath the fade while H releases outside.', 'H pulls the corner toward the flat. X reaches the sideline behind him before the safety can get across.', 'The ball lands in the honey hole. A late throw would let the half-field safety close it.'])
  } else if (id === 'cover-3') {
    r(s, 'X', [115, 100], [100, 50]); r(s, 'H', [280, 240], [330, 120]); r(s, 'Y', [595, 240], [565, 100]); r(s, 'Z', [790, 100], [805, 50]); r(s, 'RB', [365, 345], [425, 315])
    shell(s); r(s, 'N', [230, 245], [265, 215]); r(s, 'M', [525, 235], [550, 210]); r(s, 'FS', [450, 70], [510, 80])
    read(s, 'QB', 'FS', 'Middle safety leans to Y', 1.1, 3.3)
    mark(s, 285, 95, 105, 115, 'Left seam window', 1.7, 3.5)
    finish(s, 'QB', 'H', 2.55, 3.25)
    notes(s, ['Cover 3 has three deep defenders. Four vertical routes put two seams on one middle safety.', 'The outside receivers carry the corners. H and Y run past the underneath defenders.', 'The middle safety leans toward Y. H is now between the left corner and that safety.', 'The QB throws the opposite seam before the safety recovers. The hook defender is too shallow to finish the play.'])
  } else if (id === 'cover-4') {
    r(s, 'X', [115, 210], [160, 205]); r(s, 'H', [265, 225], [355, 75]); r(s, 'Y', [600, 225], [550, 75]); r(s, 'Z', [790, 95]); r(s, 'RB', [300, 435], [140, 345])
    r(s, 'CBL', [140, 175], [160, 180]); r(s, 'CBR', [760, 125], [765, 65]); man(s, 'FS', 'H', [-22, -30]); man(s, 'SS', 'Y', [24, -30]); r(s, 'N', [235, 260], [210, 310]); r(s, 'W', [385, 240]); r(s, 'M', [610, 240])
    read(s, 'QB', 'FS', 'Safety carries the seam', .8, 2.8)
    mark(s, 90, 290, 130, 85, 'Checkdown in space', 1.8, 4.2)
    finish(s, 'QB', 'RB', 2.6, 3.1)
    notes(s, ['In this quarters call, each safety matches a vertical No. 2 receiver. The RB releases under the coverage.', 'H and Y push vertically. Both safeties turn and carry them instead of sitting in empty grass.', 'The deep routes are covered. The flat defender has ground to cover as the RB swings outside.', 'The QB takes the checkdown. Quarters protects the verticals but still makes an underneath defender tackle in space.'])
  } else {
    r(s, 'X', [115, 185], [140, 175]); r(s, 'H', [260, 220], [330, 75]); r(s, 'Y', [610, 285], [805, 285]); r(s, 'Z', [790, 200], [815, 120]); r(s, 'RB', [360, 360], [445, 320])
    r(s, 'CBL', [145, 130]); man(s, 'FS', 'H', [20, -28]); r(s, 'SS', [650, 90], [705, 90]); r(s, 'CBR', [795, 270], [805, 285]); r(s, 'N', [245, 250]); r(s, 'W', [400, 230]); r(s, 'M', [580, 225])
    mark(s, 750, 120, 100, 115, 'Half-field side window', 1.6, 3.8)
    read(s, 'QB', 'CBR', 'Half-side corner takes the flat', .8, 3)
    finish(s, 'QB', 'Z', 2.45, 3.15)
    notes(s, ['Cover 6 mixes quarters on the left with Cover 2 on the right. The same route can get a different answer on each side.', 'The left safety carries H vertically. On the right, the corner squats over Y’s flat route.', 'Z climbs behind the right corner while the half-field safety works toward the sideline.', 'The QB attacks the Cover 2 side before the safety arrives. Read the actual assignments, not just the two-high starting shell.'])
  }
  return s
}

function stunt(id: string) {
  const s = fresh(id)
  passSet(s, id === 'blitz-cross-dog' ? [] : id === 'blitz-fire-zone' ? ['ER'] : id === 'stunt-loop' ? ['EL', 'TL', 'TR'] : ['TR', 'ER'])
  r(s, 'X', [115, 165], [260, 165]); r(s, 'H', [255, 280], [390, 270]); r(s, 'Y', [615, 180], [680, 95]); r(s, 'Z', [790, 180], [710, 180]); r(s, 'RB', [340, 435], [290, 400])
  shell(s)
  if (id === 'stunt-tex') {
    place(s, 'TR', 525, 317)
    engage(s, 'RT', 'TR', .85, 2.85, [552, 365], [575, 395], 'Tackle occupies RT')
    frames(s, 'RG', [{ at: 0, pos: [500, 355] }, { at: 1.2, pos: [535, 365] }, { at: 2.6, pos: [550, 390] }, { at: 4.2, pos: [525, 415] }])
    frames(s, 'ER', [{ at: 0, pos: [595, 317] }, { at: .85, pos: [570, 300] }, { at: 1.7, pos: [490, 320] }, { at: 2.9, pos: [475, 405] }, { at: 3.6, pos: [470, 445] }])
    read(s, 'QB', 'ER', 'Looper enters the opened B gap', 1.2, 3.5)
    mark(s, 460, 340, 55, 115, 'Inside rush lane', 1.7, 4.2, 'danger')
    finish(s, 'QB', 'H', 2.45, 3.1)
    notes(s, ['Tex means tackle first, end second. The RG and RT must pass off two rushers who exchange lanes.', 'The tackle hits the RT’s inside shoulder. The RG turns toward that collision.', 'The end loops behind the tackle into the space the RG just left. He waits for the first collision instead of crossing through it.', 'The QB throws the shallow route before the end reaches him. The stunt wins pressure because both blockers chased the penetrator.'])
  } else if (id === 'stunt-ext') {
    engage(s, 'RG', 'ER', .95, 2.95, [520, 365], [505, 400], 'End pins the guard')
    frames(s, 'RT', [{ at: 0, pos: [550, 355] }, { at: 1.1, pos: [545, 375] }, { at: 2.5, pos: [560, 395] }, { at: 4.2, pos: [585, 415] }])
    frames(s, 'TR', [{ at: 0, pos: [495, 317] }, { at: .85, pos: [530, 285] }, { at: 1.7, pos: [630, 315] }, { at: 2.8, pos: [625, 415] }, { at: 3.75, pos: [510, 460] }])
    read(s, 'QB', 'TR', 'Tackle wraps outside', 1.2, 3.6); mark(s, 590, 335, 70, 110, 'Outside rush lane', 1.6, 4.2, 'danger')
    finish(s, 'QB', 'RB', 2.55, 3.1)
    notes(s, ['ExT reverses the order: the end spikes inside and the tackle wraps outside. Watch the RT’s shoulders.', 'The end drives at the RG. The RT turns inside to help, giving up his outside set.', 'The tackle loops behind the contact and turns the corner outside the RT.', 'The QB checks it down as the wrap closes. Staying square would let the RT pass off the end and pick up the tackle.'])
  } else if (id === 'stunt-loop') {
    engage(s, 'LG', 'EL', .9, 3.3, [390, 360], [405, 390], 'Spike holds the guard')
    engage(s, 'C', 'TR', 1.05, 3.3, [465, 365], [465, 400], 'Inside lane occupied')
    frames(s, 'LT', [{ at: 0, pos: [350, 355] }, { at: 1.1, pos: [365, 365] }, { at: 2.7, pos: [380, 390] }])
    frames(s, 'TL', [{ at: 0, pos: [410, 317] }, { at: .9, pos: [440, 285] }, { at: 1.9, pos: [580, 295] }, { at: 2.8, pos: [630, 390] }, { at: 3.9, pos: [525, 465] }])
    read(s, 'QB', 'TL', 'Long loop arrives late', 1.6, 3.8); mark(s, 600, 320, 70, 140, 'Wrap lane', 2, 4.2, 'danger')
    finish(s, 'QB', 'Z', 2.4, 3.05)
    notes(s, ['The long looper travels behind two penetrating teammates. He needs them to occupy the line first.', 'The end spikes into the LG while the other tackle holds the center. Both contacts compress the pocket.', 'The looper crosses behind the rush, then bends outside the RT. The extra distance makes this pressure late.', 'The QB gets the ball out on the intermediate out. A long loop punishes a held ball, not a clean quick-game throw.'])
  } else if (id === 'blitz-cross-dog') {
    place(s, 'W', 405, 240); place(s, 'M', 495, 230)
    engage(s, 'C', 'M', 1.3, 3.7, [425, 365], [415, 405], 'First blitzer takes the center')
    frames(s, 'W', [{ at: 0, pos: [405, 240] }, { at: .8, pos: [430, 295] }, { at: 1.55, pos: [478, 335] }, { at: 2.6, pos: [478, 405] }, { at: 3.45, pos: [465, 445] }])
    r(s, 'RB', [365, 405], [395, 375]); r(s, 'H', [255, 300], [330, 275])
    read(s, 'QB', 'W', 'Second A-gap rusher is free', .75, 2.9); mark(s, 458, 325, 38, 105, 'Open A gap', 1.3, 4.2, 'danger')
    finish(s, 'QB', 'H', 1.7, 2.25)
    notes(s, ['The two linebackers cross into opposite A gaps. The RB sets left, so the QB needs a quick answer on the right.', 'The first linebacker attacks the left A gap and draws the center. The second delays behind him.', 'The second linebacker crosses into the other A gap after the center commits. The RB is on the wrong side to help.', 'The QB hits H’s hot route before the free blitzer arrives. The crossing paths make the protection declare its choice.'])
  } else {
    place(s, 'N', 275, 320); place(s, 'SS', 285, 120); place(s, 'FS', 620, 120)
    engage(s, 'RB', 'N', 1.55, 3.5, [345, 405], [365, 425], 'RB picks up the nickel')
    engage(s, 'C', 'W', 1.45, 3.6, [420, 370], [425, 400], 'Fifth rusher fills A gap')
    r(s, 'ER', [645, 265], [695, 235]); r(s, 'SS', [220, 245], [175, 265]); r(s, 'M', [450, 240], [500, 240]); r(s, 'FS', [470, 90], [450, 65]); r(s, 'CBL', [155, 105]); r(s, 'CBR', [755, 105])
    r(s, 'Y', [625, 265], [725, 245]); r(s, 'H', [255, 235], [350, 180])
    read(s, 'QB', 'ER', 'End drops under the expected hot', .7, 3.2); mark(s, 620, 210, 145, 80, 'Seam / flat trap', 1.1, 4.2, 'danger')
    finish(s, 'QB', 'H', 2.6, 3.2)
    notes(s, ['This fire zone sends five, with three underneath and three deep. The right end will trade his rush for a coverage job.', 'The nickel and Will rush while the end opens toward Y. The RB and center have to take the added pressure.', 'Y runs into the end’s seam drop, so the expected quick throw is covered. H bends behind the weak underneath defender.', 'The QB resets to H before the pocket closes. The defense changed who rushed without leaving the whole short field empty.'])
  }
  return s
}

function runDefense(id: string) {
  const s = fresh(id)
  // The gap lessons use a tight teaching front; use their existing blocker IDs.
  if (id === 'fit-one-gap' || id === 'fit-two-gap') {
    const full = sceneFrom('cover-3')
    s.offensiveNodes = full.offensiveNodes
    s.defensiveNodes = full.defensiveNodes
    if (id === 'fit-one-gap') Object.assign(node(s, 'TR'), { id: 'T', label: '3', x: 525, showLabel: true })
    else {
      Object.assign(node(s, 'N'), { id: 'NICK', label: 'N' })
      Object.assign(node(s, 'TL'), { id: 'N', label: '0', x: 450, showLabel: true })
      place(s, 'TR', 520, 245, 'LB')
    }
  }
  if (id === 'two-gap') place(s, 'TR', 520, 245, 'LB')
  runSet(s, ['TL', 'TR', ...(['3-4', 'penny'].includes(id) ? ['ER'] : [])])
  r(s, 'RB', [470, 430], [475, 360], [480, 280])
  r(s, 'H', [290, 340], [315, 275]); r(s, 'Y', [635, 325], [670, 270])
  if (id === '4-3') {
    engage(s, 'LG', 'TL', .7, 2.6, [425, 335], [418, 325], 'Shade holds A gap')
    engage(s, 'RG', 'TR', .7, 3.1, [525, 335], [538, 325], '3-tech closes B gap')
    r(s, 'M', [465, 280], [480, 340]); r(s, 'W', [390, 275], [420, 345]); r(s, 'N', [630, 295], [615, 350])
    engage(s, 'M', 'RB', 2.7, 4.2, [478, 355], [478, 360], 'Mike meets the cut')
    read(s, 'M', 'RB', 'Fit off the tackle’s hip', .5, 2.8); mark(s, 458, 305, 40, 100, 'Mike: open A gap', 1.2, 4.2, 'danger')
    notes(s, ['This 4–3 has a shaded nose and a 3-technique. Each lineman attacks one gap; the linebackers fit what remains.', 'The guards engage both tackles. The RB presses inside zone while Mike reads the near guard.', 'The 3-tech closes B, so the RB cuts toward A. Mike fills off the tackle’s inside hip.', 'Mike meets the runner in the remaining gap. The front works because the tackle and linebacker do different jobs.'])
  } else if (id === '3-4') {
    engage(s, 'C', 'TL', .7, 2.3, [450, 338], [450, 345], 'Nose controls the center')
    engage(s, 'RT', 'ER', .7, 3.4, [550, 338], [555, 350], 'End keeps both shoulders free')
    r(s, 'N', [295, 360], [315, 395]); r(s, 'SS', [620, 350], [610, 405]); r(s, 'TR', [500, 280], [478, 355])
    engage(s, 'TR', 'RB', 2.65, 4.2, [478, 355], [480, 360], 'Inside linebacker fits downhill')
    r(s, 'W', [395, 290], [420, 340]); read(s, 'TR', 'RB', 'Read the nose, then fill', .7, 2.8); mark(s, 462, 320, 35, 95, 'Inside fit', 1.4, 4.2, 'danger')
    notes(s, ['This two-gap 3–4 asks the nose and ends to control blockers, leaving the inside linebackers clean.', 'The nose meets the center square. Both outside linebackers set edges, so the run stays inside.', 'The RB presses the right A gap. The right inside linebacker steps downhill behind the nose’s control.', 'The linebacker meets the runner without a guard on him. The nose created that clean fit by holding the center.'])
  } else if (id === 'bear') {
    engage(s, 'LG', 'TL', .6, 3.7, [400, 335], [392, 345], 'Covered guard cannot climb')
    engage(s, 'RG', 'TR', .6, 3.7, [500, 335], [510, 345], 'Covered guard cannot climb')
    engage(s, 'C', 'M', .6, 3.7, [450, 335], [450, 350], 'Nose occupies center')
    r(s, 'RB', [440, 430], [385, 375]); r(s, 'W', [365, 290], [380, 355])
    engage(s, 'W', 'RB', 2.8, 4.2, [382, 365], [380, 370], 'Free linebacker closes the cutback')
    read(s, 'RB', 'W', 'No clean climb to the linebacker', .8, 3.1); mark(s, 370, 310, 155, 80, 'Covered interior', .8, 3.5, 'danger')
    notes(s, ['Bear covers both guards and the center. That makes the usual inside-zone double teams hard to build.', 'All three interior blockers meet a down lineman immediately. Neither guard gets a free release to Will.', 'The RB bends away from the clogged middle. Will tracks the cutback without having to defeat a climbing guard.', 'Will closes the cutback. Bear’s value here is occupying blockers before they can reach the second level.'])
  } else if (id === 'penny') {
    engage(s, 'LG', 'TL', .7, 3.6, [400, 337], [395, 347], 'Interior covered')
    engage(s, 'C', 'TR', .7, 3.6, [450, 337], [450, 345], 'Nose fixes the center')
    engage(s, 'RG', 'ER', .7, 3.6, [500, 337], [510, 345], 'Inside shoulder occupied')
    engage(s, 'RT', 'W', .8, 3.6, [610, 345], [620, 355], 'RT secures the wide edge')
    engage(s, 'Y', 'W', .8, 3.6, [610, 345], [620, 355], 'Fifth lineman sets the edge')
    r(s, 'RB', [470, 430], [480, 365]); r(s, 'M', [450, 275], [478, 348]); engage(s, 'M', 'RB', 2.8, 4.2, [480, 360], [482, 368], 'Lone linebacker fits the crease')
    r(s, 'N', [210, 255], [195, 260]); read(s, 'M', 'RB', 'Five-man front keeps Mike clean', .65, 2.9); mark(s, 463, 315, 36, 100, 'Mike’s crease', 1.4, 4.2, 'danger')
    notes(s, ['Penny puts five on the line with one true linebacker behind them. The nickel stays out with the slot.', 'The five-man surface occupies the line and TE. Mike can track the RB without a guard climbing straight at him.', 'The RB presses between the nose and inside tackle. Mike shuffles into that crease.', 'Mike meets the run while the nickel still covers the slot. The five-man front lets this package defend a run without abandoning the spread receivers.'])
  } else if (id === 'one-gap' || id === 'fit-one-gap') {
    const tackle = id === 'fit-one-gap' ? 'T' : 'TR'
    place(s, tackle, 525, 315)
    engage(s, 'RG', tackle, .65, 3.5, [525, 340], [532, 370], '3-tech owns B')
    if (id === 'fit-one-gap') engage(s, 'LG', 'TL', .7, 3.6, [410, 338], [405, 350], 'Backside shade stays occupied')
    if (id === 'one-gap') engage(s, 'LG', 'TL', .7, 3.6, [375, 338], [375, 360], 'Weak B gap squeezed')
    r(s, 'M', [475, 290], [475, 350]); r(s, 'RB', [510, 430], [480, 365])
    engage(s, 'M', 'RB', 2.7, 4.2, [478, 361], [480, 369], 'Linebacker owns A')
    read(s, 'M', tackle, 'Tackle takes B; Mike takes A', .5, 2.9); mark(s, 510, 305, 30, 105, 'B: tackle', .7, 4.2, 'danger'); mark(s, 462, 305, 30, 105, 'A: Mike', 1.25, 4.2, 'danger')
    notes(s, id === 'one-gap' ? ['One-gap defenders attack separate lanes. This right-side fit pairs a B-gap tackle with an A-gap Mike.', 'The tackle strikes the guard’s outside shoulder and squeezes B. Mike stays behind the other gap.', 'The RB cuts inside the tackle. Mike steps through A instead of following his teammate into B.', 'The runner meets Mike. Two defenders in the same gap would have left this cutback open.'] : ['The 3-tech starts outside the guard. His B-gap charge tells Mike which inside lane still needs a defender.', 'The guard meets the 3-tech, whose outside shoulder stays in B. Mike reads the back’s path.', 'The RB bends toward A as B closes. Mike fills A from the second level.', 'The tackle and Mike close different lanes. The result comes from fitting together, not both chasing the ball.'])
  } else {
    const nose = id === 'fit-two-gap' ? 'N' : 'TL'
    place(s, nose, 450, 305)
    engage(s, 'C', nose, .65, 1.85, [450, 340], [450, 345], 'Lock out, then read')
    frames(s, nose, [{ at: 0, pos: [450, 305] }, { at: .65, pos: [450, 325] }, { at: 1.85, pos: [450, 330] }, { at: 2.5, pos: [478, 355] }, { at: 3.8, pos: [480, 367] }])
    r(s, 'RB', [482, 430], [480, 365]); r(s, 'M', [410, 285], [420, 345]); track(s, 'C', [[450, 355], [438, 362]], 1.85, 2.8)
    engage(s, nose, 'RB', 2.8, 4.2, [480, 367], [480, 371], 'Shed into the declared gap')
    mark(s, 412, 320, 28, 95, 'Read both A gaps', .65, 1.85); mark(s, 465, 320, 30, 95, 'Shed to the ball', 1.85, 4.2, 'danger'); read(s, nose, 'RB', 'Back declares right', .7, 2.8)
    notes(s, id === 'fit-two-gap' ? ['The nose is head-up on the center. He must control the blocker before choosing either A gap.', 'The nose strikes square and extends his arms. He waits while the RB presses the line.', 'The RB declares the right A gap. The nose sheds to that side instead of guessing at the snap.', 'The nose meets the runner after the shed. The opposite linebacker keeps the other A gap covered.'] : ['Two-gap play starts by controlling the man across from you. This nose reads both A gaps through the center.', 'The nose locks out the center. He holds his shoulders square while the RB approaches.', 'The RB chooses the right A gap; the nose releases that shoulder and steps into the lane.', 'The nose closes the chosen A gap. Waiting behind contact, then shedding, is the point of this technique.'])
  }
  return s
}

function role(id: string) {
  if (id === 'nose') {
    const s = runDefense('two-gap'); s.id = id
    // Same two-gap technique, a different declared run and supporting fit.
    s.contacts = s.contacts.filter(c => !(c.a === 'TL' && c.b === 'RB'))
    r(s, 'RB', [425, 430], [423, 365]); r(s, 'M', [485, 285], [485, 345])
    frames(s, 'TL', [{ at: 0, pos: [450, 305] }, { at: .65, pos: [450, 325] }, { at: 1.85, pos: [450, 330] }, { at: 2.5, pos: [425, 355] }, { at: 3.8, pos: [423, 367] }])
    engage(s, 'TL', 'RB', 2.8, 4.2, [423, 367], [423, 371], 'Nose closes the left A gap')
    s.areas = []; mark(s, 412, 320, 28, 95, 'Nose sheds left', 1.85, 4.2, 'danger')
    s.reads = []; read(s, 'TL', 'RB', 'Back declares left', .7, 2.8)
    notes(s, ['The nose lines up on the center. His job here is to control both A gaps and keep the linebackers clean.', 'He strikes the center square instead of immediately running past one shoulder.', 'The back declares left. The nose sheds the center into that A gap while Mike protects the other side.', 'The nose meets the runner after holding the center. A stat sheet may miss the block he kept off Mike.'])
    return s
  }
  const s = fresh(id)
  if (['mike', 'will', 'strong-safety'].includes(id)) {
    runSet(s)
    if (id === 'mike') {
      s.contacts = s.contacts.filter(c => !(c.a === 'RG' && c.b === 'TR') && !(c.a === 'RT' && c.b === 'ER'))
      engage(s, 'RG', 'TR', .65, 1.45, [500, 335], [508, 328], 'Double team secures tackle')
      engage(s, 'RT', 'TR', .65, 3.7, [500, 335], [508, 328], 'Tackle takes over the block')
      engage(s, 'Y', 'ER', .7, 3.6, [610, 335], [620, 342], 'TE holds the edge')
      frames(s, 'RG', [{ at: 0, pos: [500, 355] }, { at: .65, pos: [500, 350] }, { at: 1.45, pos: [508, 343] }, { at: 2.3, pos: [480, 292] }, { at: 3.8, pos: [470, 315] }])
      r(s, 'M', [460, 280], [450, 325]); r(s, 'RB', [480, 430], [480, 365], [453, 330])
      engage(s, 'M', 'RB', 3, 4.2, [455, 335], [453, 340], 'Fit inside the climbing guard')
      read(s, 'M', 'RG', 'Guard climbs: beat him to the fit', .6, 2.8); mark(s, 435, 295, 40, 95, 'Inside fit', 1.5, 4.2, 'danger')
      notes(s, ['Mike reads the guard and RB together. This guard will come off a double team to block him.', 'The RG helps on the tackle before climbing. Mike steps downhill as soon as that guard leaves the line.', 'Mike fits inside the climb before the guard gets square. The RB cuts toward the same crease.', 'Mike meets the runner in the gap. Waiting flat-footed would let the guard wall him off.'])
    } else if (id === 'will') {
      r(s, 'RB', [510, 430], [530, 370], [425, 340]); frames(s, 'W', [{ at: 0, pos: [365, 245] }, { at: 1, pos: [390, 265] }, { at: 1.9, pos: [415, 285] }, { at: 3.1, pos: [425, 340] }])
      engage(s, 'W', 'RB', 3, 4.2, [425, 345], [425, 350], 'Cutback closed')
      r(s, 'M', [505, 285], [540, 345]); read(s, 'W', 'RB', 'Stay behind the flow', .7, 3); mark(s, 400, 305, 55, 95, 'Backside cutback', 1.5, 4.2, 'danger')
      notes(s, ['Will is the backside linebacker here. Outside-zone flow invites him to overrun the play.', 'The RB presses right. Will shuffles with the flow but keeps his shoulders square behind the line.', 'The front closes the outside lane, so the RB cuts back. Will is still behind the ball.', 'Will meets the cutback. Chasing over the top would have opened the lane he was supposed to protect.'])
    } else {
      r(s, 'RB', [530, 430], [635, 360]); engage(s, 'Y', 'ER', .7, 3.4, [620, 330], [630, 340], 'TE occupies the edge')
      r(s, 'SS', [640, 225], [650, 300], [637, 355]); engage(s, 'SS', 'RB', 3, 4.2, [640, 357], [640, 360], 'Extra fitter closes D gap')
      r(s, 'FS', [450, 80]); read(s, 'SS', 'Y', 'TE blocks: trigger downhill', .5, 2.7); mark(s, 637, 295, 50, 105, 'Safety’s D-gap fit', 1.2, 4.2, 'danger')
      notes(s, ['The strong safety is the extra run fitter outside the TE. He reads the TE before committing downhill.', 'The TE blocks the edge rather than releasing. That gives the safety a run key.', 'The RB bounces outside the block. The safety fills D gap while the free safety stays over the top.', 'The safety meets the runner outside the TE. His fit adds a defender the line cannot account for.'])
    }
  } else {
    passSet(s, id === 'edge' ? ['ER'] : [])
    r(s, 'X', [115, 200], [170, 140]); r(s, 'H', [255, 240], [330, 150]); r(s, 'Y', [615, 240], [655, 135]); r(s, 'Z', [790, 190], [745, 175]); r(s, 'RB', [300, 420], [190, 380]); shell(s)
    if (id === 'edge') {
      place(s, 'ER', 655, 315)
      engage(s, 'RT', 'ER', .9, 1.8, [610, 370], [628, 398], 'Keep outside leverage')
      frames(s, 'ER', [{ at: 0, pos: [655, 315] }, { at: .9, pos: [625, 370] }, { at: 1.8, pos: [643, 398] }, { at: 2.9, pos: [635, 445] }, { at: 4.2, pos: [535, 475] }])
      r(s, 'QB', [520, 455], [605, 470], [535, 490]); read(s, 'QB', 'ER', 'Edge keeps the escape closed', 1.1, 3.5); mark(s, 620, 385, 70, 115, 'Contain', 1, 4.2, 'danger'); finish(s, 'QB', 'RB', 2.7, 3.3)
      notes(s, ['The edge rusher starts outside the TE. He must rush the QB without giving up an easy escape outside.', 'He strikes the tackle with his inside shoulder and keeps his outside arm free.', 'The QB tries to roll right, but the rusher is still outside him. The QB has to pull up.', 'Contain forces a checkdown. Running blindly inside would have handed the quarterback the edge.'])
    } else if (id === 'sam') {
      place(s, 'N', 655, 275, 'S'); r(s, 'Y', [640, 265], [690, 140]); man(s, 'N', 'Y', [-20, -25]); read(s, 'N', 'Y', 'TE releases: carry him', .5, 2.8); mark(s, 620, 130, 115, 145, 'Seam carried', 1.1, 4.2, 'danger'); finish(s, 'QB', 'RB', 2.6, 3.2)
      notes(s, ['Sam aligns to the TE side. The TE’s first steps tell him whether to fit the run or carry a route.', 'The TE releases vertically rather than blocking. Sam opens his hips and runs underneath the seam.', 'Sam stays between the QB and TE as the route bends inside. The seam throw has no clean lane.', 'The QB takes the RB underneath. Sam removed the intended throw by reacting to the TE’s release.'])
    } else if (id === 'cornerback') {
      place(s, 'CBL', 140, 317); r(s, 'X', [110, 285], [70, 160]); man(s, 'CBL', 'X', [18, -18]); read(s, 'QB', 'CBL', 'Inside leverage forces the fade', .5, 2.8); mark(s, 40, 135, 70, 160, 'Small sideline window', 1.5, 3.6); finish(s, 'QB', 'X', 2.45, 3.1)
      notes(s, ['The corner starts inside X, taking away an easy slant. X must release toward the boundary.', 'X tries to win outside. The corner opens without crossing his feet and stays on the inside hip.', 'The sideline squeezes the route while the corner removes the inside throw.', 'The QB has only a narrow outside-shoulder window. Good leverage changed the route and made the throw harder.'])
    } else if (id === 'free-safety') {
      place(s, 'FS', 450, 110); r(s, 'Y', [610, 225], [560, 75]); r(s, 'X', [115, 190], [405, 65]); r(s, 'FS', [490, 85], [560, 70]); read(s, 'QB', 'FS', 'Safety stays over the seam', .9, 3); mark(s, 485, 45, 130, 110, 'Top stays capped', 1.4, 4.2, 'danger'); finish(s, 'QB', 'H', 2.7, 3.25)
      notes(s, ['The free safety is the deepest middle defender. Y’s seam and X’s post make him choose an angle.', 'He gains depth while reading the quarterback, keeping both routes in front of him.', 'The QB looks to Y, and the safety overlaps that seam without driving below the receiver.', 'The QB comes down to H. The safety kept the explosive throw capped rather than chasing a short route.'])
    } else {
      place(s, 'N', 285, 295); r(s, 'H', [265, 235], [315, 90]); man(s, 'N', 'H', [-18, -22]); r(s, 'X', [115, 220], [200, 185]); read(s, 'N', 'H', 'Slot goes vertical: carry the seam', .6, 2.8); mark(s, 245, 100, 120, 145, 'Nickel’s seam match', 1.1, 4.2, 'danger'); finish(s, 'QB', 'X', 2.65, 3.2)
      notes(s, ['The nickel is matched to the slot. A short alignment does not mean his assignment ends five yards downfield.', 'H pushes vertically. The nickel turns and carries him rather than stopping in the flat.', 'The nickel stays underneath the seam while the safety protects its top. X sits underneath on the outside.', 'The QB takes X’s short route. Carrying the slot closed the seam and forced the ball somewhere else.'])
    }
  }
  return s
}

function adjustment(id: string) {
  const s = fresh(id)
  passSet(s)
  r(s, 'X', [115, 170], [140, 80]); r(s, 'Z', [790, 180], [760, 170]); r(s, 'Y', [615, 220], [685, 120]); r(s, 'RB', [330, 430], [180, 375]); shell(s)
  if (id === 'creeping-safety') {
    frames(s, 'SS', [{ at: 0, pos: [620, 120] }, { at: .55, pos: [650, 235] }, { at: 1.5, pos: [655, 300] }, { at: 3, pos: [580, 385] }])
    r(s, 'H', [255, 230], [450, 170]); r(s, 'FS', [450, 85], [510, 90]); r(s, 'M', [465, 230], [480, 205])
    read(s, 'QB', 'SS', 'Safety down: throw behind him', .25, 2.7); mark(s, 615, 115, 120, 135, 'Space behind the rotation', 1.2, 3.9); finish(s, 'QB', 'Y', 2.3, 3)
    notes(s, ['The safety starts high but creeps toward the box. The QB should notice the changing count before choosing the throw.', 'The safety comes downhill toward the run look. The TE releases behind the space he leaves.', 'The middle safety cannot reach the TE’s outside break in time. The QB keeps his eyes on the rotating defender.', 'The ball goes behind the creeping safety. A pre-snap two-high picture did not remain two-high after the snap.'])
  } else if (id === 'motion-adjustment') {
    frames(s, 'H', [{ at: 0, pos: [255, 385] }, { at: .15, pos: [450, 415] }, { at: .3, pos: [655, 400] }, { at: 1.8, pos: [660, 300] }, { at: 3.6, pos: [790, 255] }])
    frames(s, 'N', [{ at: 0, pos: [250, 260] }, { at: .15, pos: [450, 275] }, { at: .3, pos: [665, 295] }, { at: 1.8, pos: [680, 290] }, { at: 3.6, pos: [800, 235] }])
    for (const id of ['H', 'N']) s.tracks.find(t => t.player === id)!.presnap = true
    r(s, 'M', [525, 245]); r(s, 'Y', [615, 245], [520, 170]); read(s, 'QB', 'N', 'Nickel travels with the motion', .1, 2.4); mark(s, 485, 150, 130, 100, 'Inside route after the motion', 1.5, 4.2); finish(s, 'QB', 'Y', 2.6, 3.2)
    notes(s, ['H motions across the formation before this snap. The nickel’s response gives the QB a clue about the coverage.', 'The nickel has traveled with H; Mike bumps right. That suggests a man assignment, though motion alone is not proof.', 'After the snap H releases outside and the nickel follows. Y breaks inside away from that matchup.', 'The QB throws Y’s inside route. Motion made the defense show who was responsible for the receiver.'])
  } else {
    r(s, 'H', [255, 240], [330, 90]); r(s, 'Y', [615, 300], [805, 285]); r(s, 'Z', [790, 190], [710, 160]); r(s, 'SS', [675, 175], [735, 275]); r(s, 'FS', [385, 80], [455, 65]); r(s, 'CBR', [775, 105]); r(s, 'CBL', [140, 105])
    read(s, 'QB', 'SS', 'Safety rolls into the flat', .4, 2.8); mark(s, 620, 135, 150, 100, 'Window above the rolled safety', 1.5, 4.2); finish(s, 'QB', 'Z', 2.6, 3.2)
    notes(s, ['Two high safeties can still become Cover 3. Watch both safeties after the ball moves.', 'The left safety rotates to the middle while the right safety drops into the flat. The corners bail deep.', 'Y holds the rolled safety underneath. Z settles above him and below the deep corner.', 'The QB fits the ball between those defenders. The useful read was the rotation, not the starting shell.'])
  }
  return s
}

function dollar() {
  const s = fresh('dollar'); passSet(s, ['TL', 'TR'])
  engage(s, 'C', 'TL', 1.05, 3.6, [425, 370], [430, 395], 'Third rusher picked up')
  r(s, 'TR', [510, 220], [540, 185]); r(s, 'X', [115, 160], [210, 130]); r(s, 'H', [255, 230], [400, 200]); r(s, 'Y', [615, 210], [520, 165]); r(s, 'Z', [790, 140]); r(s, 'RB', [330, 420], [200, 360]); r(s, 'N', [240, 200], [290, 195]); r(s, 'W', [350, 115]); r(s, 'M', [535, 100]); r(s, 'FS', [285, 65]); r(s, 'SS', [650, 65]); r(s, 'CBL', [145, 110]); r(s, 'CBR', [775, 105])
  read(s, 'QB', 'TR', 'Dropper takes away Y’s dig', .7, 3); mark(s, 445, 130, 150, 100, 'Extra coverage body', 1.3, 4.2, 'danger'); finish(s, 'QB', 'RB', 2.8, 3.4)
  notes(s, ['Dollar gets seven defensive backs on the field. This call rushes three and drops the fourth box defender.', 'The line picks up the three rushers. The extra underneath defender backs into the dig window.', 'Y’s dig and H’s cross run into layered coverage. The quarterback has time, but the deeper windows stay closed.', 'The QB takes the RB underneath. This package trades a fourth rusher for another body in the passing lanes.'])
  return s
}

function techniques() {
  const s = fresh('techniques')
  // One coherent front replaces the old strip of nine overlapping linemen.
  s.offensiveNodes = [
    ...['LT', 'LG', 'C', 'RG', 'RT'].map((id, i) => n(id, 350 + i * 50, 355)),
    n('QB', 450, 405), n('RB', 450, 480), n('Y', 615, 355, 'offense', 'TE'), n('H', 255, 385), n('X', 115, 355), n('Z', 790, 385),
  ]
  s.defensiveNodes = [n('EL', 315, 317, 'defense', '5'), n('TL', 425, 317, 'defense', '1'), n('TR', 525, 317, 'defense', '3'), n('ER', 595, 317, 'defense', '7'), n('M', 465, 230, 'defense'), n('W', 365, 245, 'defense'), n('N', 690, 255, 'defense', '9'), n('CBL', 115, 280, 'defense', 'CB'), n('CBR', 790, 280, 'defense', 'CB'), n('FS', 330, 110, 'defense'), n('SS', 620, 110, 'defense')]
  runSet(s, ['TR', 'ER']); engage(s, 'RG', 'TR', .7, 3.6, [525, 340], [535, 355], '3: guard’s outside shoulder'); engage(s, 'Y', 'ER', .7, 3.6, [600, 340], [605, 350], '7: TE’s inside shoulder')
  r(s, 'RB', [525, 425], [575, 365]); r(s, 'M', [505, 280], [560, 350]); engage(s, 'M', 'RB', 2.9, 4.2, [568, 358], [565, 365], 'Linebacker fills the remaining lane'); read(s, 'M', 'TR', 'Alignment tells you where the block starts', .5, 2.9); mark(s, 563, 305, 30, 100, 'C gap between 3 and 7', 1.2, 4.2, 'danger')
  notes(s, ['Technique numbers describe alignment: this front shows a 1 on the center, a 3 outside the guard, and a 7 inside the TE.', 'The RG meets the 3-tech’s outside shade. The TE meets the 7-tech on his inside shoulder.', 'Those starting angles squeeze B and the TE’s inside lane. The RB presses C, where Mike has to fit.', 'Mike meets the runner in C. Technique describes the starting leverage; the called fit still decides the assignment.'])
  return s
}

function n(id: string, x: number, y: number, team: BlueprintNode['team'] = 'offense', label = id): BlueprintNode {
  return { id, label, x, y, team, showLabel: true }
}
function special(id: string) {
  const s = fresh(id)
  if (id.startsWith('fg-')) {
    // Preserve the actual 11-man kicking unit and rush team, not a normal offense.
    const source = sceneFrom(id)
    s.offensiveNodes = source.offensiveNodes.filter(n => ['LT', 'LG', 'C', 'RG', 'RT', 'LE', 'RE', 'LW', 'RW', 'HOLD', 'K'].includes(n.id))
    s.defensiveNodes = source.defensiveNodes.filter(n => ['E1', 'E2', 'T1', 'T2', 'T3', 'T4', 'W1', 'W2', 'M', 'S1', 'S2'].includes(n.id))
    for (const [ol, dl, x] of [['LT', 'T1', 375], ['LG', 'T2', 425], ['RG', 'T3', 475], ['RT', 'T4', 525]] as const) {
      if (id !== 'fg-a-gap-push' || !['T2', 'T3'].includes(dl)) engage(s, ol, dl, .55, 2.8, [x, 348], [x, 365], 'Stay low; protect the launch')
    }
    track(s, 'K', [[430, 470]], .35, 1.25); track(s, 'HOLD', [[455, 470]], .35, .6)
    if (id === 'fg-edge-overload') {
      engage(s, 'RE', 'E2', .65, 1.9, [625, 385], [630, 405], 'First rusher occupies the end')
      engage(s, 'RW', 'W1', .75, 2.1, [660, 415], [650, 435], 'Wing takes the second rusher')
      frames(s, 'M', [{ at: 0, pos: [735, 350] }, { at: .75, pos: [695, 430] }, { at: 1.5, pos: [545, 470] }, { at: 2.2, pos: [495, 460] }])
      read(s, 'HOLD', 'M', 'Third edge rusher stays free', .4, 2); mark(s, 650, 370, 95, 100, 'Three rushers, two protectors', .6, 2.6, 'danger'); finish(s, 'K', 'M', 1.65, 2.2, 'kick')
      notes(s, ['Three rushers stack outside the right end. The end and wing can only take two of them.', 'The first two rushers hit the end and wing. The third runs outside both contacts.', 'The free rusher turns toward the holder while the kicker approaches. The block point is the launch spot, not the holder’s body.', 'The third rusher reaches the low ball at launch. The overload worked because the first two occupied the available blockers.'])
    } else if (id === 'fg-a-gap-push') {
      engage(s, 'LG', 'T2', .55, 1.45, [425, 350], [435, 385], 'Drive the guard backward'); engage(s, 'RG', 'T3', .55, 1.45, [475, 350], [465, 385], 'Compress both A gaps')
      frames(s, 'T2', [{ at: 0, pos: [425, 318] }, { at: .55, pos: [425, 335] }, { at: 1.45, pos: [435, 370] }, { at: 2, pos: [445, 380] }])
      r(s, 'M', [450, 305], [450, 335]); engage(s, 'LE', 'E1', .8, 2.5, [280, 385], [285, 410]); engage(s, 'RE', 'E2', .8, 2.5, [635, 385], [630, 410]); read(s, 'K', 'T2', 'Interior push raises the block point', .5, 2); mark(s, 410, 330, 80, 85, 'A-gap compression', .6, 2.7, 'danger'); finish(s, 'K', 'T2', 1.3, 1.85, 'kick')
      notes(s, ['The rush attacks both A gaps. The aim is to push the protection back and get hands into the low part of the kick.', 'Both interior rushers strike low and drive the guards toward the holder. Nobody jumps on a teammate.', 'The pocket compresses near the launch line. The inside rusher can raise a hand where the ball is still low.', 'The kick meets the inside hand. This example wins with legal ground-level push, not by leaping over the center.'])
    } else {
      engage(s, 'LE', 'E1', .75, 2.4, [270, 390], [290, 420], 'Controlled edge rush'); engage(s, 'RE', 'E2', .75, 2.4, [635, 390], [615, 420], 'Do not lose outside contain')
      r(s, 'S1', [215, 315], [245, 350]); r(s, 'S2', [695, 315], [665, 350]); r(s, 'M', [450, 295]); r(s, 'LW', [255, 355], [225, 280]); r(s, 'RW', [645, 355], [675, 280]); man(s, 'S1', 'LW', [18, -18]); man(s, 'S2', 'RW', [-18, -18])
      read(s, 'M', 'HOLD', 'Hold the fake responsibility', .35, 2.6); mark(s, 195, 280, 100, 100, 'Release covered', .8, 3.3, 'danger'); mark(s, 625, 280, 100, 100, 'Release covered', .8, 3.3, 'danger')
      s.ball = { from: 'K', to: 'K', release: 1.35, arrival: 2.1, kind: 'kick', target: [450, 45] }
      notes(s, ['Safe block keeps defenders responsible for the eligible releases and holder. It gives up some pressure to cover a fake.', 'The edges rush under control. The outside defenders match the wings instead of selling out for the kicker.', 'The holder stays down for the kick. The fake outlets remain covered while the inside rush is contained.', 'The kick clears the rush. This call’s tradeoff is visible: fewer free rushers, but no uncovered receiver on a fake.'])
    }
    return s
  }
  if (id === 'punt-spread' || id === 'punt-pro') {
    s.offensiveNodes = s.offensiveNodes.filter(n => n.team === 'special').map(n => ({ ...n, team: 'offense' as const }))
    s.defensiveNodes = [n('DL', 290, 240, 'defense'), n('DTL', 390, 240, 'defense'), n('DTR', 510, 240, 'defense'), n('DR', 610, 240, 'defense'), n('BL', 335, 180, 'defense'), n('BR', 565, 180, 'defense'), n('J1', 110, 240, 'defense'), n('J2', 790, 240, 'defense'), n('VL', 205, 140, 'defense'), n('VR', 695, 140, 'defense'), n('RET', 450, 50, 'defense', 'R')]
    if (id === 'punt-spread') {
      engage(s, 'S1', 'DL', 1.15, 1.75, [355, 385], [355, 400], 'Shield squares the left rush')
      engage(s, 'S2', 'DTR', 1.2, 1.8, [465, 385], [465, 400], 'Shield holds the middle')
      engage(s, 'S3', 'DR', 1.15, 1.75, [545, 385], [545, 400], 'Shield squares the right rush')
      for (const [i, x] of [90, 210, 330, 570, 690, 810].entries()) { track(s, `L${i}`, [[node(s, `L${i}`).x, 215], [x, 95]], .5, 3.8) }
      track(s, 'C', [[450, 170], [450, 100]], .55, 3.7)
      r(s, 'DTL', [395, 310], [405, 380]); r(s, 'BL', [320, 260], [300, 320]); r(s, 'BR', [580, 260], [605, 320]); man(s, 'J1', 'L0', [20, -20]); man(s, 'J2', 'L5', [-20, -20])
      read(s, 'P', 'S2', 'Shield buys the release time', .7, 1.8); mark(s, 320, 355, 260, 80, 'Three-man shield', .7, 2.1); finish(s, 'P', 'RET', 1.75, 3.7, 'kick')
      notes(s, ['Spread punt puts seven across the line and three in the shield. The wide coverage players release while the shield protects the punter.', 'The snap arrives. The wide players release into lanes while the middle rush closes on the shield.', 'The shield meets the rush before the launch spot. The punter kicks while the coverage has a head start.', 'The returner fields the kick with coverage spreading around him. Shield protection bought time without keeping every cover player in.'])
    } else {
      for (const [ol, dl, x] of [['LT', 'DL', 330], ['LG', 'DTL', 400], ['RG', 'DTR', 500], ['RT', 'DR', 570]] as const) engage(s, ol, dl, .75, 1.75, [x, 300], [x, 325], 'Protect, then release')
      engage(s, 'PP', 'BR', 1.2, 1.9, [500, 385], [500, 400], 'Personal protector takes the leak')
      r(s, 'GL', [100, 175], [180, 80]); r(s, 'GR', [800, 175], [720, 80]); man(s, 'J1', 'GL', [20, -20]); man(s, 'J2', 'GR', [-20, -20]); r(s, 'WL', [300, 300], [270, 180]); r(s, 'WR', [600, 300], [630, 180]); r(s, 'BL', [335, 265], [360, 305])
      for (const ol of ['LT', 'LG', 'C', 'RG', 'RT']) { const p = node(s, ol); frames(s, ol, [{ at: 0, pos: [p.x, p.y] }, { at: .75, pos: [p.x, 315] }, { at: 1.75, pos: [p.x, 340] }, { at: 3.8, pos: [p.x, 170] }]) }
      read(s, 'P', 'PP', 'Protector picks up the leak', .8, 2); mark(s, 455, 340, 100, 100, 'Last protection layer', 1, 2.2); finish(s, 'P', 'RET', 1.8, 3.8, 'kick')
      notes(s, ['Pro-style punt keeps the line and wings in protection before releasing them. The two gunners leave immediately.', 'The line sets against the rush. The personal protector scans for a defender who slips through.', 'A right-side rusher leaks inside; the protector meets him before the punter launches the kick.', 'The line releases after the kick while the gunners arrive first. Protection cost those interior cover players some downfield distance.'])
    }
    return s
  }
  if (id === 'punt-gunner') {
    s.offensiveNodes = [n('GL', 180, 355, 'offense', 'G'), n('GR', 720, 355, 'offense', 'G'), ...['LT', 'LG', 'C', 'RG', 'RT'].map((id, i) => n(id, 350 + i * 50, 355)), n('WL', 290, 400), n('WR', 610, 400), n('PP', 450, 440), n('P', 450, 510)]
    s.defensiveNodes = [n('J1', 160, 318, 'defense'), n('J2', 210, 318, 'defense'), n('J3', 710, 318, 'defense'), n('RET', 450, 65, 'defense', 'R'), n('DL', 315, 317, 'defense'), n('TL', 410, 317, 'defense'), n('TR', 495, 317, 'defense'), n('DR', 595, 317, 'defense'), n('M', 465, 240, 'defense'), n('VL', 275, 175, 'defense'), n('VR', 625, 175, 'defense')]
    engage(s, 'GL', 'J1', .55, .95, [155, 320], [145, 307], 'First jam slows the release')
    frames(s, 'GL', [{ at: 0, pos: [180, 355] }, { at: .55, pos: [170, 320] }, { at: .95, pos: [160, 307] }, { at: 1.6, pos: [115, 255] }, { at: 2.8, pos: [220, 130] }, { at: 4.2, pos: [385, 90] }])
    r(s, 'J1', [130, 270], [210, 160]); r(s, 'J2', [175, 265], [270, 150]); engage(s, 'GR', 'J3', .5, .8, [720, 320], [745, 300], 'Outside release wins')
    frames(s, 'GR', [{ at: 0, pos: [720, 355] }, { at: .5, pos: [735, 320] }, { at: .8, pos: [760, 300] }, { at: 1.6, pos: [755, 225] }, { at: 2.8, pos: [625, 130] }, { at: 4.2, pos: [510, 90] }])
    for (const [a, b, x] of [['LT', 'DL', 330], ['LG', 'TL', 410], ['RG', 'TR', 495], ['RT', 'DR', 575]] as const) engage(s, a, b, .75, 2, [x, 375], [x, 390], 'Punt protection')
    read(s, 'GL', 'J2', 'Win outside the double jam', .35, 1.6); mark(s, 360, 55, 180, 80, 'Bracket the returner', 2.8, 4.2, 'danger'); finish(s, 'P', 'RET', 1.7, 3.6, 'kick')
    notes(s, ['The left gunner faces two jammers; the right faces one. Both need a release that keeps the returner between them.', 'The first jams create real contact. The left gunner works outside the double while the right wins his single block.', 'Both gunners clear the jams and angle inward as the kick travels. Running straight to the same shoulder would open a return lane.', 'They arrive on opposite sides as the returner fields the punt. The release work created leverage at the catch.'])
    return s
  }
  // For returns, O is the return unit and X is the incoming coverage unit.
  s.offensiveNodes = [n('RET', 600, 75, 'offense', 'R'), ...[210, 315, 420, 525, 630, 735].map((x, i) => n(`B${i}`, x, 220)), n('J1', 130, 260), n('J2', 800, 260), n('J3', 340, 280), n('J4', 570, 280)]
  s.defensiveNodes = [...[155, 275, 395, 515, 635, 755].map((x, i) => n(`C${i}`, x, 390, 'defense')), n('P', 450, 510, 'defense'), n('S1', 350, 425, 'defense'), n('S2', 550, 425, 'defense'), n('G1', 90, 330, 'defense'), n('G2', 810, 330, 'defense')]
  for (let i = 0; i < 6; i++) engage(s, `B${i}`, `C${i}`, 2 + i * .09, 4.2, [285 + i * 35, 265 + i * 22], [300 + i * 35, 265 + i * 22], 'Seal coverage to the inside')
  frames(s, 'RET', [{ at: 0, pos: [600, 75] }, { at: 1.75, pos: [600, 85] }, { at: 2.2, pos: [500, 130] }, { at: 3, pos: [185, 220] }, { at: 4.2, pos: [175, 430] }])
  engage(s, 'J1', 'G1', 1, 2.9, [115, 265], [115, 245], 'Keep the gunner outside'); engage(s, 'J2', 'G2', 1, 2.9, [805, 265], [805, 245], 'Delay the backside gunner')
  r(s, 'S1', [330, 340], [310, 220]); r(s, 'S2', [550, 330], [515, 195]); read(s, 'RET', 'B0', 'Press, then follow the wall', 1.7, 3.7); mark(s, 130, 190, 100, 290, 'Return lane outside the wall', 2.1, 4.2); finish(s, 'P', 'RET', .45, 1.75, 'kick')
  notes(s, ['The return unit will build a left wall. The returner must secure the catch before bending toward it.', 'The kick travels while the gunners meet the outside jams. Interior blockers locate the approaching coverage.', 'The returner fields the punt and presses left. The wall meets coverage from the side and seals it toward the middle.', 'The returner follows the outside hip of the wall. The lane exists because the blockers turned the coverage, not because the runner outran untouched defenders.'])
  return s
}

export function defensiveScene(id: string): PlayScene | undefined {
  if (/^cover-[012346]$/.test(id)) return coverage(id)
  if (['stunt-tex', 'stunt-ext', 'stunt-loop', 'blitz-cross-dog', 'blitz-fire-zone'].includes(id)) return stunt(id)
  if (['4-3', '3-4', 'bear', 'penny', 'one-gap', 'two-gap', 'fit-one-gap', 'fit-two-gap'].includes(id)) return runDefense(id)
  if (['nose', 'edge', 'mike', 'will', 'sam', 'cornerback', 'free-safety', 'strong-safety', 'nickel'].includes(id)) return role(id)
  if (['creeping-safety', 'motion-adjustment', 'coverage-roll'].includes(id)) return adjustment(id)
  if (id === 'dollar') return dollar()
  if (id === 'techniques') return techniques()
  if (['fg-edge-overload', 'fg-a-gap-push', 'fg-block-safe', 'punt-spread', 'punt-pro', 'punt-gunner', 'punt-return-wall'].includes(id)) return special(id)
  return undefined
}
