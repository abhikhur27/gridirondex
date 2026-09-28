import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus, RotateCcw, Move, Crosshair } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { defense, defensiveRoutes, offense, routesFor, zones } from '../data/diagrams'
import type { Player, Route } from '../data/diagrams'
import type { Concept, Coverage } from '../data/types'

interface Props { concept: Concept; coverage: Coverage; progress: number; showDefense: boolean; showLabels: boolean }
const colors = {cyan:'var(--color-accent)',amber:'var(--color-amber)',red:'var(--color-defense)'}

function AnimatedRoute({route,progress}:{route:Route;progress:number}) {
 return <g>
   <path d={route.d} className="route-ghost" stroke={colors[route.color]} markerEnd={route.block?'url(#block)':'url(#arrow-'+route.color+')'} />
   <path d={route.d} pathLength="1" className="route-path" stroke={colors[route.color]} strokeDasharray="1" strokeDashoffset={1-progress} />
 </g>
}

function MovingPlayer({player,route,progress,selected,onSelect,labels,reduced}:{player:Player;route?:Route;progress:number;selected:boolean;onSelect:()=>void;labels:boolean;reduced:boolean}) {
 const pathRef=useRef<SVGPathElement>(null)
 const nodeRef=useRef<SVGGElement>(null)
 useLayoutEffect(()=>{const point=route&&pathRef.current&&progress>0?pathRef.current.getPointAtLength(pathRef.current.getTotalLength()*progress):player;nodeRef.current?.setAttribute('transform',`translate(${point.x} ${point.y})`)},[route?.d,progress,player.x,player.y])
 return <>{route&&<path ref={pathRef} d={route.d} fill="none" stroke="none" aria-hidden="true"/>}<g ref={nodeRef}><PlayerNode player={player} x={0} y={0} selected={selected} onSelect={onSelect} labels={labels} reduced={reduced}/></g></>
}

function PlayerNode({player,x,y,selected,onSelect,labels,reduced}:{player:Player;x:number;y:number;selected:boolean;onSelect:()=>void;labels:boolean;reduced:boolean}) {
 const defensive=player.team==='defense'
 return <g transform={`translate(${x} ${y})`} className={`player ${defensive?'defensive':'offensive'} ${selected?'selected':''}`} role="button" tabIndex={0} aria-label={`${player.label}: ${player.assignment}`} onClick={e=>{e.stopPropagation();onSelect()}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect()}}}>
   <title>{player.label}: {player.assignment}</title>
   <circle r="22" className="player-hit" />
   {!defensive&&!player.line&&<motion.circle r="18" className="player-halo" animate={reduced?{}:{opacity:[.12,.35,.12],scale:[1,1.08,1]}} transition={{duration:3,repeat:Infinity,delay:player.x/900}} />}
   {player.line?<rect x="-10" y="-10" width="20" height="20" rx="3" className="player-core" />:defensive?<><circle r="13" className="defense-ring"/><path d="M -5 -5 L 5 5 M 5 -5 L -5 5" className="defense-x"/></>:<circle r={player.id==='QB'?15:12} className="player-core" />}
   {!defensive&&<text textAnchor="middle" y={player.line?4:4.5} className="player-letter">{player.label}</text>}
   {defensive&&labels&&<text textAnchor="middle" y="-22" className="defense-label">{player.label}</text>}
 </g>
}

