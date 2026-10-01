import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useMotionPreference } from '../useMotionPreference';
import { ArrowLeft, ArrowRight, RotateCcw, Undo2 } from 'lucide-react';
import { advanceRun, arrowGeometry, clamp, defenseFor, distance, emptyRoutes, FIELD, LINEMEN, frameAt, lookForLevel, newRun, receiversFor, ROUTE_NAMES, routePreset, sanitizeRoute, simulate, smoothPath } from '../game/engine';
import type { Personnel, Point, Protection, ReceiverId, RouteName, Routes, Simulation } from '../game/engine';
import PlayCanvas from './PlayCanvas';
import { DEFAULT_PLAYBACK_RATE, PLAYBACK_RATES } from '../data/playback';
import { positionForNode } from '../data/positionNavigation';
import '../game.css';

type Phase = 'draw' | 'playing' | 'result';
type Stroke = { pointerId: number; id: ReceiverId; points: Point[]; original: Routes; moved: boolean };
const PACKAGES: { id: Personnel; label: string; detail: string }[] = [
  { id: '11', label: '11 personnel', detail: '1 back · 1 tight end' },
  { id: '12', label: '12 personnel', detail: '1 back · 2 tight ends' },
  { id: 'empty', label: '5-wide', detail: '5 receivers · no back' },
];

function InkRoute({ points, selected, defense = false }: { points: Point[]; selected?: boolean; defense?: boolean }) {
  const arrow = arrowGeometry(points, defense ? 9 : 12);
  return <g className={`draft-route${selected ? ' selected' : ''}${defense ? ' defensive' : ''}`}>
    <path d={smoothPath(arrow.line)} />
    {arrow.cap && <polygon points={arrow.cap} />}
  </g>;
}

function Cross({ point, faded = false }: { point: Point; faded?: boolean }) {
  return <path className={`draft-x${faded ? ' faded' : ''}`} d={`M ${point.x - 7} ${point.y - 7} L ${point.x + 7} ${point.y + 7} M ${point.x + 7} ${point.y - 7} L ${point.x - 7} ${point.y + 7}`} />;
}

function PositionNode({ id, label = id, team, point, onNavigate, children }: { id: string; label?: string; team: 'offense' | 'defense'; point: Point; onNavigate: (slug: string) => void; children: ReactNode }) {
  const slug = positionForNode({ id, label, team });
  const open = () => onNavigate(slug);
  return <g className="draft-position" role="button" tabIndex={0} aria-label={`Open ${slug.replaceAll('-', ' ')} position`} data-position={slug} onClick={open} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } }}><title>{slug.replaceAll('-', ' ')}</title><circle className="draft-position-hit" cx={point.x} cy={point.y} r="15" />{children}</g>;
}

