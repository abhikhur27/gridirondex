import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Concept } from '../data/types'

export default function FilmModal({ concept, onClose, returnFocus }: { concept: Concept; onClose: () => void; returnFocus?: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const film = concept.film
  const takeaway = concept.id === 'mesh'
    ? 'The shallow crossers make man defenders work through traffic. Against zone, settle in open space.'
    : concept.watch
  useEffect(() => {
    const previous = returnFocus ?? document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'; ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const nodes = ref.current?.querySelectorAll<HTMLElement>('button, iframe')
      if (!nodes?.length) return
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [onClose, returnFocus])

  return <motion.div className="film-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div ref={ref} className="film-frame" role="dialog" aria-modal="true" aria-label={`${concept.name} film`}
      initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }}
      transition={{ duration: reduced ? 0 : .22 }} onClick={event => event.stopPropagation()}>
      <button className="close-film" aria-label="Close film" onClick={onClose}><X size={23} strokeWidth={2.6} /></button>
      <div className="film-card">
        <div className="video-container"><iframe title={film.title} src={`https://www.youtube-nocookie.com/embed/${film.id}?start=${film.start}${film.end ? `&end=${film.end}` : ''}&rel=0&playsinline=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
        <p className="takeaway">{takeaway}</p>
      </div>
    </motion.div>
  </motion.div>
}
