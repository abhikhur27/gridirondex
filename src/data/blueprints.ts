import type { Concept } from './types.ts'
import type { Point } from './vectorGeometry.ts'

export type Team = 'offense' | 'defense' | 'special'
export interface BlueprintNode { id: string; label: string; team: Team; x: number; y: number; focus?: boolean; showLabel?: boolean }
export interface BlueprintPath { player: string; points: Point[]; team: Team; dashed?: boolean; label?: string; branch?: boolean; delay?: number }
export interface BlueprintArea { x: number; y: number; width: number; height: number; label?: string }
export interface Blueprint { nodes: BlueprintNode[]; paths: BlueprintPath[]; zones?: BlueprintArea[]; lanes?: BlueprintArea[]; caption?: string; routeOnly?: boolean }

const node = (id: string, x: number, y: number, team: Team = 'offense', label = id): BlueprintNode => ({ id, label, x, y, team })
const line = () => ['LT', 'LG', 'C', 'RG', 'RT'].map((id, i) => node(id, 350 + i * 50, 355))
function offense(): BlueprintNode[] {
  return [...line(), node('X', 115, 355), node('H', 255, 385), node('Y', 615, 355), node('Z', 790, 385), node('QB', 450, 425), node('RB', 365, 465)]
}
function defense(): BlueprintNode[] {
  return [node('CBL', 115, 280, 'defense', 'CB'), node('CBR', 790, 280, 'defense', 'CB'), node('EL', 315, 317, 'defense', 'E'), node('TL', 410, 317, 'defense', 'T'), node('TR', 495, 317, 'defense', 'T'), node('ER', 595, 317, 'defense', 'E'), node('W', 365, 245, 'defense'), node('M', 465, 230, 'defense'), node('N', 250, 260, 'defense'), node('FS', 330, 120, 'defense'), node('SS', 620, 120, 'defense')]
}
function base(withDefense = false): Blueprint { return { nodes: [...offense(), ...(withDefense ? defense() : [])], paths: [] } }
function at(b: Blueprint, id: string) { const found = b.nodes.find(n => n.id === id); if (!found) throw new Error(`Missing diagram player ${id}`); return found }
function move(b: Blueprint, id: string, x: number, y: number, label?: string) { Object.assign(at(b, id), { x, y }, label ? { label } : {}); return b }
function focus(b: Blueprint, ...ids: string[]) { ids.forEach(id => Object.assign(at(b, id), { focus: true, showLabel: true })); return b }
function route(b: Blueprint, id: string, points: Point[], extra: Partial<BlueprintPath> = {}) {
  const n = at(b, id)
  b.paths.push({ player: id, points: [[n.x, n.y], ...points], team: n.team, dashed: n.team === 'defense', ...extra })
  return b
}
function drop(b: Blueprint, id: string, x: number, y: number) { return route(b, id, [[x, y]]) }
const zone = (x: number, y: number, width: number, height: number, label?: string): BlueprintArea => ({ x, y, width, height, label })

// Each route has its actual stem, break direction, and landmark. No recycled thumbnails.
const routeShapes: Record<string, { origin: Point; points: Point[]; second?: { origin: Point; points: Point[] } }> = {
  flat: { origin: [545, 465], points: [[510, 365], [195, 365]] },
  slant: { origin: [280, 465], points: [[280, 310], [635, 100]] },
  comeback: { origin: [485, 465], points: [[485, 85], [295, 210]] },
  curl: { origin: [450, 465], points: [[450, 155], [365, 145], [365, 235]] },
  out: { origin: [575, 465], points: [[575, 205], [185, 205]] },
  dig: { origin: [250, 465], points: [[250, 190], [705, 190]] },
  corner: { origin: [555, 465], points: [[555, 280], [240, 75]] },
  post: { origin: [275, 465], points: [[275, 290], [625, 65]] },
  go: { origin: [450, 465], points: [[450, 60]] },
  wheel: { origin: [485, 465], points: [[320, 410], [235, 335], [235, 65]] },
  angle: { origin: [430, 465], points: [[280, 365], [275, 315], [610, 100]] },
  option: { origin: [450, 465], points: [[450, 255], [695, 255]], second: { origin: [450, 255], points: [[205, 255]] } },
  'mesh-crossers': { origin: [225, 465], points: [[225, 290], [725, 290]], second: { origin: [695, 465], points: [[695, 205], [185, 205]] } },
}
function routeTree(id: string): Blueprint {
  const shape = routeShapes[id], b: Blueprint = { nodes: [node('R', ...shape.origin)], paths: [], routeOnly: true }
  route(b, 'R', shape.points)
  if (shape.second) {
    if (id === 'option') b.paths.push({ player: 'R', points: [shape.second.origin, ...shape.second.points], team: 'offense', branch: true })
    else { b.nodes.push(node('R2', ...shape.second.origin)); route(b, 'R2', shape.second.points) }
  }
  return b
}

