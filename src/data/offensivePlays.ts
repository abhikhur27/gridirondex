import type { PlayScene } from './playModel.ts'
import type { Point } from './vectorGeometry.ts'
import { sceneFrom, node, place, track, frames, engage, mark, read, notes, man, finish } from './playBuilders.ts'

// Each lesson is a called play against a stated response. The outcome belongs to
// that response, not to a claim that a formation or route always beats a coverage.
const routeIds = ['flat', 'slant', 'comeback', 'curl', 'out', 'dig', 'corner', 'post', 'go', 'wheel', 'angle', 'option', 'mesh-crossers']
const passIds = ['mesh', 'smash', 'flood', 'hi-lo', 'drive', 'y-cross', 'four-verticals', 'dagger', 'scissors', 'boot']
const runIds = ['inside-zone', 'outside-zone', 'power', 'trap', 'counter', 'duo', 'slide', 'man-protection', 'chip', 'play-action']
const personnelIds = ['personnel-11', 'personnel-12', 'personnel-21', 'personnel-22', 'personnel-00', 'personnel-10']
const roleIds = ['quarterback', 'running-back', 'fullback', 'tight-end', 'x-receiver', 'z-receiver', 'slot']
const readIds = ['safety-count', 'hot-read', 'leverage', 'apex', 'conflict-linebacker', 'press-check', 'zero-beater', 'box-count']
const formationIds = ['formation-i', 'formation-singleback', 'formation-trips', 'formation-empty', 'formation-pistol', 'formation-wishbone', 'formation-flexbone']
const gapIds = ['gap-a', 'gap-b', 'gap-c', 'gap-d']
export const offensiveSceneIds = [...routeIds, ...passIds, ...runIds, ...personnelIds, ...roleIds, ...readIds, ...formationIds, ...gapIds]

function blank(id: string) {
  const s = sceneFrom(id)
  s.areas = []; s.reads = []; s.contacts = []; s.beats = []
  return s
}

function protectedPocket(s: PlayScene) {
  track(s, 'QB', [[450, 465]], .35, 1)
  const pairs: [string, string, Point][] = [['LT', 'EL', [325, 365]], ['LG', 'TL', [405, 355]], ['RG', 'TR', [510, 355]], ['RT', 'ER', [585, 365]]]
  for (const [o, d, p] of pairs) engage(s, o, d, .75, 4.2, p, [p[0], p[1] + 20], 'Set / contain')
  track(s, 'C', [[450, 370], [450, 390]], .35, 1.3)
}

function cover(s: PlayScene, shell: 'man' | 'two' | 'three' | 'quarters' = 'three') {
  if (shell === 'man') {
    for (const [d, o] of [['CBL', 'X'], ['CBR', 'Z'], ['N', 'H'], ['SS', 'Y'], ['W', 'RB']]) man(s, d, o, [14, -20])
    track(s, 'FS', [[450, 80]], .35, 2.2)
    track(s, 'M', [[450, 265]], .35, 1.1)
  } else if (shell === 'two') {
    track(s, 'CBL', [[115, 280]], .35, .9); track(s, 'CBR', [[785, 280]], .35, .9)
    track(s, 'FS', [[270, 80]], .35, 2.4); track(s, 'SS', [[650, 85]], .35, 2.4)
    track(s, 'N', [[245, 225]], .35, 1.5); track(s, 'W', [[385, 205]], .35, 1.5); track(s, 'M', [[550, 210]], .35, 1.5)
  } else if (shell === 'quarters') {
    track(s, 'CBL', [[145, 90]], .35, 2.4); track(s, 'CBR', [[765, 90]], .35, 2.4)
    track(s, 'FS', [[340, 100]], .35, 2.4); track(s, 'SS', [[560, 100]], .35, 2.4)
    track(s, 'N', [[210, 260]], .35, 1.4); track(s, 'W', [[425, 220]], .35, 1.4); track(s, 'M', [[655, 260]], .35, 1.4)
  } else {
    track(s, 'CBL', [[135, 90]], .35, 2.4); track(s, 'CBR', [[765, 90]], .35, 2.4); track(s, 'FS', [[450, 65]], .35, 2.4)
    track(s, 'SS', [[710, 275]], .35, 1.6); track(s, 'N', [[180, 275]], .35, 1.6)
    track(s, 'W', [[350, 235]], .35, 1.6); track(s, 'M', [[535, 235]], .35, 1.6)
  }
}

function routesAround(s: PlayScene) {
  track(s, 'X', [[115, 220], [110, 100]])
  track(s, 'Z', [[790, 200], [790, 95]])
  track(s, 'H', [[255, 280], [295, 225]])
  track(s, 'Y', [[615, 245], [625, 135]])
  track(s, 'RB', [[330, 420], [220, 390]], .6, 2.8)
}

