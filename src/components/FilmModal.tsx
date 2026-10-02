import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from 'lucide-react'
import { concepts } from '../data/concepts'
import { conceptPage, pageHash } from '../data/navigation'
import type { Concept } from '../data/types'
import PlayCanvas from './PlayCanvas'
import { sceneFor } from '../data/playScenes'
import { samplePlay } from '../data/playEngine'
import { useMotionPreference } from '../useMotionPreference'
import { adjacentKeyframe, DEFAULT_PLAYBACK_RATE, PLAYBACK_RATES, playSteps } from '../data/playback'
import FilmPlayer from './FilmPlayer'
import SourceCredit from './SourceCredit'
import '../breakdown.css'

const aliases: Record<string, string[]> = {
  'cover-0': ['Cover 0'], 'cover-1': ['Cover 1'], 'cover-2': ['Cover 2'], 'cover-3': ['Cover 3'],
  'cover-4': ['Cover 4', 'Quarters'], 'cover-6': ['Cover 6'],
  'x-receiver': ['X receiver'], 'z-receiver': ['Z receiver'], 'slot': ['slot receiver'],
  'tight-end': ['tight end'], 'running-back': ['running back'], 'fullback': ['fullback'],
  'gap-a': ['A-gap', 'A gap'], 'gap-b': ['B-gap', 'B gap'], 'gap-c': ['C-gap', 'C gap'], 'gap-d': ['D-gap', 'D gap'],
  'mesh': ['Mesh'], 'four-verticals': ['Four Verticals'], 'smash': ['Smash'], 'flood': ['Flood'],
  'formation-pistol': ['Pistol'], 'formation-trips': ['Trips'], 'formation-empty': ['Empty'],
  'stunt-tex': ['Tex'], 'stunt-ext': ['ExT'], 'blitz-cross-dog': ['Cross-Dog'], 'blitz-fire-zone': ['Fire Zone'],
}
const shortName = (concept: Concept) => concept.name.startsWith('FG · ') ? concept.name.replace('FG · ', 'FG: ') : concept.name.replace(/^\d+ · /, '').split(' · ')[0]
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function CoachingText({ concept, onNavigate }: { concept: Concept; onNavigate: (target: Concept) => void }) {
  const { pieces, terms } = useMemo(() => {
    const terms = new Map<string, Concept>()
    for (const target of concepts) {
      if (target.id === concept.id) continue
      const names = aliases[target.id] ?? (concept.related?.includes(target.id) ? [shortName(target)] : [])
      for (const name of names) if (name.length > 2) terms.set(name.toLowerCase(), target)
    }
    const pattern = [...terms.keys()].sort((a, b) => b.length - a.length).map(escapeRegex).join('|')
    return { terms, pieces: pattern ? concept.watch.split(new RegExp(`\\b(${pattern})\\b`, 'gi')) : [concept.watch] }
  }, [concept])
  return <p className="coaching-takeaway">{pieces.map((part, index) => {
    const target = terms.get(part.toLowerCase())
    return target ? <a key={index} className="concept-pill inline-pill" href={pageHash(conceptPage(target))} onClick={event => { event.preventDefault(); onNavigate(target) }}>{part}</a> : part
  })}</p>
}

