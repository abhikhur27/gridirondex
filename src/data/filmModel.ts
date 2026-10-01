import type { Film } from './types.ts'

export interface VerifiedFilm extends Film {
  durationSeconds: number
  verification: {
    kind: 'publisher-chapter' | 'transcript' | 'short-topic'
    sourceUrl: string
    excerpt: string
    checkedOn: string
  }
}

export const youtubeSourceUrl = (film: Film) => `https://www.youtube.com/watch?v=${film.id}&t=${film.start}s`
export const youtubeEmbedUrl = (film: Film) => `https://www.youtube-nocookie.com/embed/${film.id}?start=${film.start}${film.end ? `&end=${film.end}` : ''}&rel=0&playsinline=1`
