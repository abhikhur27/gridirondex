import { useMemo } from 'react'
import { sceneFor } from '../data/playScenes'
import type { Concept, Side } from '../data/types'
import PlayCanvas from './PlayCanvas'
export function Alignment({ side }: { side: Side }) {
  const positions = side === 'offense'
    ? [[30, 103], [84, 118], [126, 103], [150, 103], [174, 103], [198, 103], [222, 103], [269, 103], [301, 118], [174, 145], [131, 151]]
    : side === 'special'
      ? [[30, 75], [86, 75], [130, 75], [174, 75], [218, 75], [262, 75], [305, 75], [137, 119], [174, 119], [211, 119], [174, 165]]
      : [[35, 101], [301, 101], [120, 102], [150, 102], [183, 102], [218, 102], [85, 69], [151, 67], [221, 69], [123, 28], [231, 28]]
  return <svg viewBox="0 0 336 180" className="alignment" aria-hidden="true">{positions.map(([x, y], i) => side !== 'defense'
    ? <circle key={i} cx={x} cy={y} r="7.5" fill="none" stroke="currentColor" strokeWidth="4" />
    : <path key={i} d={`M ${x - 6} ${y - 6} L ${x + 6} ${y + 6} M ${x + 6} ${y - 6} L ${x - 6} ${y + 6}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />)}</svg>
}

export default function Field({ concept, active, replay, progress, onNavigatePosition }: { concept: Concept; active: boolean; replay: number; progress?: number; onNavigatePosition?: (slug: string) => void }) {
  const scene = useMemo(() => sceneFor(concept), [concept.id])
  return <PlayCanvas offensiveNodes={scene.offensiveNodes} defensiveNodes={scene.defensiveNodes} scene={scene}
    active={active} replay={replay} progress={progress} onNavigatePosition={onNavigatePosition} className={`alignment-field side-${concept.side}`} />
}
