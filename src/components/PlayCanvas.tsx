import { useEffect, useMemo, useState } from 'react'
import type { Ref, SVGProps } from 'react'
import type { BlueprintNode } from '../data/blueprints'
import type { PlayScene } from '../data/playModel'
import { samplePlay } from '../data/playEngine'
import { arrowGeometry, type Point } from '../data/vectorGeometry'
import { useMotionPreference } from '../useMotionPreference'
import '../field.css'

export type PlayCanvasProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  offensiveNodes: BlueprintNode[]
  defensiveNodes: BlueprintNode[]
  scene?: PlayScene
  /** The shared play clock, normalized from zero to one. Omit for hover playback. */
  progress?: number
  active?: boolean
  replay?: number
  preview?: boolean
  grid?: boolean
  renderPlayers?: boolean
  svgRef?: Ref<SVGSVGElement>
}

function Player({ node, at, ghost = false, endpoint = false, moving = false }: { node: BlueprintNode; at: Point; ghost?: boolean; endpoint?: boolean; moving?: boolean }) {
  return <g data-player={node.id} data-team={node.team}
    className={`blueprint-node team-${node.team}${node.focus ? ' focused' : ''}${ghost ? ' blueprint-origin' : ''}${endpoint ? ' blueprint-endpoint' : ''}${moving ? ' blueprint-moving' : ''}`}
    transform={`translate(${at[0]} ${at[1]})`}>
    {node.team === 'defense'
      ? <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" className="blueprint-x" />
      : <circle r="15" className="blueprint-o" />}
    {node.showLabel && !ghost && !endpoint && <text className="blueprint-label" y="-26" textAnchor="middle">{node.label}</text>}
  </g>
}

