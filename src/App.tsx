import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Gamepad2, Play } from 'lucide-react'
import { concepts } from './data/concepts'
import { conceptPage, homePage, pageHash, readPage, sections, type Page } from './data/navigation'
import type { Concept } from './data/types'
import Field, { Alignment } from './components/Field'
import FilmModal from './components/FilmModal'
import PositionDetail from './components/PositionDetail'
import { positionProfileBySlug } from './data/positionProfiles'
import { useMotionPreference } from './useMotionPreference'
import './expansion.css'
import './position.css'

const TacticalDraft = lazy(() => import('./components/TacticalDraft'))

function ToyTile({ concept, route, selected, onSelect, onOpen, onNavigatePosition, section = false }: { concept: Concept; route: boolean; selected: boolean; onSelect: () => void; onOpen: () => void; onNavigatePosition: (slug: string) => void; section?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [replay, setReplay] = useState(0)
  const reduced = useMotionPreference()
  const active = hovered || selected
  const activate = () => { setReplay(value => value + 1); route ? onSelect() : onOpen() }
  return <motion.article className={`toy-tile ${concept.side} ${active ? 'lit' : ''}`} data-concept={section ? undefined : concept.id} whileHover={reduced ? {} : { y: -3 }}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setHovered(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovered(false) }}>
    <div className="tile-main" onClick={activate}>
      <Field concept={concept} active={active} replay={replay} onNavigatePosition={onNavigatePosition} />
      <button className="tile-label" title={concept.name} aria-label={section ? `Open ${concept.name.toLowerCase()}` : route ? `Select ${concept.name}` : `Explore ${concept.name}`} aria-pressed={route ? selected : undefined}
        onClick={event => { event.stopPropagation(); activate() }}>{concept.name.replace(/^\d+ · /, '')}
      {!route && (section ? <ArrowUpRight className="tile-corner" size={19} strokeWidth={2.5} /> : <Play className="tile-corner" size={17} fill="currentColor" />)}
      </button>
    </div>
    {route && <button className="tile-film" aria-label={`Explore ${concept.name}`} onClick={onOpen}><Play size={17} fill="currentColor" /></button>}
  </motion.article>
}

function DraftGlyph() {
  return <svg viewBox="0 0 170 80" aria-hidden="true" className="draft-glyph">
    <path d="M 25 65 V 39 Q 25 31 33 31 H 118 M 65 65 V 49 Q 65 41 72 33 L 103 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="round" />
    <path d="m118 26 10 5-10 5z M99 4 108 3 106 13z" fill="currentColor" />
    <circle cx="25" cy="65" r="7" /><circle cx="65" cy="65" r="7" />
    <path d="m135 52 10 10m0-10-10 10" className="draft-opponent" />
  </svg>
}

function DriveGlyph() {
  return <svg viewBox="0 0 170 80" aria-hidden="true" className="draft-glyph">
    <path d="M 20 12 V 70 M 65 12 V 70 M 110 12 V 70 M 155 12 V 70" fill="none" stroke="currentColor" strokeWidth="2" opacity=".18" />
    <path d="M 20 57 H 65 V 40 H 110 V 23 H 149" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    <path d="m149 18 10 5-10 5z" fill="currentColor" />
    <circle cx="20" cy="57" r="7" /><circle cx="65" cy="40" r="7" /><circle cx="110" cy="23" r="7" />
  </svg>
}

