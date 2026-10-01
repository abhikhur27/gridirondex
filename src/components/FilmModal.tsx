import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Pause, Play, RotateCcw, X } from 'lucide-react'
import { concepts } from '../data/concepts'
import { conceptPage, pageHash } from '../data/navigation'
import type { Concept } from '../data/types'
import Field from './Field'
import { useMotionPreference } from '../useMotionPreference'
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

export default function FilmModal({ concept, onClose, onNavigate, returnFocus }: { concept: Concept; onClose: () => void; onNavigate: (concept: Concept) => void; returnFocus?: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const initialFocus = useRef(returnFocus)
  const reduced = useMotionPreference()
  const [mode, setMode] = useState<'diagram' | 'film'>('diagram')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
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
      const nodes = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, iframe, summary') ?? [])].filter(el => el.getClientRects().length > 0)
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
      setProgress(value => Math.min(1, value + elapsed / 4200))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reduced])
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
          <div className="video-container"><iframe title={film.title} src={`https://www.youtube-nocookie.com/embed/${film.id}?start=${film.start}${film.end ? `&end=${film.end}` : ''}&rel=0&playsinline=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
          <a className="film-fallback" href={`https://www.youtube.com/watch?v=${film.id}&t=${film.start}s`} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight size={13} /></a>
          {film.note && <p className="film-note">{film.note}</p>}
        </div> : <div className="diagram-preview">
          <div className={`preview-field lit ${concept.side}`} role="img" aria-label={`${shortName(concept)}: ${progress === 0 ? 'pre-snap alignment' : progress >= 1 ? 'post-snap destinations' : 'play in motion'}`}><Field concept={concept} active replay={0} progress={progress} /></div>
          <div className="preview-controls">
            <button className="preview-play" aria-label={playing ? 'Pause diagram' : progress >= 1 ? 'Replay diagram' : 'Play diagram'} onClick={play}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}<span>{playing ? 'PAUSE' : progress >= 1 ? 'REPLAY' : 'PLAY'}</span></button>
            <input aria-label="Play progress" type="range" min="0" max="100" step="1" value={Math.round(progress * 100)} onChange={event => { setPlaying(false); setProgress(Number(event.target.value) / 100) }} />
            <button className="preview-reset" aria-label="Reset diagram" onClick={() => { setPlaying(false); setProgress(0) }}><RotateCcw size={18} /></button>
            <span className="snap-label">{progress === 0 ? 'PRE-SNAP' : progress >= 1 ? 'POST-SNAP' : 'IN MOTION'}</span>
          </div>
          {concept.side === 'defense' && <p className="preview-legend">Solid X: before the snap. Faded X: where he’s headed.</p>}
        </div>}
        <div className="breakdown-notes">
          <CoachingText concept={concept} onNavigate={onNavigate} />
          {related.length > 0 && <nav className="related-concepts" aria-label="Related concepts">{related.map(target => <a key={target.id} className="concept-pill" href={pageHash(conceptPage(target))} onClick={event => { event.preventDefault(); onNavigate(target) }}>{shortName(target)}<ArrowUpRight size={12} /></a>)}</nav>}
          <details className="coaching-sources"><summary>Sources</summary><ul>{concept.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={12} /></a><span>{source.publisher}</span></li>)}</ul></details>
        </div>
      </div>
    </motion.div>
  </motion.div>
}
