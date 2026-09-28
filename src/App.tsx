import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Bookmark, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Clipboard, Film, Layers3, ListFilter, Menu, Pause, Play, RotateCcw, Route, Search, Shield, Target, X } from 'lucide-react'
import { categories, concepts, findConcept } from './data/concepts'
import type { Concept, Coverage, Side } from './data/types'
import { useLocal, usePlayback } from './hooks'
import Field from './components/Field'
import FilmModal from './components/FilmModal'

type View='playbook'|'guide'|'saved'|'film'
const COVERAGES:Coverage[]=['Cover 0','Cover 1','Cover 2','Cover 3','Cover 4','Cover 6']
function initialConcept() { return findConcept(new URLSearchParams(location.hash.slice(1)).get('play')??'mesh') }
function MiniDiagram({type='mesh'}:{type?:string}) {
 return <svg viewBox="0 0 130 64" className="mini-diagram" aria-hidden="true"><path d="M 8 18 H 122 M 8 36 H 122 M 8 54 H 122" className="mini-grid"/>{type==='smash'?<><path d="M 28 52 V 31 l 8 5 M 62 52 V 22 L 30 5" className="mini-route"/><path d="m 30 11 0-6 6 1" className="mini-route"/></>:type==='verticals'?<><path d="M 24 52 V 8 M 48 52 V 8 M 79 52 V 8 M 105 52 V 8" className="mini-route"/></>:type==='flood'?<><path d="M 100 52 V 6 M 65 52 V 24 H 111 M 35 52 V 43 H 110" className="mini-route"/></>:<><path d="M 35 52 V 33 Q 35 28 42 28 H 111" className="mini-route"/><path d="M 95 52 V 19 Q 95 15 87 15 H 16" className="mini-route secondary"/></>}{[26,48,78,103].map(x=><circle key={x} cx={x} cy="53" r="3.4" className="mini-player"/>)}</svg>
}