function passing(id: string): Blueprint {
  const b = base()
  switch (id) {
    case 'mesh':
      route(b, 'H', [[255, 295], [740, 295]]); route(b, 'Y', [[615, 245], [150, 245]])
      route(b, 'X', [[115, 150], [65, 70]]); route(b, 'Z', [[790, 160], [690, 185]]); route(b, 'RB', [[250, 465], [100, 415]])
      break
    case 'smash':
      route(b, 'X', [[115, 260], [145, 285]]); route(b, 'H', [[255, 205], [100, 55]])
      route(b, 'Y', [[615, 195], [815, 55]]); route(b, 'Z', [[790, 260], [755, 285]])
      break
    case 'flood':
      move(b, 'H', 655, 385); move(b, 'Y', 585, 355)
      route(b, 'Z', [[790, 55]]); route(b, 'H', [[655, 205], [840, 205]]); route(b, 'Y', [[615, 305], [835, 305]])
      route(b, 'X', [[115, 145], [370, 90]]); break
    case 'hi-lo':
      move(b, 'H', 300, 380); route(b, 'H', [[300, 275], [680, 275]]); route(b, 'X', [[115, 175], [640, 175]])
      b.nodes.push(node('M', 465, 230, 'defense')); focus(b, 'M'); drop(b, 'M', 475, 195); break
    case 'drive':
      route(b, 'X', [[115, 175], [575, 175]]); route(b, 'H', [[255, 300], [760, 300]])
      route(b, 'Y', [[615, 65]]); route(b, 'Z', [[790, 95]]); route(b, 'RB', [[300, 435], [180, 400]]); break
    case 'y-cross':
      route(b, 'Y', [[615, 220], [290, 130], [105, 130]]); route(b, 'X', [[115, 50]])
      route(b, 'H', [[255, 305], [100, 305]]); route(b, 'Z', [[790, 210], [700, 230]]); break
    case 'four-verticals':
      route(b, 'X', [[115, 50]]); route(b, 'H', [[280, 225], [340, 50]])
      route(b, 'Y', [[600, 225], [560, 50]]); route(b, 'Z', [[790, 50]]); route(b, 'RB', [[365, 340], [440, 310]]); break
    case 'dagger':
      route(b, 'X', [[115, 195], [515, 195]]); route(b, 'H', [[255, 170], [405, 45]])
      route(b, 'Y', [[615, 310], [195, 310]]); route(b, 'Z', [[790, 80]]); break
    case 'scissors':
      move(b, 'H', 220, 385); route(b, 'X', [[115, 225], [480, 50]]); route(b, 'H', [[220, 195], [75, 60]])
      route(b, 'Y', [[615, 290], [795, 290]]); route(b, 'Z', [[790, 180], [675, 180]]); break
    case 'boot':
      move(b, 'QB', 450, 395); move(b, 'RB', 450, 470)
      route(b, 'QB', [[420, 440], [610, 455], [690, 415]]); route(b, 'RB', [[410, 440], [265, 400]])
      route(b, 'Y', [[655, 300], [830, 300]]); route(b, 'H', [[255, 210], [750, 210]]); route(b, 'X', [[115, 150], [645, 85]]); route(b, 'Z', [[790, 60]]); break
  }
  return b
}

function runOrProtection(id: string): Blueprint {
  const b = base(true)
  move(b, 'H', 685, 385); move(b, 'QB', 450, 402); move(b, 'RB', 450, 485)
  b.nodes = b.nodes.filter(n => n.team === 'offense' || ['EL', 'TL', 'TR', 'ER', 'M', 'W'].includes(n.id))
  const block = (id: string, ...targets: Point[]) => route(b, id, targets)
  switch (id) {
    case 'inside-zone':
      block('LT', [325, 315]); block('LG', [410, 317], [420, 260]); block('C', [410, 317]); block('RG', [495, 317], [475, 245]); block('RT', [595, 317]); block('Y', [625, 310]);
      route(b, 'RB', [[485, 420], [480, 335], [450, 220]]); break
    case 'outside-zone':
      ['LT', 'LG', 'C', 'RG', 'RT', 'Y'].forEach(id => block(id, [at(b, id).x + 70, 320], [at(b, id).x + 90, 280]))
      route(b, 'RB', [[540, 450], [650, 375], [695, 265]]); break
    case 'power':
      block('LT', [360, 300]); block('C', [405, 300]); block('RG', [450, 300]); block('RT', [500, 300]); block('Y', [640, 317])
      block('LG', [400, 405], [570, 405], [585, 250]); route(b, 'RB', [[515, 425], [570, 315], [610, 195]]); break
    case 'trap':
      block('LT', [360, 255]); block('LG', [400, 400], [495, 395], [500, 330]); block('C', [410, 295]); block('RG', [475, 250]); block('RT', [595, 300])
      route(b, 'RB', [[470, 435], [470, 355], [465, 220]]); drop(b, 'TR', 490, 385); break
    case 'counter':
      block('LT', [350, 425], [555, 425], [560, 245]); block('LG', [400, 395], [600, 395], [640, 317]); block('C', [405, 307]); block('RG', [450, 315]); block('RT', [495, 317]); block('Y', [580, 270])
      route(b, 'RB', [[400, 455], [425, 435], [555, 375], [600, 215]]); break
    case 'duo':
      block('LT', [385, 318]); block('LG', [410, 317], [380, 245]); block('C', [415, 317]); block('RG', [495, 317], [465, 245]); block('RT', [500, 317]); block('Y', [595, 310])
      route(b, 'RB', [[455, 425], [455, 340], [520, 240]]); focus(b, 'M'); break
    case 'slide':
      ;['LT', 'LG', 'C', 'RG', 'RT'].forEach(id => block(id, [at(b, id).x - 35, 330], [at(b, id).x - 35, 290]))
      route(b, 'RB', [[520, 435], [610, 365], [600, 330]]); break
    case 'man-protection':
      block('LT', [315, 317]); block('LG', [410, 317]); block('C', [465, 270]); block('RG', [495, 317]); block('RT', [595, 317]); route(b, 'RB', [[380, 415], [365, 290]]); break
    case 'chip':
      move(b, 'RB', 630, 440); block('LT', [315, 320]); block('LG', [410, 320]); block('C', [455, 320]); block('RG', [495, 320]); block('RT', [595, 320]); route(b, 'RB', [[635, 365], [595, 320], [705, 295], [825, 295]]); break
    case 'play-action':
      route(b, 'RB', [[450, 420], [535, 360], [580, 280]]); route(b, 'QB', [[450, 430], [445, 490]])
      route(b, 'Y', [[615, 245], [255, 160]]); route(b, 'X', [[115, 60]]); drop(b, 'M', 465, 290); drop(b, 'W', 405, 300)
      ;['LT', 'LG', 'C', 'RG', 'RT'].forEach(id => block(id, [at(b, id).x + 15, 330])); break
  }
  return b
}