export default function FilmModal({ concept, onClose, onNavigate, onNavigatePosition, returnFocus }: { concept: Concept; onClose: () => void; onNavigate: (concept: Concept) => void; onNavigatePosition: (slug: string) => void; returnFocus?: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const initialFocus = useRef(returnFocus)
  const reduced = useMotionPreference()
  const [mode, setMode] = useState<'diagram' | 'film'>('diagram')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(DEFAULT_PLAYBACK_RATE)
  const scene = useMemo(() => sceneFor(concept), [concept.id])
  const playFrame = useMemo(() => samplePlay(scene, progress * scene.duration), [scene, progress])
  const stages = playSteps(scene)
  const activeStage = [...stages].reverse().find(stage => playFrame.seconds >= stage.seconds - .005)
  const film = concept.film
  const related = (concept.related ?? []).map(id => concepts.find(c => c.id === id)).filter((c): c is Concept => !!c && c.id !== concept.id).slice(0, 4)

  useEffect(() => { setMode('diagram'); setProgress(0); setPlaying(false); ref.current?.querySelector<HTMLButtonElement>('.close-breakdown')?.focus() }, [concept.id])
  useEffect(() => {
    const previous = initialFocus.current ?? document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLButtonElement>('.close-breakdown')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab') return
      const nodes = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [role="button"][tabindex="0"], a[href], input, select, iframe, summary') ?? [])].filter(el => el.getClientRects().length > 0)
      if (!nodes.length) return
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', keydown)
      if (previous?.isConnected) previous.focus()
      else document.getElementById('main')?.focus()
    }
  }, [onClose])
  useEffect(() => {
    if (!playing) return
    if (reduced) { setProgress(1); setPlaying(false); return }
    let frame = 0, last = performance.now()
    const tick = (now: number) => {
      const elapsed = now - last; last = now
      setProgress(value => Math.min(1, value + elapsed * rate / (scene.duration * 1000)))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reduced, scene.duration, rate])
  useEffect(() => { if (progress >= 1) setPlaying(false) }, [progress])
  const play = () => {
    if (playing) { setPlaying(false); return }
    if (reduced) { setProgress(progress >= 1 ? 0 : 1); return }
    if (progress >= 1) setProgress(0)
    setPlaying(true)
  }

  return <motion.div className="breakdown-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div ref={ref} className={`breakdown-frame ${concept.side}`} role="dialog" aria-modal="true" aria-labelledby="breakdown-title"
      initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }}
      transition={{ duration: reduced ? 0 : .2 }} onClick={event => event.stopPropagation()}>
      <button className="close-breakdown" aria-label="Close breakdown" onClick={onClose}><X size={23} strokeWidth={2.6} /></button>
      <div className="breakdown-card">
        <div className="breakdown-heading"><h2 id="breakdown-title">{shortName(concept)}</h2>
          {film && <div className="breakdown-tabs" aria-label="Breakdown format">
            <button aria-pressed={mode === 'diagram'} onClick={() => setMode('diagram')}>Diagram</button>
            <button aria-pressed={mode === 'film'} onClick={() => { setMode('film'); setPlaying(false) }}>Film</button>
          </div>}
        </div>
        {mode === 'film' && film ? <div className="breakdown-film">
          <FilmPlayer key={`${film.id}:${film.start}`} film={film} />
          <SourceCredit concept={concept} />
          {film.note && <p className="film-note">{film.note}</p>}
        </div> : <div className="diagram-preview">
          <div className={`preview-field lit ${concept.side}`} role="group" aria-label={`${shortName(concept)}: offense and defense, ${playFrame.phase.toLowerCase()}`}>
            <PlayCanvas offensiveNodes={scene.offensiveNodes} defensiveNodes={scene.defensiveNodes} scene={scene} active progress={progress} preview onNavigatePosition={onNavigatePosition} className={`side-${concept.side}`} />
          </div>
          <div className="preview-controls">
            <button className="preview-play" aria-label={playing ? 'Pause diagram' : progress >= 1 ? 'Replay diagram' : 'Play diagram'} onClick={play}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}<span>{playing ? 'PAUSE' : progress >= 1 ? 'REPLAY' : 'PLAY'}</span></button>
            <input aria-label="Play progress" aria-valuetext={`${playFrame.seconds.toFixed(2)} seconds, ${playFrame.phase.toLowerCase()}`} type="range" min="0" max="100" step="0.1" value={progress * 100} onChange={event => { setPlaying(false); setProgress(Number(event.target.value) / 100) }} />
            <button className="preview-reset" aria-label="Reset diagram" onClick={() => { setPlaying(false); setProgress(0) }}><RotateCcw size={18} /></button>
            <span className="snap-label" aria-hidden="true">{playFrame.seconds.toFixed(2)}s</span>
          </div>
          <div className="playback-tools"><div className="keyframe-controls" role="group" aria-label="Step through play"><button aria-label="Previous keyframe" disabled={progress === 0} onClick={() => { setPlaying(false); setProgress(adjacentKeyframe(scene, playFrame.seconds, -1) / scene.duration) }}><SkipBack size={14} /> Step</button><button aria-label="Next keyframe" disabled={progress === 1} onClick={() => { setPlaying(false); setProgress(adjacentKeyframe(scene, playFrame.seconds, 1) / scene.duration) }}>Step <SkipForward size={14} /></button></div><label className="playback-rate">Speed <select aria-label="Playback speed" value={rate} onChange={event => setRate(Number(event.target.value))}>{PLAYBACK_RATES.map(value => <option key={value} value={value}>{value}×</option>)}</select></label></div>
          <div className="preview-stages" role="group" aria-label="Play stages">{stages.map(stage => <button key={stage.name} aria-pressed={activeStage === stage}
            onClick={() => { setPlaying(false); setProgress(stage.seconds / scene.duration) }}>{stage.name}</button>)}</div>
          <div className="preview-caption"><span className="caption-time" aria-hidden="true">{playFrame.seconds.toFixed(2)}s</span><p aria-live="polite" aria-atomic="true">{playFrame.caption}</p></div>
          <p className="preview-legend"><span className="motion-swatch" /> Pre-snap motion <span className="assignment-swatch" /> After the snap · Tap a player to explore their position.</p>
        </div>}
        <div className="breakdown-notes">
          <CoachingText concept={concept} onNavigate={onNavigate} />
          <SourceCredit concept={concept} />
          {related.length > 0 && <nav className="related-concepts" aria-label="Related concepts">{related.map(target => <a key={target.id} className="concept-pill" href={pageHash(conceptPage(target))} onClick={event => { event.preventDefault(); onNavigate(target) }}>{shortName(target)}<ArrowUpRight size={12} /></a>)}</nav>}
          <details className="coaching-sources"><summary>Sources</summary><ul>{concept.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={12} /></a><span>{source.publisher}</span></li>)}</ul></details>
        </div>
      </div>
    </motion.div>
  </motion.div>
}
