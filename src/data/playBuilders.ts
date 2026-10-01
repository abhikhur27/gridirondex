import { blueprintFor, type BlueprintNode } from './blueprints.ts'
import { PLAY_DURATION, type PlayScene, type PlayFrame, type PlayBall } from './playModel.ts'
import type { Point } from './vectorGeometry.ts'

const standard = () => blueprintFor({ id: 'cover-3' }).nodes.map(n => ({ ...n, focus: false, showLabel: false }))
export function sceneFrom(id: string): PlayScene {
  const b = blueprintFor({ id })
  const defaults = standard()
  const original = b.routeOnly ? defaults : b.nodes.map(n => ({ ...n }))
  const offensiveNodes = original.filter(n => n.team !== 'defense')
  const defensiveNodes = original.filter(n => n.team === 'defense')
  for (const n of defaults) {
    const team = n.team === 'defense' ? defensiveNodes : offensiveNodes
    if (team.length < 11 && !original.some(p => p.id === n.id)) team.push({ ...n })
  }
  const scene: PlayScene = { id, offensiveNodes, defensiveNodes, tracks: [], contacts: [], areas: [], reads: [], beats: [], duration: PLAY_DURATION }
  if (!b.routeOnly) for (const p of b.paths.filter(p => !p.branch)) track(scene, p.player, p.points.slice(1), .35 + (p.delay ?? 0) * 2, 3.5)
  return scene
}
export function node(s: PlayScene, id: string): BlueprintNode {
  const found = [...s.offensiveNodes, ...s.defensiveNodes].find(n => n.id === id)
  if (!found) throw new Error(`${s.id}: unknown player ${id}`)
  return found
}
export function place(s: PlayScene, id: string, x: number, y: number, label?: string) {
  Object.assign(node(s, id), { x, y }, label ? { label, showLabel: true } : {})
  const old = s.tracks.find(t => t.player === id)
  if (old) old.frames[0] = { at: 0, pos: [x, y] }
  return s
}
export function frames(s: PlayScene, id: string, keys: PlayFrame[]) {
  const n = node(s, id)
  const all = keys.some(k => k.at === 0) ? keys : [{ at: 0, pos: [n.x, n.y] as Point }, ...keys]
  const unique = new Map(all.map(k => [k.at, { at: k.at, pos: [...k.pos] as Point }]))
  const t = { player: id, dashed: n.team === 'defense', frames: [...unique.values()].sort((a, b) => a.at - b.at) }
  s.tracks = [...s.tracks.filter(p => p.player !== id), t]
  return s
}
export function track(s: PlayScene, id: string, points: Point[], start = .35, end = 3.5) {
  const n = node(s, id), origin: Point = [n.x, n.y], all = [origin, ...points]
  const lengths = points.map((p, i) => Math.hypot(p[0] - all[i][0], p[1] - all[i][1]))
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  let time = start
  return frames(s, id, [{ at: 0, pos: origin }, { at: start, pos: origin }, ...points.map((pos, i) => ({ at: time += lengths[i] / total * (end - start), pos }))])
}
export function engage(s: PlayScene, a: string, b: string, start: number, end: number, point: Point, finish: Point = point, label = 'Seal') {
  s.contacts.push({ a, b, start, end, point, finish, label })
  for (const id of [a, b]) {
    const n = node(s, id), offset = n.team === 'defense' ? -14 : 14
    const existing = s.tracks.find(t => t.player === id)?.frames ?? [{ at: 0, pos: [n.x, n.y] as Point }]
    frames(s, id, [...existing.filter(f => f.at < start || f.at > end), { at: start, pos: [point[0], point[1] + offset] }, { at: end, pos: [finish[0], finish[1] + offset] }])
  }
  return s
}
export function mark(s: PlayScene, x: number, y: number, width: number, height: number, label: string, start = 1, end = PLAY_DURATION, tone: 'lane' | 'danger' = 'lane') {
  s.areas.push({ x, y, width, height, label, start, end, tone }); return s
}
export function read(s: PlayScene, from: string, to: string, label: string, start = .4, end = 2.5) {
  s.reads.push({ from, to, label, start, end }); return s
}
export function notes(s: PlayScene, text: [string, string, string, string]) {
  s.beats = text.map((text, i) => ({ at: [0, .35, 1.35, 3.4][i], text })); return s
}
export function man(s: PlayScene, defender: string, receiver: string, offset: Point = [15, -20]) {
  const receiverTrack = s.tracks.find(t => t.player === receiver)
  if (!receiverTrack) throw new Error(`${s.id}: ${receiver} needs a route before man coverage`)
  const d = node(s, defender)
  return frames(s, defender, [{ at: 0, pos: [d.x, d.y] }, { at: .48, pos: [d.x, d.y] }, ...receiverTrack.frames.filter(f => f.at > .35).map(f => ({ at: Math.min(s.duration, f.at + .22), pos: [Math.max(45, Math.min(850, f.pos[0] + offset[0])), Math.max(40, Math.min(515, f.pos[1] + offset[1]))] as Point }))])
}
export function finish(s: PlayScene, from: string, to: string, release = 2.8, arrival = 3.4, kind: PlayBall['kind'] = 'pass') {
  s.ball = { from, to, release, arrival, kind }; return s
}