function personnel(id: string): Blueprint {
  const b = base(), p = id.slice(-2)
  if (p === '11') { move(b, 'Y', 615, 355, 'TE'); move(b, 'H', 260, 385, 'WR'); focus(b, 'RB', 'Y'); route(b, 'Y', [[635, 265]]) }
  if (p === '12') { move(b, 'X', 115, 385); move(b, 'H', 290, 355, 'TE'); move(b, 'Y', 610, 355, 'TE'); move(b, 'RB', 450, 490); focus(b, 'H', 'Y', 'RB'); route(b, 'H', [[265, 285]]); route(b, 'Y', [[630, 285]]) }
  if (p === '21') { move(b, 'H', 450, 465, 'FB'); move(b, 'RB', 370, 505); move(b, 'QB', 450, 392); move(b, 'Y', 610, 355, 'TE'); focus(b, 'H', 'RB', 'Y'); route(b, 'H', [[475, 390], [530, 315]]) }
  if (p === '22') { move(b, 'X', 115, 385); move(b, 'H', 450, 445, 'FB'); move(b, 'RB', 450, 505); move(b, 'Z', 290, 355, 'TE'); move(b, 'Y', 610, 355, 'TE'); move(b, 'QB', 450, 392); focus(b, 'H', 'RB', 'Y', 'Z'); route(b, 'Y', [[650, 305]]) }
  if (p === '00') { move(b, 'H', 245, 385, 'WR'); move(b, 'Y', 640, 385, 'WR'); move(b, 'RB', 750, 425, 'WR'); move(b, 'Z', 795, 355, 'WR'); focus(b, 'X', 'H', 'Y', 'Z', 'RB'); route(b, 'RB', [[760, 320], [835, 250]]) }
  if (p === '10') { move(b, 'H', 265, 385, 'WR'); move(b, 'Y', 635, 385, 'WR'); move(b, 'Z', 790, 355); move(b, 'RB', 535, 465); focus(b, 'RB'); route(b, 'H', [[265, 290], [330, 240]]); route(b, 'Y', [[635, 285], [580, 225]]) }
  return b
}

function offensePosition(id: string): Blueprint {
  const b = base()
  switch (id) {
    case 'quarterback': focus(b, 'QB'); route(b, 'QB', [[450, 490]]); route(b, 'X', [[115, 230], [305, 180]]); break
    case 'running-back': focus(b, 'RB'); route(b, 'RB', [[280, 440], [190, 375], [185, 220]]); break
    case 'fullback': move(b, 'H', 450, 445, 'FB'); move(b, 'QB', 450, 395); move(b, 'RB', 450, 505); focus(b, 'H'); route(b, 'H', [[500, 390], [560, 300]]); route(b, 'RB', [[485, 445], [545, 355]]); break
    case 'tight-end': focus(b, 'Y'); route(b, 'Y', [[630, 280], [715, 210]]); b.lanes = [zone(575, 320, 80, 90)]; break
    case 'x-receiver': focus(b, 'X'); route(b, 'X', [[115, 270], [260, 140]]); b.nodes.push(node('CBL', 115, 317, 'defense', 'CB')); break
    case 'z-receiver': focus(b, 'Z'); route(b, 'Z', [[695, 405], [620, 420], [565, 420]], { dashed: true }); break
    case 'slot': focus(b, 'H'); route(b, 'H', [[255, 265], [380, 265]]); b.nodes.push(node('N', 280, 295, 'defense')); break
  }
  return b
}

function reads(id: string): Blueprint {
  const b = base(true)
  switch (id) {
    case 'safety-count': focus(b, 'FS', 'SS'); drop(b, 'FS', 450, 65); drop(b, 'SS', 640, 265); b.zones = [zone(290, 40, 320, 110)]; route(b, 'H', [[265, 185], [330, 60]]); break
    case 'hot-read': focus(b, 'N', 'H'); move(b, 'N', 290, 325); route(b, 'N', [[340, 385], [445, 430]]); route(b, 'H', [[250, 310], [315, 265]]); break
    case 'leverage': move(b, 'CBL', 145, 310); focus(b, 'X', 'CBL'); route(b, 'X', [[100, 305], [100, 210], [55, 160]]); drop(b, 'CBL', 120, 230); b.zones = [zone(160, 160, 100, 100)]; break
    case 'apex': move(b, 'N', 300, 270); focus(b, 'N'); route(b, 'H', [[255, 295], [135, 295]]); route(b, 'RB', [[425, 425], [430, 310]]); drop(b, 'N', 230, 295); break
    case 'conflict-linebacker': focus(b, 'M'); route(b, 'Y', [[615, 180], [250, 180]]); route(b, 'H', [[255, 290], [710, 290]]); drop(b, 'M', 465, 185); break
    case 'press-check': move(b, 'X', 135, 355); move(b, 'H', 155, 405); move(b, 'CBL', 135, 315); move(b, 'N', 185, 315); focus(b, 'X', 'H'); route(b, 'X', [[135, 285], [65, 200]]); route(b, 'H', [[155, 310], [310, 200]]); break
    case 'zero-beater': move(b, 'FS', 430, 275); move(b, 'SS', 615, 315); route(b, 'X', [[115, 295], [290, 215]]); route(b, 'H', [[255, 335], [95, 335]]); route(b, 'SS', [[600, 395], [470, 430]]); route(b, 'FS', [[435, 360], [450, 410]]); break
    case 'box-count': move(b, 'SS', 650, 195); focus(b, 'SS'); b.zones = [zone(290, 225, 350, 155)]; drop(b, 'SS', 585, 285); route(b, 'RB', [[430, 430], [415, 310]]); route(b, 'Z', [[790, 290], [705, 245]]); break
  }
  return b
}

