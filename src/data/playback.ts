import type { PlayScene } from './playModel.ts'

// Simulation seconds remain exact; default playback gives the eye twice as long.
export const DEFAULT_PLAYBACK_RATE = .5
export const PLAYBACK_RATES = [.25, .5, 1] as const
export function playSteps(scene: PlayScene) {
  const firstContact = Math.min(...scene.contacts.map(c => c.start).filter(t => t > .35), .8)
  return [
    { name: 'PRE-SNAP', seconds: 0 },
    { name: 'MOTION / RELEASE', seconds: scene.tracks.some(t => t.presnap) ? .15 : .4 },
    { name: 'SNAP / CONTACT', seconds: Math.max(.45, firstContact) },
    { name: 'BREAK / DROP', seconds: 1.5 },
    { name: 'RESULT', seconds: scene.duration },
  ]
}
export function playKeyframes(scene: PlayScene) {
  return [...new Set([0, .35, ...scene.tracks.flatMap(track => track.frames.map(frame => frame.at)), ...scene.beats.map(b => b.at), ...scene.contacts.flatMap(c => [c.start, c.end]), ...(scene.ball ? [scene.ball.release, scene.ball.arrival] : []), ...playSteps(scene).map(s => s.seconds), scene.duration])].filter(at => at >= 0 && at <= scene.duration).sort((a,b)=>a-b)
}
export function adjacentKeyframe(scene: PlayScene, seconds: number, direction: -1 | 1) {
  const keys = playKeyframes(scene)
  return direction > 0 ? keys.find(t => t > seconds + .005) ?? scene.duration : [...keys].reverse().find(t => t < seconds - .005) ?? 0
}
