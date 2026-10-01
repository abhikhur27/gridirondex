import type { Concept } from '../data/types'
import { youtubeSourceUrl } from '../data/filmModel'

export default function SourceCredit({ concept }: { concept: Concept }) {
  const film = concept.film
  const source = concept.sources.find(item => !/youtu(?:\.be|be\.com)/.test(item.url)) ?? concept.sources[0]
  return <p className="source-credit">{film ? <>Source / Film breakdown courtesy of <a href={youtubeSourceUrl(film)} target="_blank" rel="noopener noreferrer">{film.channel} (YouTube)</a></> : source ? <>Source / <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} — {source.title}</a></> : null}</p>
}
