import assert from 'node:assert/strict'
import { concepts } from '../src/data/concepts.ts'
import { sceneFor } from '../src/data/playScenes.ts'
import { positionForNode } from '../src/data/positionNavigation.ts'
import { positionProfiles, positionProfileBySlug } from '../src/data/positionProfiles.ts'
import type { BlueprintNode } from '../src/data/blueprints.ts'

const conceptIds = new Set(concepts.map(concept => concept.id))
assert.equal(positionProfileBySlug.size, positionProfiles.length, 'Unique position URLs')
let players = 0
for (const concept of concepts) {
  const scene = sceneFor(concept)
  for (const node of [...scene.offensiveNodes, ...scene.defensiveNodes]) {
    const slug = positionForNode(node, scene.id)
    assert.ok(positionProfileBySlug.has(slug), `${concept.id}/${node.id}: missing ${slug}`)
    players++
  }
}
for (const profile of positionProfiles) {
  assert.ok(conceptIds.has(profile.lesson), `${profile.slug}: example lesson exists`)
  for (const id of profile.related) assert.ok(conceptIds.has(id), `${profile.slug}: ${id} related lesson exists`)
  const scene = sceneFor({ id: profile.lesson })
  assert.ok([...scene.offensiveNodes, ...scene.defensiveNodes].some(node => positionForNode(node, scene.id) === profile.slug), `${profile.slug}: example includes the position`)
}
const expect = (sceneId: string, id: string, slug: string) => {
  const scene = sceneFor({ id: sceneId })
  const node = [...scene.offensiveNodes, ...scene.defensiveNodes].find(node => node.id === id)!
  assert.ok(node, `${sceneId}: ${id} exists`)
  assert.equal(positionForNode(node, sceneId), slug, `${sceneId}/${id}`)
}
for (const [scene, id, slug] of [
  ['chip', 'Y', 'tight-end'], ['personnel-12', 'H', 'tight-end'], ['personnel-22', 'Z', 'tight-end'],
  ['personnel-21', 'H', 'fullback'], ['formation-flexbone', 'RB', 'fullback'], ['formation-flexbone', 'H', 'slot-back'],
  ['formation-wishbone', 'Z', 'running-back'], ['formation-empty', 'RB', 'wide-receiver'], ['personnel-00', 'Y', 'wide-receiver'],
  ['inside-zone', 'H', 'h-back'], ['cover-3', 'N', 'nickel'], ['fit-two-gap', 'N', 'nose'], ['fit-two-gap', 'NICK', 'nickel'],
  ['personnel-12', 'N', 'sam'], ['3-4', 'SS', 'outside-linebacker'], ['3-4', 'M', 'strong-safety'], ['dollar', 'M', 'defensive-back'],
  ['fg-block-safe', 'C', 'long-snapper'], ['fg-block-safe', 'HOLD', 'holder'], ['fg-block-safe', 'K', 'kicker'],
  ['punt-pro', 'C', 'long-snapper'], ['punt-spread', 'S2', 'punt-protector'], ['punt-gunner', 'GL', 'gunner'],
  ['punt-gunner', 'J2', 'punt-jammer'], ['punt-return-wall', 'RET', 'returner'], ['punt-return-wall', 'P', 'punter'],
  ['punt-return-wall', 'B2', 'return-blocker'], ['punt-return-wall', 'C2', 'punt-coverage'],
] as const) expect(scene, id, slug)
const gameNode = (id: string, label: string, team: BlueprintNode['team'] = 'offense') => ({ id, label, team })
assert.equal(positionForNode(gameNode('H', 'tight end')), 'tight-end')
assert.equal(positionForNode(gameNode('RB', 'receiver')), 'wide-receiver')
assert.equal(positionForNode(gameNode('RB', 'slot receiver')), 'slot')
assert.equal(positionForNode(gameNode('Y', 'receiver')), 'wide-receiver')
assert.equal(positionForNode(gameNode('D2', 'D2', 'defense')), 'defensive-tackle')
assert.equal(positionForNode(gameNode('B1', 'B1', 'defense')), 'linebacker')
console.log(`Positions checked: ${positionProfiles.length} profiles, ${players} players across ${concepts.length} lessons; personnel and special-team overrides pass.`)