function routeLesson(id: string) {
  const s = blank(id); s.tracks = []
  protectedPocket(s); routesAround(s)
  const config: Record<string, { player: string; path: Point[]; target: string; area: [number, number, number, number, string]; text: [string, string, string, string] }> = {
    flat: { player: 'Y', path: [[650, 315], [815, 315]], target: 'SS', area: [740, 285, 110, 60, 'Flat outlet'], text: ['Cover 3: the strong safety owns the flat; Z can push the corner deep.', 'Y releases outside while Z runs past the corner.', 'The safety gains depth under Z. Y gets width below him.', 'The QB takes the flat before the safety can drive downhill.'] },
    slant: { player: 'X', path: [[115, 315], [295, 225]], target: 'CBL', area: [195, 220, 120, 55, 'Inside window'], text: ['X faces outside leverage. The nickel still has to leave the slant lane.', 'X threatens outside; H releases to the flat and widens the nickel.', 'X cuts across the corner’s face after the nickel expands.', 'The throw leads X inside. A nickel sitting here would take this away.'] },
    comeback: { player: 'X', path: [[115, 155], [70, 210]], target: 'CBL', area: [45, 175, 90, 80, 'Comeback window'], text: ['The corner has cushion and deep-third responsibility.', 'X runs at that cushion, making the corner turn and bail.', 'X plants and comes back outside; the corner’s momentum stays deep.', 'The ball arrives toward the boundary before the corner can reverse.'] },
    curl: { player: 'X', path: [[115, 215], [170, 215], [170, 260]], target: 'N', area: [125, 235, 125, 60, 'Curl window'], text: ['The curl and flat will stretch the same underneath defender.', 'X pushes the corner deep. H widens into the flat.', 'The nickel expands with H; X settles inside that movement.', 'The QB hits the stationary curl before the hook defender closes.'] },
    out: { player: 'X', path: [[145, 205], [55, 205]], target: 'CBL', area: [40, 180, 100, 60, 'Out break'], text: ['The corner protects inside leverage with a safety in the middle.', 'X stems vertically to keep the corner from sitting on the sideline.', 'X breaks outside while the corner is still turning out of his pedal.', 'The ball meets the break. Waiting longer lets the corner recover.'] },
    dig: { player: 'X', path: [[115, 190], [465, 190]], target: 'W', area: [310, 160, 200, 70, 'Behind the hook'], text: ['A dig needs room behind the hook defender and below the safety.', 'H carries the safety deep while Y crosses beneath the linebackers.', 'The WILL steps down toward Y, leaving space behind his shoulder.', 'X catches the dig in that window before the next linebacker arrives.'] },
    corner: { player: 'H', path: [[255, 210], [85, 85]], target: 'CBL', area: [45, 95, 130, 105, 'Cover 2 hole'], text: ['Cover 2 has a corner underneath and a half-field safety above.', 'X sits on a hitch, drawing the flat corner down.', 'H breaks behind the corner and away from the inside safety.', 'The QB fits the corner route between the two defenders.'] },
    post: { player: 'X', path: [[145, 210], [355, 75]], target: 'FS', area: [260, 55, 155, 105, 'Post window'], text: ['Two high safeties: the inside seam can hold the near safety.', 'H runs a seam while X sells a vertical outside stem.', 'The safety turns with H. X bends inside the corner into that space.', 'The post gets the throw only after the safety commits to the seam.'] },
    go: { player: 'X', path: [[105, 280], [80, 55]], target: 'FS', area: [45, 45, 95, 145, 'Outside leverage'], text: ['X has a press corner and a middle safety too far away to help outside.', 'X releases outside the corner; the QB checks the safety’s angle.', 'The safety holds the opposite seam, leaving a one-on-one lane.', 'The throw leads X toward the boundary, away from inside help.'] },
    wheel: { player: 'RB', path: [[235, 405], [115, 335], [100, 155]], target: 'W', area: [60, 160, 100, 140, 'Wheel lane'], text: ['The WILL has the back in man. X must clear the sideline first.', 'RB sells a flat release and makes the linebacker run sideways.', 'RB turns upfield while the linebacker has to flip his hips.', 'The wheel catches outside the trailing linebacker; X has carried the corner away.'] },
    angle: { player: 'RB', path: [[275, 385], [310, 320], [445, 265]], target: 'W', area: [350, 235, 135, 70, 'Inside cut'], text: ['The back has a man matchup against the WILL in space.', 'RB releases outside; the WILL widens to protect the flat.', 'RB plants inside while Y carries the middle help away.', 'The angle route gets a throw across the linebacker’s trailing shoulder.'] },
    option: { player: 'H', path: [[255, 275], [150, 265]], target: 'N', area: [120, 235, 115, 65, 'Break away'], text: ['The nickel lines up inside the slot. The receiver and QB share an outside-break rule.', 'H stems at the nickel to make him declare his leverage.', 'The nickel stays inside, so H breaks away toward the sideline.', 'The QB throws outside with H. A different leverage picture changes the route.'] },
    'mesh-crossers': { player: 'H', path: [[255, 290], [695, 290]], target: 'N', area: [395, 250, 160, 70, 'Crossing traffic'], text: ['Two shallow routes attack man coverage at slightly different depths.', 'H and Y cross; their man defenders have to follow.', 'The nickel bends around Y’s route while H keeps running. Nobody sets a pick block.', 'H gets the throw with the nickel trailing through the crossing traffic.'] },
  }
  const c = config[id]
  track(s, c.player, c.path, .35, 3.35)
  if (['slant', 'curl'].includes(id)) track(s, 'H', [[230, 325], [70, 320]], .35, 2.5)
  if (id === 'dig') { track(s, 'H', [[255, 160], [370, 50]]); track(s, 'Y', [[615, 290], [290, 290]]) }
  if (id === 'corner') track(s, 'X', [[115, 280]], .35, 1.4)
  if (id === 'post') track(s, 'H', [[260, 180], [285, 50]])
  if (id === 'wheel') track(s, 'X', [[145, 220], [310, 65]])
  if (id === 'mesh-crossers') track(s, 'Y', [[615, 255], [175, 255]], .35, 3.35)
  cover(s, ['slant', 'out', 'go', 'wheel', 'angle', 'option', 'mesh-crossers'].includes(id) ? 'man' : ['corner', 'post'].includes(id) ? 'two' : 'three')
  if (id === 'flat') track(s, 'SS', [[745, 200]], .35, 2.4)
  if (['slant', 'curl'].includes(id)) track(s, 'N', [[135, 305], [100, 320]], .35, 2.3)
  if (id === 'slant') { place(s, 'CBL', 140, 310); man(s, 'CBL', 'X', [-24, -12]) }
  if (id === 'comeback') frames(s, 'CBL', [{ at: .35, pos: [115, 280] }, { at: 2.4, pos: [120, 110] }, { at: 3.8, pos: [95, 175] }])
  if (id === 'dig') track(s, 'W', [[355, 290]], .65, 2.3)
  if (id === 'post') track(s, 'FS', [[275, 60]], .35, 2.6)
  if (id === 'go') track(s, 'FS', [[570, 90]], .35, 2.8)
  if (id === 'wheel') frames(s, 'W', [{ at: .35, pos: [365, 245] }, { at: 1.5, pos: [205, 345] }, { at: 2.4, pos: [140, 325] }, { at: 3.8, pos: [135, 185] }])
  if (id === 'angle') { track(s, 'M', [[530, 150]], .35, 2.7); frames(s, 'W', [{ at: .35, pos: [365, 245] }, { at: 1.6, pos: [270, 340] }, { at: 3.7, pos: [405, 290] }]) }
  if (id === 'option') { place(s, 'N', 285, 295); track(s, 'N', [[285, 260], [215, 255]], .35, 3.5) }
  if (id === 'mesh-crossers') frames(s, 'N', [{ at: .35, pos: [265, 320] }, { at: 1.6, pos: [395, 305] }, { at: 2.2, pos: [440, 330] }, { at: 3.7, pos: [645, 315] }])
  mark(s, ...c.area, 1.6, 4.2); read(s, 'QB', c.target, 'Read the leverage', .5, 3)
  finish(s, 'QB', c.player, id === 'slant' ? 1.65 : 2.7, id === 'slant' ? 2.2 : 3.35)
  notes(s, c.text)
  return s
}

function passingLesson(id: string) {
  const s = blank(id); protectedPocket(s)
  const shell = id === 'mesh' ? 'man' : id === 'smash' ? 'two' : id === 'scissors' ? 'quarters' : 'three'
  cover(s, shell)
  switch (id) {
    case 'mesh':
      frames(s, 'N', [{ at: .35, pos: [260, 320] }, { at: 1.6, pos: [415, 305] }, { at: 2.1, pos: [450, 330] }, { at: 3.7, pos: [690, 315] }])
      mark(s, 380, 240, 170, 100, 'Man traffic', 1.3); read(s, 'QB', 'N', 'Trailing the crossers'); finish(s, 'QB', 'H')
      notes(s, ['Cover 1 attaches the nickel and safety to the two inside receivers.', 'H and Y cross at different depths while the line holds the rush.', 'The nickel takes a longer path around the traffic; H keeps his speed.', 'The throw goes to the crosser running away from his man. No receiver blocks downfield.'])
      break
    case 'smash':
      track(s, 'CBL', [[120, 280]], .35, 1.1); track(s, 'FS', [[300, 80]], .35, 2.6)
      mark(s, 50, 90, 145, 110, 'Cover 2 honey hole', 1.4); read(s, 'QB', 'CBL', 'Corner squats → throw above'); finish(s, 'QB', 'H')
      notes(s, ['The hitch and corner route attack one Cover 2 corner at two depths.', 'X stops underneath. The corner squats on him instead of sinking.', 'H breaks behind that corner while the safety starts from inside.', 'The QB throws into the sideline window between corner and safety.'])
      break
    case 'flood':
      track(s, 'SS', [[765, 300]], .35, 1.8)
      mark(s, 740, 165, 115, 80, 'Sail window', 1.7); read(s, 'QB', 'SS', 'Flat player drives down'); finish(s, 'QB', 'H')
      notes(s, ['Three receivers attack the right sideline against Cover 3.', 'Z carries the corner deep. Y pulls the flat defender toward the line.', 'The safety drives on Y, leaving H’s intermediate sail above him.', 'H catches between the flat player and deep-third corner.'])
      break
    case 'hi-lo':
      track(s, 'M', [[480, 185]], .35, 1.8)
      mark(s, 490, 250, 200, 70, 'Under the hook', 1.5); read(s, 'QB', 'M', 'Depth leaves the shallow'); finish(s, 'QB', 'H')
      notes(s, ['The shallow and dig sit on opposite sides of the MIKE’s depth.', 'The MIKE gains depth to stay below the dig.', 'H crosses under him. The QB reads the linebacker instead of waiting on X.', 'The shallow gets the ball in front of the deep-dropping linebacker.'])
      break
    case 'drive':
      track(s, 'M', [[525, 295]], .5, 2.1)
      mark(s, 395, 145, 205, 70, 'Dig behind the chase', 1.5); read(s, 'QB', 'M', 'Shallow pulls him down'); finish(s, 'QB', 'X')
      notes(s, ['The shallow crosses below a deeper dig; the verticals keep the safeties back.', 'H crosses quickly and the MIKE steps toward him.', 'X breaks behind that downhill step into the middle window.', 'The QB hits the dig before the linebacker can recover his depth.'])
      break
    case 'y-cross':
      track(s, 'W', [[365, 230]], .35, 1.2); track(s, 'FS', [[465, 75]], .35, 2.5)
      mark(s, 130, 100, 195, 80, 'Behind the linebackers', 1.8); read(s, 'QB', 'FS', 'Check the far safety'); finish(s, 'QB', 'Y')
      notes(s, ['X runs off the corner while H offers a short left outlet.', 'Y climbs beyond the linebackers before crossing left.', 'The middle safety stays deep and central; the WILL cannot reach Y from underneath.', 'Y gets the ball between those levels. A safety cutting the cross would force the outlet.'])
      break
    case 'four-verticals':
      track(s, 'FS', [[370, 75]], .35, 2.4); track(s, 'M', [[535, 220]], .35, 1.6)
      mark(s, 510, 65, 100, 150, 'Cover 3 seam hole', 1.4); read(s, 'QB', 'FS', 'Safety leans to H'); finish(s, 'QB', 'Y', 2.4, 3.1)
      notes(s, ['Spot-drop Cover 3 has three deep defenders against four vertical lanes.', 'Outside receivers occupy both corners; H and Y split the middle safety.', 'The safety leans left toward H while Y runs beyond the hook defender.', 'The QB hits the right seam. Match rules could carry Y and close this hole.'])
      break
    case 'dagger':
      track(s, 'FS', [[395, 55]], .35, 2.6); track(s, 'W', [[325, 295]], .35, 2.2)
      mark(s, 320, 160, 220, 70, 'Cleared dig window', 1.7); read(s, 'QB', 'W', 'Hook steps to the shallow'); finish(s, 'QB', 'X')
      notes(s, ['H’s vertical and Y’s shallow surround the space X wants for the dig.', 'H takes the safety deep; Y brings the WILL’s attention down.', 'X breaks into the middle after those two defenders separate.', 'The dig catches between the hook defender and the cleared safety.'])
      break
    case 'scissors':
      track(s, 'FS', [[420, 65]], .35, 2.8); man(s, 'CBL', 'X', [-20, -18])
      mark(s, 45, 60, 140, 135, 'Corner away from safety', 1.8); read(s, 'QB', 'FS', 'Safety carries the post'); finish(s, 'QB', 'H')
      notes(s, ['X’s post and H’s corner exchange lanes against a quarters picture.', 'The corner carries X while the safety keys both inside stems.', 'The safety follows the post inside, leaving H breaking away toward the sideline.', 'The QB chooses the corner. A clean defensive exchange would remove this opening.'])
      break
    case 'boot':
      s.contacts = s.contacts.filter(c => c.b !== 'ER')
      track(s, 'QB', [[420, 435], [590, 460], [695, 420]], .35, 3.2)
      track(s, 'ER', [[615, 365], [650, 415]], .35, 2.8); track(s, 'M', [[400, 285]], .35, 1.5)
      mark(s, 745, 270, 110, 70, 'Boot outlet', 1.4); read(s, 'QB', 'ER', 'Edge stays home → get it out'); finish(s, 'QB', 'Y', 2.1, 2.8)
      notes(s, ['The run fake goes left; the quarterback boots right with a flat outlet.', 'The MIKE follows the fake, but the backside end stays outside.', 'That end closes on the rollout. The QB cannot keep drifting toward him.', 'The QB releases to Y in the flat before the contain rusher arrives.'])
      break
  }
  return s
}