export default function App() {
 const [concept,setConcept]=useState<Concept>(initialConcept)
 const [side,setSide]=useState<Side>(concept.side), [view,setView]=useState<View>('playbook')
 const [query,setQuery]=useState(''), [filter,setFilter]=useState('All topics')
 const [expanded,setExpanded]=useState<string[]>([concept.category])
 const [coverage,setCoverage]=useState<Coverage>(()=>{const value=new URLSearchParams(location.hash.slice(1)).get('coverage') as Coverage;return COVERAGES.includes(value)?value:concept.coverage??'Cover 1'})
 const [showDefense,setShowDefense]=useLocal('gridirondex-defense',true),[showLabels,setShowLabels]=useLocal('gridirondex-labels',false)
 const [saved,setSaved]=useLocal<string[]>('gridirondex-saved',[])
 const [filmOpen,setFilmOpen]=useState(false), [sourcesOpen,setSourcesOpen]=useState(false), [counterOpen,setCounterOpen]=useState(false)
 const [mobileMenu,setMobileMenu]=useState(false), [help,setHelp]=useState(false), [toast,setToast]=useState('')
 const searchRef=useRef<HTMLInputElement>(null), reduced=useReducedMotion()
 const playback=usePlayback(concept.id)
 const choose=useCallback((c:Concept)=>{setConcept(c);setSide(c.side);setView('playbook');setMobileMenu(false);setSourcesOpen(false);setCounterOpen(false);setCoverage(c.coverage??(c.id==='four-verticals'?'Cover 3':c.id==='smash'?'Cover 2':'Cover 1'));setExpanded(prev=>prev.includes(c.category)?prev:[...prev,c.category]);setQuery('');window.scrollTo({top:0,behavior:'instant'})},[])
 useEffect(()=>{const onHash=()=>{const p=new URLSearchParams(location.hash.slice(1)),c=findConcept(p.get('play')??'mesh');setConcept(c);setSide(c.side);setView('playbook');const cov=p.get('coverage') as Coverage;if(COVERAGES.includes(cov))setCoverage(cov)};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash)},[])
 useEffect(()=>{history.replaceState(null,'',`#play=${concept.id}&coverage=${encodeURIComponent(coverage)}`)},[concept.id,coverage])
 useEffect(()=>{if(!toast)return;const timeout=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(timeout)},[toast])
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLSelectElement)){e.preventDefault();searchRef.current?.focus()}if(e.key==='Escape'){setMobileMenu(false);setHelp(false);setQuery('')}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[])
 const visible=useMemo(()=>concepts.filter(c=>(view==='saved'?saved.includes(c.id):c.side===side)&&(filter==='All topics'||c.category===filter)&&(!query||`${c.name} ${c.subtitle} ${c.summary} ${c.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))),[side,view,saved,filter,query])
 const sidebarMatches=concepts.filter(c=>c.side===side&&(!query||`${c.name} ${c.subtitle} ${c.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())))
 const favorite=saved.includes(concept.id)
 const save=(id:string)=>{const exists=saved.includes(id);setSaved(prev=>exists?prev.filter(s=>s!==id):[...prev,id]);setToast(exists?'Removed from your playbook':'Saved to your playbook')}
 const closeFilm=useCallback(()=>setFilmOpen(false),[])
 const share=async()=>{try{await navigator.clipboard.writeText(location.href);setToast('Play link copied')}catch{setToast('Copy the play link from your address bar')}}
 const changeSide=(s:Side)=>{setSide(s);setFilter('All topics');setQuery('');setExpanded([s==='offense'?'Passing concepts':'Coverages & shells']);if(view==='playbook')choose(concepts.find(c=>c.side===s)!)}
 const related=concepts.filter(c=>c.category===concept.category&&c.id!==concept.id).slice(0,3)
 const phase=playback.progress===0?'Pre-snap':playback.progress<.35?'Release':playback.progress<.7?'Develop':'Find the window'
 const readIndex=Math.min(2,Math.floor(playback.progress*3))
 return <div className="app-shell">
   <a className="skip-link" href="#main-content">Skip to the play</a>
   <header className="app-header">
     <button className="brand" onClick={()=>choose(concepts[0])} aria-label="GridironDex home"><span className="brand-symbol"><Route size={25}/></span><span>Gridiron<span className="brand-accent">Dex</span><span className="brand-period">.</span></span></button>
     <div className="header-divider"/><span className="header-caption">THE GAME, DECODED.</span>
     <nav className="header-nav" aria-label="Main navigation"><button className={view==='playbook'?'active':''} onClick={()=>setView('playbook')}>Playbook</button><button className={view==='guide'?'active':''} onClick={()=>{setView('guide');setFilter('All topics');setQuery('')}}>Field guide</button><button className={view==='film'?'active':''} onClick={()=>{setView('film');setFilter('All topics');setQuery('')}}>Film room <ArrowUpRight size={12}/></button></nav>
     <button className={`saved-nav ${view==='saved'?'active':''}`} onClick={()=>{setView('saved');setFilter('All topics');setQuery('')}}><Bookmark size={15}/><span>My playbook</span><b>{saved.length}</b></button>
     <button className="mobile-menu icon-button" aria-label="Open concept library" aria-expanded={mobileMenu} onClick={()=>setMobileMenu(p=>!p)}><Menu size={21}/></button>
   </header>
   <div className="workspace">
     {mobileMenu&&<button className="sidebar-scrim" aria-label="Close concept library" onClick={()=>setMobileMenu(false)}/>}
     <aside className={`sidebar ${mobileMenu?'open':''}`} aria-label="Concept library">
       <div className="sidebar-intro"><div className="eyebrow"><BookOpen size={13}/> THE PLAYBOOK<button className="mobile-close text-button" onClick={()=>setMobileMenu(false)} aria-label="Close library"><X size={17}/></button></div><p>Learn to see the whole field.</p></div>
       <label className="search-box"><Search size={16}/><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a concept…" aria-label="Search concepts"/><kbd>/</kbd>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={13}/></button>}</label>
       <div className="side-switch" role="group" aria-label="Side of the ball"><button className={side==='offense'?'active':''} onClick={()=>changeSide('offense')}><Route size={14}/> Offense</button><button className={side==='defense'?'active defense':''} onClick={()=>changeSide('defense')}><Shield size={14}/> Defense</button></div>
       <div className="sidebar-topics">
         <div className="library-label"><span>{side==='offense'?'OFFENSIVE':'DEFENSIVE'} CONCEPTS</span><span>{sidebarMatches.length}</span></div>
         {categories.filter(cat=>sidebarMatches.some(c=>c.category===cat)).map(cat=>{const entries=sidebarMatches.filter(c=>c.category===cat),open=expanded.includes(cat)||!!query;return <div className={`topic-group ${open?'expanded':''}`} key={cat}>
           <button className="topic-heading" onClick={()=>setExpanded(prev=>prev.includes(cat)?prev.filter(x=>x!==cat):[...prev,cat])} aria-expanded={open}><span>{cat}</span><span>{entries.length}<ChevronDown size={13}/></span></button>
           {open&&<div className="topic-entries">{entries.map(c=><button key={c.id} className={`concept-link ${concept.id===c.id&&view==='playbook'?'selected':''}`} onClick={()=>choose(c)} aria-current={concept.id===c.id&&view==='playbook'?'page':undefined}><span className="concept-node"/><span>{c.name}</span>{saved.includes(c.id)?<Bookmark size={12}/>:concept.id===c.id&&view==='playbook'?<ArrowRight size={13}/>:null}</button>)}</div>}
         </div>})}
         {!sidebarMatches.length&&<div className="sidebar-empty">No concepts found.<button className="text-button" onClick={()=>setQuery('')}>Clear search</button></div>}
       </div>
       <div className="mobile-destinations"><button onClick={()=>{setView('film');setMobileMenu(false);setFilter('All topics')}}><Film size={14}/> Film room</button><button onClick={()=>{setView('saved');setMobileMenu(false);setFilter('All topics')}}><Bookmark size={14}/> My playbook <b>{saved.length}</b></button></div>
       <button className="sidebar-help" onClick={()=>{setHelp(p=>!p);setMobileMenu(false)}}><span className="help-icon"><CircleHelp size={18}/></span><span><strong>New to X’s and O’s?</strong><small>A quick guide to the field</small></span><ChevronRight size={15}/></button>
       <div className="sidebar-footer"><span className="tiny-brand">GD<span> / FIELD NOTES</span></span><span>V.1.0</span></div>
     </aside>
     <main id="main-content" className="main-content">
       {help&&<div className="help-panel"><div><span className="eyebrow">START HERE</span><h2>Follow the lines. Find the space.</h2><p>Cyan circles are offensive players. Red crosses are defenders. Amber marks the route to watch. Purple areas show coverage responsibilities. Press “Run play” to follow the routes, then compare another coverage. Select any player for their assignment.</p></div><button className="icon-button" aria-label="Close quick guide" onClick={()=>setHelp(false)}><X size={20}/></button></div>}
       {view==='playbook'?<>
         <div className="breadcrumb"><button onClick={()=>{setView('guide');setFilter('All topics')}}>Playbook</button><ChevronRight size={11}/><span>{concept.side}</span><ChevronRight size={11}/><span>{concept.category}</span><div className="page-actions"><button aria-label="Copy link to this play" onClick={()=>void share()}><Clipboard size={14}/><span>Share play</span></button><button className={favorite?'is-saved':''} aria-label={favorite?'Remove from my playbook':'Save to my playbook'} onClick={()=>save(concept.id)}><Bookmark size={15} fill={favorite?'currentColor':'none'}/></button></div></div>
         <div className="concept-heading"><div><div className="concept-meta"><span className={`type-tag ${concept.side}`}>{concept.category==='Passing concepts'?'PASSING CONCEPT':concept.category.toUpperCase()}</span><span className="difficulty"><span/>{concept.difficulty}</span></div><h1>{concept.name}<span className="heading-dot">.</span></h1><p>{concept.subtitle}</p></div><div className="heading-watermark" aria-hidden="true">{concept.side==='offense'?<Route size={78} strokeWidth={.8}/>:<Shield size={78} strokeWidth={.8}/>}</div></div>
         <div className="studio-layout">
           <section className="play-studio" aria-label="Interactive play diagram">
             <div className="studio-toolbar"><div className="studio-tabs"><span className="selected"><Layers3 size={14}/> Diagram</span><button onClick={()=>setFilmOpen(true)}><Film size={14}/> On film <ArrowUpRight size={10}/></button></div><label className="coverage-select"><span>VS.</span><select value={coverage} onChange={e=>{setCoverage(e.target.value as Coverage);playback.reset()}} aria-label="Defensive coverage">{COVERAGES.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={12}/></label></div>
             <Field concept={concept} coverage={coverage} progress={playback.progress} showDefense={showDefense} showLabels={showLabels}/>
             <div className="playback-controls"><button className="run-button" onClick={playback.toggle} aria-label={playback.playing?'Pause play':playback.progress>=1?'Replay play':'Run play'}>{playback.playing?<Pause size={15} fill="currentColor"/>:<Play size={15} fill="currentColor"/>}<span>{playback.playing?'Pause play':playback.progress>=1?'Replay play':'Run play'}</span></button><button className="replay-button" onClick={playback.reset} aria-label="Reset play"><RotateCcw size={16}/></button><div className="timeline"><input type="range" min="0" max="1" step=".001" value={playback.progress} onChange={e=>playback.scrub(Number(e.target.value))} aria-label="Play timeline" style={{'--progress':`${playback.progress*100}%`} as React.CSSProperties}/><div className="timeline-labels"><span>{phase}</span><span>{(playback.progress*4.5).toFixed(1)} / 4.5s</span></div></div><select className="speed-select" value={playback.speed} onChange={e=>playback.setSpeed(Number(e.target.value))} aria-label="Playback speed"><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div>
             <div className="diagram-options"><div className="legend"><span><i className="offense-symbol"/> Offense</span><span><i className="defense-symbol">×</i> Defense</span><span><i className="read-symbol"/> Key route</span></div><div className="display-options"><label><input type="checkbox" checked={showDefense} onChange={e=>setShowDefense(e.target.checked)}/><span>Defense</span></label><label><input type="checkbox" checked={showLabels} onChange={e=>setShowLabels(e.target.checked)}/><span>Labels</span></label></div></div>
             <div className="read-strip"><span className="read-number">{String(readIndex+1).padStart(2,'0')}</span><div><span className="eyebrow">{concept.side==='offense'?'THE QUARTERBACK’S READ':'FOLLOW THE RESPONSIBILITY'}</span><p>{concept.read[readIndex]}</p></div><ArrowRight size={18}/></div>
           </section>
           <aside className="coaching-panel" aria-label="Concept explanation"><div className="panel-heading"><span className="eyebrow">INSIDE THE PLAY</span><Target size={15}/></div><h2>{concept.diagram==='coverage'?'How it works':'The idea is simple.'}</h2><p className="concept-summary">{concept.summary}</p><div className="watch-note"><span className="eyebrow"><Target size={13}/> WATCH THIS</span><p>{concept.watch}</p></div><button className="counter-heading" onClick={()=>setCounterOpen(p=>!p)} aria-expanded={counterOpen}><Shield size={14}/><span>{concept.side==='offense'?'How the defense responds':'How the offense attacks it'}</span><ChevronDown size={14} className={counterOpen?'rotate':''}/></button>{counterOpen&&<p className="counter-copy">{concept.counter}</p>}
             <button className="film-card" onClick={()=>setFilmOpen(true)} aria-label={`Watch ${concept.name} coaching film`}><img src={`https://i.ytimg.com/vi/${concept.film.id}/hqdefault.jpg`} alt="" loading="lazy"/><div className="film-card-scrim"/><span className="film-card-label"><Film size={11}/> FROM THE FILM ROOM</span><span className="film-play"><Play size={15} fill="currentColor"/></span><div className="film-card-bottom"><strong>See it on film</strong><span>{concept.film.channel}<ArrowUpRight size={13}/></span></div></button>
             <button className="sources-button" onClick={()=>setSourcesOpen(p=>!p)} aria-expanded={sourcesOpen}><BookOpen size={13}/><span>Coaching sources</span><b>{concept.sources.length}</b><ChevronDown size={13} className={sourcesOpen?'rotate':''}/></button>{sourcesOpen&&<div className="source-list">{concept.sources.map(s=><a href={s.url} key={s.url} target="_blank" rel="noreferrer"><span><strong>{s.title}</strong><small>{s.publisher}</small></span><ArrowUpRight size={14}/></a>)}<p>Diagrams show a teaching example. Assignments and terminology vary by team.</p></div>}
           </aside>
         </div>
         <section className="related-section"><div className="related-heading"><span className="eyebrow">CONNECT THE DOTS</span><button onClick={()=>{setView('guide');setFilter(concept.category)}}>Explore {concept.category.toLowerCase()}<ArrowRight size={13}/></button></div><div className="related-list">{related.map(c=><button key={c.id} className="related-concept" onClick={()=>choose(c)}><MiniDiagram type={c.diagram}/><div><strong>{c.name}</strong><span>{c.subtitle}</span></div><ArrowUpRight size={17}/></button>)}</div></section>
       </>:<>
         <div className="breadcrumb"><span>GRIDIRONDEX</span><ChevronRight size={11}/><span>{view==='saved'?'My playbook':view==='film'?'Film room':'Field guide'}</span></div>
         <div className="library-hero"><span className="eyebrow">{view==='saved'?'YOUR PERSONAL CALL SHEET':view==='film'?'FROM THE WHITEBOARD TO THE FILM':'A FIELD GUIDE TO FOOTBALL'}</span><h1>{view==='saved'?'Your playbook':view==='film'?'See it on film':'The game, decoded'}<span className="heading-dot">.</span></h1><p>{view==='saved'?'Keep the concepts you want to come back to.':view==='film'?'Coaching breakdowns paired with the concepts you’re learning.':'Routes, reads and responsibilities. One concept at a time.'}</p></div>
         <div className="library-toolbar"><span><BookOpen size={15}/>{visible.length} concepts</span><label><ListFilter size={14}/><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter by topic"><option>All topics</option>{categories.filter(cat=>concepts.some(c=>c.category===cat&&(view==='saved'||c.side===side))).map(cat=><option key={cat}>{cat}</option>)}</select></label></div>
         {visible.length?<div className="concept-grid">{visible.map(c=><article className="library-card" key={c.id}><button className="library-card-main" onClick={()=>{choose(c);if(view==='film')setFilmOpen(true)}}><div className="library-preview">{view==='film'?<><img src={`https://i.ytimg.com/vi/${c.film.id}/mqdefault.jpg`} alt="" loading="lazy"/><span><Play size={18} fill="currentColor"/></span></>:<MiniDiagram type={c.diagram}/>}</div><div className="library-card-info"><span className="eyebrow">{c.category}</span><h2>{c.name}</h2><p>{c.subtitle}</p><div className="library-card-footer"><span>{view==='film'?c.film.channel:c.difficulty}</span><ArrowRight size={16}/></div></div></button><button className={`card-save ${saved.includes(c.id)?'is-saved':''}`} onClick={()=>save(c.id)} aria-label={`${saved.includes(c.id)?'Unsave':'Save'} ${c.name}`}><Bookmark size={16} fill={saved.includes(c.id)?'currentColor':'none'}/></button></article>)}</div>:<div className="empty-state"><Bookmark size={32}/><h2>{view==='saved'&&!query?'Your next favorite play is out there.':'No concepts match this search.'}</h2><p>{view==='saved'&&!query?'Save a concept with the bookmark button to add it here.':'Try a route name, coverage, position, or another topic.'}</p><button className="run-button" onClick={()=>{setView('guide');setQuery('');setFilter('All topics')}}>Explore the field guide <ArrowRight size={15}/></button></div>}
       </>}
       <footer className="main-footer"><span>FOOTBALL IS A GAME OF SPACE.<span> Now you can see it.</span></span><span><span className="live-dot"/>{concepts.length} CONCEPTS TO EXPLORE</span></footer>
     </main>
   </div>
   {filmOpen&&<FilmModal concept={concept} onClose={closeFilm}/>}
   <AnimatePresence>{toast&&<motion.div role="status" className="toast" initial={{opacity:0,y:reduced?0:15}} animate={{opacity:1,y:0}} exit={{opacity:0}}><Check size={15}/>{toast}</motion.div>}</AnimatePresence>
 </div>
}