export default function Field({concept,coverage,progress,showDefense,showLabels}:Props) {
 const reduced=useReducedMotion()??false
 const frame=useRef<HTMLDivElement>(null)
 const [zoom,setZoom]=useState(1), [pan,setPan]=useState({x:0,y:0})
 const [selected,setSelected]=useState<string|null>(null)
 const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null)
 const players=offense(concept), defenders=defense(coverage,concept), routes=routesFor(concept),defenderRoutes=defensiveRoutes(coverage,concept)
 const all=[...players,...(showDefense?defenders:[])]
 const selectedPlayer=all.find(p=>p.id===selected)
 useEffect(()=>{setSelected(null);setZoom(1);setPan({x:0,y:0})},[concept.id])
 const reset=()=>{setZoom(1);setPan({x:0,y:0})}
 const changeZoom=(step:number)=>setZoom(z=>Math.min(1.8,Math.max(.8,Number((z+step).toFixed(1)))))
 return <div className="field-frame" ref={frame}>
   <div className="field-topline"><span><span className="live-dot" /> PLAY DIAGRAM</span><span>{concept.personnel??(concept.id==='fullback'?'21':'11')} PERSONNEL <b>·</b> {concept.diagram==='run'?'SINGLEBACK':concept.personnel&&concept.personnel!=='11'?'SAMPLE ALIGNMENT':'GUN · 2×2'}</span></div>
   <div className="field-coordinate">OFFENSE ↑</div>
   <svg className={`football-field ${zoom!==1?'zoomed':''}`} viewBox="0 0 900 550" aria-label={`${concept.name} diagram against ${coverage}. Select a player for their assignment.`} onPointerDown={e=>{if((e.target as Element).closest('.player'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(drag.current){const scale=900/e.currentTarget.getBoundingClientRect().width;setPan({x:Math.max(-250,Math.min(250,drag.current.px+(e.clientX-drag.current.x)*scale)),y:Math.max(-170,Math.min(170,drag.current.py+(e.clientY-drag.current.y)*scale))})}}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
     <defs>
       <pattern id="field-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" className="field-grid-line" fill="none" /></pattern>
       {(['cyan','amber','red'] as const).map(color=><marker key={color} id={'arrow-'+color} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M 2 2 L 8 6 L 2 10" fill="none" stroke={colors[color]} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></marker>)}
       <marker id="block" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M 6 1 L 6 11" fill="none" stroke="var(--color-accent)" strokeWidth="2"/></marker>
     </defs>
     <rect width="900" height="550" fill="url(#field-grid)"/>
     <g transform={`translate(${450+pan.x} ${275+pan.y}) scale(${zoom}) translate(-450 -275)`}>
       <path d="M 55 25 V 535 M 845 25 V 535" className="sideline"/>
       {[50,150,250,350,450].map((y,i)=><g key={y}><line x1="55" x2="845" y1={y} y2={y} className="yard-line"/><text x="82" y={y-12} className="yard-number">{[10,20,30,40,50][i]}</text><text x="790" y={y-12} className="yard-number">{[10,20,30,40,50][i]}</text></g>)}
       {Array.from({length:25},(_,i)=><g key={i}><line x1="370" x2="380" y1={35+i*20} y2={35+i*20} className="hash-line"/><line x1="520" x2="530" y1={35+i*20} y2={35+i*20} className="hash-line"/><line x1="55" x2="65" y1={35+i*20} y2={35+i*20} className="hash-line"/><line x1="835" x2="845" y1={35+i*20} y2={35+i*20} className="hash-line"/></g>)}
       {showDefense&&zones(coverage).map((z,i)=><g key={i} className="coverage-zone"><rect x={z.x+3} y={z.y} width={z.width-6} height={z.height} rx="8"/><text x={z.x+z.width/2} y={z.y+27} textAnchor="middle">{z.label}</text></g>)}
       <line x1="55" x2="845" y1="385" y2="385" className="scrimmage-line"/>
       <text x="61" y="377" className="scrimmage-label">LOS</text>
       {routes.map(route=><AnimatedRoute key={`${concept.id}-${route.player}`} route={route} progress={progress}/>)}
       {showLabels&&routes.filter(r=>r.label).map(route=>{const player=players.find(p=>p.id===route.player);return player?<text key={route.player} x={player.x+22} y={player.y-29} className={`route-label ${route.color}`}>{route.label}</text>:null})}
       {all.map(p=><MovingPlayer key={`${concept.id}-${p.id}`} player={p} route={(p.team==='offense'?routes:defenderRoutes).find(r=>r.player===p.id)} progress={p.team==='defense'?progress*.88:progress} selected={p.id===selected} onSelect={()=>setSelected(p.id===selected?null:p.id)} labels={showLabels} reduced={reduced}/>)}
       <ellipse cx="450" cy="402" rx="4" ry="6" className="football" />
     </g>
   </svg>
   {selectedPlayer&&<div className="assignment-tooltip" role="status"><Crosshair size={16}/><div><strong>{selectedPlayer.label}</strong><span>{selectedPlayer.assignment}</span></div><button className="text-button" onClick={()=>setSelected(null)} aria-label="Close assignment">×</button></div>}
   <div className="field-bottomline"><span><Move size={12}/> Drag to pan <b>·</b> Select a player</span><div className="zoom-controls"><button aria-label="Zoom out" onClick={()=>changeZoom(-.1)} disabled={zoom<=.8}><Minus size={14}/></button><span>{Math.round(zoom*100)}%</span><button aria-label="Zoom in" onClick={()=>changeZoom(.1)} disabled={zoom>=1.8}><Plus size={14}/></button><button aria-label="Reset field view" onClick={reset}><RotateCcw size={14}/></button><button aria-label="Full screen field" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void frame.current?.requestFullscreen().catch(()=>{})}}><Maximize2 size={14}/></button></div></div>
 </div>
}