function runSupport(s: PlayScene) {
  track(s, 'CBL', [[155, 310]], .35, 2.8); track(s, 'CBR', [[735, 320]], .35, 2.8)
  track(s, 'FS', [[435, 165]], .35, 3.3); track(s, 'SS', [[610, 235]], .35, 3.3)
  track(s, 'N', [[285, 310]], .35, 2.6)
  // Stalk blocks engage near the line only once the run has declared.
  engage(s, 'X', 'CBL', 1.6, 4.2, [150, 320], [165, 305], 'Stalk / outside leverage')
  engage(s, 'Z', 'CBR', 1.6, 4.2, [740, 335], [750, 315], 'Stalk / outside leverage')
  frames(s, 'QB', [{ at: .35, pos: [450, 410] }, { at: .8, pos: [455, 445] }, { at: 1.4, pos: [425, 450] }, { at: 3.8, pos: [405, 460] }])
}

function insideRun(s: PlayScene, duo = false) {
  runSupport(s)
  place(s, 'H', 285, 385, 'H')
  engage(s, 'LT', 'EL', .65, 1.45, [330, 330], [315, 300], 'Reach the end')
  engage(s, 'H', 'EL', 1.45, 4.2, [315, 300], [295, 275], 'Take over the edge')
  engage(s, 'LT', 'W', 2, 4.2, [355, 250], [350, 210], 'Climb / wall off WILL')
  engage(s, 'C', 'TL', .65, 4.2, [420, 330], [410, 290], 'Secure the shade')
  engage(s, 'LG', 'TL', .65, 1.3, [420, 330], [410, 310], 'Combo before climbing')
  track(s, 'LG', [[390, 285], [385, 225]], 1.3, 3)
  engage(s, 'RG', 'TR', .65, 4.2, [510, 330], [530, 290], 'Drive the 3-tech')
  engage(s, 'RT', 'TR', .65, 1.45, [510, 330], [520, 310], 'Double-team')
  engage(s, 'RT', 'M', 2.05, 4.2, [475, 250], [480, 210], 'Climb / seal MIKE')
  engage(s, 'Y', 'ER', .7, 4.2, [605, 330], [625, 285], 'Keep the edge outside')
  track(s, 'W', [[370, 280]], .35, 1.7); track(s, 'M', [[480, 280]], .35, 1.7)
  frames(s, 'RB', [{ at: .35, pos: [450, 485] }, { at: .8, pos: [455, 445] }, { at: 1.5, pos: [duo ? 480 : 460, 400] }, { at: 2.3, pos: [duo ? 535 : 455, 330] }, { at: 3.8, pos: [duo ? 555 : 450, 205] }])
  mark(s, duo ? 540 : 437, 205, 45, 190, duo ? 'B-gap cut' : 'A-gap crease', 1.8)
  finish(s, 'QB', 'RB', .65, .85, 'handoff')
}

function outsideRun(s: PlayScene) {
  runSupport(s)
  engage(s, 'LT', 'EL', .75, 4.2, [340, 330], [365, 300], 'Cut off pursuit')
  engage(s, 'LG', 'TL', .75, 4.2, [425, 330], [455, 290], 'Reach the shade')
  track(s, 'C', [[490, 325], [535, 250]], .35, 2.7)
  engage(s, 'RG', 'TR', .75, 4.2, [535, 335], [575, 300], 'Reach the 3-tech')
  engage(s, 'RT', 'ER', .75, 1.5, [610, 335], [650, 315], 'Stretch the end')
  engage(s, 'Y', 'ER', 1.5, 4.2, [650, 315], [705, 300], 'TE takes the edge')
  engage(s, 'RT', 'M', 2, 4.2, [610, 260], [620, 225], 'Tackle climbs to MIKE')
  track(s, 'W', [[465, 275], [530, 290]], .35, 3.2)
  track(s, 'M', [[560, 270]], .35, 1.8)
  frames(s, 'RB', [{ at: .35, pos: [450, 485] }, { at: .85, pos: [495, 450] }, { at: 1.7, pos: [620, 400] }, { at: 2.6, pos: [660, 335] }, { at: 3.8, pos: [660, 215] }])
  mark(s, 635, 215, 45, 180, 'One cut inside the edge', 2)
  read(s, 'RB', 'ER', 'End widens → cut inside', 1, 3)
  finish(s, 'QB', 'RB', .65, .85, 'handoff')
}

function powerRun(s: PlayScene, counter = false) {
  runSupport(s)
  engage(s, 'C', 'TL', .65, 4.2, [410, 330], [395, 290], 'Down block')
  engage(s, 'RG', 'TR', .65, 4.2, [485, 330], [470, 290], 'Down block')
  engage(s, 'RT', 'TR', .7, 1.6, [485, 330], [470, 310], 'Inside wall')
  engage(s, counter ? 'LG' : 'Y', 'ER', counter ? 1.65 : .8, 4.2, [635, 340], [665, 310], 'Kick out')
  if (counter) {
    frames(s, 'LG', [{ at: .35, pos: [400, 355] }, { at: .7, pos: [405, 410] }, { at: 1.35, pos: [590, 405] }, { at: 1.65, pos: [635, 354] }])
    frames(s, 'LT', [{ at: .35, pos: [350, 355] }, { at: .85, pos: [355, 440] }, { at: 1.7, pos: [555, 430] }, { at: 2.2, pos: [570, 285] }])
    engage(s, 'LT', 'M', 2.2, 4.2, [570, 270], [580, 225], 'Tackle wraps to MIKE')
    engage(s, 'Y', 'N', .85, 4.2, [630, 300], [650, 255], 'Seal the overhang')
    track(s, 'EL', [[325, 365], [390, 400]], .35, 3.5)
  } else {
    engage(s, 'LT', 'EL', .65, 4.2, [330, 330], [320, 295], 'Backside hinge')
    frames(s, 'LG', [{ at: .35, pos: [400, 355] }, { at: .75, pos: [405, 410] }, { at: 1.5, pos: [565, 400] }, { at: 2.1, pos: [570, 285] }])
    engage(s, 'LG', 'M', 2.1, 4.2, [570, 270], [580, 225], 'Guard leads through')
    track(s, 'N', [[350, 300]], .35, 2.5)
  }
  track(s, 'M', [[550, 285]], .35, 1.6); track(s, 'W', [[450, 285], [520, 310]], .35, 3.1)
  frames(s, 'RB', [{ at: .35, pos: [450, 485] }, { at: .75, pos: [counter ? 400 : 480, 450] }, { at: 1.4, pos: [490, 435] }, { at: 2.3, pos: [580, 355] }, { at: 3.9, pos: [610, 205] }])
  mark(s, 578, 220, 55, 180, 'Follow the puller', 1.9)
  read(s, 'RB', 'M', 'Lead block sets the lane', 1, 3.1); finish(s, 'QB', 'RB', .65, .85, 'handoff')
}

