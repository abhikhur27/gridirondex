import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Play } from 'lucide-react'
import { concepts } from './data/concepts'
import type { Concept, Side } from './data/types'
import Field, { Alignment } from './components/Field'
import FilmModal from './components/FilmModal'

const sections = [
  { key: 'routes', name: 'ROUTES', category: 'Route tree', side: 'offense' },
  { key: 'concepts', name: 'CONCEPTS', category: 'Passing concepts', side: 'offense' },
  { key: 'blocking', name: 'BLOCKING', category: 'Run game & blocking', side: 'offense' },
  { key: 'personnel', name: 'PERSONNEL', category: 'Personnel groups', side: 'offense' },
  { key: 'positions', name: 'POSITIONS', category: 'Offensive positions', side: 'offense' },
  { key: 'reads', name: 'READS', category: 'Quarterback reads', side: 'offense' },
  { key: 'situations', name: 'SITUATIONS', category: 'Situational adjustments', side: 'offense' },
  { key: 'coverages', name: 'COVERAGES', category: 'Coverages & shells', side: 'defense' },
  { key: 'fronts', name: 'FRONTS', category: 'Fronts & packages', side: 'defense' },
  { key: 'positions', name: 'POSITIONS', category: 'Defensive positions', side: 'defense' },
  { key: 'reactions', name: 'REACTIONS', category: 'Defensive reactions', side: 'defense' },
] as const
type Page = { side: Side | null; section: string | null }
function readPage(): Page {
  const [side, section] = location.hash.slice(1).split('/')
  if (side !== 'offense' && side !== 'defense') return { side: null, section: null }
  return { side, section: sections.some(s => s.side === side && s.key === section) ? section : null }
}

function ToyTile({ concept, route, selected, onSelect, onFilm, section = false }: { concept: Concept; route: boolean; selected: boolean; onSelect: () => void; onFilm: () => void; section?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [replay, setReplay] = useState(0)
  const reduced = useReducedMotion()
  const active = hovered || selected
  return <motion.article className={`toy-tile ${concept.side} ${active ? 'lit' : ''}`} whileHover={reduced ? {} : { y: -3 }}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setHovered(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovered(false) }}>
    <button className="tile-main" aria-label={section ? `Open ${concept.name.toLowerCase()}` : route ? `Select ${concept.name}` : `Watch ${concept.name}`} aria-pressed={route ? selected : undefined}
      onClick={() => { setReplay(value => value + 1); route ? onSelect() : onFilm() }}>
      <Field concept={concept} active={active} replay={replay} />
      <span className="tile-label">{concept.name.replace(/^\d+ · /, '')}</span>
      {!route && (section ? <ArrowUpRight className="tile-corner" size={19} strokeWidth={2.5} /> : <Play className="tile-corner" size={17} fill="currentColor" />)}
    </button>
    {route && <button className="tile-film" aria-label={`Watch ${concept.name}`} onClick={onFilm}><Play size={17} fill="currentColor" /></button>}
  </motion.article>
}

export default function App() {
  const [page, setPage] = useState<Page>(readPage)
  const [selected, setSelected] = useState<string | null>(null)
  const [film, setFilm] = useState<Concept | null>(null)
  const filmTrigger = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const section = sections.find(s => s.side === page.side && s.key === page.section)
  const closeFilm = useCallback(() => setFilm(null), [])

  useEffect(() => {
    const update = () => { setPage(readPage()); setSelected(null); setFilm(null) }
    window.addEventListener('popstate', update); window.addEventListener('hashchange', update)
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('hashchange', update) }
  }, [])
  const navigate = (next: Page) => {
    const hash = next.side ? `#${next.side}${next.section ? `/${next.section}` : ''}` : ''
    history.pushState(null, '', location.pathname + location.search + hash)
    setPage(next); setSelected(null); setFilm(null); window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return <div className="app">
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to blocks</a>
    <header className="topbar" inert={!!film}>
      <button className="wordmark" aria-label="GridironDex home" onClick={() => navigate({ side: null, section: null })}>GridironDex</button>
      {page.side && <button className="back-button" onClick={() => navigate(page.section ? { side: page.side, section: null } : { side: null, section: null })}><ArrowLeft size={18} /><span>BACK</span></button>}
    </header>
    <main id="main" tabIndex={-1} className={page.side ? 'blocks-page' : 'home-page'} inert={!!film}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${page.side}-${page.section}`} initial={{ opacity: 0, y: reduced ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }}>
          {!page.side ? <div className="home-blocks">
            {(['offense', 'defense'] as const).map(side => <motion.button key={side} className={`home-block ${side}`} aria-label={side === 'offense' ? 'Offense' : 'Defense'}
              whileHover={reduced ? {} : { y: -4 }} whileTap={reduced ? {} : { scale: .985 }} onClick={() => navigate({ side, section: null })}>
              <Alignment side={side} />
              <span className="home-block-label">{side.toUpperCase()}<ArrowUpRight size={37} strokeWidth={2.8} /></span>
            </motion.button>)}
          </div> : !section ? <>
            <h1>{page.side.toUpperCase()}</h1>
            <div className="section-blocks">
              {sections.filter(s => s.side === page.side).map(s => {
                const sample = concepts.find(c => c.category === s.category)!
                return <ToyTile key={s.key} concept={{ ...sample, name: s.name }} route={false} selected={false} section
                  onSelect={() => {}} onFilm={() => navigate({ side: page.side, section: s.key })} />
              })}
            </div>
          </> : <>
            <h1 className={section.name.length >= 9 ? 'long-title' : ''}>{section.name}</h1>
            <div className={`concept-blocks ${section.key === 'routes' ? 'route-blocks' : ''}`}>
              {concepts.filter(c => c.category === section.category).map(concept => <ToyTile key={concept.id} concept={concept}
                route={section.key === 'routes'} selected={selected === concept.id} onSelect={() => setSelected(concept.id)} onFilm={() => { filmTrigger.current = document.activeElement as HTMLElement; setFilm(concept) }} />)}
            </div>
          </>}
        </motion.div>
      </AnimatePresence>
    </main>
    <AnimatePresence>{film && <FilmModal concept={film} onClose={closeFilm} returnFocus={filmTrigger.current} />}</AnimatePresence>
  </div>
}