export default function App() {
  const [page, setPage] = useState<Page>(readPage)
  const [draftVisited, setDraftVisited] = useState(() => !!readPage().game && !readPage().drive)
  const [driveVisited, setDriveVisited] = useState(() => !!readPage().drive)
  const [selected, setSelected] = useState<string | null>(null)
  const filmTrigger = useRef<HTMLElement | null>(null)
  const positionReturn = useRef<Page | null>(null)
  const reduced = useMotionPreference()
  const section = sections.find(s => s.side === page.side && s.key === page.section)
  const position = page.position ? positionProfileBySlug.get(page.position) : undefined
  const film = page.concept ? concepts.find(c => c.id === page.concept && c.side === page.side && c.category === section?.category) : undefined

  useEffect(() => {
    const update = () => { setPage(readPage()); setSelected(null) }
    window.addEventListener('popstate', update); window.addEventListener('hashchange', update)
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('hashchange', update) }
  }, [])
  useEffect(() => {
    if (page.game) page.drive ? setDriveVisited(true) : setDraftVisited(true)
  }, [page.game, page.drive])
  const navigate = (next: Page) => {
    const base = location.pathname.startsWith('/positions/') ? '/' : location.pathname
    history.pushState(null, '', base + location.search + pageHash(next))
    setPage(next); setSelected(next.concept ?? null)
    if (!next.concept) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const closeFilm = useCallback(() => {
    setPage(previous => {
      const next = { ...previous, concept: undefined }
      history.replaceState(null, '', location.pathname + location.search + pageHash(next))
      return next
    })
  }, [])
  const openConcept = (concept: Concept) => {
    filmTrigger.current = document.activeElement as HTMLElement
    navigate(conceptPage(concept))
  }
  const home = () => navigate(homePage)
  const openPosition = (slug: string) => {
    if (!page.position) positionReturn.current = page
    navigate({ ...homePage, position: slug })
  }
  const openGame = (mode: 'draft' | 'drive') => navigate({ ...homePage, game: true, drive: mode === 'drive' })
  const draft = () => openGame('draft')
  const back = () => navigate(page.position ? positionReturn.current ?? { side: position?.side ?? 'offense', section: position?.side === 'special' ? 'teams' : 'positions' } : page.game || page.side === 'special' ? homePage : page.section ? { side: page.side, section: null } : homePage)

  return <div className="app">
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to field</a>
    <header className="topbar" inert={!!film}>
      <button className="wordmark" aria-label="GridironDex home" onClick={home}>GridironDex</button>
      <div className="topbar-actions">
        {(page.side || page.position) && <button className="quick-draft" aria-label="PLAY" title="Tactical Draft" onClick={draft}><span>PLAY</span><Gamepad2 size={18} /></button>}
        {(page.side || page.game || page.position) && <button className="back-button" onClick={back}><ArrowLeft size={18} /><span>BACK</span></button>}
      </div>
    </header>
    <main id="main" tabIndex={-1} className={page.position ? 'position-page' : page.game ? 'draft-page' : page.side ? 'blocks-page' : 'home-page'} inert={!!film}>
      {draftVisited && <div hidden={!page.game || page.drive}><Suspense fallback={<p className="loading-draft" role="status">Setting the field…</p>}><TacticalDraft mode="draft" active={!!page.game && !page.drive} onModeChange={openGame} onExit={home} onNavigatePosition={openPosition} /></Suspense></div>}
      {driveVisited && <div hidden={!page.game || !page.drive}><Suspense fallback={<p className="loading-draft" role="status">Setting the field…</p>}><TacticalDraft mode="drive" active={!!page.game && !!page.drive} onModeChange={openGame} onExit={home} onNavigatePosition={openPosition} /></Suspense></div>}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={page.position ? `position-${page.position}` : page.game ? 'draft' : `${page.side}-${page.section}`} initial={{ opacity: 0, y: reduced ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }}>
          {page.position ? position ? <PositionDetail profile={position} onOpenConcept={openConcept} onNavigatePosition={openPosition} onBack={back} backLabel={positionReturn.current?.game ? positionReturn.current.drive ? 'Back to your drive' : 'Back to your draft' : positionReturn.current?.concept ? 'Back to the play' : 'Back to the playbook'} /> : <div className="position-missing"><h1>Position not found</h1><button onClick={home}>Back to the playbook</button></div> : page.game ? null : !page.side ? <>
            <div className="home-blocks">
              {(['offense', 'defense'] as const).map(side => <motion.button key={side} className={`home-block ${side}`} aria-label={side === 'offense' ? 'Offense' : 'Defense'}
                whileHover={reduced ? {} : { y: -4 }} whileTap={reduced ? {} : { scale: .985 }} onClick={() => navigate({ side, section: null })}>
                <Alignment side={side} />
                <span className="home-block-label">{side.toUpperCase()}<ArrowUpRight size={37} strokeWidth={2.8} /></span>
              </motion.button>)}
            </div>
            <div className="home-extras">
              <button className="draft-entry" onClick={draft}>
                <DraftGlyph /><span><strong>TACTICAL DRAFT</strong><small>Draw a play. Beat the coverage.</small></span><ArrowUpRight size={24} />
              </button>
              <button className="draft-entry" onClick={() => openGame('drive')}>
                <DriveGlyph /><span><strong>THE DRIVE</strong><small>Four downs. Keep the chains moving.</small></span><ArrowUpRight size={24} />
              </button>
            </div>
            <button className="teams-entry" onClick={() => navigate({ side: 'special', section: 'teams' })}>SPECIAL TEAMS <ArrowUpRight size={20} /></button>
          </> : !section ? <>
            <h1>{page.side.toUpperCase()}</h1>
            <div className="section-blocks">
              {sections.filter(s => s.side === page.side).map(s => {
                const sample = concepts.find(c => c.category === s.category && c.side === s.side)
                return sample && <ToyTile key={s.key} concept={{ ...sample, name: s.name }} route={false} selected={false} section
                  onSelect={() => {}} onOpen={() => navigate({ side: page.side, section: s.key })} onNavigatePosition={openPosition} />
              })}
            </div>
          </> : <>
            <h1 className={section.name.length >= 9 ? 'long-title' : ''}>{section.name}</h1>
            <div className={`concept-blocks ${section.key === 'routes' ? 'route-blocks' : ''}`}>
              {concepts.filter(c => c.category === section.category && c.side === section.side).map(concept => <ToyTile key={concept.id} concept={concept}
                route={section.key === 'routes'} selected={selected === concept.id} onSelect={() => setSelected(concept.id)} onOpen={() => openConcept(concept)} onNavigatePosition={openPosition} />)}
            </div>
          </>}
        </motion.div>
      </AnimatePresence>
    </main>
    <AnimatePresence>{film && <FilmModal concept={film} onClose={closeFilm} onNavigate={target => navigate(conceptPage(target))} onNavigatePosition={openPosition} returnFocus={filmTrigger.current} />}</AnimatePresence>
  </div>
}