function chip(s: PlayScene) {
  protectedPocket(s); routesAround(s); cover(s, 'three')
  s.contacts = s.contacts.filter(c => c.b !== 'ER')
  place(s, 'Y', 615, 355, 'TE'); place(s, 'ER', 585, 318, '7')
  place(s, 'SS', 680, 240, 'OLB')
  frames(s, 'Y', [{ at: .35, pos: [615, 355] }, { at: .8, pos: [610, 365] }, { at: 1.2, pos: [620, 370] }, { at: 1.8, pos: [700, 330] }, { at: 3.4, pos: [825, 315] }])
  frames(s, 'ER', [{ at: .35, pos: [585, 318] }, { at: .8, pos: [610, 337] }, { at: 1.2, pos: [620, 342] }, { at: 3.8, pos: [610, 395] }])
  engage(s, 'Y', 'ER', .8, 1.2, [610, 351], [620, 356], 'Chip slows the rush')
  engage(s, 'RT', 'ER', 1.2, 4.2, [620, 356], [630, 395], 'OT takes over')
  track(s, 'SS', [[640, 225]], .35, 1.3)
  frames(s, 'SS', [{ at: .35, pos: [680, 240] }, { at: 1.5, pos: [650, 210] }, { at: 2.3, pos: [720, 255] }, { at: 3.8, pos: [780, 285] }])
  track(s, 'RB', [[570, 445]], .35, 1.4)
  mark(s, 755, 300, 95, 55, 'Delayed flat', 1.5); read(s, 'QB', 'SS', 'OLB turns toward late release', 1.2, 3.3)
  finish(s, 'QB', 'Y', 2.6, 3.3)
  notes(s, ['Y is attached beside a 7-tech edge. The tackle needs a moment to set.', 'Y releases into the edge’s outside shoulder while RT gains depth.', 'RT takes over the slowed rusher; Y releases into the flat and makes the OLB turn.', 'The QB hits the delayed outlet after the chip buys a clean pocket.'])
  s.beats.push({ at: .8, text: 'TE chips the DE to slow his rush, giving the OT time to set the edge.' }, { at: 1.2, text: 'The tackle takes over the edge; the TE lets go and releases into the flat.' })
  s.beats.sort((a, b) => a.at - b.at)
}

function playAction(s: PlayScene) {
  protectedPocket(s); cover(s, 'three')
  frames(s, 'QB', [{ at: .35, pos: [450, 400] }, { at: .85, pos: [450, 435] }, { at: 1.5, pos: [445, 485] }])
  track(s, 'RB', [[460, 435], [525, 355], [565, 310]], .35, 2.4)
  track(s, 'Y', [[615, 235], [330, 165]], .35, 3.4)
  track(s, 'X', [[115, 80]], .35, 3.3); track(s, 'H', [[255, 305], [110, 310]], .35, 2.6)
  frames(s, 'M', [{ at: .35, pos: [465, 230] }, { at: 1.15, pos: [485, 305] }, { at: 3.5, pos: [500, 245] }])
  frames(s, 'W', [{ at: .35, pos: [365, 245] }, { at: 1.15, pos: [405, 310] }, { at: 3.5, pos: [385, 250] }])
  mark(s, 285, 135, 230, 80, 'Behind the run step', 1.4); read(s, 'QB', 'M', 'Run step opens the cross', .6, 2.8)
  finish(s, 'QB', 'Y', 2.6, 3.4)
}

function blockingLesson(id: string) {
  const s = blank(id)
  switch (id) {
    case 'inside-zone':
      insideRun(s); read(s, 'RB', 'TR', 'Press the front; read the crease', .65, 2.7)
      notes(s, ['Inside zone: the back reads the front while adjacent blockers share down linemen.', 'The combinations secure the tackles before anyone leaves for a linebacker.', 'LG leaves the secured shade. The tackles wait for their partners before climbing.', 'The back presses, then hits the A-gap behind those second-level seals.'])
      s.beats.push({ at: 1.45, text: 'H takes over the left edge. LT and RT leave their first blocks and climb toward the linebackers.' }, { at: 1.8, text: 'The interior blocks widen the A-gap crease. RB presses it while the tackles close on the linebackers.' }, { at: 2.05, text: 'LT walls off WILL and RT seals MIKE. RB now has a lane through both levels.' })
      s.beats.sort((a,b)=>a.at-b.at)
      break
    case 'outside-zone':
      outsideRun(s)
      notes(s, ['The line and back threaten the right edge; defenders must keep outside leverage.', 'RT stretches the end while the interior reaches toward the play.', 'Y closes on the end so RT can leave for the linebacker.', 'The back makes one cut upfield between the tackle’s seal and the TE’s edge block.'])
      s.beats.push({ at: 1.5, text: 'Y takes over the widened end. RT releases from the edge and climbs toward MIKE.' }, { at: 2, text: 'RT meets MIKE at the second level. The lane opens inside Y’s edge block for the back’s cut.' })
      s.beats.sort((a,b)=>a.at-b.at)
      break
    case 'power':
      powerRun(s)
      notes(s, ['Power creates a wall inside, a kick-out outside and a lead blocker in between.', 'Y kicks the end out as LG pulls behind the down blocks.', 'The guard turns up through the gap and meets the MIKE before the back arrives.', 'RB follows the lead block into the gap between the inside wall and kicked-out end.'])
      break
    case 'counter':
      powerRun(s, true)
      notes(s, ['Counter sends the back left first, but the guard and tackle will pull right.', 'The back’s jab delays pursuit while LG crosses behind the line.', 'LG kicks the end out. LT follows through the hole to the linebacker.', 'RB returns right behind both blocks; the first step was the disguise, not the run lane.'])
      break
    case 'trap':
      runSupport(s)
      engage(s, 'LT', 'EL', .7, 4.2, [325, 330], [315, 295], 'Backside cutoff')
      engage(s, 'C', 'TL', .65, 4.2, [415, 330], [400, 290], 'Seal inside')
      engage(s, 'RT', 'ER', .65, 4.2, [595, 330], [620, 285], 'Keep edge out')
      track(s, 'TR', [[500, 380]], .35, 1.35)
      frames(s, 'LG', [{ at: .35, pos: [400, 355] }, { at: .8, pos: [405, 410] }, { at: 1.35, pos: [510, 395] }])
      engage(s, 'LG', 'TR', 1.35, 4.2, [510, 380], [550, 365], 'Trap the free 3-tech')
      engage(s, 'RG', 'M', 1.55, 4.2, [475, 280], [485, 230], 'Release to MIKE')
      track(s, 'W', [[400, 300]], .35, 2.4); track(s, 'Y', [[640, 285]], .35, 2.3)
      frames(s, 'RB', [{ at: .35, pos: [450, 485] }, { at: .8, pos: [460, 445] }, { at: 1.7, pos: [470, 405] }, { at: 3.8, pos: [455, 225] }])
      mark(s, 440, 225, 40, 195, 'Inside the trap', 1.4); read(s, 'RB', 'TR', 'Free tackle is the bait', .4, 1.5); finish(s, 'QB', 'RB', .65, .85, 'handoff')
      notes(s, ['The right guard deliberately releases past the 3-tech. LG will trap him.', 'The tackle penetrates while the guard loops behind the line.', 'LG arrives from the side and stops the penetration before RB reaches it.', 'The back runs inside the trapped tackle and behind the guard’s block on the MIKE.'])
      break
    case 'duo':
      insideRun(s, true); read(s, 'RB', 'M', 'MIKE fills inside → bend out', .7, 2.7)
      notes(s, ['Duo uses downhill doubles without a pulling guard; RB keys the MIKE.', 'The doubles move both tackles as the MIKE steps into the inside lane.', 'The back stays patient while the right tackle comes off onto that linebacker.', 'RB bends outside the MIKE’s fit into the B-gap created by the double-team.'])
      break
    case 'chip': chip(s); break
    case 'slide':
      protectedPocket(s); routesAround(s); cover(s, 'man')
      engage(s, 'C', 'M', 1.05, 4.2, [435, 360], [425, 390], 'Close the left A-gap')
      track(s, 'M', [[425, 315]], .35, .85)
      engage(s, 'RB', 'SS', 1.35, 4.2, [640, 420], [650, 435], 'Back owns the opposite edge')
      place(s, 'SS', 670, 315, 'OLB'); track(s, 'RB', [[525, 430], [640, 434]], .35, 1.35)
      track(s, 'Y', [[615, 250], [700, 235]])
      mark(s, 408, 310, 35, 115, 'Left A-gap protected', .6); read(s, 'QB', 'SS', 'Back takes opposite pressure'); finish(s, 'QB', 'Y')
      notes(s, ['The line slides left. RB is responsible for the extra threat on the right.', 'The center closes the A-gap as the MIKE attacks it.', 'The back meets the opposite edge blitzer before he reaches the launch point.', 'The QB has time for Y’s break because the slide and backside pickup cover both threats.'])
      break
    case 'man-protection':
      protectedPocket(s); routesAround(s); cover(s, 'man')
      s.contacts = s.contacts.filter(c => !['TR', 'ER'].includes(c.b))
      track(s, 'TR', [[550, 345], [580, 380]], .35, 1.4)
      track(s, 'ER', [[560, 290], [490, 320], [490, 395]], .6, 2.2)
      engage(s, 'RT', 'TR', 1.35, 4.2, [580, 375], [595, 395], 'Tackle takes penetrator')
      engage(s, 'RG', 'ER', 2, 4.2, [490, 390], [490, 410], 'Guard catches looper')
      engage(s, 'RB', 'M', 1.1, 4.2, [420, 390], [415, 420], 'Back scans inside')
      mark(s, 465, 325, 145, 105, 'Pass off the twist', 1); read(s, 'C', 'M', 'Set the protection point'); finish(s, 'QB', 'X')
      notes(s, ['Five linemen and a scanning back account for the rush; the defense runs a T/E game.', 'The tackle penetrates outward, trying to drag RG away from the looping end.', 'RT takes the penetrator; RG stays square and catches the end in the vacated lane.', 'The exchange keeps the pocket intact. Chasing the original man would open the loop.'])
      break
    case 'play-action':
      playAction(s)
      notes(s, ['The back and line show run action, with Y crossing behind the linebackers.', 'QB and RB sell the mesh point; the MIKE and WILL step downhill.', 'The quarterback pulls back into protection as Y runs behind those run steps.', 'The cross gets the throw before the linebackers recover into the window.'])
      break
  }
  return s
}

