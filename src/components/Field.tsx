import { motion, useReducedMotion } from 'framer-motion'
import { offense, defense, routesFor, defensiveRoutes, zones } from '../data/diagrams'
import type { Concept, Side } from '../data/types'

const routeGlyphs: Record<string, string[]> = {
  flat: ['M 75 126 V 100 Q 75 91 65 91 H 28'],
  slant: ['M 52 126 V 88 L 133 28'],
  comeback: ['M 100 126 V 24 L 69 58'],
  curl: ['M 99 126 V 40 Q 99 25 87 25 Q 74 25 74 41 V 52'],
  out: ['M 129 126 V 57 Q 129 47 119 47 H 40'],
  dig: ['M 55 126 V 55 Q 55 45 65 45 H 148'],
  corner: ['M 111 126 V 77 Q 111 66 103 58 L 56 19'],
  post: ['M 61 126 V 77 Q 61 66 70 57 L 129 15'],
  go: ['M 98 126 V 16'],
  wheel: ['M 66 126 L 40 109 Q 31 101 40 95 L 73 79 Q 84 73 84 61 V 17'],
  angle: ['M 67 126 L 44 101 Q 37 94 44 87 L 132 24'],
  option: ['M 83 126 V 60 Q 83 49 95 49 H 145', 'M 83 60 Q 83 49 72 49 H 32'],
  'mesh-crossers': ['M 45 126 V 82 Q 45 72 56 72 H 151', 'M 149 126 V 55 Q 149 45 137 45 H 40'],
}

export function Alignment({ side }: { side: Side }) {
  const positions = side === 'offense'
    ? [[30, 103], [84, 118], [126, 103], [150, 103], [174, 103], [198, 103], [222, 103], [269, 103], [301, 118], [174, 145], [131, 151]]
    : [[35, 101], [301, 101], [120, 102], [150, 102], [183, 102], [218, 102], [85, 69], [151, 67], [221, 69], [123, 28], [231, 28]]
  return <svg viewBox="0 0 336 180" className="alignment" aria-hidden="true">{positions.map(([x, y], i) => side === 'offense'
    ? <circle key={i} cx={x} cy={y} r="7.5" fill="none" stroke="currentColor" strokeWidth="4" />
    : <path key={i} d={`M ${x - 6} ${y - 6} L ${x + 6} ${y + 6} M ${x + 6} ${y - 6} L ${x - 6} ${y + 6}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />)}</svg>
}

export default function Field({ concept, active, replay }: { concept: Concept; active: boolean; replay: number }) {
  const reduced = useReducedMotion()
  const glyph = concept.category === 'Route tree' ? routeGlyphs[concept.id] : undefined
  const id = `arrow-${concept.side}-${concept.id.replace(/[^a-z0-9-]/gi, '')}`
  const segment = (d: string, index: number, keyRoute = false) => <g key={index} className={keyRoute ? 'key-route' : ''}>
    <path d={d} className="path-guide" markerEnd={`url(#${id})`} />
    {active && <motion.path key={replay} d={d} className="path-ink" markerEnd={`url(#${id})`}
      initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .72, ease: [.22, 1, .36, 1] }} />}
  </g>
  if (glyph) return <svg className="toy-field route-glyph" viewBox="0 0 190 150" aria-hidden="true">
    <defs><marker id={id} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M 3 2 L 8 6 L 3 10" /></marker></defs>
    <path d="M 23 30 H 167 M 23 65 H 167 M 23 100 H 167 M 23 135 H 167" className="mini-grid" />
    {glyph.map((d, i) => segment(d, i))}
    {glyph.map((d, i) => { const [, x, y] = d.match(/^M (\d+) (\d+)/)!; return <circle className="node-o" key={i} cx={x} cy={y} r="7" /> })}
  </svg>

  const coverage = concept.coverage ?? (concept.id === 'four-verticals' ? 'Cover 3' : concept.id === 'smash' ? 'Cover 2' : 'Cover 1')
  const players = offense(concept), defenders = defense(coverage, concept)
  const routes = concept.side === 'defense' ? defensiveRoutes(coverage, concept) : routesFor(concept)
  return <svg className="toy-field alignment-field" viewBox="0 0 900 550" aria-hidden="true">
    <defs><marker id={id} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="24" markerHeight="24" markerUnits="userSpaceOnUse" orient="auto"><path d="M 3 2 L 8 6 L 3 10" /></marker></defs>
    <path d="M 50 95 H 850 M 50 195 H 850 M 50 295 H 850 M 50 395 H 850 M 50 495 H 850" className="mini-grid" />
    {concept.side === 'defense' && zones(coverage).map((zone, i) => <rect key={i} className="toy-zone" x={zone.x} y={zone.y} width={zone.width - 6} height={zone.height} rx="15" />)}
    {routes.map((route, i) => segment(route.d, i, route.color === 'amber'))}
    {players.map(player => <circle key={player.id} className="node-o" cx={player.x} cy={player.y} r="17" />)}
    {defenders.map(player => <path key={player.id} className="node-x" d={`M ${player.x - 13} ${player.y - 13} L ${player.x + 13} ${player.y + 13} M ${player.x + 13} ${player.y - 13} L ${player.x - 13} ${player.y + 13}`} />)}
  </svg>
}
