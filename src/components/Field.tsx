import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { blueprintFor, type BlueprintNode, type BlueprintPath } from '../data/blueprints'
import { arrowGeometry, positionAlong } from '../data/vectorGeometry'
import type { Concept, Side } from '../data/types'
import { useMotionPreference } from '../useMotionPreference'
import '../field.css'

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

function Node({ node, x = node.x, y = node.y, endpoint = false, moving = false, dim = false }: { node: BlueprintNode; x?: number; y?: number; endpoint?: boolean; moving?: boolean; dim?: boolean }) {
  return <g className={`blueprint-node team-${node.team}${node.focus ? ' focused' : ''}${endpoint ? ' blueprint-endpoint' : ''}${moving ? ' blueprint-moving' : ''}${dim ? ' blueprint-origin' : ''}`} transform={`translate(${x} ${y})`}>
    {node.team === 'defense'
      ? <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" className="blueprint-x" />
      : <circle r="15" className="blueprint-o" />}
    {node.showLabel && !endpoint && !moving && <text className="blueprint-label" y="-28" textAnchor="middle">{node.label}</text>}
  </g>
}

export default function Field({ concept, active, replay, progress }: { concept: Concept; active: boolean; replay: number; progress?: number }) {
  const reduced = useMotionPreference()
  const blueprint = useMemo(() => blueprintFor(concept), [concept.id])
  const isPreview = progress !== undefined
  const amount = Math.min(1, Math.max(0, progress ?? 0))
  const routes = useMemo(() => blueprint.paths.map(route => ({ route, geometry: arrowGeometry(route.points, blueprint.routeOnly ? 24 : 19) })), [blueprint])
  const moving = new Map<string, BlueprintPath>()
  blueprint.paths.filter(route => !route.branch).forEach(route => { if (!moving.has(route.player)) moving.set(route.player, route) })
  const hasFocus = blueprint.nodes.some(node => node.focus)
  return <svg className={`toy-field blueprint-field ${blueprint.routeOnly ? 'route-glyph' : 'alignment-field'} ${active ? 'blueprint-active' : ''} ${hasFocus ? 'has-focus' : ''} ${isPreview ? 'blueprint-preview' : ''} side-${concept.side}`}
    viewBox={blueprint.routeOnly ? '80 25 740 500' : '35 25 830 505'} aria-hidden="true" data-blueprint={concept.id}>
    <path d="M 55 95 H 845 M 55 195 H 845 M 55 295 H 845 M 55 395 H 845 M 55 495 H 845" className="mini-grid" />
    {blueprint.zones?.map((zone, i) => <rect key={`z${i}`} {...{ x: zone.x, y: zone.y, width: zone.width, height: zone.height }} className="blueprint-zone" rx="14" />)}
    {blueprint.lanes?.map((lane, i) => <g key={`l${i}`}><rect {...{ x: lane.x, y: lane.y, width: lane.width, height: lane.height }} className="blueprint-lane" rx="9" />{lane.label && <text className="blueprint-gap-label" x={lane.x + lane.width / 2} y={lane.y - 14} textAnchor="middle">{lane.label}</text>}</g>)}
    {routes.map(({ route, geometry }, i) => <g key={`${route.player}-${i}`} className={`blueprint-route team-${route.team}${route.dashed ? ' is-dashed' : ''}`}>
      <path d={geometry.shaft} className="blueprint-guide" />
      {/* A filled cap, with no outline. The butt-ended shaft stops exactly at its base. */}
      <polygon points={geometry.cap} className="blueprint-cap blueprint-guide-cap" />
      {active && !route.dashed && <motion.path key={replay} d={geometry.shaft} className="blueprint-ink"
        initial={{ pathLength: reduced || isPreview ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced || isPreview ? 0 : .72, ease: [.22, 1, .36, 1] }} />}
      {active && !route.dashed && <motion.polygon key={`cap-${replay}`} points={geometry.cap} className="blueprint-cap blueprint-ink-cap"
        initial={{ opacity: reduced || isPreview ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: .12, delay: reduced || isPreview ? 0 : .55 }} />}
    </g>)}
    {blueprint.paths.filter(route => route.team === 'defense').map((route, i) => {
      const node = blueprint.nodes.find(node => node.id === route.player)!
      const end = route.points.at(-1)!
      return <Node key={`end-${i}`} node={node} x={end[0]} y={end[1]} endpoint />
    })}
    {blueprint.nodes.map(node => <Node key={node.id} node={node} dim={isPreview && amount > .01 && node.team !== 'defense' && moving.has(node.id)} />)}
    {isPreview && amount > .001 && blueprint.nodes.filter(node => moving.has(node.id)).map(node => {
      const assignment = moving.get(node.id)!
      const delay = assignment.delay ?? 0
      const point = positionAlong(assignment.points, Math.max(0, (amount - delay) / (1 - delay)))
      return <Node key={`moving-${node.id}`} node={node} x={point[0]} y={point[1]} moving />
    })}
  </svg>
}