function coverage(id: string): Blueprint {
  const b = base(true)
  if (id === 'cover-0' || id === 'cover-1') {
    move(b, 'CBL', 115, 317); move(b, 'CBR', 790, 337); move(b, 'N', 255, 340); move(b, 'SS', 615, 310); move(b, 'W', 365, 295)
    route(b, 'CBL', [[125, 215], [250, 120]]); route(b, 'CBR', [[775, 235], [710, 175]]); route(b, 'N', [[280, 270], [470, 260]]); route(b, 'SS', [[620, 230], [590, 125]]); route(b, 'W', [[300, 340], [190, 370]])
    if (id === 'cover-0') { move(b, 'FS', 430, 265); route(b, 'FS', [[430, 340], [455, 430]]); route(b, 'M', [[480, 325], [490, 400]]) }
    else { move(b, 'FS', 450, 105); drop(b, 'FS', 450, 60); drop(b, 'M', 455, 275); b.zones = [zone(270, 40, 360, 120)] }
  } else if (id === 'cover-2') {
    move(b, 'CBL', 115, 325); move(b, 'CBR', 790, 325)
    b.zones = [zone(55, 40, 385, 155), zone(460, 40, 385, 155)]
    drop(b, 'FS', 250, 85); drop(b, 'SS', 655, 85); drop(b, 'CBL', 105, 285); drop(b, 'CBR', 795, 285); drop(b, 'N', 265, 220); drop(b, 'W', 390, 215); drop(b, 'M', 525, 210)
  } else if (id === 'cover-3') {
    b.zones = [zone(55, 40, 250, 140), zone(325, 40, 250, 140), zone(595, 40, 250, 140)]
    drop(b, 'CBL', 170, 90); drop(b, 'CBR', 735, 90); drop(b, 'FS', 450, 75); drop(b, 'SS', 715, 270); drop(b, 'N', 160, 270); drop(b, 'W', 350, 240); drop(b, 'M', 515, 240)
  } else if (id === 'cover-4') {
    b.zones = [55, 255, 455, 655].map(x => zone(x, 40, 190, 155))
    drop(b, 'CBL', 145, 90); drop(b, 'CBR', 755, 90); drop(b, 'FS', 350, 105); drop(b, 'SS', 550, 105); drop(b, 'N', 200, 260); drop(b, 'W', 420, 225); drop(b, 'M', 650, 260)
  } else {
    move(b, 'CBR', 790, 325)
    b.zones = [zone(55, 40, 190, 155), zone(255, 40, 190, 155), zone(465, 40, 380, 155)]
    drop(b, 'CBL', 150, 90); drop(b, 'FS', 350, 90); drop(b, 'SS', 650, 80); drop(b, 'CBR', 790, 280); drop(b, 'N', 210, 250); drop(b, 'W', 410, 230); drop(b, 'M', 585, 220)
  }
  // Every shown rusher has an actual post-snap landmark, too.
  route(b, 'EL', [[300, 365], [350, 435]]); drop(b, 'TL', 425, 385); drop(b, 'TR', 475, 385); route(b, 'ER', [[610, 365], [560, 435]])
  return b
}

function front(id: string): Blueprint {
  const b = base(true)
  if (id === '4-3') {
    move(b, 'N', 650, 250, 'S'); move(b, 'TL', 425, 317); move(b, 'TR', 525, 317); focus(b, 'EL', 'TL', 'TR', 'ER', 'M', 'W', 'N')
    drop(b, 'EL', 325, 380); drop(b, 'TL', 425, 390); drop(b, 'TR', 525, 390); drop(b, 'ER', 590, 385); drop(b, 'M', 475, 340); drop(b, 'W', 375, 340); drop(b, 'N', 630, 340)
  } else if (id === '3-4') {
    move(b, 'TL', 450, 315, 'NT'); move(b, 'EL', 350, 315); move(b, 'ER', 550, 315); move(b, 'TR', 520, 250, 'LB'); move(b, 'N', 285, 325, 'OLB'); move(b, 'SS', 630, 325, 'OLB'); move(b, 'M', 475, 155, 'S')
    focus(b, 'EL', 'TL', 'ER', 'N', 'SS'); drop(b, 'TL', 450, 350); drop(b, 'EL', 375, 360); drop(b, 'ER', 525, 360); drop(b, 'N', 310, 405); drop(b, 'SS', 605, 405); drop(b, 'W', 415, 335); drop(b, 'TR', 480, 335)
  } else if (id === 'bear') {
    move(b, 'TL', 400, 315); move(b, 'TR', 500, 315); move(b, 'M', 450, 315, 'NT'); move(b, 'EL', 315, 320); move(b, 'ER', 610, 320); focus(b, 'TL', 'M', 'TR')
    drop(b, 'TL', 395, 360); drop(b, 'M', 450, 365); drop(b, 'TR', 505, 360); drop(b, 'EL', 335, 400); drop(b, 'ER', 595, 405); drop(b, 'W', 375, 335); drop(b, 'N', 300, 345)
  } else if (id === 'penny') {
    move(b, 'EL', 300, 315); move(b, 'TL', 400, 315); move(b, 'TR', 450, 315, 'NT'); move(b, 'ER', 500, 315); move(b, 'W', 610, 315, 'E'); move(b, 'M', 450, 225); move(b, 'N', 240, 255)
    focus(b, 'M'); ['EL', 'TL', 'TR', 'ER', 'W'].forEach((p, i) => drop(b, p, [325, 375, 475, 525, 590][i], 385)); drop(b, 'M', 430, 325); drop(b, 'N', 175, 250)
  } else if (id === 'dollar') {
    move(b, 'EL', 325, 315); move(b, 'ER', 590, 315); move(b, 'TL', 435, 275, 'LB'); move(b, 'TR', 505, 275, 'LB'); move(b, 'W', 350, 180, 'DB'); move(b, 'M', 535, 175, 'DB'); move(b, 'N', 245, 255, 'DB')
    b.nodes.filter(n => n.team === 'defense' && !['EL', 'ER', 'TL', 'TR'].includes(n.id)).forEach(n => { n.showLabel = true; n.focus = true })
    drop(b, 'EL', 350, 415); drop(b, 'ER', 560, 415); drop(b, 'TL', 420, 370); drop(b, 'TR', 510, 210); drop(b, 'W', 340, 115); drop(b, 'M', 550, 100); drop(b, 'N', 225, 210)
  } else { // A teaching strip of technique landmarks, with names anchored to actual blockers.
    b.nodes = [...line(), node('TE', 625, 355), ...[['0', 450], ['1', 430], ['2', 400], ['3', 375], ['4', 550], ['5', 580], ['6', 625], ['7', 600], ['9', 675]].map(([label, x], i) => ({ ...node(`tech${i}`, Number(x), i % 2 ? 215 : 280, 'defense', String(label)), showLabel: true, focus: true }))]
    b.nodes.filter(n => n.team === 'defense').forEach(n => drop(b, n.id, n.x, 325))
    b.caption = 'Technique numbers name the alignment, not the assignment.'
  }
  return b
}