function doubleTight(s: PlayScene) {
  protectedPocket(s); routesAround(s); cover(s, 'quarters')
  place(s, 'X', 115, 385); place(s, 'H', 290, 355, 'TE'); place(s, 'Y', 610, 355, 'TE')
  place(s, 'N', 650, 265, 'SAM'); place(s, 'SS', 635, 165, 'S')
  track(s, 'H', [[285, 290], [200, 265]], .35, 2.7)
  track(s, 'Y', [[615, 275], [630, 140]], .35, 3.4)
  frames(s, 'SS', [{ at: 0, pos: [635, 165] }, { at: .35, pos: [635, 165] }, { at: 1.3, pos: [650, 295] }, { at: 3.7, pos: [665, 230] }])
  frames(s, 'N', [{ at: .35, pos: [650, 265] }, { at: 1.2, pos: [620, 300] }, { at: 2.3, pos: [650, 235] }, { at: 3.7, pos: [650, 175] }])
  track(s, 'RB', [[455, 425], [485, 380]], .35, 1.5)
  mark(s, 625, 285, 55, 100, 'Added D-gap fit', .65, 1.7)
  mark(s, 590, 130, 100, 110, 'TE / linebacker matchup', 1.8)
  read(s, 'QB', 'SS', 'Safety inserts for the extra gap', .45, 1.7)
  read(s, 'QB', 'N', 'SAM turns late with the TE', 1.7, 3.3)
  finish(s, 'QB', 'Y', 2.7, 3.4)
}

function leadRun(s: PlayScene) {
  runSupport(s)
  engage(s, 'LT', 'EL', .7, 4.2, [325, 330], [310, 295], 'Backside seal')
  engage(s, 'LG', 'TL', .7, 4.2, [410, 330], [395, 285], 'Move the shade')
  engage(s, 'C', 'TL', .7, 1.5, [410, 330], [405, 310], 'Help before climbing')
  engage(s, 'RG', 'TR', .7, 4.2, [520, 330], [540, 290], 'Widen the 3-tech')
  engage(s, 'RT', 'ER', .7, 4.2, [585, 330], [610, 285], 'Widen the end')
  track(s, 'Y', [[625, 300]], .35, 1.6)
  frames(s, 'H', [{ at: .35, pos: [450, 445] }, { at: 1.15, pos: [470, 360] }, { at: 1.7, pos: [480, 285] }])
  engage(s, 'H', 'M', 1.7, 4.2, [480, 270], [505, 225], 'Fullback leads on MIKE')
  track(s, 'W', [[405, 280], [425, 320]], .35, 2.9)
  frames(s, 'RB', [{ at: .35, pos: [450, 505] }, { at: .85, pos: [450, 450] }, { at: 1.65, pos: [475, 390] }, { at: 3.8, pos: [475, 210] }])
  mark(s, 453, 205, 40, 190, 'Follow the lead block', 1.7)
  read(s, 'RB', 'M', 'Fullback removes the extra fitter', .8, 2.7)
  finish(s, 'QB', 'RB', .65, .85, 'handoff')
}

function emptyPass(s: PlayScene) {
  protectedPocket(s); routesAround(s)
  place(s, 'RB', 645, 405, 'WR'); place(s, 'Y', 725, 385, 'WR'); place(s, 'Z', 815, 355, 'WR')
  track(s, 'RB', [[650, 315], [565, 275]], .35, 2.3)
  track(s, 'Y', [[725, 250], [835, 200]], .35, 3.3)
  track(s, 'Z', [[815, 95]], .35, 3.4)
  track(s, 'H', [[235, 315], [325, 260]], .35, 2.2)
  cover(s, 'man')
  place(s, 'W', 620, 285); man(s, 'W', 'RB', [25, -5])
  track(s, 'M', [[425, 320], [440, 420]], .35, 2.5)
  mark(s, 540, 245, 95, 70, 'Quick inside answer', 1.2)
  read(s, 'QB', 'M', 'No back: ball beats the extra rush', .35, 2.1)
  finish(s, 'QB', 'RB', 1.5, 2.2)
}

