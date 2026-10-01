import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { concepts } from '../data/concepts'
import { pageHash, conceptPage } from '../data/navigation'
import { sceneFor } from '../data/playScenes'
import { samplePlay } from '../data/playEngine'
import { DEFAULT_PLAYBACK_RATE, PLAYBACK_RATES, adjacentKeyframe, playSteps } from '../data/playback'
import { positionForNode } from '../data/positionNavigation'
import type { PositionProfile } from '../data/positionProfiles'
import type { Concept } from '../data/types'
import { useMotionPreference } from '../useMotionPreference'
import PlayCanvas from './PlayCanvas'
import SourceCredit from './SourceCredit'

export default function PositionDetail({ profile, onOpenConcept, onNavigatePosition, onBack, backLabel }: { profile: PositionProfile; onOpenConcept: (concept: Concept) => void; onNavigatePosition: (slug: string) => void; onBack: () => void; backLabel: string }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const lesson = concepts.find(concept => concept.id === profile.lesson)!
  const scene = useMemo(() => {
    const original = sceneFor({ id: profile.lesson })
    const highlight = (node: typeof original.offensiveNodes[number]) => ({ ...node, focus: positionForNode(node, original.id) === profile.slug, showLabel: positionForNode(node, original.id) === profile.slug })
    return { ...original, offensiveNodes: original.offensiveNodes.map(highlight), defensiveNodes: original.defensiveNodes.map(highlight) }
  }, [profile.slug, profile.lesson])
  const reduced = useMotionPreference()
  const [seconds, setSeconds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState<number>(DEFAULT_PLAYBACK_RATE)
  const frame = useMemo(() => samplePlay(scene, seconds), [scene, seconds])
  const stages = playSteps(scene)
  const related = profile.related.map(id => concepts.find(concept => concept.id === id)).filter((concept): concept is Concept => !!concept)

  useEffect(() => { heading.current?.focus({ preventScroll: true }); setSeconds(0); setPlaying(false) }, [profile.slug])
  useEffect(() => {
    if (!playing) return
    if (reduced) { setSeconds(scene.duration); setPlaying(false); return }
    let request = 0, last = performance.now()
    const tick = (now: number) => {
      const elapsed = now - last; last = now
      setSeconds(value => Math.min(scene.duration, value + elapsed / 1000 * rate))
      request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
  }, [playing, reduced, rate, scene.duration])
  useEffect(() => { if (seconds >= scene.duration) setPlaying(false) }, [seconds, scene.duration])
  const seek = (at: number) => { setPlaying(false); setSeconds(at) }
  const play = () => {
    if (playing) { setPlaying(false); return }
    if (reduced) { setSeconds(seconds >= scene.duration ? 0 : scene.duration); return }
    if (seconds >= scene.duration) setSeconds(0)
    setPlaying(true)
  }
  return <article className={`position-detail ${profile.side}`}>
    <button className="position-breadcrumb" onClick={onBack}><ArrowLeft size={15} />{backLabel}</button>
    <header className="position-heading"><span className="position-kicker">{profile.side.toUpperCase()} · {profile.abbreviation}</span><h1 ref={heading} tabIndex={-1}>{profile.name}</h1></header>
    <div className="position-canvas-wrap">
      <PlayCanvas offensiveNodes={scene.offensiveNodes} defensiveNodes={scene.defensiveNodes} scene={scene} active preview progress={seconds / scene.duration}
        onNavigatePosition={onNavigatePosition} role="group" aria-label={`${profile.name} example: ${lesson.name}`} />
    </div>
    <div className="position-controls">
      <button className="position-play" onClick={play} aria-label={playing ? 'Pause position diagram' : 'Play position diagram'}>{playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}{playing ? 'PAUSE' : seconds >= scene.duration ? 'REPLAY' : 'PLAY'}</button>
      <button className="position-step" aria-label="Previous position keyframe" onClick={() => seek(adjacentKeyframe(scene, seconds, -1))}><SkipBack size={17} /></button>
      <input aria-label="Position play progress" aria-valuetext={`${seconds.toFixed(2)} seconds`} type="range" min="0" max={scene.duration} step="0.01" value={seconds} onChange={event => seek(Number(event.target.value))} />
      <button className="position-step" aria-label="Next position keyframe" onClick={() => seek(adjacentKeyframe(scene, seconds, 1))}><SkipForward size={17} /></button>
      <button className="position-step" aria-label="Reset position diagram" onClick={() => seek(0)}><RotateCcw size={17} /></button>
      <select aria-label="Position playback speed" value={rate} onChange={event => setRate(Number(event.target.value))}>{PLAYBACK_RATES.map(speed => <option key={speed} value={speed}>{speed}×</option>)}</select>
    </div>
    <div className="position-stages" role="group" aria-label="Position play stages">{stages.map(stage => <button key={stage.name} onClick={() => seek(stage.seconds)} aria-pressed={Math.abs(seconds - stage.seconds) < .03}>{stage.name}</button>)}</div>
    <div className="position-caption"><span aria-hidden="true">{seconds.toFixed(2)}s</span><p aria-live="polite" aria-atomic="true">{frame.caption}</p></div>
    <div className="position-notes">
      <section><h2>Alignment</h2><p>{profile.alignment}</p></section>
      <section><h2>Technique</h2><p>{profile.technique}</p></section>
      <section><h2>{profile.side === 'offense' ? 'Routes & assignments' : 'Assignments'}</h2><p>{profile.involvement}</p></section>
    </div>
    <nav className="position-related" aria-label="Position lessons">{related.map(concept => <a key={concept.id} href={pageHash(conceptPage(concept))} onClick={event => { event.preventDefault(); onOpenConcept(concept) }}>{concept.name.replace(/^\d+ · /, '')}<ArrowUpRight size={14} /></a>)}</nav>
    <div className="position-credit"><SourceCredit concept={lesson} /></div>
  </article>
}