function defensePosition(id: string): Blueprint {
  const b = base(true)
  switch (id) {
    case 'nose': move(b, 'TL', 450, 317, 'NT'); b.nodes = b.nodes.filter(n => n.id !== 'TR'); focus(b, 'TL'); route(b, 'TL', [[450, 350], [425, 390]]); b.lanes = [zone(412, 325, 28, 80), zone(460, 325, 28, 80)]; break
    case 'edge': focus(b, 'ER'); move(b, 'ER', 655, 315); route(b, 'ER', [[675, 375], [630, 435], [510, 445]]); route(b, 'QB', [[520, 455], [640, 465]]); break
    case 'mike': focus(b, 'M'); route(b, 'M', [[465, 285], [480, 330], [480, 390]]); b.lanes = [zone(462, 315, 28, 90)]; route(b, 'RG', [[495, 317], [475, 265]]); break
    case 'will': focus(b, 'W'); route(b, 'W', [[360, 300], [415, 355], [405, 405]]); route(b, 'RB', [[475, 435], [510, 385], [405, 355]]); break
    case 'sam': move(b, 'N', 655, 275, 'S'); focus(b, 'N'); route(b, 'N', [[660, 240], [710, 200]]); route(b, 'Y', [[640, 270], [690, 150]]); break
    case 'cornerback': move(b, 'CBL', 140, 317); focus(b, 'CBL'); route(b, 'CBL', [[130, 260], [90, 140]]); route(b, 'X', [[115, 285], [70, 175]]); break
    case 'free-safety': move(b, 'FS', 450, 110); focus(b, 'FS'); route(b, 'FS', [[490, 85], [635, 100]]); route(b, 'Y', [[610, 215], [575, 75]]); b.zones = [zone(220, 40, 450, 125)]; break
    case 'strong-safety': focus(b, 'SS'); route(b, 'SS', [[640, 225], [625, 295], [585, 350]]); route(b, 'RB', [[510, 430], [600, 345]]); b.lanes = [zone(567, 305, 35, 95)]; break
    case 'nickel': move(b, 'N', 285, 295); focus(b, 'N'); route(b, 'N', [[310, 235], [315, 135]]); route(b, 'H', [[265, 235], [315, 90]]); b.zones = [zone(240, 105, 145, 150)]; break
  }
  return b
}

function reaction(id: string): Blueprint {
  const b = base(true)
  if (id === 'creeping-safety') { focus(b, 'SS'); route(b, 'SS', [[650, 210], [655, 290], [625, 370]]); drop(b, 'FS', 465, 75); route(b, 'Y', [[615, 265], [695, 155]]) }
  if (id === 'motion-adjustment') { route(b, 'H', [[335, 420], [650, 420]], { dashed: true }); focus(b, 'N', 'M'); route(b, 'N', [[335, 275], [640, 285]]); drop(b, 'M', 525, 245); drop(b, 'SS', 650, 190) }
  if (id === 'coverage-roll') { b.zones = [zone(315, 40, 270, 145), zone(655, 235, 185, 80)]; focus(b, 'FS', 'SS'); route(b, 'FS', [[385, 80], [455, 65]]); route(b, 'SS', [[675, 175], [735, 275]]); drop(b, 'CBL', 140, 105); drop(b, 'CBR', 775, 105); drop(b, 'N', 165, 270) }
  if (id === 'one-gap') { b.lanes = [325, 375, 475, 575].map(x => zone(x - 14, 300, 28, 110)); focus(b, 'EL', 'TL', 'TR', 'ER'); drop(b, 'EL', 325, 405); drop(b, 'TL', 375, 405); drop(b, 'TR', 475, 405); drop(b, 'ER', 575, 405); drop(b, 'M', 425, 340) }
  if (id === 'two-gap') { move(b, 'TL', 450, 317, 'NT'); move(b, 'EL', 350, 317); move(b, 'ER', 550, 317); b.nodes = b.nodes.filter(n => n.id !== 'TR'); focus(b, 'TL', 'EL', 'ER'); b.lanes = [325, 375, 425, 475, 525, 575].map(x => zone(x - 13, 330, 26, 90)); for (const [p, x] of [['EL', 350], ['TL', 450], ['ER', 550]] as const) { route(b, p, [[x, 345], [x - 25, 390]]); route(b, p, [[x, 345], [x + 25, 390]], { branch: true }) } }
  return b
}