function personnelLesson(id: string) {
  const s = blank(id)
  switch (id) {
    case 'personnel-11':
      protectedPocket(s); routesAround(s); cover(s, 'three')
      place(s, 'N', 275, 270, 'NB'); track(s, 'H', [[255, 285], [130, 290]], .35, 2.6)
      track(s, 'N', [[185, 290]], .35, 1.6); track(s, 'Y', [[615, 250], [550, 175]])
      track(s, 'M', [[610, 215]], .35, 2.5)
      mark(s, 495, 145, 110, 80, 'TE inside the linebacker', 1.6); read(s, 'QB', 'M', 'Nickel widens; MIKE has Y'); finish(s, 'QB', 'Y')
      notes(s, ['One back, one TE, three WRs: the nickel aligns over the slot instead of adding a box defender.', 'H widens the nickel while Y releases from the attached surface.', 'Y breaks inside the MIKE after the slot has stretched the underneath coverage.', 'The QB uses the TE matchup created by the three-receiver spacing.'])
      break
    case 'personnel-12':
      doubleTight(s)
      notes(s, ['Two attached TEs add run gaps on both edges. In this look, the defense answers with a safety in the fit.', 'The strong safety inserts toward the D-gap as RB sells the run.', 'Y releases past the SAM, who took a run step. The safety is too low to help over him.', 'The QB throws to Y against the turning linebacker. The extra gap helped create that matchup.'])
      break
    case 'personnel-21':
      leadRun(s)
      notes(s, ['Two backs and one TE give the offense a fullback to meet the free box linebacker.', 'The line opens the right A-gap; the fullback leads ahead of the runner.', 'The fullback meets the MIKE so RB does not have to beat him in the hole.', 'RB runs off the fullback’s inside shoulder through the newly sealed lane.'])
      break
    case 'personnel-22':
      playAction(s); place(s, 'N', 650, 275, 'SAM'); track(s, 'SS', [[625, 290]], .35, 1.6)
      track(s, 'H', [[475, 390], [610, 335]], .35, 2.3)
      mark(s, 560, 145, 140, 95, 'Behind the heavy box', 1.5)
      notes(s, ['Two backs and two TEs add gaps, bringing the safety down toward an eight-man box.', 'The fullback and runner sell the lead run while Y releases past the edge.', 'The safety and linebackers step toward the run surface; Y crosses behind them.', 'The QB throws into the space the heavy box left behind. The fake still needs sound protection.'])
      break
    case 'personnel-00':
      emptyPass(s)
      notes(s, ['Five WRs spread the defense. There is no back to pick up an extra inside blitzer.', 'The MIKE rushes beyond the five-man protection while the right slot breaks inside.', 'The slot wins leverage against his matchup before the rush can reach the QB.', 'The quick throw beats the extra rusher. Holding the ball would waste the spacing advantage.'])
      break
    case 'personnel-10':
      protectedPocket(s); routesAround(s); cover(s, 'two')
      track(s, 'H', [[265, 290], [390, 245]], .35, 3.2); track(s, 'Y', [[635, 285], [535, 235]], .35, 3.2)
      engage(s, 'RB', 'M', 1.4, 4.2, [515, 410], [530, 430], 'Back adds the sixth protector')
      track(s, 'W', [[320, 235]], .35, 1.8)
      mark(s, 445, 210, 110, 70, 'Inside spacing', 1.5); read(s, 'QB', 'W', 'Four WRs stretch the underneath'); finish(s, 'QB', 'Y')
      notes(s, ['One back and four WRs pull the underneath defense across the field.', 'The slots threaten both inside lanes; RB stays in to scan for pressure.', 'The back meets the extra rusher as the WILL widens toward the left slot.', 'The QB hits the right slot inside. Keeping RB in traded a route for time.'])
      break
  }
  return s
}

function readLesson(id: string) {
  const s = blank(id); protectedPocket(s); routesAround(s); cover(s, 'three')
  switch (id) {
    case 'safety-count':
      place(s, 'FS', 330, 120); place(s, 'SS', 620, 120)
      track(s, 'FS', [[450, 65]], .35, 1.7); track(s, 'SS', [[715, 280]], .35, 1.7)
      track(s, 'Y', [[610, 230], [560, 90]], .35, 3.5)
      mark(s, 530, 110, 85, 110, 'Seam after rotation', 1.6); read(s, 'QB', 'SS', 'Two high rotates to one', .35, 1.7); read(s, 'QB', 'FS', 'Confirm the post safety', 1.7, 3)
      finish(s, 'QB', 'Y', 2.6, 3.3)
      notes(s, ['Two safeties start deep. That picture alone does not identify the final coverage.', 'The strong safety rolls into the flat while FS moves to the deep middle.', 'The QB confirms three deep defenders and finds Y above the hook defender.', 'The seam throw follows the rotation. Throwing solely from the starting shell risks the wrong read.'])
      break
    case 'hot-read':
      place(s, 'N', 290, 325); track(s, 'N', [[340, 380], [440, 435]], .35, 2.5)
      track(s, 'H', [[255, 310], [310, 270]], .35, 2.2)
      mark(s, 245, 255, 120, 70, 'Replace the blitzer', .8); read(s, 'QB', 'N', 'Nickel rush confirmed', .35, 1.7); finish(s, 'QB', 'H', 1.15, 1.8)
      notes(s, ['The nickel threatens outside the protection. H has the quick replacement route.', 'The nickel actually rushes; the QB checks for a defender dropping into his lane.', 'H turns into the space behind that rush while the ball leaves early.', 'The hot throw reaches H before the unblocked nickel reaches the launch point.'])
      break
    case 'leverage':
      place(s, 'CBL', 145, 310); track(s, 'X', [[100, 305], [95, 215], [50, 175]], .35, 3.4)
      man(s, 'CBL', 'X', [28, -8]); track(s, 'FS', [[490, 80]], .35, 2.6)
      mark(s, 40, 145, 90, 100, 'Away from inside help', 1.3); read(s, 'QB', 'CBL', 'Inside leverage → throw outside'); finish(s, 'QB', 'X')
      notes(s, ['The corner protects the receiver’s inside shoulder; the post safety also sits inside.', 'X releases away from that leverage instead of running straight into help.', 'The corner turns and trails from inside as X breaks toward the sideline.', 'The QB places the ball outside. The same throw is unsafe against an outside-leverage corner.'])
      break
    case 'apex':
      place(s, 'N', 300, 270); track(s, 'H', [[255, 305], [120, 305]], .35, 2.5)
      track(s, 'N', [[370, 330]], .35, 1.4); track(s, 'RB', [[435, 435], [440, 345]], .35, 2)
      mark(s, 95, 275, 135, 65, 'Flat left by the apex', 1); read(s, 'QB', 'N', 'Apex fits inside → throw flat', .35, 2.2)
      finish(s, 'QB', 'H', 1.35, 2.1)
      notes(s, ['The apex sits between H and the run box. The call pairs an inside run look with a flat answer.', 'RB threatens inside. The apex commits toward the run fit.', 'The QB keeps the ball out of the mesh and throws where that defender left.', 'H catches in the flat. This example uses pass protection so linemen stay out of the throw.'])
      break
    case 'conflict-linebacker':
      track(s, 'H', [[255, 290], [705, 290]]); track(s, 'Y', [[615, 180], [290, 180]])
      track(s, 'M', [[475, 190]], .35, 1.8)
      mark(s, 490, 260, 210, 65, 'Under the deep drop', 1.3); read(s, 'QB', 'M', 'MIKE gains depth → throw below'); finish(s, 'QB', 'H')
      notes(s, ['Y crosses high and H crosses low, putting the MIKE between two route depths.', 'The linebacker gains depth to protect the high crosser.', 'H runs underneath that drop while the QB confirms the next hook defender stays inside.', 'The QB takes the shallow rather than forcing the throw over the MIKE.'])
      break
    case 'press-check':
      place(s, 'X', 135, 355); place(s, 'H', 155, 405); place(s, 'CBL', 135, 315); place(s, 'N', 185, 315)
      track(s, 'X', [[130, 280], [65, 200]], .35, 3.1); track(s, 'H', [[155, 320], [310, 215]], .35, 3.1)
      track(s, 'CBL', [[110, 275], [80, 180]], .5, 3.4); track(s, 'N', [[210, 285], [265, 235]], .5, 3.4)
      mark(s, 265, 195, 100, 70, 'Free inside release', 1.2); read(s, 'QB', 'N', 'Watch the switch communicate'); finish(s, 'QB', 'H')
      notes(s, ['The stack puts H off the line behind X so both defenders cannot press their man cleanly.', 'X releases outside and H comes inside from behind the stack.', 'The defense switches releases, but the nickel is late turning inside to H.', 'H gets the timing throw. The stack created a release, not a legal license to block the corner.'])
      break
    case 'zero-beater':
      cover(s, 'man'); place(s, 'FS', 430, 275); place(s, 'SS', 625, 305)
      track(s, 'FS', [[430, 340], [450, 435]], .35, 2.3); track(s, 'M', [[485, 350], [470, 450]], .35, 2.5)
      man(s, 'SS', 'Y', [20, -15]); track(s, 'X', [[115, 310], [290, 240]], .35, 2.1); man(s, 'CBL', 'X', [-25, -5])
      mark(s, 215, 215, 120, 65, 'Quick slant lane', .8); read(s, 'QB', 'FS', 'No deep helper; extra rush', .35, 1.6); finish(s, 'QB', 'X', 1, 1.7)
      notes(s, ['Cover 0 has no deep safety. Six defenders can rush while five match the receivers.', 'The inside pressure comes; X wins his first step across the corner’s face.', 'The QB releases before those extra rushers reach the pocket.', 'The slant catches in stride. There was no time to wait for a deep route.'])
      break
    case 'box-count':
      place(s, 'SS', 650, 195); track(s, 'SS', [[585, 295]], .35, 1.5)
      track(s, 'Z', [[790, 295], [705, 250]], .35, 2.5); track(s, 'CBR', [[775, 195]], .35, 1.8)
      mark(s, 565, 255, 60, 115, 'Extra box fitter', .5, 1.7); mark(s, 680, 230, 120, 65, 'Perimeter answer', 1.4)
      read(s, 'QB', 'SS', 'Safety adds a run fitter', .35, 1.8); finish(s, 'QB', 'Z', 1.75, 2.5)
      notes(s, ['A light box can change when a safety walks down. Count who can join the fit.', 'SS inserts on the right, adding a defender beyond the basic blocking count.', 'The QB takes the built-in perimeter throw against the corner’s cushion.', 'Z catches outside the loaded box. Counting only the original six would miss the added safety.'])
      break
  }
  return s
}

