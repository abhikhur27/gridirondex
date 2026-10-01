import type { Point } from './vectorGeometry.ts'
import type { PlayScene, PlayTrack, PlayContact } from './playModel.ts'

const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value))
export function contactAnchor(scene: PlayScene, contact: PlayContact, player: string, seconds: number): Point {
  const nodes = [...scene.offensiveNodes, ...scene.defensiveNodes]
  const n = nodes.find(n => n.id === player)!
  const center = lerp(contact.point, contact.finish ?? contact.point, clamp((seconds - contact.start) / (contact.end - contact.start || 1)))
  const opponent = contact.a === player ? contact.b : contact.a
  const teammates = [...new Set(scene.contacts.filter(c => c.start < contact.end && c.end > contact.start && [c.a,c.b].includes(opponent)).flatMap(c => [c.a,c.b]).filter(id => id !== opponent && nodes.find(n=>n.id===id)?.team === n.team))].sort()
  const lateral = teammates.length > 1 ? (teammates.indexOf(player) - (teammates.length-1)/2) * 28 : 0
  return [center[0]+lateral,center[1]+(n.team==='defense'?-14:14)]
}

/** Reconcile track anchors after all combination blocks have been authored. */
export function prepareScene(scene: PlayScene): PlayScene {
  for (const track of scene.tracks) {
    const contacts = scene.contacts.filter(c=>c.a===track.player||c.b===track.player)
    const keys = new Map(track.frames.map(k=>[k.at,k]))
    if (!track.presnap) {
      const player = [...scene.offensiveNodes,...scene.defensiveNodes].find(n=>n.id===track.player)!
      for(const at of keys.keys())if(at>0&&at<.35)keys.delete(at)
      keys.set(.35,{at:.35,pos:[player.x,player.y]})
    }
    for(const c of contacts)for(const at of [c.start,c.end]){
      const simultaneous=contacts.filter(other=>at>=other.start&&at<=other.end)
      const anchors=simultaneous.map(other=>contactAnchor(scene,other,track.player,at))
      keys.set(at,{at,pos:[anchors.reduce((v,p)=>v+p[0],0)/anchors.length,anchors.reduce((v,p)=>v+p[1],0)/anchors.length]})
    }
    track.frames=[...keys.values()].sort((a,b)=>a.at-b.at)
  }
  return scene
}
export function trackPosition(track: PlayTrack, seconds: number): Point {
  const f = track.frames
  if (seconds <= f[0].at) return f[0].pos
  for (let i = 1; i < f.length; i++) if (seconds <= f[i].at) return lerp(f[i - 1].pos, f[i].pos, clamp((seconds - f[i - 1].at) / (f[i].at - f[i - 1].at)))
  return f.at(-1)!.pos
}

/** One clock drives both teams, reciprocal contact constraints, ball flight and teaching cues. */
export function samplePlay(scene: PlayScene, requested: number) {
  const seconds = clamp(requested, 0, scene.duration)
  const nodes = [...scene.offensiveNodes, ...scene.defensiveNodes]
  const positions = new Map<string, Point>(nodes.map(n => [n.id, [n.x, n.y]]))
  for (const t of scene.tracks) positions.set(t.player, trackPosition(t, seconds))
  const contacts = scene.contacts.filter(c => seconds >= c.start && seconds <= c.end)
  const locked = new Set<string>()
  // Active blocks are a coupled constraint: neither player can translate through the other.
  const anchors = new Map<string, Point[]>()
  for (const c of contacts) {
    for (const id of [c.a, c.b]) {
      const values = anchors.get(id) ?? []
      values.push(contactAnchor(scene,c,id,seconds))
      anchors.set(id, values); locked.add(id)
    }
  }
  for (const [id, values] of anchors) positions.set(id, [values.reduce((n, p) => n + p[0], 0) / values.length, values.reduce((n, p) => n + p[1], 0) / values.length])
  // Non-contact players keep a body-width corridor. This is deterministic even when scrubbing backwards.
  if (seconds > .35) for (let iteration = 0; iteration < 3; iteration++) {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], p = positions.get(a.id)!, q = positions.get(b.id)!
      if (locked.has(a.id) && locked.has(b.id)) continue
      const distance = Math.hypot(q[0] - p[0], q[1] - p[1]), radius = 23
      if (distance >= radius) continue
      const dx = distance > .01 ? (q[0] - p[0]) / distance : (i % 2 ? -1 : 1)
      const dy = distance > .01 ? (q[1] - p[1]) / distance : 0
      const displacement = radius - distance
      const shareA = locked.has(a.id) ? 0 : locked.has(b.id) ? 1 : .5
      const shareB = locked.has(b.id) ? 0 : locked.has(a.id) ? 1 : .5
      positions.set(a.id, [clamp(p[0] - dx * displacement * shareA, 40, 855), clamp(p[1] - dy * displacement * shareA, 35, 520)])
      positions.set(b.id, [clamp(q[0] + dx * displacement * shareB, 40, 855), clamp(q[1] + dy * displacement * shareB, 35, 520)])
    }
  }
  let ball: Point | undefined
  if (scene.ball) {
    const pass = scene.ball
    const origin = positions.get(pass.from)!, destination = positions.get(pass.to)!
    if (seconds < pass.release) ball = origin
    else if (seconds >= pass.arrival) ball = pass.target ?? destination
    else {
      const sourceTrack = scene.tracks.find(t => t.player === pass.from)
      const targetTrack = scene.tracks.find(t => t.player === pass.to)
      const release = sourceTrack ? trackPosition(sourceTrack, pass.release) : origin
      const catchPoint = pass.target ?? (targetTrack ? trackPosition(targetTrack, pass.arrival) : destination)
      ball = lerp(release, catchPoint, (seconds - pass.release) / (pass.arrival - pass.release))
    }
  }
  const caption = [...scene.beats].reverse().find(b => b.at <= seconds)?.text ?? ''
  const phase = seconds < .35 ? 'PRE-SNAP' : seconds < 1.35 ? 'SNAP' : seconds < 3.4 ? 'DEVELOPMENT' : 'RESULT'
  return { positions, contacts, areas: scene.areas.filter(a => seconds >= a.start && seconds <= a.end), reads: scene.reads.filter(r => seconds >= r.start && seconds <= r.end), ball, caption, phase, seconds }
}