function formation(id: string): Blueprint {
  const b = base()
  if (id === 'formation-i') { move(b, 'QB', 450, 395); move(b, 'H', 450, 442, 'FB'); move(b, 'RB', 450, 510); move(b, 'Y', 610, 355); route(b, 'H', [[500, 380], [560, 305]]); route(b, 'RB', [[475, 440], [540, 335]]) }
  if (id === 'formation-singleback') { move(b, 'QB', 450, 395); move(b, 'RB', 450, 505); move(b, 'X', 115, 385); move(b, 'H', 285, 355, 'TE'); move(b, 'Y', 615, 355, 'TE'); route(b, 'RB', [[530, 455], [655, 355]]); route(b, 'H', [[265, 285], [150, 225]]) }
  if (id === 'formation-trips') { move(b, 'H', 650, 385); move(b, 'Y', 715, 405); move(b, 'Z', 800, 355); move(b, 'QB', 450, 445); move(b, 'RB', 365, 460); route(b, 'H', [[645, 250], [535, 165]]); route(b, 'Y', [[720, 275], [830, 275]]); route(b, 'Z', [[800, 130]]) }
  if (id === 'formation-empty') { move(b, 'H', 235, 390); move(b, 'RB', 645, 410, 'R'); move(b, 'Y', 720, 385); move(b, 'Z', 820, 355); move(b, 'QB', 450, 450); route(b, 'H', [[235, 270], [355, 220]]); route(b, 'RB', [[650, 300], [550, 250]]); route(b, 'Y', [[720, 245], [820, 200]]) }
  if (id === 'formation-pistol') { move(b, 'QB', 450, 430); move(b, 'RB', 450, 505); move(b, 'H', 230, 385); route(b, 'RB', [[480, 450], [560, 360], [590, 270]]); route(b, 'QB', [[440, 470], [345, 445]]) }
  if (id === 'formation-wishbone') { move(b, 'QB', 450, 390); move(b, 'H', 450, 445, 'FB'); move(b, 'RB', 365, 505, 'HB'); move(b, 'Z', 535, 505, 'HB'); move(b, 'Y', 615, 355); route(b, 'H', [[465, 390], [475, 320]]); route(b, 'RB', [[385, 450], [570, 425]]); route(b, 'Z', [[620, 450], [700, 390]]) }
  if (id === 'formation-flexbone') { move(b, 'QB', 450, 392); move(b, 'RB', 450, 480, 'FB'); move(b, 'H', 305, 390, 'SB'); move(b, 'Y', 595, 390, 'SB'); move(b, 'Z', 790, 355); route(b, 'H', [[330, 445], [560, 455]], { dashed: true }); route(b, 'RB', [[465, 410], [480, 320]]); route(b, 'QB', [[510, 425], [665, 405]]) }
  b.nodes.filter(n => ['QB', 'RB', 'H', 'Y', 'Z'].includes(n.id)).forEach(n => { n.showLabel = true })
  return b
}

function stunt(id: string): Blueprint {
  const b = base(true)
  b.nodes = b.nodes.filter(n => n.team === 'defense' || ['LT', 'LG', 'C', 'RG', 'RT', 'QB', 'RB'].includes(n.id))
  if (id === 'stunt-tex') { focus(b, 'TR', 'ER'); route(b, 'TR', [[545, 350], [585, 385], [540, 445]]); route(b, 'ER', [[555, 275], [475, 280], [475, 385], [460, 450]]); drop(b, 'EL', 335, 395); drop(b, 'TL', 420, 385); b.caption = 'Tackle goes first. End loops behind him.' }
  if (id === 'stunt-ext') { focus(b, 'TR', 'ER'); route(b, 'ER', [[545, 335], [515, 385], [475, 440]]); route(b, 'TR', [[535, 270], [630, 280], [630, 390], [550, 465]]); drop(b, 'EL', 335, 395); drop(b, 'TL', 420, 385); b.caption = 'End crashes inside. Tackle wraps outside.' }
  if (id === 'stunt-loop') { focus(b, 'TL', 'EL', 'TR'); route(b, 'EL', [[375, 345], [395, 390]]); route(b, 'TL', [[425, 275], [570, 275], [615, 365], [550, 445]]); route(b, 'TR', [[470, 355], [465, 430]]); drop(b, 'ER', 595, 395); b.caption = 'The long looper trades lanes behind the rush.' }
  if (id === 'blitz-cross-dog') { focus(b, 'W', 'M'); move(b, 'W', 405, 240); move(b, 'M', 495, 230); route(b, 'M', [[460, 275], [425, 330], [420, 410]]); route(b, 'W', [[435, 295], [475, 340], [480, 435]]); drop(b, 'TL', 375, 395); drop(b, 'TR', 525, 395); drop(b, 'EL', 325, 385); drop(b, 'ER', 600, 385); b.lanes = [zone(410, 320, 30, 95), zone(460, 320, 30, 95)] }
  if (id === 'blitz-fire-zone') {
    move(b, 'SS', 285, 120); move(b, 'FS', 620, 120)
    move(b, 'N', 275, 320); focus(b, 'N', 'ER', 'SS'); route(b, 'N', [[320, 370], [390, 445]]); route(b, 'ER', [[645, 250], [730, 235]]); drop(b, 'W', 400, 395); drop(b, 'M', 460, 240); drop(b, 'EL', 335, 400); drop(b, 'TL', 425, 395); drop(b, 'TR', 520, 395); drop(b, 'SS', 170, 245); drop(b, 'FS', 450, 65); drop(b, 'CBL', 155, 105); drop(b, 'CBR', 755, 105)
    b.zones = [zone(55, 45, 250, 130), zone(325, 45, 250, 130), zone(595, 45, 250, 130), zone(70, 210, 220, 70), zone(340, 210, 220, 70), zone(610, 210, 220, 70)]
  }
  const delayedPlayer = ({ 'stunt-tex': 'ER', 'stunt-ext': 'TR', 'stunt-loop': 'TL', 'blitz-cross-dog': 'W' } as Record<string, string>)[id]
  if (delayedPlayer) b.paths.find(path => path.player === delayedPlayer)!.delay = id === 'blitz-cross-dog' ? .12 : .2
  return b
}