function roleLesson(id: string) {
  if (id === 'fullback') {
    const s = blank(id); leadRun(s)
    notes(s, ['The fullback is behind the QB and ahead of RB, with the MIKE free in the box.', 'He leads through the right A-gap while the line controls the down linemen.', 'The fullback meets the linebacker before RB reaches the hole.', 'RB follows the leverage of that lead block rather than running into the MIKE.'])
    return s
  }
  const s = blank(id); protectedPocket(s); routesAround(s); cover(s, 'man')
  switch (id) {
    case 'quarterback':
      track(s, 'X', [[115, 260], [310, 190]]); track(s, 'H', [[255, 300], [90, 310]])
      track(s, 'M', [[335, 205]], .35, 1.8); track(s, 'N', [[235, 225]], .35, 1.8)
      mark(s, 70, 280, 120, 70, 'Second answer', 1.5); read(s, 'QB', 'M', 'First window closes', .4, 1.7); read(s, 'QB', 'N', 'Flat stays open', 1.7, 3)
      finish(s, 'QB', 'H', 2.2, 2.9)
      notes(s, ['The QB ties his drop to the slant-flat combination instead of staring at one receiver.', 'His first read is the hook defender sitting under X’s inside break.', 'That defender closes the slant. The QB resets his feet to the flat.', 'H gets the ball outside after the QB moves to the available answer.'])
      break
    case 'running-back':
      s.contacts = s.contacts.filter(c => c.b !== 'ER')
      place(s, 'RB', 615, 445)
      engage(s, 'RB', 'ER', .95, 1.3, [610, 385], [625, 390], 'Back chips before release')
      engage(s, 'RT', 'ER', 1.3, 4.2, [625, 390], [630, 420], 'Tackle takes over')
      frames(s, 'RB', [{ at: .35, pos: [615, 445] }, { at: .95, pos: [610, 399] }, { at: 1.3, pos: [625, 404] }, { at: 3.3, pos: [810, 335] }])
      frames(s, 'W', [{ at: .35, pos: [365, 245] }, { at: 1.4, pos: [485, 310] }, { at: 3.7, pos: [750, 300] }])
      mark(s, 760, 310, 90, 60, 'Check-release outlet', 1.6); read(s, 'QB', 'W', 'Back releases after protection'); finish(s, 'QB', 'RB')
      notes(s, ['The back checks the right edge before releasing. His route depends on the protection job.', 'RB meets the edge rusher and gives the tackle time to get outside.', 'The tackle takes over; RB lets go and releases to the flat with a linebacker trailing.', 'The back becomes the checkdown after doing his protection work.'])
      break
    case 'tight-end':
      place(s, 'N', 650, 270, 'SAM'); place(s, 'SS', 620, 160)
      track(s, 'Y', [[630, 265], [720, 180]], .35, 3.4); man(s, 'N', 'Y', [-25, 16]); track(s, 'SS', [[555, 125]], .35, 2.6)
      mark(s, 645, 310, 45, 95, 'Added D-gap', .35, 1.3); mark(s, 665, 150, 115, 85, 'TE against SAM', 1.7)
      read(s, 'QB', 'N', 'Run surface becomes a route'); finish(s, 'QB', 'Y')
      notes(s, ['An attached TE adds a gap outside the tackle, drawing the SAM toward that surface.', 'Y releases vertically while RB sells a run path inside him.', 'The SAM has to turn from his run leverage and carry Y into space.', 'Y gets the throw outside the linebacker. The defense must handle both the extra gap and the route.'])
      break
    case 'x-receiver':
      place(s, 'CBL', 120, 322); track(s, 'X', [[95, 325], [110, 270], [255, 165]], .35, 3.4)
      frames(s, 'CBL', [{ at: .35, pos: [120, 322] }, { at: .65, pos: [112, 310] }, { at: 1.25, pos: [90, 275] }, { at: 3.7, pos: [225, 175] }])
      mark(s, 195, 135, 120, 90, 'Release wins inside', 1.4); read(s, 'QB', 'CBL', 'On-line X must beat the jam'); finish(s, 'QB', 'X')
      notes(s, ['X is on the line, so the press corner can challenge his release immediately.', 'X threatens outside without running straight through the defender.', 'The corner opens outside; X takes the inside lane and accelerates.', 'The QB throws across the corner’s trailing shoulder once X clears the jam.'])
      break
    case 'z-receiver':
      frames(s, 'Z', [{ at: 0, pos: [790, 385] }, { at: .3, pos: [690, 405] }, { at: 1.05, pos: [615, 315] }, { at: 3.4, pos: [420, 235] }])
      frames(s, 'CBR', [{ at: 0, pos: [790, 280] }, { at: .3, pos: [690, 285] }, { at: 1.2, pos: [635, 290] }, { at: 3.7, pos: [460, 235] }])
      track(s, 'Y', [[615, 230], [650, 95]])
      mark(s, 385, 210, 130, 65, 'Off-line motion release', 1.5); read(s, 'QB', 'CBR', 'Corner travels with Z', 0, 1.5); finish(s, 'QB', 'Z')
      notes(s, ['Z starts off the line and motions inward. The corner travels with him before the snap.', 'Z turns upfield from motion while Y clears the next lane.', 'The traveling corner has to turn from a lateral shuffle and chase Z’s inside break.', 'Z gets the catch from a running start; the travel was a man clue, confirmed by the chase.'])
      break
    case 'slot':
      place(s, 'N', 280, 295); track(s, 'H', [[255, 275], [155, 255]], .35, 3.4)
      track(s, 'N', [[285, 255], [225, 250]], .35, 3.5)
      mark(s, 125, 225, 110, 65, 'Slot breaks away', 1.4); read(s, 'QB', 'N', 'Nickel protects the inside'); finish(s, 'QB', 'H')
      notes(s, ['The slot sits between X and the tackle, with a nickel shading his inside shoulder.', 'H stems at the nickel while X takes the outside corner deep.', 'The nickel protects the middle, so H breaks away into the outside window.', 'The QB hits the option break before the nickel can turn back out.'])
      break
  }
  return s
}

function optionRun(s: PlayScene, type: 'pistol' | 'wishbone' | 'flexbone') {
  runSupport(s)
  engage(s, 'LT', 'EL', .65, 4.2, [325, 330], [315, 295], 'Backside seal')
  engage(s, 'LG', 'TL', .65, 4.2, [410, 330], [400, 290], 'Control the shade')
  engage(s, 'RG', 'TR', .65, 4.2, [510, 330], [520, 295], 'Inside run block')
  engage(s, 'RT', 'M', 1.55, 4.2, [520, 260], [545, 235], 'Leave the end; climb')
  track(s, 'ER', [[555, 360], [530, 390]], .35, 1.8)
  frames(s, 'QB', [{ at: .35, pos: [450, type === 'pistol' ? 430 : 392] }, { at: .85, pos: [455, 450] }, { at: 1.6, pos: [580, 430] }, { at: 3.8, pos: [690, 265] }])
  track(s, 'RB', [[465, 430], [485, 335]], .35, 2.3)
  if (type === 'wishbone') {
    // Z is a halfback here, so he stays in the pitch relationship instead of
    // inheriting the wide receiver's perimeter stalk block.
    s.contacts = s.contacts.filter(c => c.a !== 'Z')
    track(s, 'H', [[465, 390], [475, 300]], .35, 2.7)
    track(s, 'Z', [[640, 475], [745, 365]], .35, 3.8)
    track(s, 'RB', [[435, 460], [570, 400]], .35, 3.1)
    track(s, 'CBR', [[750, 285], [720, 310]], .35, 3.8)
  }
  if (type === 'flexbone') {
    frames(s, 'H', [{ at: 0, pos: [305, 390] }, { at: .35, pos: [370, 445] }, { at: 1.5, pos: [570, 465] }, { at: 3.8, pos: [755, 365] }])
    engage(s, 'Y', 'N', 1.45, 4.2, [670, 300], [700, 275], 'Slot seals the force player')
  } else engage(s, 'Y', 'N', 1.5, 4.2, [670, 305], [700, 275], 'TE seals support')
  track(s, 'W', [[430, 295], [485, 325]], .35, 3.3)
  mark(s, 625, 255, 95, 165, 'Keep outside the crash', 1.2)
  read(s, 'QB', 'ER', 'End crashes → QB keeps', .35, 2.2)
  // Ball stays with the QB: no fake handoff is recorded as a completion.
  finish(s, 'QB', 'QB', .8, .85, 'handoff')
}

