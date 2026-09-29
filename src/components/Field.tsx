import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus, RotateCcw, Move, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { defense, defensiveRoutes, offense, routesFor, zones } from '../data/diagrams'
import type { Player, Route } from '../data/diagrams'
import type { Concept, Coverage } from '../data/types'

interface Props { concept: Concept; coverage: Coverage; progress: number; showDefense: boolean; showLabels: boolean }
const colors = { cyan: 'var(--color-accent)', amber: 'var(--color-amber)', red: 'var(--color-defense)' }

function AssignmentRoute({ route, player, progress, focused, dimmed, selected, replay, reduced, onSelect, onHover }:
  { route: Route; player: Player; progress: number; focused: boolean; dimmed: boolean; selected: boolean; replay: number; reduced: boolean; onSelect: () => void; onHover: (value: boolean) => void }) {
  return <motion.g className={`assignment-route ${focused ? 'focused' : ''} ${selected ? 'selected' : ''}`} data-player={route.player}
    animate={{ opacity: dimmed ? .16 : 1 }} transition={{ duration: reduced ? 0 : .18 }}
    role="button" tabIndex={0} aria-label={`${player.label} route: ${route.label ?? player.assignment}`} aria-pressed={selected}
    onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)} onFocus={() => onHover(true)} onBlur={() => onHover(false)}
    onClick={e => { e.stopPropagation(); onSelect() }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}>
    <path d={route.d} className="route-ghost" stroke={colors[route.color]} markerEnd={route.block ? 'url(#block)' : `url(#arrow-${route.color})`} />
    <path d={route.d} pathLength="1" className="route-path" stroke={colors[route.color]} strokeDasharray="1" strokeDashoffset={1 - progress} />
    {selected && <motion.path key={replay} d={route.d} className="route-selection" stroke={colors[route.color]}
      initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .9, ease: [.22, 1, .36, 1] }} />}
    <path d={route.d} className="route-hit" />
  </motion.g>
}

function PlayerNode({ player, selected, dimmed, onSelect, onHover, labels, reduced }:
  { player: Player; selected: boolean; dimmed: boolean; onSelect: () => void; onHover: (value: boolean) => void; labels: boolean; reduced: boolean }) {
  const defensive = player.team === 'defense'
  return <motion.g className={`player ${defensive ? 'defensive' : 'offensive'} ${selected ? 'selected' : ''}`} role="button" tabIndex={0}
    aria-label={`${player.label}: ${player.assignment}`} aria-pressed={selected} animate={{ opacity: dimmed ? .22 : 1 }} transition={{ duration: reduced ? 0 : .18 }}
    onClick={e => { e.stopPropagation(); onSelect() }} onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)}
    onFocus={() => onHover(true)} onBlur={() => onHover(false)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}>
    <title>{player.label}: {player.assignment}</title>
    <circle r="23" className="player-hit" />
    {selected && <circle r="21" className="player-focus-ring" />}
    {defensive ? <path d="M -7 -7 L 7 7 M 7 -7 L -7 7" className="defense-x" /> : <circle r={player.id === 'QB' ? 15 : 13} className="player-core" />}
    {!defensive && <text textAnchor="middle" y="3.5" className="player-letter">{player.label}</text>}
    {defensive && labels && <text textAnchor="middle" y="-19" className="defense-label">{player.label}</text>}
  </motion.g>
}

function MovingPlayer({ player, route, progress, ...props }:
  { player: Player; route?: Route; progress: number } & Omit<Parameters<typeof PlayerNode>[0], 'player'>) {
  const path = useRef<SVGPathElement>(null), node = useRef<SVGGElement>(null)
  useLayoutEffect(() => {
    const point = route && path.current && progress > 0 ? path.current.getPointAtLength(path.current.getTotalLength() * progress) : player
    node.current?.setAttribute('transform', `translate(${point.x} ${point.y})`)
  }, [route?.d, progress, player.x, player.y])
  return <>{route && <path ref={path} d={route.d} fill="none" stroke="none" aria-hidden="true" />}<g ref={node}><PlayerNode player={player} {...props} /></g></>
}

