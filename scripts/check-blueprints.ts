import assert from 'node:assert/strict'
import { concepts } from '../src/data/concepts.ts'
import { blueprintFor, blueprintIds } from '../src/data/blueprints.ts'
import { arrowGeometry, positionAlong, type Point } from '../src/data/vectorGeometry.ts'

const signatures = new Map<string, string>()
assert.equal(new Set(blueprintIds).size, blueprintIds.length, 'Blueprint IDs must be unique')
assert.deepEqual([...blueprintIds].sort(), concepts.map(c => c.id).sort(), 'Every lesson needs its own blueprint')
const within = ([x, y]: Point) => Number.isFinite(x) && Number.isFinite(y) && x >= 40 && x <= 855 && y >= 35 && y <= 520
for (const concept of concepts) {
  const blueprint = blueprintFor(concept)
  assert(blueprint.nodes.length > 0, `${concept.id}: missing players`)
  assert(blueprint.paths.length > 0, `${concept.id}: missing assignments`)
  assert.equal(new Set(blueprint.nodes.map(n => n.id)).size, blueprint.nodes.length, `${concept.id}: repeated player IDs`)
  blueprint.nodes.forEach(node => assert(within([node.x, node.y]), `${concept.id}: node outside field`))
  blueprint.paths.forEach(path => {
    assert(blueprint.nodes.some(node => node.id === path.player), `${concept.id}: unknown player ${path.player}`)
    assert(path.points.length >= 2 && path.points.every(within), `${concept.id}: invalid route points`)
    assert((path.delay ?? 0) >= 0 && (path.delay ?? 0) < 1, `${concept.id}: invalid timing`)
    if (path.team === 'defense') assert(path.dashed, `${concept.id}: defensive movement must be dashed`)
    const { shaft, cap, tip, base } = arrowGeometry(path.points)
    assert(shaft && cap && !shaft.includes('NaN') && !cap.includes('NaN'), `${concept.id}: invalid cap geometry`)
    const shaftEnd = shaft.match(/ L (-?[\d.e+]+) (-?[\d.e+]+)$/)
    assert(shaftEnd, `${concept.id}: shaft must end in a line`)
    assert.equal(Number(shaftEnd[1]), base[0]); assert.equal(Number(shaftEnd[2]), base[1])
    assert(Math.hypot(tip[0] - base[0], tip[1] - base[1]) > 0, `${concept.id}: shaft extends to arrow tip`)
    assert.deepEqual(positionAlong(path.points, 0), path.points[0], `${concept.id}: preview must begin at origin`)
    const end = positionAlong(path.points, 1)
    assert(Math.hypot(end[0] - tip[0], end[1] - tip[1]) < .0001, `${concept.id}: preview must reach assignment`)
  })
  // Deliberately ignore IDs, captions and labels: cosmetic renaming cannot make a duplicate pass.
  const signature = JSON.stringify({
    nodes: blueprint.nodes.map(({ x, y, team, focus }) => [x, y, team, !!focus]).sort(),
    paths: blueprint.paths.map(({ points, team, dashed, branch }) => [points, team, !!dashed, !!branch]).sort(),
    zones: blueprint.zones?.map(({ x, y, width, height }) => [x, y, width, height]),
    lanes: blueprint.lanes?.map(({ x, y, width, height }) => [x, y, width, height]),
  })
  assert(!signatures.has(signature), `${concept.id} duplicates ${signatures.get(signature)}`)
  signatures.set(signature, concept.id)
}

for (const formation of ['i', 'singleback', 'trips', 'empty', 'pistol', 'wishbone', 'flexbone']) {
  assert.equal(blueprintFor({ id: `formation-${formation}` }).nodes.length, 11, `${formation}: eleven offensive players`)
}
for (const id of blueprintIds.filter(id => id.startsWith('formation-') || id.startsWith('personnel-'))) {
  const diagram = blueprintFor({ id })
  const line = diagram.nodes.filter(node => node.team === 'offense' && node.y === 355).sort((a, b) => a.x - b.x)
  const linemen = new Set(['LT', 'LG', 'C', 'RG', 'RT'])
  assert.equal(diagram.nodes.length, 11, `${id}: eleven offensive players`)
  assert.equal(line.length, 7, `${id}: seven players on the line`)
  assert(!linemen.has(line[0].id) && !linemen.has(line.at(-1)!.id), `${id}: eligible players at both ends`)
  assert(line.slice(1, -1).every(node => linemen.has(node.id)), `${id}: no covered eligible receivers`)
  assert.equal(diagram.nodes.filter(node => node.y > 355).length, 4, `${id}: four players in the backfield`)
}
assert.equal(blueprintFor({ id: 'formation-singleback' }).nodes.filter(node => node.label === 'TE' && node.y === 355).length, 2, 'Singleback uses the stated two attached tight ends')
assert.equal(blueprintFor({ id: 'punt-spread' }).nodes.length, 11)
assert.equal(blueprintFor({ id: 'punt-pro' }).nodes.length, 11)
assert.equal(blueprintFor({ id: 'formation-wishbone' }).nodes.filter(n => n.label === 'HB').length, 2)
assert.equal(blueprintFor({ id: 'formation-flexbone' }).nodes.filter(n => n.label === 'SB').length, 2)
const fire = blueprintFor({ id: 'blitz-fire-zone' })
assert.equal(fire.paths.filter(path => path.team === 'defense' && path.points.at(-1)![1] > 350).length, 5, 'Fire zone sends five')
assert.equal(fire.paths.filter(path => path.team === 'defense' && path.points.at(-1)![1] < 150).length, 3, 'Fire zone has three deep')
for (const [id, player] of [['stunt-tex', 'ER'], ['stunt-ext', 'TR'], ['stunt-loop', 'TL']]) {
  assert(blueprintFor({ id }).paths.find(p => p.player === player)!.delay! > 0, `${id}: looper waits for penetrator`)
}
console.log(`Blueprint checks passed: ${concepts.length} unique diagrams, bounded routes, clean arrow caps, formations and defensive assignments.`)
