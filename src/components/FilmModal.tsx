import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Film, X } from 'lucide-react'
import type { Concept } from '../data/types'

export default function FilmModal({concept,onClose}:{concept:Concept;onClose:()=>void}) {
 const ref=useRef<HTMLDivElement>(null), reduced=useReducedMotion()
 const [loaded,setLoaded]=useState(false)
 const [companion,setCompanion]=useState(false)
 const film=companion&&concept.film.companion?concept.film.companion:concept.film
 const url=`https://www.youtube.com/watch?v=${film.id}&t=${film.start}s`
 useEffect(()=>{
   const previous=document.activeElement as HTMLElement
   ref.current?.focus()
   const old=document.body.style.overflow;document.body.style.overflow='hidden'
   const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=ref.current?.querySelectorAll<HTMLElement>('button,a[href],iframe');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
   document.addEventListener('keydown',handler)
   return()=>{document.removeEventListener('keydown',handler);document.body.style.overflow=old;previous?.focus()}
 },[onClose])
 return <motion.div className="modal-scrim" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}} onClick={onClose}>
   <motion.div className="film-modal" role="dialog" aria-modal="true" aria-labelledby="film-title" tabIndex={-1} ref={ref} initial={{y:reduced?0:32,opacity:0}} animate={{y:0,opacity:1}} exit={{y:reduced?0:20,opacity:0}} transition={{duration:reduced?0:.32,ease:[.22,1,.36,1]}} onClick={e=>e.stopPropagation()}>
     <div className="modal-heading"><div><span className="eyebrow"><Film size={14}/> The film room</span><h2 id="film-title">{concept.name}<span> on film</span></h2></div><button className="icon-button" aria-label="Close film" onClick={onClose}><X size={22}/></button></div>
     {concept.film.companion&&<div className="film-tabs"><button className={!companion?'active':''} onClick={()=>{setCompanion(false);setLoaded(false)}}>Route breakdown</button><button className={companion?'active':''} onClick={()=>{setCompanion(true);setLoaded(false)}}>Official NFL overview <ArrowUpRight size={12}/></button></div>}
     <div className="video-container">{!loaded&&<div className="video-loading">Loading coaching film…</div>}<iframe key={film.id+film.start} title={film.title} src={`https://www.youtube-nocookie.com/embed/${film.id}?start=${film.start}${film.end?`&end=${film.end}`:''}&rel=0&playsinline=1`} onLoad={()=>setLoaded(true)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
     <div className="film-caption"><div><strong>{film.title}</strong><span>{film.channel} <b>·</b> Starts at {Math.floor(film.start/60)}:{String(film.start%60).padStart(2,'0')}{film.note?` · ${film.note}`:''}</span></div><a href={url} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight size={14}/></a></div>
     <div className="film-watch"><span className="eyebrow">What to look for</span><p>{concept.watch}</p></div>
     <p className="video-fallback">If the publisher restricts playback here, use “Open on YouTube” to watch the same segment.</p>
   </motion.div>
 </motion.div>
}