function gaps(id: string): Blueprint {
  const b: Blueprint = { nodes: [...line(), node('YL', 285, 355, 'offense', 'TE'), node('YR', 615, 355, 'offense', 'TE'), node('RB', 450, 485)], paths: [], lanes: [] }
  if (id.startsWith('gap-')) {
    const gap = id.slice(-1).toUpperCase(), pairs: Record<string, [number, number]> = { A: [425, 475], B: [375, 525], C: [317, 583], D: [240, 660] }
    b.lanes = pairs[gap].map(x => zone(x - 15, 255, 30, 170, gap))
    const target = pairs[gap][1]
    route(b, 'RB', [[target, 440], [target, 265]])
    b.nodes.filter(n => ['C', 'YL', 'YR'].includes(n.id)).forEach(n => { n.showLabel = true })
  } else if (id === 'fit-one-gap') {
    b.nodes.push(node('T', 525, 315, 'defense', '3'), node('M', 450, 225, 'defense'))
    b.lanes = [zone(510, 280, 30, 150, 'B'), zone(460, 280, 30, 150, 'A')]; focus(b, 'T', 'M'); drop(b, 'T', 525, 405); route(b, 'M', [[475, 290], [475, 385]]); route(b, 'RB', [[500, 440], [505, 365]])
  } else {
    b.nodes.push(node('N', 450, 305, 'defense', '0'), node('M', 430, 220, 'defense'))
    b.lanes = [zone(409, 280, 32, 145, 'A'), zone(459, 280, 32, 145, 'A')]; focus(b, 'N'); route(b, 'N', [[450, 340], [425, 395]]); route(b, 'N', [[450, 340], [475, 395]], { branch: true }); drop(b, 'M', 380, 330); route(b, 'RB', [[480, 445], [480, 370]])
  }
  return b
}

function special(id: string): Blueprint {
  if (id.startsWith('fg-')) {
    const b: Blueprint = { nodes: [...line(), node('LE', 295, 360), node('RE', 605, 360), node('LW', 280, 400), node('RW', 620, 400), node('HOLD', 455, 465, 'offense', 'H'), node('K', 375, 505)], paths: [] }
    const rush = [['E1', 230, 345], ['E2', 665, 345], ['T1', 375, 318], ['T2', 425, 318], ['T3', 475, 318], ['T4', 525, 318], ['W1', 280, 310], ['W2', 620, 310], ['M', 450, 255], ['S1', 170, 250], ['S2', 730, 250]] as const
    rush.forEach(([n, x, y]) => b.nodes.push(node(n, x, y, 'defense')))
    if (id === 'fg-edge-overload') { move(b, 'W1', 705, 325); move(b, 'M', 735, 350); focus(b, 'E2', 'W1', 'M'); route(b, 'E2', [[650, 415], [500, 470]]); route(b, 'W1', [[675, 435], [510, 485]]); route(b, 'M', [[695, 460], [520, 500]]); drop(b, 'T3', 475, 380) }
    if (id === 'fg-a-gap-push') { focus(b, 'T2', 'T3'); route(b, 'T2', [[430, 355], [435, 400]]); route(b, 'T3', [[470, 355], [465, 400]]); route(b, 'M', [[450, 320], [450, 375]]); b.lanes = [zone(410, 305, 28, 105, 'A'), zone(462, 305, 28, 105, 'A')]; route(b, 'E1', [[255, 395], [345, 460]]) }
    if (id === 'fg-block-safe') { focus(b, 'E1', 'E2', 'S1', 'S2'); route(b, 'E1', [[235, 410], [310, 460]]); route(b, 'E2', [[665, 410], [590, 460]]); drop(b, 'S1', 220, 350); drop(b, 'S2', 700, 350); drop(b, 'M', 450, 295); drop(b, 'T1', 375, 355); drop(b, 'T4', 525, 355) }
    return b
  }
  if (id === 'punt-spread') {
    const b: Blueprint = { nodes: [node('C', 450, 280, 'special', 'LS'), ...[110, 235, 340, 560, 665, 790].map((x, i) => node(`L${i}`, x, 280, 'special')), node('S1', 365, 400, 'special'), node('S2', 450, 400, 'special'), node('S3', 535, 400, 'special'), node('P', 450, 510, 'special')], paths: [] }
    ;['S1', 'S2', 'S3', 'P'].forEach(n => { at(b, n).showLabel = true })
    ;['L0', 'L1', 'L2', 'L3', 'L4', 'L5'].forEach((n, i) => route(b, n, [[at(b, n).x, 220], [[85, 205, 325, 575, 695, 815][i], 80]])); route(b, 'C', [[450, 155]]); b.caption = 'Seven spread on the line; three shield the punter.'; return b
  }
  if (id === 'punt-pro') {
    const b: Blueprint = { nodes: [...line().map(n => ({ ...n, y: 280, team: 'special' as const })), node('GL', 105, 280, 'special', 'G'), node('GR', 795, 280, 'special', 'G'), node('WL', 290, 335, 'special'), node('WR', 610, 335, 'special'), node('PP', 450, 385, 'special'), node('P', 450, 510, 'special')], paths: [] }
    focus(b, 'PP', 'P'); route(b, 'GL', [[105, 90]]); route(b, 'GR', [[795, 90]]); route(b, 'WL', [[325, 310], [245, 200]]); route(b, 'WR', [[575, 310], [655, 200]]); route(b, 'PP', [[495, 355], [495, 295]]); return b
  }
  if (id === 'punt-gunner') {
    const b: Blueprint = { nodes: [node('GL', 180, 385, 'special', 'G'), node('GR', 720, 385, 'special', 'G'), node('P', 450, 475, 'special'), node('J1', 160, 330, 'defense'), node('J2', 215, 330, 'defense'), node('J3', 710, 335, 'defense'), node('R', 450, 95, 'defense')], paths: [] }
    focus(b, 'GL', 'GR'); route(b, 'GL', [[135, 345], [115, 280], [205, 185], [390, 110]]); route(b, 'GR', [[760, 330], [735, 255], [635, 165], [510, 110]]); route(b, 'J1', [[120, 290], [210, 200]]); route(b, 'J2', [[185, 275], [280, 185]]); drop(b, 'J3', 700, 245); return b
  }
  // Returners move toward the bottom (their opponent's original line of scrimmage).
  const b: Blueprint = { nodes: [node('R', 600, 85, 'special', 'R'), ...[210, 315, 420, 525, 630, 735].map((x, i) => node(`B${i}`, x, 235, 'special')), ...[155, 275, 395, 515, 635, 755].map((x, i) => node(`C${i}`, x, 390, 'defense'))], paths: [], lanes: [zone(125, 140, 115, 340)] }
  focus(b, 'R'); route(b, 'R', [[490, 130], [190, 205], [180, 330], [180, 480]])
  ;['B0', 'B1', 'B2', 'B3', 'B4', 'B5'].forEach((n, i) => route(b, n, [[270 + i * 35, 210 + i * 28], [285 + i * 35, 255 + i * 28]]))
  ;['C0', 'C1', 'C2', 'C3', 'C4', 'C5'].forEach((n, i) => drop(b, n, 265 + i * 48, 280 - i * 12))
  return b
}

