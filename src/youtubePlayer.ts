// The official IFrame API reports playback failures that iframe.onload cannot.
export interface YouTubePlayer { destroy(): void }
interface PlayerOptions {
  events: { onReady(): void; onError(event: { data: number }): void }
}
export interface YouTubeApi {
  Player: new (iframe: HTMLIFrameElement, options: PlayerOptions) => YouTubePlayer
}
declare global {
  interface Window { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void }
}

let pending: Promise<YouTubeApi> | undefined
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending
  pending = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script')
    const previous = window.onYouTubeIframeAPIReady
    const restore = () => {
      clearTimeout(timeout)
      script.onerror = null
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous
    }
    const fail = () => { restore(); script.remove(); reject(new Error('YouTube player did not load')) }
    const ready = () => {
      if (!window.YT?.Player) { fail(); return }
      restore()
      resolve(window.YT)
      previous?.()
    }
    const timeout = setTimeout(fail, 15000)
    window.onYouTubeIframeAPIReady = ready
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = fail
    document.head.append(script)
  }).catch(error => { pending = undefined; throw error })
  return pending
}

export function playbackError(code?: number): string {
  if (code === 100) return 'This video is no longer available on YouTube. The diagram is still available.'
  if (code === 101 || code === 150) return 'This creator only allows playback on YouTube. Open the clip there at the same timestamp.'
  if (code === undefined) return 'The YouTube player hasn’t loaded. Retry, or open the clip on YouTube.'
  return 'YouTube couldn’t play this clip here. Try again, or open it on YouTube.'
}
