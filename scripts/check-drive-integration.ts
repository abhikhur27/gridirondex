import assert from 'node:assert/strict'
import { advanceDrive, driveLookSeed, newDrive } from '../src/game/drive.ts'
import { lookForLevel, receiversFor, routePreset, runRoutePreset, simulate, frameAt, FIELD, qbStartFor, qbPreset } from '../src/game/engine.ts'
import type { FormationId, Personnel, RouteName, Routes, RunScheme } from '../src/game/model.ts'

// A small set of ordinary calls must be enough to construct a real scoring drive.
// No direct yardage fixtures, state mutation, or guaranteed-win branch in the engine.
const passing: RouteName[][] = [
  ['Slant', 'Post', 'Out', 'Block', 'Drag'], ['Go', 'Out', 'Post', 'Flat', 'Curl'],
  ['Comeback', 'Post', 'Flat', 'Block', 'Out'], ['Drag', 'Slant', 'Curl', 'Block', 'Post'],
  ['Out', 'Out', 'Block', 'Post', 'Post'], ['Post', 'Curl', 'Out', 'Wheel', 'Drag'],
]
let completions = 0, runs = 0, touchdowns = 0
for (const seed of [7, 42, 123]) {
  let drive = newDrive(seed)
  while (drive.status === 'active' && drive.plays < 18) {
    const look = lookForLevel(driveLookSeed(drive), 1 + Math.floor(drive.plays / 3))
    const candidates = []
    for (const [personnel, formation] of [['11', 'spread'], ['10', 'bunch-right'], ['12', 'inline']] as [Personnel, FormationId][]) {
      const receivers = receiversFor(personnel, formation)
      for (const names of passing) {
        const routes = Object.fromEntries(receivers.map((receiver, index) => [receiver.id, routePreset(receiver, names[index])])) as Routes
        for (const side of ['stay', 'left', 'right'] as const) candidates.push(simulate(look, personnel, routes, look.rushSide, { formation, qbRoute: qbPreset(qbStartFor(personnel, formation), side), yardsToGoal: 100 - drive.fieldPosition }))
      }
      for (const runScheme of ['Zone Read', 'Power', 'Draw', 'Counter'] as RunScheme[]) for (const runSide of ['left', 'right'] as const) {
        const routes = Object.fromEntries(receivers.map(r => [r.id, r.id === 'RB' ? runRoutePreset(r.start, runScheme, runSide) : [r.start]])) as Routes
        candidates.push(simulate(look, personnel, routes, 'balanced', { formation, kind: 'run', runScheme, runSide, yardsToGoal: 100 - drive.fieldPosition }))
      }
    }
    const best = candidates.sort((a, b) => b.gain - a.gain)[0]
    const final = frameAt(best, best.catchTime)
    if (best.outcome === 'complete') completions++
    if (best.outcome === 'run' || best.outcome === 'qb-run') runs++
    assert.ok(Math.abs(final.ball.x - best.catchPoint.x) < .01 && Math.abs(final.ball.y - best.catchPoint.y) < .01, 'The ball reaches the credited outcome')
    assert.ok(Math.abs(Math.min((FIELD.los - best.catchPoint.y) / 12, 100 - drive.fieldPosition) - best.gain) < .01, 'Awarded gain equals the animated ball position, capped at the goal for end-zone catches')
    drive = advanceDrive(drive, best)
  }
  assert.equal(drive.status, 'touchdown', `Seed ${seed}: ordinary preset calls must be capable of a full scoring drive; ended ${drive.status} at ${drive.fieldPosition}`)
  assert.equal(drive.fieldPosition, 100)
  assert.ok(Math.abs(drive.history.reduce((total, play) => total + play.gain, 0) - 75) < 1e-8, 'The complete drive credits exactly 75 yards')
  touchdowns++
}
console.log(`Drive integration: ${touchdowns} complete 75-yard drives from simulated plays; ${completions} passes and ${runs} runs; ball/outcome agreement passed.`)
