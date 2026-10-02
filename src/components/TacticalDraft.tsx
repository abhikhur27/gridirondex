import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Undo2 } from 'lucide-react'
import { useMotionPreference } from '../useMotionPreference'
import { advanceRun, arrowGeometry, clamp, defenseFor, distance, emptyRoutes, FIELD, LINEMEN, frameAt, lookForLevel, newRun, sanitizeRoute, simulate, smoothPath } from '../game/engine'
import { defaultFormation, formationsFor, qbStartFor, receiversFor } from '../game/formations'
import { adjustRouteDepth, editRouteHandle, qbPreset, routeDepth, routeHandles, ROUTE_NAMES, routePreset, runRoutePreset } from '../game/routeEditing'
import { advanceDrive, driveLookSeed, fieldPositionLabel, newDrive } from '../game/drive'
import type { DrawableId, FormationId, Personnel, PlayKind, Point, Protection, RouteName, Routes, RunScheme, Simulation } from '../game/model'
import PlayCanvas from './PlayCanvas'
import { DEFAULT_PLAYBACK_RATE, PLAYBACK_RATES } from '../data/playback'
import { positionForNode } from '../data/positionNavigation'
import '../game.css'

type Phase = 'draw' | 'playing' | 'result'
type Snapshot = { routes:Routes; qbRoute:Point[]; kind:PlayKind; rpo:boolean; runScheme:RunScheme; runSide:'left'|'right' }
type Stroke = { pointerId:number; id:DrawableId; kind:'draw'|'handle'; handle?:number; points:Point[]; original:Snapshot; moved:boolean }
type Props = { onExit:()=>void; onNavigatePosition:(slug:string)=>void; mode?:'draft'|'drive'; active?:boolean; onModeChange?:(mode:'draft'|'drive')=>void }
const PACKAGES: { id:Personnel; label:string; detail:string }[] = [
  { id:'10',label:'10 personnel',detail:'1 back · 4 receivers' },
  { id:'11',label:'11 personnel',detail:'1 back · 1 tight end' },
  { id:'12',label:'12 personnel',detail:'1 back · 2 tight ends' },
  { id:'empty',label:'5-wide',detail:'5 receivers · no back' },
]
const RUN_SCHEMES:RunScheme[]=['Zone Read','Power','Draw','Counter']
const number = (value:number) => Number(value.toFixed(1)).toString()
const ordinal = (down:number) => ['','1ST','2ND','3RD','4TH'][down]
const gainLabel = (gain:number) => `${gain>0?'+':''}${number(gain)}`

function InkRoute({ points, selected, defense=false }: { points:Point[];selected?:boolean;defense?:boolean }) {
  const arrow=arrowGeometry(points,defense?9:12)
  return <g className={`draft-route${selected?' selected':''}${defense?' defensive':''}`}><path d={smoothPath(arrow.line)} />{arrow.cap&&<polygon points={arrow.cap}/>}</g>
}
function Cross({ point,faded=false }: {point:Point;faded?:boolean}) {
  return <path className={`draft-x${faded?' faded':''}`} d={`M ${point.x-7} ${point.y-7} L ${point.x+7} ${point.y+7} M ${point.x+7} ${point.y-7} L ${point.x-7} ${point.y+7}`}/>
}
function PositionNode({id,label=id,team,point,onNavigate,children}:{id:string;label?:string;team:'offense'|'defense';point:Point;onNavigate:(slug:string)=>void;children:ReactNode}) {
  const slug=positionForNode({id,label,team})
  const open=()=>onNavigate(slug)
  return <g className="draft-position" role="button" tabIndex={0} aria-label={`Open ${slug.replaceAll('-',' ')} position`} data-position={slug} onClick={open} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}}}><title>{slug.replaceAll('-',' ')}</title><circle className="draft-position-hit" cx={point.x} cy={point.y} r="15"/>{children}</g>
}

