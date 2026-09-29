import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Bookmark, BookOpen, ChevronDown, Film, Search, X } from 'lucide-react'
import { categories, concepts } from '../data/concepts'
import type { Concept, Side } from '../data/types'

interface Props {
  concept: Concept; side: Side; query: string; saved: string[]; expanded: string[]
  onQuery: (query: string) => void; onSide: (side: Side) => void
  onChoose: (concept: Concept) => void; onExpand: (category: string) => void
  onDestination: (view: 'film' | 'saved') => void; onClose: () => void
}

export default function LibraryDrawer(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const matches = concepts.filter(c => c.side === props.side &&
    `${c.name} ${c.subtitle} ${c.tags.join(' ')}`.toLowerCase().includes(props.query.toLowerCase()))

  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLInputElement>('input')?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose()
      if (event.key !== 'Tab') return
      const nodes = ref.current?.querySelectorAll<HTMLElement>('button, input, a[href]')
      if (!nodes?.length) return
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [props.onClose])

  return <motion.div className="drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={props.onClose}>
    <motion.div className="library-drawer" role="dialog" aria-modal="true" aria-labelledby="library-title" ref={ref}
      initial={{ x: reduced ? 0 : -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -28, opacity: 0 }}
      transition={{ duration: .24 }} onClick={e => e.stopPropagation()}>
      <div className="drawer-heading"><div><span className="eyebrow">The playbook</span><h2 id="library-title">Find your next play.</h2></div><button className="icon-button" aria-label="Close library" onClick={props.onClose}><X size={21} /></button></div>
      <label className="search-box"><Search size={18} /><input aria-label="Search concepts" placeholder="A route, coverage, position…" value={props.query} onChange={e => props.onQuery(e.target.value)} />{props.query && <button aria-label="Clear search" onClick={() => props.onQuery('')}><X size={15} /></button>}</label>
      <div className="side-switch" role="group" aria-label="Side of the ball">
        <button className={props.side === 'offense' ? 'active' : ''} onClick={() => props.onSide('offense')}>Offense <span>{concepts.filter(c => c.side === 'offense').length}</span></button>
        <button className={props.side === 'defense' ? 'active defense' : ''} onClick={() => props.onSide('defense')}>Defense <span>{concepts.filter(c => c.side === 'defense').length}</span></button>
      </div>
      <div className="drawer-topics">
        {categories.filter(category => matches.some(c => c.category === category)).map(category => {
          const entries = matches.filter(c => c.category === category)
          const open = props.expanded.includes(category) || !!props.query
          return <div className="topic-group" key={category}>
            <button className="topic-heading" aria-expanded={open} onClick={() => props.onExpand(category)}><span>{category}</span><span>{entries.length}<ChevronDown size={15} className={open ? 'rotate' : ''} /></span></button>
            {open && <div className="topic-entries">{entries.map(c => <button className={`concept-link ${c.id === props.concept.id ? 'selected' : ''}`} key={c.id} onClick={() => props.onChoose(c)}><span>{c.name}</span>{props.saved.includes(c.id) ? <Bookmark size={14} /> : <ArrowRight size={14} />}</button>)}</div>}
          </div>
        })}
        {!matches.length && <p className="drawer-empty">No matching concepts. Try a route name or another side of the ball.</p>}
      </div>
      <div className="drawer-destinations"><button onClick={() => props.onDestination('film')}><Film size={16} /> Film room <ArrowRight size={15} /></button><button onClick={() => props.onDestination('saved')}><Bookmark size={16} /> My playbook <span>{props.saved.length}</span></button></div>
      <p className="drawer-footnote"><BookOpen size={14} /> A field guide to routes, reads and responsibilities.</p>
    </motion.div>
  </motion.div>
}
