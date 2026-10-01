import { offensiveScene } from './offensivePlays.ts'
import { defensiveScene } from './defensivePlays.ts'
import type { PlayScene } from './playModel.ts'
import { prepareScene } from './playEngine.ts'
const cache = new Map<string, PlayScene>()
export function sceneFor(concept: { id: string }): PlayScene {
  let scene = cache.get(concept.id)
  if (!scene) {
    scene = offensiveScene(concept.id) ?? defensiveScene(concept.id)
    if (!scene) throw new Error(`Missing contextual play: ${concept.id}`)
    prepareScene(scene)
    cache.set(concept.id, scene)
  }
  return scene
}