export default function TacticalDraft({onExit,onNavigatePosition,mode='draft',active=true,onModeChange}:Props) {
  const uid=useId(),helpId=`${uid}-help`,timelineId=`${uid}-timeline`,depthId=`${uid}-depth`
  const [run,setRun]=useState(()=>newRun())
  const [drive,setDrive]=useState(()=>newDrive())
  const [personnel,setPersonnel]=useState<Personnel>('11')
  const [formation,setFormation]=useState<FormationId>(defaultFormation('11'))
  const [routes,setRoutes]=useState<Routes>(()=>emptyRoutes('11',defaultFormation('11')))
  const [qbRoute,setQbRoute]=useState<Point[]>(()=>[qbStartFor('11',defaultFormation('11'))])
  const [selected,setSelected]=useState<DrawableId>('X')
  const [protection,setProtection]=useState<Protection>('balanced')
  const [kind,setKind]=useState<PlayKind>('pass')
  const [rpo,setRpo]=useState(false)
  const [runScheme,setRunScheme]=useState<RunScheme>('Zone Read')
  const [runSide,setRunSide]=useState<'left'|'right'>('right')
  const [phase,setPhase]=useState<Phase>('draw')
  const [result,setResult]=useState<Simulation|null>(null)
  const [time,setTime]=useState(0)
  const [paused,setPaused]=useState(false)
  const [rate,setRate]=useState<number>(DEFAULT_PLAYBACK_RATE)
  const [history,setHistory]=useState<Snapshot[]>([])
  const [announcement,setAnnouncement]=useState('')
  const svg=useRef<SVGSVGElement>(null),stroke=useRef<Stroke|null>(null),depthSnapshot=useRef<Snapshot|null>(null)
  const resultHeading=useRef<HTMLHeadingElement>(null)
  const reducedMotion=useMotionPreference()
  const look=useMemo(()=>mode==='drive'?lookForLevel(driveLookSeed(drive),1+Math.floor(drive.plays/3)):lookForLevel(run.seed,run.level),[mode,drive.seed,drive.plays,run.seed,run.level])
  const receivers=useMemo(()=>receiversFor(personnel,formation),[personnel,formation])
  const qbStart=useMemo(()=>qbStartFor(personnel,formation),[personnel,formation])
  const defenders=useMemo(()=>defenseFor(look,personnel,formation),[look,personnel,formation])
  const offensiveNodes=useMemo(()=>[...receivers.map(r=>({id:r.id,label:r.id,team:'offense' as const,...r.start})),...LINEMEN.map(n=>({id:n.id,label:n.id,team:'offense' as const,...n.start})),{id:'QB',label:'QB',team:'offense' as const,...qbStart}],[receivers,qbStart])
  const defensiveNodes=useMemo(()=>defenders.map(d=>({id:d.id,label:d.id,team:'defense' as const,...d.start})),[defenders])
  const activePoints=selected==='QB'?qbRoute:routes[selected]
  const activeStart=selected==='QB'?qbStart:receivers.find(r=>r.id===selected)!.start
  const handles=useMemo(()=>routeHandles(activePoints),[activePoints])
  const drawnCount=Object.values(routes).filter(points=>points.length>1).length
  const canSnap=phase==='draw'&&(kind==='run'?personnel!=='empty'&&routes.RB.length>1:drawnCount>0||qbRoute.length>1)
  const currentFrame=result&&phase!=='draw'?frameAt(result,Math.min(time,result.catchTime)):null
  const qbPoint=currentFrame?.qb??qbStart,ball=currentFrame?.ball??qbStart
  const projectedDrive=useMemo(()=>result?advanceDrive(drive,result):drive,[drive,result])
  const shownDrive=phase==='result'?projectedDrive:drive
  const creditedGain=mode==='drive'&&result?(projectedDrive.history.at(-1)?.gain??result.gain):result?.gain??0
  const touchdownText=mode==='drive'&&result&&projectedDrive.status==='touchdown'?`Touchdown. ${result.outcome==='qb-run'?'The quarterback':result.target??'The runner'} scores from ${number(creditedGain)} yards out.`:null
  const displayFeedback=touchdownText?[touchdownText,...(result?.feedback??[]).filter(line=>!/\d+(?:\.\d+)?[ -]yards?\b/i.test(line))]:result?.feedback??[]
  const lives=run.lives-(phase==='result'&&result&&!result.won?1:0),runOver=lives<=0
  const driveOver=projectedDrive.status!=='active'
  const selectedFormation=formationsFor(personnel).find(f=>f.id===formation)!
  const intendedRollout=qbRoute.length>1&&Math.abs(qbRoute.at(-1)!.x-qbStart.x)>40?(qbRoute.at(-1)!.x<qbStart.x?'left':'right'):null
  const rollout=result&&phase!=='draw'?result.rollout:intendedRollout
  const readPoint=result?.read&&currentFrame?currentFrame.defenders[result.read.defender]:null
  const targetPoint=result?.target&&currentFrame?currentFrame.receivers[result.target]:null
  const conflict=targetPoint&&currentFrame?defenders.filter(d=>d.assignment!=='rush').sort((a,b)=>distance(currentFrame.defenders[a.id],targetPoint)-distance(currentFrame.defenders[b.id],targetPoint))[0]:null
  const stageSteps=result?[['PRE-SNAP',0],['MOTION / RELEASE',.15],['SNAP / CONTACT',.45],['BREAK / DROP',Math.min(1.5,result.throwTime)],...(result.read?[['READ',result.read.at]]:[]),['RESULT',result.catchTime]] as [string,number][]:[]

  useEffect(()=>{
    if(phase!=='playing'||!result||paused||!active)return
    if(reducedMotion){setTime(result.catchTime);setPhase('result');return}
    let request=0
    const started=performance.now(),startTime=time,end=result.catchTime+.45
    const tick=(now:number)=>{const elapsed=Math.min(end,startTime+(now-started)/1000*rate);setTime(elapsed);if(elapsed>=end)setPhase('result');else request=requestAnimationFrame(tick)}
    request=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(request)
  },[phase,result,paused,rate,reducedMotion,active])
  useEffect(()=>{if(phase==='result'&&active)resultHeading.current?.focus({preventScroll:true})},[phase,active])
  useEffect(()=>{
    if(!active&&stroke.current){
      const drawing=stroke.current;stroke.current=null;restore(drawing.original)
      if(svg.current?.hasPointerCapture(drawing.pointerId))svg.current.releasePointerCapture(drawing.pointerId)
    }
  },[active])

  function snapshot():Snapshot{return{routes,qbRoute,kind,rpo,runScheme,runSide}}
  function restore(value:Snapshot){setRoutes(value.routes);setQbRoute(value.qbRoute);setKind(value.kind);setRpo(value.rpo);setRunScheme(value.runScheme);setRunSide(value.runSide)}
  function remember(value:Snapshot){setHistory(previous=>[...previous.slice(-29),snapshot()]);restore(value)}
  function assigned(id:DrawableId,points:Point[],original=snapshot()):Snapshot{return id==='QB'?{...original,qbRoute:points}:{...original,routes:{...original.routes,[id]:points}}}
  function applyPoints(id:DrawableId,points:Point[]){restore(assigned(id,points))}
  function quickReceiver(pack:Personnel,set:FormationId,side:'left'|'right'){
    const sign=side==='left'?-1:1,qb=qbStartFor(pack,set)
    return receiversFor(pack,set).filter(receiver=>receiver.id!=='RB'&&(receiver.start.x-qb.x)*sign>0).sort((a,b)=>Math.abs(a.start.x-(qb.x+sign*120))-Math.abs(b.start.x-(qb.x+sign*120)))[0]
  }
  function withRunRoute(base:Routes,pack=personnel,set=formation,scheme=runScheme,side=runSide,quick=rpo,preserveBack=false):Routes {
    if(pack==='empty')return base
    const rb=receiversFor(pack,set).find(r=>r.id==='RB')!
    const next={...base,RB:preserveBack&&base.RB.length>1?base.RB:runRoutePreset(rb.start,scheme,side)}
    const outlet=quickReceiver(pack,set,side)
    if(quick&&outlet&&next[outlet.id].length<2)next[outlet.id]=routePreset(outlet,'Slant')
    return next
  }
  function selectPackage(next:Personnel){
    if(next===personnel)return
    const nextFormation=defaultFormation(next),nextKind=next==='empty'?'pass':kind
    setPersonnel(next);setFormation(nextFormation);setKind(nextKind)
    if(next==='empty')setRpo(false)
    const blank=emptyRoutes(next,nextFormation)
    setRoutes(nextKind==='run'?withRunRoute(blank,next,nextFormation):blank);setQbRoute([qbStartFor(next,nextFormation)]);setHistory([]);depthSnapshot.current=null
    setAnnouncement(`${PACKAGES.find(p=>p.id===next)?.label}. Routes cleared for the new alignment.`)
  }
  function selectFormation(next:FormationId){
    if(next===formation)return
    setFormation(next)
    const blank=emptyRoutes(personnel,next)
    setRoutes(kind==='run'?withRunRoute(blank,personnel,next):blank);setQbRoute([qbStartFor(personnel,next)]);setHistory([]);depthSnapshot.current=null
    setAnnouncement(`${formationsFor(personnel).find(f=>f.id===next)?.label}. Draw from the new alignment.`)
  }
  function selectKind(next:PlayKind){
    if(next===kind)return
    if(next==='run'){remember({...snapshot(),kind:next,routes:withRunRoute(routes)});setSelected('RB')}
    else remember({...snapshot(),kind:next,rpo:false})
  }
  function selectRun(scheme:RunScheme,side:'left'|'right'){
    if(scheme===runScheme&&side===runSide)return
    remember({...snapshot(),runScheme:scheme,runSide:side,routes:withRunRoute(routes,personnel,formation,scheme,side)});setSelected('RB')
  }
  function toggleRpo(enabled:boolean){
    if(enabled){
      const outlet=quickReceiver(personnel,formation,runSide)
      remember({...snapshot(),kind:'run',rpo:true,routes:withRunRoute(routes,personnel,formation,runScheme,runSide,true,true)})
      if(outlet)setSelected(outlet.id)
      setAnnouncement(`RPO on. ${outlet?.id??'The playside receiver'} supplies the quick throw beside the run fit. Edit either path.`)
    }else remember({...snapshot(),rpo:false})
  }
  function applyPreset(name:RouteName){
    if(selected==='QB')return
    remember(assigned(selected,routePreset(receivers.find(r=>r.id===selected)!,name)))
    setAnnouncement(name==='Block'?`${selected} stays in.`:`${name} assigned to ${selected}. Drag its handles to change the break.`)
  }
  function pointFromPointer(event:ReactPointerEvent<SVGElement>):Point|null{
    const matrix=svg.current?.getScreenCTM();if(!matrix)return null
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse())
    return{x:clamp(point.x,24,696),y:clamp(point.y,28,481)}
  }
  function beginStroke(event:ReactPointerEvent<SVGGElement>,id:DrawableId){
    if(phase!=='draw'||!event.isPrimary||event.button!==0)return
    event.preventDefault();setSelected(id)
    const start=id==='QB'?qbStart:receivers.find(r=>r.id===id)!.start
    stroke.current={pointerId:event.pointerId,id,kind:'draw',points:[start],original:snapshot(),moved:false}
    svg.current?.setPointerCapture(event.pointerId)
  }
  function beginHandle(event:ReactPointerEvent<SVGGElement>,index:number){
    if(phase!=='draw'||!event.isPrimary||event.button!==0)return
    event.preventDefault();event.stopPropagation()
    stroke.current={pointerId:event.pointerId,id:selected,kind:'handle',handle:index,points:activePoints,original:snapshot(),moved:false}
    svg.current?.setPointerCapture(event.pointerId)
  }
  function continueStroke(event:ReactPointerEvent<SVGSVGElement>){
    const drawing=stroke.current;if(!drawing||event.pointerId!==drawing.pointerId)return
    const point=pointFromPointer(event);if(!point)return
    if(drawing.kind==='handle'){
      if(distance(point,drawing.points[drawing.handle!])<1)return
      drawing.moved=true;restore(assigned(drawing.id,editRouteHandle(drawing.points,drawing.handle!,point),drawing.original))
    }else{
      if(distance(point,drawing.points.at(-1)!)<7)return
      drawing.moved=true;drawing.points=sanitizeRoute([...drawing.points,point],drawing.points[0]);applyPoints(drawing.id,drawing.points)
    }
  }
  function finishStroke(event:ReactPointerEvent<SVGSVGElement>,cancel=false){
    const drawing=stroke.current;if(!drawing||event.pointerId!==drawing.pointerId)return
    stroke.current=null
    if(svg.current?.hasPointerCapture(event.pointerId))svg.current.releasePointerCapture(event.pointerId)
    if(cancel)restore(drawing.original)
    else if(drawing.moved){setHistory(previous=>[...previous.slice(-29),drawing.original]);setAnnouncement(`${drawing.id} ${drawing.kind==='handle'?'route adjusted':'path drawn'}.`)}
    else if(drawing.kind==='draw'){
      const role=drawing.id==='QB'?'quarterback':receivers.find(r=>r.id===drawing.id)!.role
      onNavigatePosition(positionForNode({id:drawing.id,label:role,team:'offense'}))
    }
  }
  function moveHandle(event:ReactKeyboardEvent<SVGGElement>,index:number){
    const directions:Record<string,Point>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}}
    const direction=directions[event.key];if(!direction)return
    event.preventDefault();const old=activePoints[index],step=event.shiftKey?12:4
    remember(assigned(selected,editRouteHandle(activePoints,index,{x:old.x+direction.x*step,y:old.y+direction.y*step},activeStart)))
  }
  function startDepth(){if(!depthSnapshot.current)depthSnapshot.current=snapshot()}
  function finishDepth(){
    const before=depthSnapshot.current
    if(before&&JSON.stringify(before)!==JSON.stringify(snapshot()))setHistory(previous=>[...previous.slice(-29),before])
    depthSnapshot.current=null
  }
  function snap(){
    if(!canSnap)return
    const simulation=simulate(look,personnel,routes,protection,{formation,qbRoute,kind,rpo,runScheme,runSide,yardsToGoal:mode==='drive'?100-drive.fieldPosition:undefined})
    setResult(simulation);setTime(0);setPaused(false);setPhase('playing')
    setAnnouncement(rpo?'Snap. Read the conflict defender at the mesh.':kind==='run'?'Snap. Follow the blocking and the runner.':'Snap. Follow the quarterback and the throwing window.')
    svg.current?.scrollIntoView({block:'center',behavior:reducedMotion?'instant':'smooth'})
  }
  function clearPlay(){
    const blank=emptyRoutes(personnel,formation)
    setRoutes(kind==='run'?withRunRoute(blank):blank);setQbRoute([qbStart]);setHistory([])
  }
  function nextPlay(){
    if(!result)return
    if(mode==='drive'){
      if(projectedDrive.status!=='active')return
      setDrive(projectedDrive);clearPlay()
      setAnnouncement(`${ordinal(projectedDrive.down)} and ${number(projectedDrive.lineToGain-projectedDrive.fieldPosition)} at ${fieldPositionLabel(projectedDrive.fieldPosition)}.`)
    }else{
      const next=advanceRun(run,result);setRun(next)
      if(result.won)clearPlay()
      setAnnouncement(result.won?`Level ${next.level}. Read the new coverage.`:'Edit the routes and try this coverage again.')
    }
    setResult(null);setTime(0);setPhase('draw');setPaused(false)
  }
  function restart(){
    if(mode==='drive')setDrive(newDrive());else setRun(newRun())
    setPhase('draw');setResult(null);setTime(0);setPaused(false);clearPlay()
    setAnnouncement(mode==='drive'?'New drive. First and ten at your 25.':'New run. Three downs left.')
  }
  function replay(){setTime(0);setPaused(false);setPhase('playing')}
  function liveCaption(){
    if(!result||phase==='draw')return rpo?'Pair the run with a quick throw. Watch the conflict defender to decide give or pull.':kind==='run'?'Set the run direction, then move the back’s route handles to choose his cut.':'Read the shell, set your protection, and draw a throwing window.'
    if(time<.35)return 'The offense is set. Watch the quarterback, the rush, and each receiver’s release.'
    if(result.read&&time>=result.read.at&&time<result.catchTime)return result.read.text
    if(result.read&&time<result.read.at)return `${result.read.defender} is the read. Watch whether he closes the run fit or stays with the quick route.`
    if(time>=result.catchTime)return touchdownText??result.feedback[0]
    if(result.outcome==='run'||result.outcome==='qb-run')return `${currentFrame?.engagements.length??0} blocks create the fit. The runner follows the lane until a free defender closes it.`
    if(time<result.throwTime)return `${currentFrame?.engagements.length??0} blocks hold the pocket. ${rollout?'The rush tracks the moving quarterback; throwing back across the field takes longer.':look.coverage<=1?'Sharp breaks pull man defenders off their leverage.':'Receivers at different depths make the zone defenders choose.'}`
    return result.outcome==='sack'?'The rush reaches the quarterback before a viable throw.':`The ball leaves ${rollout?'the moving pocket':'the quarterback'} toward ${result.target??'the outlet'}. ${result.anglePenalty>0?'The across-body throw gives coverage extra time.':'Watch the defender closing on the catch point.'}`
  }
  const driveDistance=shownDrive.lineToGain-shownDrive.fieldPosition
  const driveTitle=shownDrive.status==='touchdown'?'TOUCHDOWN':shownDrive.status==='turnover'?'TURNOVER ON DOWNS':shownDrive.status==='safety'?'SAFETY':`${ordinal(shownDrive.down)} & ${shownDrive.lineToGain===100?'GOAL':number(driveDistance)}`
  const firstDownY=clamp(FIELD.los-(drive.lineToGain-drive.fieldPosition)*12,28,FIELD.los)
  const goalY=FIELD.los-(100-drive.fieldPosition)*12,backLineY=goalY-120
  const routeEntries:[DrawableId,Point[]][]=[...receivers.map(r=>[r.id,routes[r.id]] as [DrawableId,Point[]]),['QB',qbRoute]]
  const drawables=[...receivers,{id:'QB' as const,start:qbStart,role:'quarterback',onLine:false}]

  return <section className="tactical-draft" aria-label={mode==='drive'?'Drive mode game':'Tactical Draft game'} data-game-mode={mode}>
    {onModeChange&&<div className="game-mode-tabs" role="group" aria-label="Game mode"><button aria-pressed={mode==='draft'} onClick={()=>onModeChange('draft')}>TACTICAL DRAFT</button><button aria-pressed={mode==='drive'} onClick={()=>onModeChange('drive')}>THE DRIVE</button></div>}
    <div className="draft-heading">
      <div><p className="draft-kicker">{mode==='drive'?`${driveTitle} · ${fieldPositionLabel(shownDrive.fieldPosition).toUpperCase()}`:<>LEVEL {run.level}<span>·</span>{Math.max(0,lives)} DOWNS LEFT</>}</p><h1>{mode==='drive'?<>THE<br/>DRIVE</>:<>TACTICAL<br/>DRAFT</>}</h1></div>
      <button className="draft-exit" onClick={onExit}><ArrowLeft size={16}/> Playbook</button>
    </div>
    {mode==='drive'&&<div className="drive-strip" aria-label={`Drive: ${driveTitle}, ${fieldPositionLabel(shownDrive.fieldPosition)}, ${number(100-shownDrive.fieldPosition)} yards to the end zone`}>
      <div className="drive-strip-labels"><strong>{driveTitle}</strong><span>{fieldPositionLabel(shownDrive.fieldPosition)} · {number(100-shownDrive.fieldPosition)} to score</span></div>
      <div className="drive-track" aria-hidden="true">
        {[0,25,50,75,100].map(yard=><span key={yard} className="drive-tick" style={{left:`${yard}%`}}/>)}
        <span className="drive-gained" style={{left:`${Math.min(25,shownDrive.fieldPosition)}%`,width:`${Math.abs(shownDrive.fieldPosition-25)}%`}}/>
        <span className="drive-first-down" style={{left:`${shownDrive.lineToGain}%`}}/>
        <span className="drive-ball" style={{left:`${shownDrive.fieldPosition}%`}}/>
      </div>
      <div className="drive-strip-scale" aria-hidden="true"><span>YOUR END</span><span>50</span><span>TOUCHDOWN</span></div>
    </div>}
    <div className="draft-matchup"><h2>{look.name}</h2><p>{look.hint}{look.front&&<> <span>{look.front}.</span></>}</p></div>
    <div className="draft-package-row" role="group" aria-label="Offensive personnel">{PACKAGES.map(pack=><button key={pack.id} aria-pressed={personnel===pack.id} disabled={phase!=='draw'} onClick={()=>selectPackage(pack.id)}><strong>{pack.label}</strong><span>{pack.detail}</span></button>)}</div>
    <div className="draft-design-row">
      <label>Formation <select aria-label="Offensive formation" value={formation} disabled={phase!=='draw'} onChange={event=>selectFormation(event.target.value as FormationId)}>{formationsFor(personnel).map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      <div className="play-kind" role="group" aria-label="Play type"><button aria-pressed={kind==='pass'} disabled={phase!=='draw'} onClick={()=>selectKind('pass')}>Pass</button><button aria-pressed={kind==='run'} disabled={phase!=='draw'||personnel==='empty'} onClick={()=>selectKind('run')}>Run</button></div>
      <label className="rpo-toggle"><input type="checkbox" checked={rpo} disabled={phase!=='draw'||personnel==='empty'} onChange={event=>toggleRpo(event.target.checked)}/> RPO</label>
    </div>
    <p className="draft-formation-note">{selectedFormation.description}{personnel==='empty'?' Choose a package with a back for runs and RPOs.':''}</p>
    {kind==='run'&&<div className="run-design-row"><label>Run <select aria-label="Run scheme" value={runScheme} disabled={phase!=='draw'} onChange={event=>selectRun(event.target.value as RunScheme,runSide)}>{RUN_SCHEMES.map(scheme=><option key={scheme}>{scheme}</option>)}</select></label><div role="group" aria-label="Run direction">{(['left','right'] as const).map(side=><button key={side} aria-pressed={runSide===side} disabled={phase!=='draw'} onClick={()=>selectRun(runScheme,side)}>{side==='left'?'Left':'Right'}</button>)}</div>{rpo&&<span>Draw the quick throw on a receiver.</span>}</div>}
    <div className="draft-field-wrap">
      <div className="draft-field-tools"><p id={helpId}>{phase==='draw'?'Drag an O to draw. Click a route to edit its bends. Tap a player for their position.':phase==='playing'?'Follow the ball. Pause or scrub to inspect the read.':'Replay or scrub the play before the next snap.'}</p><div><button title="Undo route" aria-label="Undo last route" disabled={phase!=='draw'||!history.length} onClick={()=>{restore(history.at(-1)!);setHistory(previous=>previous.slice(0,-1))}}><Undo2 size={17}/></button><button title="Clear routes" aria-label="Clear all routes" disabled={phase!=='draw'||!drawnCount&&qbRoute.length<2} onClick={()=>remember({...snapshot(),routes:emptyRoutes(personnel,formation),qbRoute:[qbStart]})}><RotateCcw size={17}/></button></div></div>
      <PlayCanvas svgRef={svg} offensiveNodes={offensiveNodes} defensiveNodes={defensiveNodes} renderPlayers={false} grid={false} className={`draft-field ${phase} formation-${formation}`} viewBox="0 0 720 510" role="group" aria-label="Draw offensive routes against the defense" aria-describedby={helpId} onPointerMove={continueStroke} onPointerUp={event=>finishStroke(event)} onPointerCancel={event=>finishStroke(event,true)} onLostPointerCapture={event=>finishStroke(event,true)}>
        <g className="draft-grid" aria-hidden="true">{[65,125,185,245,305,365].map((y,index)=><g key={y}><path d={`M 24 ${y} H 696`}/><text x="33" y={y-9}>{(5-index)*5}</text><path d={`M 246 ${y-5} v 10 M 474 ${y-5} v 10`}/></g>)}</g>
        {mode==='drive'&&goalY>28&&<g className="drive-end-zone" aria-label="Opponent end zone"><rect x="24" y={Math.max(28,backLineY)} width="672" height={Math.min(365,goalY)-Math.max(28,backLineY)}/>{backLineY>=28&&<path d={`M 24 ${backLineY} H 696`}/>}<text x="360" y={(Math.max(28,backLineY)+Math.min(365,goalY))/2+4} textAnchor="middle">END ZONE</text></g>}
        <g className="draft-zones" aria-label="Defensive zone landmarks">{defenders.filter(d=>d.zone).map(d=>{const zone=d.zone!;return <g key={d.id} data-zone={zone.label}><rect x={clamp(zone.x,24,696)} y={clamp(zone.y,28,365)} width={Math.min(zone.width,696-clamp(zone.x,24,696))} height={Math.min(zone.height,365-clamp(zone.y,28,365))} rx="12"/><text x={clamp(d.drop.x,80,640)} y={clamp(zone.y+20,48,335)} textAnchor="middle">{zone.label}</text></g>})}</g>
        {rollout&&kind==='pass'&&<g className="rollout-restriction" aria-label="Across-body throws travel slower"><rect x={rollout==='left'?360:24} y="28" width={rollout==='left'?336:336} height="325" rx="12"/><text x={rollout==='left'?525:195} y="46" textAnchor="middle">Across-body: slower throw</text></g>}
        {mode==='drive'&&<g className="game-first-down" aria-hidden="true"><path d={`M 24 ${firstDownY} H 696`}/><text x="687" y={firstDownY-8} textAnchor="end">{drive.lineToGain===100?'GOAL LINE':'FIRST DOWN'} · {number(drive.lineToGain-drive.fieldPosition)} YD</text></g>}
        <text className="draft-los-label" x="675" y="385" textAnchor="end" aria-hidden="true">LOS</text>
        {phase==='draw'&&<g aria-hidden="true">{defenders.map(d=>d.assignment!=='man'&&<g key={d.id}><InkRoute points={[d.start,d.drop]} defense/><Cross point={d.drop} faded/></g>)}</g>}
        <g aria-hidden="true">{routeEntries.map(([id,points])=><InkRoute key={id} points={points} selected={selected===id&&phase==='draw'}/>)}</g>
        {phase==='draw'&&<g>{routeEntries.filter(([,points])=>points.length>1).map(([id,points])=><path key={id} className="route-select-hit" data-route-id={id} d={smoothPath(points)} role="button" tabIndex={0} aria-label={`Select ${id} route to edit`} onClick={()=>setSelected(id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(id)}}}/>)}</g>}
        {targetPoint&&time>.45&&<g className="draft-window" aria-hidden="true"><ellipse cx={targetPoint.x} cy={targetPoint.y} rx="38" ry="24"/>{conflict&&!result?.read&&<path d={`M ${qbPoint.x} ${qbPoint.y} L ${currentFrame!.defenders[conflict.id].x} ${currentFrame!.defenders[conflict.id].y}`}/>}</g>}
        {readPoint&&result?.read&&time>=.35&&<g className="rpo-conflict" data-read-defender={result.read.defender} aria-label={time>=result.read.at?result.read.text:`Read ${result.read.defender}`}><circle cx={readPoint.x} cy={readPoint.y} r="22"/><path d={`M ${qbPoint.x} ${qbPoint.y} L ${readPoint.x} ${readPoint.y}`}/><text x={readPoint.x} y={readPoint.y-31} textAnchor="middle">{time>=result.read.at?result.read.decision.toUpperCase():'READ'}</text></g>}
        <g className="draft-line" aria-label="Five offensive linemen">{LINEMEN.map(n=>{const p=currentFrame?.linemen[n.id]??n.start;return <PositionNode key={n.id} id={n.id} team="offense" point={p} onNavigate={onNavigatePosition}><rect x={p.x-8} y={p.y-8} width="16" height="16" rx="3"/></PositionNode>})}</g>
        <g className="draft-engagements" aria-label="Active protection contacts">{currentFrame?.engagements.map(e=><path key={`${e.blocker}-${e.rusher}`} data-blocker={e.blocker} data-rusher={e.rusher} d={`M ${e.point.x-10} ${e.point.y} H ${e.point.x+10}`}/>)}</g>
        <g aria-label="Eleven defenders">{defenders.map(d=>{const point=currentFrame?.defenders[d.id]??d.start;return <PositionNode key={d.id} id={d.id} team="defense" point={point} onNavigate={onNavigatePosition}><Cross point={point}/></PositionNode>})}</g>
        {drawables.map(receiver=>{
          const p=receiver.id==='QB'?qbPoint:currentFrame?.receivers[receiver.id]??receiver.start
          const slug=positionForNode({id:receiver.id,label:receiver.role,team:'offense'})
          const nearMesh=!!currentFrame&&distance(currentFrame.receivers.RB,qbPoint)<36&&(receiver.id==='QB'||receiver.id==='RB')
          const labelX=nearMesh?clamp(p.x+(receiver.id==='QB'?-20:20),45,675):p.x
          return <g key={receiver.id} className={`draft-receiver${selected===receiver.id?' selected':''}`} data-receiver-id={receiver.id} role="button" tabIndex={0} aria-label={`${receiver.id}: open ${receiver.role} position or drag to draw a route`} data-position={slug} onPointerDown={event=>beginStroke(event,receiver.id)} onClick={()=>{if(phase!=='draw')onNavigatePosition(slug)}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onNavigatePosition(slug)}}}>
            <circle className="draft-hit-area" cx={p.x} cy={p.y} r="24"/><circle className="draft-o" cx={p.x} cy={p.y} r="12"/><text x={labelX} y={p.y+32} textAnchor={nearMesh?receiver.id==='QB'?'end':'start':'middle'}>{receiver.id}</text>
          </g>
        })}
        {phase==='draw'&&<g className="route-handles" aria-label={`${selected} route handles`}>{handles.map(handle=><g key={`${selected}-${handle.index}`} role="button" tabIndex={0} data-route-handle={handle.index} aria-label={`${selected} route handle ${handle.index}; use arrow keys to move`} onPointerDown={event=>beginHandle(event,handle.index)} onKeyDown={event=>moveHandle(event,handle.index)}><circle className="route-handle-hit" cx={handle.point.x} cy={handle.point.y} r="15"/><circle className="route-handle-dot" cx={handle.point.x} cy={handle.point.y} r="5"/></g>)}</g>}
        {phase!=='draw'&&<ellipse className="draft-ball" cx={ball.x} cy={ball.y} rx="7" ry="4" transform={`rotate(-28 ${ball.x} ${ball.y})`}/>}
        {phase==='result'&&result&&<circle className={`draft-catch ${result.outcome==='complete'||result.outcome==='run'||result.outcome==='qb-run'?'complete':''}`} cx={result.catchPoint.x} cy={result.catchPoint.y} r="25"/>}
      </PlayCanvas>
    </div>
    <p className="draft-context-caption"><span aria-hidden="true">{Math.min(time,result?.catchTime??0).toFixed(2)}s</span><span aria-live="polite">{liveCaption()}</span></p>
    {phase!=='draw'&&result&&<div className="draft-review">
      <div className="draft-clock-tools"><label htmlFor={timelineId}>{phase==='playing'?'FOLLOW THE PLAY':'REVIEW THE PLAY'}</label>{phase==='playing'&&<button aria-label={paused?'Resume game animation':'Pause game animation'} onClick={()=>setPaused(value=>!value)}>{paused?'RESUME':'PAUSE'}</button>}<label className="playback-rate">Speed <select aria-label="Game playback speed" value={rate} onChange={event=>setRate(Number(event.target.value))}>{PLAYBACK_RATES.map(value=><option key={value} value={value}>{value}×</option>)}</select></label></div>
      <input id={timelineId} aria-label="Game play progress" type="range" min="0" max={result.catchTime} step=".01" value={Math.min(time,result.catchTime)} onChange={event=>{setPaused(true);setTime(Number(event.target.value))}}/>
      <div>{stageSteps.map(([label,at])=><button key={label} onClick={()=>{setPaused(true);setTime(at)}}>{label}</button>)}</div>
    </div>}
    {phase==='draw'?<>
      <div className="draft-route-controls">
        <div className="draft-player-picker" role="group" aria-label="Select a receiver">{drawables.map(player=><button key={player.id} title={player.role} onClick={()=>setSelected(player.id)} aria-pressed={selected===player.id}>{player.id}</button>)}</div>
        {selected==='QB'?<div className="draft-presets draft-qb-presets" role="group" aria-label="Quarterback movement">{(['left','right','stay'] as const).map(direction=><button key={direction} onClick={()=>{remember(assigned('QB',qbPreset(qbStart,direction)));setAnnouncement(direction==='stay'?'QB stays in the pocket.':`QB rolls ${direction}.`)}}>{direction==='stay'?'Stay in pocket':`Roll ${direction}`}</button>)}</div>:<div className="draft-presets" role="group" aria-label={`Assign a route to ${selected}`}>{ROUTE_NAMES.map(name=><button key={name} onClick={()=>applyPreset(name)}>{name==='Block'?'Stay in':name}</button>)}</div>}
      </div>
      {activePoints.length>1&&<div className="route-depth"><label htmlFor={depthId}>{selected==='QB'?'QB path depth':`${selected} route depth`} <strong>{number(routeDepth(activePoints))} yd</strong></label><input id={depthId} aria-label="Route depth" type="range" min="1" max={Math.min(30,Math.floor((activeStart.y-28)/12))} step=".5" value={clamp(routeDepth(activePoints),1,Math.min(30,Math.floor((activeStart.y-28)/12)))} onPointerDown={startDepth} onPointerUp={finishDepth} onPointerCancel={()=>{if(depthSnapshot.current)restore(depthSnapshot.current);depthSnapshot.current=null}} onKeyDown={startDepth} onKeyUp={finishDepth} onBlur={finishDepth} onChange={event=>{startDepth();applyPoints(selected,adjustRouteDepth(activePoints,Number(event.target.value),activeStart))}}/><span>Drag the dots for individual bends. Arrow keys move a focused dot.</span></div>}
      <div className="draft-snap-row"><div className="draft-protection"><span id={`${uid}-protection`}>PROTECTION</span><div role="group" aria-labelledby={`${uid}-protection`}>{(['left','balanced','right'] as const).map(side=><button key={side} aria-pressed={protection===side} onClick={()=>setProtection(side)}>{side==='balanced'?'Balanced':`Slide ${side}`}</button>)}</div></div><button className="draft-snap" disabled={!canSnap} onClick={snap}>SNAP <ArrowRight size={22}/></button></div>
      <p className="draft-rule">{mode==='drive'?'Start at your 25. Four downs to reach the line to gain; move the ball 75 yards for a touchdown. Actual yardage moves the chains.':`Reach a clean window and ${look.targetScore} points to advance. Three failed plays end your run.`}</p>
    </>:phase==='playing'?<p className="draft-playing" role="status">PLAY IS LIVE <span>{Math.min(time,result?.catchTime??0).toFixed(1)}s</span></p>:result&&<div className="draft-result" aria-live="polite">
      <div className="draft-result-title"><div><p>{mode==='drive'?(projectedDrive.status!=='active'?driveTitle:projectedDrive.lineToGain!==drive.lineToGain?'FIRST DOWN':result.outcome.toUpperCase().replace('-',' ')):runOver?'RUN OVER':result.won?`LEVEL ${run.level} CLEARED`:'NO FIRST DOWN'}</p><h2 ref={resultHeading} tabIndex={-1}>{mode==='drive'?gainLabel(creditedGain):result.score}<span>{mode==='drive'?' yards':` / ${look.targetScore} needed`}</span></h2></div><span className="draft-total">{mode==='drive'?'FIELD POSITION':'RUN TOTAL'}<strong>{mode==='drive'?fieldPositionLabel(projectedDrive.fieldPosition):run.total+(result.won?result.score:0)}</strong></span></div>
      {mode==='drive'&&<p className="drive-summary">{projectedDrive.status==='active'?`${ordinal(projectedDrive.down)} and ${projectedDrive.lineToGain===100?'goal':number(projectedDrive.lineToGain-projectedDrive.fieldPosition)}. ${number(100-projectedDrive.fieldPosition)} yards left to score.`:projectedDrive.status==='touchdown'?'You took the ball from your 25 to the end zone.':projectedDrive.status==='turnover'?'Fourth down ended short of the line to gain.':'The ball carrier was stopped in your own end zone.'}</p>}
      <div className="draft-feedback">{displayFeedback.map(line=><p key={line}>{line}</p>)}<p>{result.outcome==='run'||result.outcome==='qb-run'?`Run ends at ${result.catchTime.toFixed(2)}s.`:`Pocket time: ${result.pocket.toFixed(2)}s.`}{result.anglePenalty>0?` Throwing across his movement adds ${result.anglePenalty.toFixed(2)}s to the release.`:''}</p></div>
      <div className="draft-result-actions">
        {mode==='drive'?<button className="draft-snap" onClick={driveOver?restart:nextPlay}>{driveOver?'NEW DRIVE':'NEXT DOWN'} <ArrowRight size={19}/></button>:!runOver&&<button className="draft-snap" onClick={nextPlay}>{result.won?'NEXT LEVEL':'EDIT & RETRY'} <ArrowRight size={19}/></button>}
        {mode==='draft'?<button className={runOver?'draft-snap':'draft-text-button'} onClick={restart}>{runOver?'NEW RUN':'Restart run'}</button>:!driveOver&&<button className="draft-text-button" onClick={restart}>Restart drive</button>}
        <button className="draft-text-button" onClick={replay}>Replay</button>
      </div>
    </div>}
    {mode==='drive'&&shownDrive.history.length>0&&<details className="drive-history"><summary>DRIVE HISTORY · {shownDrive.history.length} {shownDrive.history.length===1?'PLAY':'PLAYS'}</summary><ol>{shownDrive.history.map(play=><li key={play.play}><span>{ordinal(play.down)} · {fieldPositionLabel(play.start)}</span><strong>{gainLabel(play.gain)} yd</strong><span>{play.outcome.replace('-',' ')} · {fieldPositionLabel(play.end)}</span></li>)}</ol></details>}
    <p className="draft-sr-only" role="status">{announcement}</p>
  </section>
}
