import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import type { Film } from '../data/types'
import { youtubeEmbedUrl, youtubeSourceUrl } from '../data/filmModel'
import { loadYouTubeApi, playbackError, type YouTubePlayer } from '../youtubePlayer'

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function FilmPlayer({ film }: { film: Film }) {
  const host = useRef<HTMLDivElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    const container = host.current!
    let disposed = false
    let player: YouTubePlayer | undefined
    setError('')
    const iframe = document.createElement('iframe')
    iframe.title = film.title
    iframe.src = youtubeEmbedUrl(film, window.location.origin)
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    container.replaceChildren(iframe)
    const fail = (code?: number) => {
      if (!disposed) { clearTimeout(timeout); setError(playbackError(code)) }
    }
    const timeout = setTimeout(() => fail(), 20000)
    loadYouTubeApi().then(api => {
      if (disposed) return
      player = new api.Player(iframe, { events: {
        onReady: () => { if (!disposed) clearTimeout(timeout) },
        onError: event => fail(event.data),
      } })
    }).catch(() => fail())
    return () => {
      disposed = true
      clearTimeout(timeout)
      player?.destroy()
      container.replaceChildren()
    }
  }, [film.id, film.start, film.end, film.title, attempt])

  return <>
    <div className="video-container film-player">
      <div ref={host} hidden={!!error} />
      {error && <div className="film-error" role="status">
        <p>{error}</p>
        <button onClick={() => setAttempt(value => value + 1)}><RotateCcw size={15} /> Retry video</button>
      </div>}
    </div>
    <a className="film-fallback" href={youtubeSourceUrl(film)} target="_blank" rel="noopener noreferrer">Watch on YouTube · {time(film.start)}<ArrowUpRight size={14} /></a>
  </>
}