/** Both sides share one sampled clock. The game can reuse the SVG shell with its own sampled actors. */
export default function PlayCanvas({ offensiveNodes, defensiveNodes, scene, progress, active = false, replay = 0, preview = progress !== undefined,
  grid = true, renderPlayers = true, svgRef, children, className = '', viewBox = '35 25 830 505', ...svgProps }: PlayCanvasProps) {
  const reduced = useMotionPreference()
  const [hoverProgress, setHoverProgress] = useState(0)
  const controlled = progress !== undefined
  useEffect(() => {
    if (controlled || !scene) return
    setHoverProgress(0)
    if (!active) return
    if (reduced) { setHoverProgress(1); return }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / (scene.duration * 1000))
      setHoverProgress(next)
      if (next < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, replay, scene, reduced, controlled])
  const amount = Math.min(1, Math.max(0, progress ?? hoverProgress))
  const seconds = amount * (scene?.duration ?? 0)
  const frame = useMemo(() => scene ? samplePlay(scene, seconds) : undefined, [scene, seconds])
  const nodes = useMemo(() => [...offensiveNodes, ...defensiveNodes], [offensiveNodes, defensiveNodes])
  const byId = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes])
  const tracks = useMemo(() => scene?.tracks.map(track => ({ track, geometry: arrowGeometry(track.frames.map(key => key.pos), 18) })) ?? [], [scene])
  const { teachingPlayers, engagedPlayers } = useMemo(() => {
    const primary = new Set(nodes.filter(node => node.focus).map(node => node.id))
    scene?.reads.forEach(read => primary.add(read.to))
    if (scene?.ball) primary.add(scene.ball.to)
    const teachingPlayers = new Set(primary)
    const engagedPlayers = new Set<string>()
    scene?.contacts.forEach(contact => {
      engagedPlayers.add(contact.a); engagedPlayers.add(contact.b)
      if (primary.has(contact.a)) teachingPlayers.add(contact.b)
      if (primary.has(contact.b)) teachingPlayers.add(contact.a)
    })
    return { teachingPlayers, engagedPlayers }
  }, [scene, nodes])
  const labelledContact = frame?.contacts.map(contact => ({
    contact,
    weight: [contact.a, contact.b].reduce((sum, id) => sum + (byId.get(id)?.focus ? 8 : 0)
      + (id === scene?.ball?.to ? 6 : 0) + (teachingPlayers.has(id) ? 2 : 0), 0),
  })).filter(item => item.weight > 0).sort((a, b) => b.weight - a.weight)[0]?.contact
  const pos = (id: string): Point => frame?.positions.get(id) ?? [byId.get(id)?.x ?? 450, byId.get(id)?.y ?? 355]
  const labelPosition = (text: string, anchor: Point, preferred: number): Point => {
    const width = Math.min(520, text.length * 8.5)
    let best: Point = anchor, score = Infinity
    for (const dy of [preferred, -32, 38, -68, 74, -108, 112]) for (const dx of [0, -90, 90, -170, 170]) {
      const point: Point = [Math.max(48 + width / 2, Math.min(852 - width / 2, anchor[0] + dx)), Math.max(60, Math.min(500, anchor[1] + dy))]
      const collisions = nodes.filter(node => {
        const at = pos(node.id)
        return Math.abs(at[0] - point[0]) < width / 2 + 21 && at[1] > point[1] - 38 && at[1] < point[1] + 22
      }).length
      const cost = collisions * 10000 + Math.abs(dy - preferred) + Math.abs(dx) * .5
      if (cost < score) { best = point; score = cost }
    }
    return best
  }
  const focused = nodes.some(node => node.focus)
  const labelled = svgProps.role || svgProps['aria-label'] || svgProps['aria-labelledby']
  return <svg ref={svgRef} viewBox={viewBox} aria-hidden={labelled ? undefined : true} {...svgProps}
    data-blueprint={scene?.id} data-play-phase={frame?.phase} data-play-seconds={seconds.toFixed(3)}
    className={`toy-field blueprint-field play-canvas${active ? ' blueprint-active' : ''}${preview ? ' blueprint-preview' : ''}${focused ? ' has-focus' : ''} ${className}`}>
    {grid && <path d="M 55 95 H 845 M 55 195 H 845 M 55 295 H 845 M 55 395 H 845 M 55 495 H 845" className="mini-grid" />}
    {renderPlayers && <>
      {frame?.areas.map((area, index) => <g className={`play-area ${area.tone ?? 'lane'}`} key={`${area.label}-${index}`}>
        <rect x={area.x} y={area.y} width={area.width} height={area.height} rx="12" />
        <text x={area.x + area.width / 2} y={area.y - 11} textAnchor="middle">{area.label}</text>
      </g>)}
      {tracks.map(({ track, geometry }) => {
        const node = byId.get(track.player)
        if (!node || !geometry.shaft) return null
        // Bodies and contact seals explain ordinary protection; reserve the path ink for the lesson.
        if (engagedPlayers.has(node.id) && !teachingPlayers.has(node.id)) return null
        const visited = track.frames.filter(key => key.at < seconds).map(key => key.pos)
        const trail = seconds > (track.frames[0]?.at ?? 0) ? [...visited, pos(track.player)] : []
        const ink = arrowGeometry(trail, 18)
        const dashed = track.dashed || node.team === 'defense'
        return <g key={track.player} className={`blueprint-route team-${node.team}${dashed ? ' is-dashed' : ''}`}>
          <path d={geometry.shaft} className="blueprint-guide" />
          <polygon points={geometry.cap} className="blueprint-cap blueprint-guide-cap" />
          {amount > 0 && ink.shaft && <path d={ink.shaft} className="blueprint-ink" />}
        </g>
      })}
      {defensiveNodes.map(node => {
        const track = scene?.tracks.find(track => track.player === node.id)
        const end = track?.frames.at(-1)?.pos
        return end && Math.hypot(end[0] - node.x, end[1] - node.y) > 20
          ? <Player key={`end-${node.id}`} node={node} at={end} endpoint /> : null
      })}
      {amount > 0 && nodes.map(node => {
        const current = pos(node.id)
        if (node.team !== 'defense' && engagedPlayers.has(node.id) && !teachingPlayers.has(node.id)) return null
        return Math.hypot(current[0] - node.x, current[1] - node.y) > 3
          ? <Player key={`origin-${node.id}`} node={node} at={[node.x, node.y]} ghost /> : null
      })}
      {frame?.reads.map((read, index) => {
        const from = pos(read.from), to = pos(read.to)
        const middle: Point = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
        const label = labelPosition(read.label, middle, -24)
        return <g className="play-read" key={`${read.from}-${read.to}-${index}`}>
          <path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} />
          <text x={label[0]} y={label[1]} textAnchor="middle">{read.label}</text>
        </g>
      })}
      {nodes.map(node => <Player key={node.id} node={node} at={pos(node.id)} moving={amount > 0} />)}
      {frame?.contacts.map((contact, index) => {
        const a = pos(contact.a), b = pos(contact.b), mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
        const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1
        const x = -dy / length * 13, y = dx / length * 13
        const label = contact === labelledContact
        const labelAt = label ? labelPosition(contact.label, mid, 45) : mid
        return <g className="play-contact" key={`${contact.a}-${contact.b}-${index}`} data-contact={`${contact.a}:${contact.b}`}>
          <path d={`M ${mid[0] - x} ${mid[1] - y} L ${mid[0] + x} ${mid[1] + y}`} />
          <circle cx={mid[0]} cy={mid[1]} r="14" />
          {label && <text x={labelAt[0]} y={labelAt[1]} textAnchor="middle">{contact.label}</text>}
        </g>
      })}
      {frame?.ball && <g className="play-ball" transform={`translate(${frame.ball[0]} ${frame.ball[1]})`}>
        <ellipse rx="8" ry="5" transform="rotate(-32)" /><path d="M -3 1 L 3 -2" />
      </g>}
    </>}
    {children}
  </svg>
}