export default function TacticalDraft({ onExit, onNavigatePosition }: { onExit: () => void; onNavigatePosition: (slug: string) => void }) {
  const [run, setRun] = useState(() => newRun());
  const [personnel, setPersonnel] = useState<Personnel>('11');
  const [routes, setRoutes] = useState<Routes>(() => emptyRoutes('11'));
  const [selected, setSelected] = useState<ReceiverId>('X');
  const [protection, setProtection] = useState<Protection>('balanced');
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<Simulation | null>(null);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState<number>(DEFAULT_PLAYBACK_RATE);
  const [history, setHistory] = useState<Routes[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const svg = useRef<SVGSVGElement>(null);
  const stroke = useRef<Stroke | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useMotionPreference();
  const look = useMemo(() => lookForLevel(run.seed, run.level), [run.seed, run.level]);
  const receivers = useMemo(() => receiversFor(personnel), [personnel]);
  const defenders = useMemo(() => defenseFor(look, personnel), [look, personnel]);
  const offensiveNodes = useMemo(() => [...receivers.map(r => ({ id:r.id, label:r.id, team:'offense' as const, ...r.start })), ...LINEMEN.map(n => ({ id:n.id, label:n.id, team:'offense' as const, ...n.start })), { id:'QB', label:'QB', team:'offense' as const, ...FIELD.qb }], [receivers]);
  const defensiveNodes = useMemo(() => defenders.map(d => ({ id:d.id, label:d.id, team:'defense' as const, ...d.start })), [defenders]);
  const activeReceiver = receivers.find(r => r.id === selected)!;
  const drawnCount = Object.values(routes).filter(points => points.length > 1).length;
  const currentFrame = result && phase !== 'draw' ? frameAt(result, Math.min(time, result.catchTime)) : null;
  const lives = run.lives - (phase === 'result' && result && !result.won ? 1 : 0);
  const runOver = lives <= 0;

  useEffect(() => {
    if (phase !== 'playing' || !result || paused) return;
    if (reducedMotion) {
      setTime(result.catchTime + .25);
      setPhase('result');
      return;
    }
    let request = 0;
    const started = performance.now();
    const startTime = time;
    const end = result.catchTime + .5;
    function tick(now: number) {
      const elapsed = Math.min(end, startTime + (now - started) / 1000 * rate);
      setTime(elapsed);
      if (elapsed >= end) setPhase('result');
      else request = requestAnimationFrame(tick);
    }
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [phase, result, reducedMotion, paused, rate]);

  useEffect(() => {
    if (phase === 'result') resultHeading.current?.focus({ preventScroll: true });
  }, [phase]);

  function remember(next: Routes) {
    setHistory(previous => [...previous.slice(-19), routes]);
    setRoutes(next);
  }

  function selectPackage(next: Personnel) {
    if (next === personnel) return;
    setPersonnel(next); setRoutes(emptyRoutes(next)); setHistory([]);
    setAnnouncement(`${PACKAGES.find(p => p.id === next)?.label}. Routes cleared for the new alignment.`);
  }

  function applyPreset(name: RouteName) {
    remember({ ...routes, [selected]: routePreset(activeReceiver, name) });
    setAnnouncement(name === 'Block' ? `${selected} stays in.` : `${name} assigned to ${selected}.`);
  }

  function pointFromPointer(event: ReactPointerEvent<SVGElement>): Point | null {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: clamp(point.x, 24, 696), y: clamp(point.y, 28, 481) };
  }

  function beginStroke(event: ReactPointerEvent<SVGGElement>, id: ReceiverId) {
    if (phase !== 'draw' || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    setSelected(id);
    const receiver = receivers.find(r => r.id === id)!;
    stroke.current = { pointerId: event.pointerId, id, points: [receiver.start], original: routes, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continueStroke(event: ReactPointerEvent<SVGSVGElement>) {
    const drawing = stroke.current;
    if (!drawing || event.pointerId !== drawing.pointerId) return;
    const point = pointFromPointer(event);
    if (!point || distance(point, drawing.points[drawing.points.length - 1]) < 7) return;
    drawing.moved = true;
    drawing.points = sanitizeRoute([...drawing.points, point], drawing.points[0]);
    setRoutes(previous => ({ ...previous, [drawing.id]: drawing.points }));
  }

  function finishStroke(event: ReactPointerEvent<SVGSVGElement>, cancel = false) {
    const drawing = stroke.current;
    if (!drawing || event.pointerId !== drawing.pointerId) return;
    if (cancel) setRoutes(drawing.original);
    else if (drawing.moved) {
      setHistory(previous => [...previous.slice(-19), drawing.original]);
      setAnnouncement(`Custom route drawn for ${drawing.id}.`);
    }
    else {
      const receiver = receivers.find(r => r.id === drawing.id)!;
      onNavigatePosition(positionForNode({ id: receiver.id, label: receiver.role, team: 'offense' }));
    }
    stroke.current = null;
  }

  function snap() {
    if (!drawnCount || phase !== 'draw') return;
    const simulation = simulate(look, personnel, routes, protection);
    setResult(simulation); setTime(0); setPaused(false); setPhase('playing');
    setAnnouncement('Snap. The quarterback will throw to the best available window.');
    svg.current?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  function nextPlay() {
    if (!result) return;
    const next = advanceRun(run, result);
    setRun(next); setResult(null); setTime(0); setPhase('draw');
    if (result.won) { setRoutes(emptyRoutes(personnel)); setHistory([]); }
    setAnnouncement(result.won ? `Level ${next.level}. Read the new coverage.` : 'Edit the routes and try this coverage again.');
  }

  function restart() {
    setRun(newRun()); setPhase('draw'); setResult(null); setTime(0); setRoutes(emptyRoutes(personnel)); setHistory([]);
    setAnnouncement('New run. Three downs left.');
  }

  let ball = FIELD.qb;
  if (result && phase !== 'draw' && time >= result.throwTime && result.target) {
    const t = clamp((time - result.throwTime) / Math.max(.05, result.catchTime - result.throwTime), 0, 1);
    ball = { x: FIELD.qb.x + (result.catchPoint.x - FIELD.qb.x) * t, y: FIELD.qb.y + (result.catchPoint.y - FIELD.qb.y) * t };
  }
  const targetPoint = result?.target && currentFrame ? currentFrame.receivers[result.target] : null;
  const conflict = targetPoint && currentFrame ? defenders.filter(d => d.assignment !== 'rush').sort((a,b) => distance(currentFrame.defenders[a.id],targetPoint)-distance(currentFrame.defenders[b.id],targetPoint))[0] : null;
  const liveCaption = !result || phase === 'draw' ? 'Read the shell, set your protection, then give the quarterback a window.' : time < .45 ? 'The line sets to meet the rush. Receivers release into the coverage.' : time < result.throwTime ? `${currentFrame?.engagements.length ?? 0} blocks hold the pocket. ${look.coverage <= 1 ? 'Sharp breaks pull man defenders off their leverage.' : 'Receivers at different depths make the zone defenders choose.'}` : time < result.catchTime ? `The quarterback releases to ${result.target ?? 'the outlet'} before the rush gets home.` : result.feedback[0];

  return <section className="tactical-draft" aria-label="Tactical Draft game">
    <div className="draft-heading">
      <div><p className="draft-kicker">LEVEL {run.level} <span>·</span> {Math.max(0, lives)} DOWNS LEFT</p><h1>TACTICAL<br />DRAFT</h1></div>
      <button className="draft-exit" onClick={onExit}><ArrowLeft size={16} /> Playbook</button>
    </div>
    <div className="draft-matchup"><h2>{look.name}</h2><p>{look.hint}</p></div>
    <div className="draft-package-row" role="group" aria-label="Offensive personnel">
      {PACKAGES.map(pack => <button key={pack.id} aria-pressed={personnel === pack.id} disabled={phase !== 'draw'} onClick={() => selectPackage(pack.id)}><strong>{pack.label}</strong><span>{pack.detail}</span></button>)}
    </div>
    <div className="draft-field-wrap">
      <div className="draft-field-tools"><p id="draft-drawing-help">{phase === 'draw' ? 'Drag an O to draw. Tap any player for their position. Route buttons are below.' : phase === 'playing' ? "Find the window. Use pause or scrub to follow the play." : result?.won ? 'Keep that play in your pocket.' : 'Watch where the window closes.'}</p><div><button title="Undo route" aria-label="Undo last route" disabled={phase !== 'draw' || !history.length} onClick={() => { setRoutes(history[history.length - 1]); setHistory(previous => previous.slice(0, -1)); }}><Undo2 size={17} /></button><button title="Clear routes" aria-label="Clear all routes" disabled={phase !== 'draw' || !drawnCount} onClick={() => remember(emptyRoutes(personnel))}><RotateCcw size={17} /></button></div></div>
      <PlayCanvas svgRef={svg} offensiveNodes={offensiveNodes} defensiveNodes={defensiveNodes} renderPlayers={false} grid={false} className={`draft-field ${phase}`} viewBox="0 0 720 510" role="group" aria-label="Draw offensive routes against the defense" aria-describedby="draft-drawing-help" onPointerMove={continueStroke} onPointerUp={event => finishStroke(event)} onPointerCancel={event => finishStroke(event, true)}>
        <g className="draft-grid" aria-hidden="true">{[65, 125, 185, 245, 305, 365].map((y, index) => <g key={y}><path d={`M 24 ${y} H 696`} /><text x="33" y={y - 9}>{(5 - index) * 5}</text><path d={`M 246 ${y - 5} v 10 M 474 ${y - 5} v 10`} /></g>)}</g>
        <text className="draft-los-label" x="675" y="385" textAnchor="end" aria-hidden="true">LOS</text>
        {phase === 'draw' && <g aria-hidden="true">{defenders.map(d => d.assignment !== 'man' && <g key={d.id}><InkRoute points={[d.start, d.drop]} defense /><Cross point={d.drop} faded /></g>)}</g>}
        <g aria-hidden="true">{receivers.map(r => <InkRoute key={r.id} points={routes[r.id]} selected={selected === r.id && phase === 'draw'} />)}</g>
        {targetPoint && time > .45 && <g className="draft-window" aria-hidden="true"><ellipse cx={targetPoint.x} cy={targetPoint.y} rx="38" ry="24" />{conflict && <path d={`M ${FIELD.qb.x} ${FIELD.qb.y} L ${currentFrame!.defenders[conflict.id].x} ${currentFrame!.defenders[conflict.id].y}`} />}</g>}
        <g className="draft-line" aria-label="Five offensive linemen">{LINEMEN.map(n => { const p=currentFrame?.linemen[n.id] ?? n.start; return <PositionNode key={n.id} id={n.id} team="offense" point={p} onNavigate={onNavigatePosition}><rect x={p.x - 8} y={p.y - 8} width="16" height="16" rx="3" /></PositionNode>; })}<PositionNode id="QB" team="offense" point={FIELD.qb} onNavigate={onNavigatePosition}><circle cx={FIELD.qb.x} cy={FIELD.qb.y} r="12" /><text x={FIELD.qb.x} y={FIELD.qb.y + 31} textAnchor="middle">QB</text></PositionNode></g>
        <g className="draft-engagements" aria-label="Active protection contacts">{currentFrame?.engagements.map(e => <path key={e.rusher} data-blocker={e.blocker} data-rusher={e.rusher} d={`M ${e.point.x-10} ${e.point.y} H ${e.point.x+10}`} />)}</g>
        <g aria-label="Eleven defenders">{defenders.map(d => { const point = currentFrame?.defenders[d.id] ?? d.start; return <PositionNode key={d.id} id={d.id} team="defense" point={point} onNavigate={onNavigatePosition}><Cross point={point} /></PositionNode>; })}</g>
        {receivers.map(receiver => {
          const p = currentFrame?.receivers[receiver.id] ?? receiver.start;
          const slug = positionForNode({ id: receiver.id, label: receiver.role, team: 'offense' });
          return <g key={receiver.id} className={`draft-receiver${selected === receiver.id ? ' selected' : ''}`} role="button" tabIndex={0} aria-label={`${receiver.id}: open ${receiver.role} position or drag to draw a route`} data-position={slug} onPointerDown={event => beginStroke(event, receiver.id)} onClick={() => { if (phase !== 'draw') onNavigatePosition(slug); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onNavigatePosition(slug); } }}>
            <circle className="draft-hit-area" cx={p.x} cy={p.y} r="24" />
            <circle className="draft-o" cx={p.x} cy={p.y} r="12" />
            <text x={p.x} y={p.y + 32} textAnchor="middle">{receiver.id}</text>
          </g>;
        })}
        {phase !== 'draw' && result?.target && <ellipse className="draft-ball" cx={ball.x} cy={ball.y} rx="7" ry="4" transform={`rotate(-28 ${ball.x} ${ball.y})`} />}
        {phase === 'result' && result?.target && <circle className={`draft-catch ${result.won ? 'complete' : ''}`} cx={result.catchPoint.x} cy={result.catchPoint.y} r="25" />}
      </PlayCanvas>
    </div>
    <p className="draft-context-caption"><span aria-hidden="true">{Math.min(time,result?.catchTime ?? 0).toFixed(2)}s</span> <span aria-live="polite">{liveCaption}</span></p>
    {phase !== 'draw' && result && <div className="draft-review"><div className="draft-clock-tools"><label htmlFor="draft-timeline">{phase === 'playing' ? 'FOLLOW THE PLAY' : 'REVIEW THE PLAY'}</label>{phase === 'playing' && <button aria-label={paused ? 'Resume game animation' : 'Pause game animation'} onClick={() => setPaused(value => !value)}>{paused ? 'RESUME' : 'PAUSE'}</button>}<label className="playback-rate">Speed <select aria-label="Game playback speed" value={rate} onChange={event => setRate(Number(event.target.value))}>{PLAYBACK_RATES.map(value => <option key={value} value={value}>{value}×</option>)}</select></label></div><input id="draft-timeline" aria-label="Game play progress" type="range" min="0" max={result.catchTime} step=".01" value={Math.min(time,result.catchTime)} onChange={event => { setPaused(true); setTime(Number(event.target.value)); }} /><div>{[['PRE-SNAP',0],['MOTION / RELEASE',.15],['SNAP / CONTACT',.45],['BREAK / DROP',Math.min(1.5,result.throwTime)],['RESULT',result.catchTime]].map(([label,at]) => <button key={label} onClick={() => { setPaused(true); setTime(Number(at)); }}>{label}</button>)}</div></div>}
    {phase === 'draw' ? <>
      <div className="draft-route-controls">
        <div className="draft-player-picker" role="group" aria-label="Select a receiver">{receivers.map(r => <button key={r.id} onClick={() => setSelected(r.id)} aria-pressed={selected === r.id}>{r.id}</button>)}</div>
        <div className="draft-presets" role="group" aria-label={`Assign a route to ${selected}`}>{ROUTE_NAMES.map(name => <button key={name} onClick={() => applyPreset(name)}>{name === 'Block' ? 'Stay in' : name}</button>)}</div>
      </div>
      <div className="draft-snap-row"><div className="draft-protection"><span id="draft-protection-label">PROTECTION</span><div role="group" aria-labelledby="draft-protection-label">{(['left', 'balanced', 'right'] as const).map(side => <button key={side} aria-pressed={protection === side} onClick={() => setProtection(side)}>{side === 'balanced' ? 'Balanced' : `Slide ${side}`}</button>)}</div></div><button className="draft-snap" disabled={!drawnCount} onClick={snap}>SNAP <ArrowRight size={22} /></button></div>
      <p className="draft-rule">Get 5+ yards and {look.targetScore} points to advance. Separation, depth, spacing, and protection decide the score. Three failed plays end your run.</p>
    </> : phase === 'playing' ? <p className="draft-playing" role="status">PLAY IS LIVE <span>{time.toFixed(1)}s</span></p> : result && <div className="draft-result" aria-live="polite">
      <div className="draft-result-title"><div><p>{runOver ? 'RUN OVER' : result.won ? `LEVEL ${run.level} CLEARED` : 'NO FIRST DOWN'}</p><h2 ref={resultHeading} tabIndex={-1}>{result.score}<span> / {look.targetScore} needed</span></h2></div><span className="draft-total">RUN TOTAL <strong>{run.total + (result.won ? result.score : 0)}</strong></span></div>
      <div className="draft-feedback">{result.feedback.map(line => <p key={line}>{line}</p>)}</div>
      <div className="draft-result-actions">{!runOver && <button className="draft-snap" onClick={nextPlay}>{result.won ? 'NEXT LEVEL' : 'EDIT & RETRY'} <ArrowRight size={19} /></button>}<button className={runOver ? 'draft-snap' : 'draft-text-button'} onClick={restart}>{runOver ? 'NEW RUN' : 'Restart run'}</button><button className="draft-text-button" onClick={() => { setTime(0); setPaused(false); setPhase('playing'); }}>Replay</button></div>
    </div>}
    <p className="draft-sr-only" role="status">{announcement}</p>
  </section>;
}