function formationLesson(id: string) {
  const s = blank(id)
  switch (id) {
    case 'formation-i':
      leadRun(s)
      notes(s, ['The I puts the fullback and tailback in one downhill track behind the QB.', 'The fullback hits the lead gap while the tailback takes the handoff behind him.', 'The lead blocker meets the extra linebacker before RB reaches the line.', 'RB follows that leverage; the stacked backfield created a direct lead-block angle.'])
      break
    case 'formation-singleback':
      outsideRun(s)
      notes(s, ['A single back has no fullback ahead of him; attached TEs widen both run surfaces.', 'The line stretches right, with RT and Y sharing the end.', 'Y takes the end and RT climbs to the linebacker; RB presses wide while those blocks form.', 'The back cuts through their inside crease rather than waiting for a fullback to lead.'])
      break
    case 'formation-trips':
      protectedPocket(s); cover(s, 'three')
      track(s, 'H', [[645, 250], [535, 165]]); track(s, 'Y', [[720, 285], [840, 285]]); track(s, 'Z', [[800, 85]])
      track(s, 'SS', [[795, 280]], .35, 1.9); track(s, 'M', [[610, 245]], .35, 2)
      mark(s, 520, 140, 125, 80, 'Inside of the trips push', 1.6); read(s, 'QB', 'M', 'Three releases pull coverage right'); finish(s, 'QB', 'H')
      notes(s, ['Trips puts three receivers on the right, forcing the underneath defense to adjust its width.', 'Z carries the corner, Y widens the flat defender and H stems inside.', 'The MIKE pushes right toward the distribution; H breaks behind his inside shoulder.', 'H gets the throw into the space created by three distinct release lanes.'])
      break
    case 'formation-empty':
      emptyPass(s)
      notes(s, ['Empty removes the backfield protector and makes all five eligible players coverage threats.', 'The defense spreads its matchups, then sends the MIKE through the unprotected interior.', 'The inside receiver breaks away before that free rusher reaches the QB.', 'The quick throw beats the pressure; the empty spacing comes with an earlier decision.'])
      break
    case 'formation-pistol':
      optionRun(s, 'pistol')
      notes(s, ['Pistol puts RB directly behind a shallow shotgun QB, hiding the run direction from the back’s offset.', 'The line blocks inside but leaves the right end for the QB to read.', 'The end crashes toward RB. The QB pulls out of the mesh and keeps outside.', 'The QB gains the edge behind the TE’s support block because the end committed inside.'])
      break
    case 'formation-wishbone':
      optionRun(s, 'wishbone')
      notes(s, ['The fullback and two halfbacks make a wishbone: inside action plus an outside pitch relationship.', 'The fullback threatens the dive while the right end is deliberately left unblocked.', 'The end squeezes inside. The QB keeps; the right halfback stays wider as a pitch option.', 'The support blocker seals the force player, so the QB turns up instead of pitching.'])
      break
    case 'formation-flexbone':
      optionRun(s, 'flexbone')
      notes(s, ['Two slots flank the tackles. H starts short motion to become the outside option.', 'The fullback threatens inside while RT climbs past the unblocked end.', 'The end dives toward the fullback. QB keeps, with H maintaining width for a possible pitch.', 'Y seals the next outside defender, letting the QB turn up while H remains available.'])
      break
  }
  return s
}

function gapLesson(id: string) {
  const s = blank('personnel-12'); s.id = id; s.tracks = []
  runSupport(s)
  const gap = id.slice(-1).toUpperCase()
  const x = ({ A: 475, B: 525, C: 580, D: 660 } as Record<string, number>)[gap]
  const assignments: Record<string, [string, string, Point, Point][]> = {
    A: [['C', 'TL', [430, 330], [415, 295]], ['RG', 'TR', [510, 330], [530, 285]], ['RT', 'ER', [595, 330], [620, 295]], ['Y', 'M', [585, 265], [600, 225]]],
    B: [['C', 'TL', [420, 330], [405, 295]], ['RG', 'TR', [495, 330], [480, 290]], ['RT', 'ER', [590, 330], [615, 285]], ['Y', 'M', [555, 270], [580, 225]]],
    C: [['C', 'TL', [420, 330], [410, 285]], ['RG', 'TR', [505, 330], [490, 290]], ['RT', 'M', [535, 275], [520, 225]], ['Y', 'ER', [610, 330], [635, 285]]],
    D: [['C', 'TL', [420, 330], [410, 285]], ['RG', 'TR', [500, 330], [490, 290]], ['RT', 'M', [545, 275], [550, 230]], ['Y', 'ER', [610, 330], [595, 295]]],
  }
  engage(s, 'LT', 'EL', .7, 4.2, [325, 330], [310, 290], 'Backside seal')
  for (const [o, d, p, end] of assignments[gap]) engage(s, o, d, o === 'RT' && ['C', 'D'].includes(gap) ? 1.5 : .75, 4.2, p, end, `${gap}-gap leverage`)
  track(s, 'W', [[400, 290], [450, 325]], .35, 3.3)
  track(s, 'LG', [[400, 310], [390, 260]], .35, 2.3)
  track(s, 'H', [[285, 310], [245, 280]], .35, 2.4)
  if (gap === 'D') { track(s, 'SS', [[625, 305]], .35, 2.4); read(s, 'RB', 'SS', 'Support fits inside the bounce', .65, 3) }
  else read(s, 'RB', gap === 'A' ? 'TL' : gap === 'B' ? 'TR' : 'ER', 'Wait for the seal', .65, 3)
  frames(s, 'RB', [{ at: .35, pos: [450, 490] }, { at: .85, pos: [465, 445] }, { at: 1.8, pos: [x, 405] }, { at: 3.8, pos: [x, 215] }])
  mark(s, x - 18, 215, 36, 205, `${gap}-gap lane`, 1.55)
  finish(s, 'QB', 'RB', .65, .85, 'handoff')
  const boundaries = { A: 'center and guard', B: 'guard and tackle', C: 'tackle and tight end', D: 'tight end and sideline' }[gap as 'A' | 'B' | 'C' | 'D']
  notes(s, [`The ${gap}-gap starts between the ${boundaries}; its usable width changes with the blocks.`, `RB presses the right side while the blockers establish leverage around the ${gap}-gap.`, gap === 'D' ? 'Y seals the end inside. The safety fits too narrowly, leaving the bounce outside the TE.' : `The two sides of the ${gap}-gap move apart as the defenders are sealed away from the runner.`, `RB takes the highlighted ${gap}-gap after the blocks form. The name identifies a lane, not a guaranteed opening.`])
  return s
}

export function offensiveScene(id: string): PlayScene | undefined {
  if (!offensiveSceneIds.includes(id)) return undefined
  const s = routeIds.includes(id) ? routeLesson(id)
    : passIds.includes(id) ? passingLesson(id)
      : runIds.includes(id) ? blockingLesson(id)
        : personnelIds.includes(id) ? personnelLesson(id)
          : roleIds.includes(id) ? roleLesson(id)
            : readIds.includes(id) ? readLesson(id)
              : formationIds.includes(id) ? formationLesson(id) : gapLesson(id)
  // Reapply contact anchors last: a later coverage adjustment must never erase
  // the exact start/end positions of an already-authored engagement.
  const contacts = [...s.contacts]; s.contacts = []
  for (const c of contacts) engage(s, c.a, c.b, c.start, c.end, c.point, c.finish, c.label)
  if (id === 'z-receiver') for (const t of s.tracks.filter(t => ['Z', 'CBR'].includes(t.player))) t.presnap = true
  if (id === 'formation-flexbone') s.tracks.find(t => t.player === 'H')!.presnap = true
  for (const r of s.reads) { node(s, r.from).showLabel = true; node(s, r.to).showLabel = true }
  return s
}