export default function Field({ concept, coverage, progress, showDefense, showLabels }: Props) {
  const reduced = useReducedMotion() ?? false
  const frame = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1), [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<string | null>(null), [hovered, setHovered] = useState<string | null>(null)
  const [replay, setReplay] = useState(0)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const players = offense(concept), defenders = defense(coverage, concept)
  const routes = routesFor(concept), defenderRoutes = defensiveRoutes(coverage, concept)
  const all = [...players, ...(showDefense ? defenders : [])]
  const active = all.some(p => p.id === hovered) ? hovered : all.some(p => p.id === selected) ? selected : null
  const activePlayer = all.find(p => p.id === active)
  const activeRoute = [...routes, ...defenderRoutes].find(r => r.player === active)
  useEffect(() => { setSelected(null); setHovered(null); setZoom(1); setPan({ x: 0, y: 0 }) }, [concept.id, coverage])
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }
  const select = (id: string) => { setSelected(id); setReplay(value => value + 1) }
  const hover = (id: string, value: boolean) => setHovered(current => value ? id : current === id ? null : current)
  const changeZoom = (step: number) => setZoom(z => Math.min(1.8, Math.max(.8, Number((z + step).toFixed(1)))))
  const drawRoute = (route: Route) => {
    const player = all.find(p => p.id === route.player)
    return player && <AssignmentRoute key={`${concept.id}-${route.player}`} route={route} player={player} progress={progress}
      focused={route.player === active} dimmed={!!active && route.player !== active} selected={route.player === selected}
      replay={replay} reduced={reduced} onSelect={() => select(route.player)} onHover={value => hover(route.player, value)} />
  }

  return <div className={`field-frame ${active ? 'has-assignment' : ''} ${progress > 0 ? 'in-motion' : ''}`} ref={frame}>
    <div className="field-topline"><span>{concept.personnel ?? (concept.id === 'fullback' ? '21' : '11')} personnel <b>·</b> {concept.diagram === 'run' ? 'Singleback' : concept.personnel && concept.personnel !== '11' ? 'Sample alignment' : 'Gun, 2 × 2'}</span><span>Attacking direction ↑</span></div>
    <svg className={`football-field ${zoom !== 1 ? 'zoomed' : ''}`} viewBox="0 0 900 550" aria-label={`${concept.name} diagram against ${coverage}. Select a player or route for their assignment.`}
      onPointerDown={e => { if ((e.target as Element).closest('.player, .assignment-route')) return; setHovered(null); drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={e => { if (!drag.current) return; const scale = 900 / e.currentTarget.getBoundingClientRect().width; setPan({ x: Math.max(-250, Math.min(250, drag.current.px + (e.clientX - drag.current.x) * scale)), y: Math.max(-170, Math.min(170, drag.current.py + (e.clientY - drag.current.y) * scale)) }) }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <defs>
        <pattern id="field-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" className="field-grid-line" fill="none" /></pattern>
        {(['cyan', 'amber', 'red'] as const).map(color => <marker key={color} id={`arrow-${color}`} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M 2 2 L 9 6 L 2 10" fill="none" stroke={colors[color]} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></marker>)}
        <marker id="block" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M 6 1 L 6 11" fill="none" stroke="var(--color-accent)" strokeWidth="2.6" /></marker>
      </defs>
      <rect width="900" height="550" fill="url(#field-grid)" />
      <g className="field-drawing" transform={`translate(${450 + pan.x} ${275 + pan.y}) scale(${zoom}) translate(-450 -275)`}>
        <path d="M 55 25 V 535 M 845 25 V 535" className="sideline" />
        {[50, 150, 250, 350, 450].map((y, i) => <g key={y}><line x1="55" x2="845" y1={y} y2={y} className="yard-line" /><text x="82" y={y - 12} className="yard-number">{[10, 20, 30, 40, 50][i]}</text><text x="790" y={y - 12} className="yard-number">{[10, 20, 30, 40, 50][i]}</text></g>)}
        {Array.from({ length: 25 }, (_, i) => <g key={i}>{[[370, 380], [520, 530], [55, 65], [835, 845]].map(([x1, x2]) => <line key={x1} x1={x1} x2={x2} y1={35 + i * 20} y2={35 + i * 20} className="hash-line" />)}</g>)}
        <g className="coverage-areas" style={{ opacity: active ? .35 : 1 }}>{showDefense && zones(coverage).map((z, i) => <g key={i} className="coverage-zone"><rect x={z.x + 3} y={z.y} width={z.width - 6} height={z.height} rx="4" /><text x={z.x + z.width / 2} y={z.y + 25} textAnchor="middle">{z.label.toLowerCase()}</text></g>)}</g>
        <line x1="55" x2="845" y1="385" y2="385" className="scrimmage-line" />
        <text x="61" y="377" className="scrimmage-label">Line of scrimmage</text>
        {routes.map(drawRoute)}
        {activePlayer?.team === 'defense' && activeRoute && drawRoute(activeRoute)}
        {showLabels && routes.filter(r => r.label).map(route => { const p = players.find(p => p.id === route.player); return p && <text key={route.player} x={p.x + 22} y={p.y - 29} className={`route-label ${route.color}`} style={{ opacity: active && route.player !== active ? .2 : 1 }}>{route.label?.toLowerCase()}</text> })}
        {all.map(p => <MovingPlayer key={`${concept.id}-${p.id}`} player={p} route={(p.team === 'offense' ? routes : defenderRoutes).find(r => r.player === p.id)} progress={p.team === 'defense' ? progress * .88 : progress}
          selected={p.id === active} dimmed={!!active && p.id !== active} onSelect={() => select(p.id)} onHover={value => hover(p.id, value)} labels={showLabels} reduced={reduced} />)}
        {progress === 0 && routes.map(r => { const p = players.find(p => p.id === r.player); return p && <circle key={p.id} cx={p.x} cy={p.y + 19} r="2.4" fill={colors[r.color]} className="snap-point" /> })}
        <ellipse cx="450" cy="402" rx="3.5" ry="5.5" className="football" />
      </g>
    </svg>
    {activePlayer && <div className="assignment-tooltip" role="status"><span className={activePlayer.team}><strong>{activePlayer.label}</strong></span><div><strong>{activeRoute?.label ?? activePlayer.assignment.split(' · ')[0]}</strong><span>{activePlayer.assignment}</span></div>{selected && <button className="icon-button" aria-label="Close assignment" onClick={() => { setSelected(null); setHovered(null) }}><X size={16} /></button>}</div>}
    <div className="field-bottomline"><span><Move size={13} /> Drag to pan <b>·</b> Select a line or player</span><div className="zoom-controls"><button aria-label="Zoom out" onClick={() => changeZoom(-.1)} disabled={zoom <= .8}><Minus size={15} /></button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => changeZoom(.1)} disabled={zoom >= 1.8}><Plus size={15} /></button><button aria-label="Reset field view" onClick={reset}><RotateCcw size={15} /></button><button aria-label="Full screen field" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void frame.current?.requestFullscreen().catch(() => {}) }}><Maximize2 size={15} /></button></div></div>
  </div>
}