const passingIds = ['mesh', 'smash', 'flood', 'hi-lo', 'drive', 'y-cross', 'four-verticals', 'dagger', 'scissors', 'boot']
const runIds = ['inside-zone', 'outside-zone', 'power', 'trap', 'counter', 'duo', 'slide', 'man-protection', 'chip', 'play-action']
const offenseRoleIds = ['quarterback', 'running-back', 'fullback', 'tight-end', 'x-receiver', 'z-receiver', 'slot']
const readIds = ['safety-count', 'hot-read', 'leverage', 'apex', 'conflict-linebacker', 'press-check', 'zero-beater', 'box-count']
const frontIds = ['4-3', '3-4', 'bear', 'penny', 'dollar', 'techniques']
const defenseRoleIds = ['nose', 'edge', 'mike', 'will', 'sam', 'cornerback', 'free-safety', 'strong-safety', 'nickel']
const reactionIds = ['creeping-safety', 'motion-adjustment', 'coverage-roll', 'one-gap', 'two-gap']
export const blueprintIds = [...Object.keys(routeShapes), ...passingIds, ...runIds, ...['11', '12', '21', '22', '00', '10'].map(p => `personnel-${p}`), ...offenseRoleIds, ...readIds, ...[0, 1, 2, 3, 4, 6].map(n => `cover-${n}`), ...frontIds, ...defenseRoleIds, ...reactionIds, ...['i', 'singleback', 'trips', 'empty', 'pistol', 'wishbone', 'flexbone'].map(n => `formation-${n}`), 'stunt-tex', 'stunt-ext', 'stunt-loop', 'blitz-cross-dog', 'blitz-fire-zone', 'gap-a', 'gap-b', 'gap-c', 'gap-d', 'fit-one-gap', 'fit-two-gap', 'fg-edge-overload', 'fg-a-gap-push', 'fg-block-safe', 'punt-spread', 'punt-pro', 'punt-gunner', 'punt-return-wall']

/** Explicit dispatch deliberately rejects missing concepts instead of recycling a default diagram. */
export function blueprintFor(concept: Pick<Concept, 'id'>): Blueprint {
  const id = concept.id
  if (routeShapes[id]) return routeTree(id)
  if (passingIds.includes(id)) return passing(id)
  if (runIds.includes(id)) return runOrProtection(id)
  if (id.startsWith('personnel-') && blueprintIds.includes(id)) return personnel(id)
  if (offenseRoleIds.includes(id)) return offensePosition(id)
  if (readIds.includes(id)) return reads(id)
  if (/^cover-[012346]$/.test(id)) return coverage(id)
  if (frontIds.includes(id)) return front(id)
  if (defenseRoleIds.includes(id)) return defensePosition(id)
  if (reactionIds.includes(id)) return reaction(id)
  if (id.startsWith('formation-') && blueprintIds.includes(id)) return formation(id)
  if (['stunt-tex', 'stunt-ext', 'stunt-loop', 'blitz-cross-dog', 'blitz-fire-zone'].includes(id)) return stunt(id)
  if (['gap-a', 'gap-b', 'gap-c', 'gap-d', 'fit-one-gap', 'fit-two-gap'].includes(id)) return gaps(id)
  if (id.startsWith('fg-') || id.startsWith('punt-')) { if (blueprintIds.includes(id)) return special(id) }
  throw new Error(`No custom blueprint for ${id}`)
}
