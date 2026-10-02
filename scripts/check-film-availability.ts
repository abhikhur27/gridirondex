/**
 * Live, public YouTube metadata audit. Run separately from the offline checks:
 * node --experimental-strip-types scripts/check-film-availability.ts
 * Use --embed-only for a reduced check during watch-page rate limiting; the
 * resulting report is explicitly incomplete and cannot exit successfully.
 *
 * An HTTP 200 embed page or watch-page playableInEmbed flag is insufficient:
 * copyright holders can reject the embedded-player preview independently.
 * This checks that preview using the site's actual origin and Referer.
 * It does NOT click Play or verify browser media playback; the report says so.
 * Exit 0 = all metadata checks passed, 1 = known unavailable/restricted clips,
 * 2 = incomplete network/metadata checks. A mixed blocked/incomplete run exits 1.
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { offenseFilms } from '../src/data/filmAuditOffense.ts'
import { defenseFilms } from '../src/data/filmAuditDefense.ts'

const ORIGIN = 'https://gridiron-dex.com'
const VIDEO_CONCURRENCY = 1 // Each video issues three requests: at most three in flight.
const TIMEOUT_MS = 20_000
const embedOnly = process.argv.includes('--embed-only')
const rateLimitedHosts = new Set<string>()
const reportUrl = new URL('../docs/film-link-health.json', import.meta.url)
type JsonObject = Record<string, any>
type Endpoint = { url: string; httpStatus?: number; error?: string; [key: string]: unknown }
type Mapping = { conceptId: string; title: string; channel: string; start: number; end?: number; durationSeconds: number }

// Balanced JSON extraction avoids evaluating any JavaScript delivered by YouTube.
function objectAfter(text: string, marker: string): JsonObject | undefined {
  const markerAt = text.indexOf(marker)
  if (markerAt < 0) return undefined
  const start = text.indexOf('{', markerAt + marker.length)
  if (start < 0) return undefined
  let depth = 0, quoted = false, escaped = false
  for (let index = start; index < text.length; index++) {
    const character = text[index]
    if (escaped) { escaped = false; continue }
    if (character === '\\' && quoted) { escaped = true; continue }
    if (character === '"') { quoted = !quoted; continue }
    if (!quoted) {
      if (character === '{') depth++
      if (character === '}' && --depth === 0) return JSON.parse(text.slice(start, index + 1))
    }
  }
  return undefined
}

function embeddedResponse(html: string): JsonObject | undefined {
  const match = html.match(/"embedded_player_response"\s*:\s*("(?:[^"\\]|\\.)*")/)
  return match ? JSON.parse(JSON.parse(match[1])) : undefined
}

function explanation(status: JsonObject | undefined): string[] {
  if (!status) return []
  const screen = status.errorScreen
  const interstitial = screen?.playerInterstitialRenderer?.content?.interstitialViewModel
  const oldRenderer = screen?.playerErrorMessageRenderer
  const flatten = (value: any) => typeof value === 'string' ? value : value?.simpleText ?? value?.runs?.map((run: any) => run.text ?? '').join('')
  const raw = [status.reason, status.errorCode, interstitial?.title?.content, interstitial?.description?.content, flatten(oldRenderer?.reason), flatten(oldRenderer?.subreason)]
  return [...new Set(raw.filter(Boolean).map(value => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()))]
}

async function fetchText(url: string): Promise<{ endpoint: Endpoint; text?: string }> {
  const hostname = new URL(url).hostname
  if (rateLimitedHosts.has(hostname)) return { endpoint: { url, error: `Deferred after ${hostname} returned HTTP 429; rerun after the rate limit clears.` } }
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Referer: `${ORIGIN}/`, 'Accept-Language': 'en-US,en;q=0.8' },
    })
    if (response.status === 429) rateLimitedHosts.add(hostname)
    return { endpoint: { url, httpStatus: response.status }, text: await response.text() }
  } catch (error) {
    return { endpoint: { url, error: error instanceof Error ? error.message : String(error) } }
  }
}

async function checkWatch(id: string): Promise<Endpoint> {
  const { endpoint, text } = await fetchText(`https://www.youtube.com/watch?v=${id}&hl=en`)
  if (endpoint.httpStatus !== 200 || !text) return endpoint
  try {
    const player = objectAfter(text, 'var ytInitialPlayerResponse =') ?? objectAfter(text, 'ytInitialPlayerResponse =')
    if (!player) return { ...endpoint, error: 'Public watch page did not expose player metadata (possible consent, rate limit, or page-format change).' }
    return {
      ...endpoint,
      status: player.playabilityStatus?.status ?? null,
      playableInEmbed: player.playabilityStatus?.playableInEmbed ?? null,
      reasons: explanation(player.playabilityStatus),
      videoId: player.videoDetails?.videoId ?? null,
      title: player.videoDetails?.title ?? null,
      channel: player.videoDetails?.author ?? null,
      durationSeconds: Number(player.videoDetails?.lengthSeconds) || null,
    }
  } catch (error) { return { ...endpoint, error: `Could not parse watch metadata: ${String(error)}` } }
}

async function checkOEmbed(id: string): Promise<Endpoint> {
  const { endpoint, text } = await fetchText(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`)
  if (endpoint.httpStatus !== 200 || !text) return endpoint
  try {
    const data = JSON.parse(text)
    return { ...endpoint, title: data.title ?? null, channel: data.author_name ?? null, type: data.type ?? null, includesExpectedEmbed: typeof data.html === 'string' && data.html.includes(`/embed/${id}`) }
  } catch (error) { return { ...endpoint, error: `Could not parse oEmbed metadata: ${String(error)}` } }
}

async function checkEmbed(id: string, start: number): Promise<Endpoint> {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${id}`)
  url.search = new URLSearchParams({ start: String(start), enablejsapi: '1', origin: ORIGIN, hl: 'en', rel: '0' }).toString()
  const { endpoint, text } = await fetchText(url.href)
  if (endpoint.httpStatus !== 200 || !text) return endpoint
  try {
    const player = embeddedResponse(text)
    if (!player) return { ...endpoint, error: 'Embed HTML did not expose embedded_player_response. HTTP 200 alone is not a playback check.' }
    const status = player.previewPlayabilityStatus ?? player.playabilityStatus
    return {
      ...endpoint,
      metadataKind: player.previewPlayabilityStatus ? 'previewPlayabilityStatus' : 'playabilityStatus',
      status: status?.status ?? null,
      playableInEmbed: status?.playableInEmbed ?? player.videoFlags?.playableInEmbed ?? null,
      reasons: explanation(status),
    }
  } catch (error) { return { ...endpoint, error: `Could not parse embedded-player preview: ${String(error)}` } }
}

const films = { ...offenseFilms, ...defenseFilms }
const unique = new Map<string, Mapping[]>()
for (const [conceptId, film] of Object.entries(films)) {
  const mappings = unique.get(film.id) ?? []
  mappings.push({ conceptId, title: film.title, channel: film.channel, start: film.start, end: film.end, durationSeconds: film.durationSeconds })
  unique.set(film.id, mappings)
}
if (unique.size === 0) throw new Error('No registry films were loaded; refusing an empty audit.')

const registryHashes = Object.fromEntries(await Promise.all(['filmAuditOffense.ts', 'filmAuditDefense.ts'].map(async name => [name, createHash('sha256').update(await readFile(new URL(`../src/data/${name}`, import.meta.url))).digest('hex')])))
const entries = [...unique.entries()]
const videos: JsonObject[] = new Array(entries.length)
let nextIndex = 0
let reportedIncomplete = 0
const startedAt = new Date().toISOString()
await Promise.all(Array.from({ length: Math.min(VIDEO_CONCURRENCY, entries.length) }, async () => {
  for (;;) {
    const index = nextIndex++
    if (index >= entries.length) return
    const [id, mappings] = entries[index]
    const deferred: Endpoint = { url: '', error: 'Intentionally deferred by --embed-only; this is an incomplete audit until rerun without that flag.' }
    const [watch, oEmbed, embed] = await Promise.all([embedOnly ? deferred : checkWatch(id), embedOnly ? deferred : checkOEmbed(id), checkEmbed(id, mappings[0].start)])
    const blocked: string[] = [], incomplete: string[] = []
    for (const [label, check] of [['watch', watch], ['embed', embed]] as const) {
      const status = check.status
      // Error 153 means this audit's embedder identity was not accepted; do not
      // mislabel that environment failure as a publisher restriction.
      const identityMissing = JSON.stringify(check.reasons ?? []).includes('EMBEDDER_IDENTITY_MISSING_REFERRER')
      if (identityMissing) incomplete.push(`${label}: embedder identity/referrer rejected`)
      else if (check.playableInEmbed === false || ['UNPLAYABLE', 'LOGIN_REQUIRED', 'ERROR', 'LIVE_STREAM_OFFLINE'].includes(String(status))) blocked.push(`${label}: ${status ?? 'embedding disabled'}`)
      else if (status !== 'OK' || check.playableInEmbed !== true || check.error || check.httpStatus !== 200) incomplete.push(`${label}: ${check.error ?? `HTTP ${check.httpStatus ?? 'unknown'}, status ${status ?? 'missing'}, playableInEmbed ${check.playableInEmbed ?? 'missing'}`}`)
    }
    if ([401, 404].includes(Number(oEmbed.httpStatus))) blocked.push(`oEmbed: HTTP ${oEmbed.httpStatus}`)
    else if (oEmbed.httpStatus !== 200 || oEmbed.error || oEmbed.includesExpectedEmbed !== true) incomplete.push(`oEmbed: ${oEmbed.error ?? `HTTP ${oEmbed.httpStatus ?? 'unknown'}, expected embed ${oEmbed.includesExpectedEmbed ?? 'missing'}`}`)
    if (watch.videoId && watch.videoId !== id) blocked.push('Watch metadata returned a different video ID')
    if (typeof watch.durationSeconds === 'number') {
      for (const mapping of mappings) {
        if (mapping.start >= watch.durationSeconds || (mapping.end !== undefined && mapping.end > watch.durationSeconds)) blocked.push(`${mapping.conceptId}: segment extends past current duration ${watch.durationSeconds}s`)
      }
    }
    const status = blocked.length ? 'blocked' : incomplete.length ? 'incomplete' : 'metadata-passed'
    videos[index] = { id, mappings, status, blocked, incomplete, watch, oEmbed, embed, browserPlayback: { status: 'not-tested', reason: 'This network audit does not operate the browser player or verify media playback.' } }
    if (status === 'blocked' || (status === 'incomplete' && !embedOnly && reportedIncomplete++ < 5)) console.log(`${status.toUpperCase()} ${id} [${mappings.map(mapping => mapping.conceptId).join(', ')}]: ${[...blocked, ...incomplete].join('; ')}`)
  }
}))

const summary = {
  mappings: Object.keys(films).length,
  uniqueVideos: videos.length,
  metadataPassed: videos.filter(video => video.status === 'metadata-passed').length,
  embedPreviewPassed: videos.filter(video => video.embed.status === 'OK' && video.embed.playableInEmbed === true).length,
  blocked: videos.filter(video => video.status === 'blocked').length,
  incomplete: videos.filter(video => video.status === 'incomplete').length,
  browserPlaybackTested: 0,
}
await writeFile(reportUrl, `${JSON.stringify({
  schemaVersion: 1, startedAt, checkedAt: new Date().toISOString(), origin: ORIGIN, registryHashes,
  method: embedOnly
    ? 'Reduced audit: every unique mapped video was checked against privacy-enhanced embedded-player preview metadata. Watch and oEmbed checks were intentionally deferred, so this audit remains incomplete. Embed requests used the production origin and Referer.'
    : 'Every unique mapped video was scheduled for official public YouTube watch metadata, oEmbed, and privacy-enhanced embed preview metadata. Further requests to a host after its HTTP 429 are deferred and marked incomplete; the other host may still be checked. Embed requests used the production origin and Referer. Preview status must pass independently of watch-page flags.',
  limitations: 'A metadata pass is not browser playback verification, topic/timestamp validation, or a guarantee across countries, accounts, devices, or future publisher changes. Browser Play must be checked separately.',
  network: { videoConcurrency: VIDEO_CONCURRENCY, maxConcurrentRequests: VIDEO_CONCURRENCY * (embedOnly ? 1 : 3), timeoutMs: TIMEOUT_MS, embedOnly, rateLimited: rateLimitedHosts.size > 0, rateLimitedHosts: [...rateLimitedHosts] }, summary, videos,
}, null, 2)}\n`)
console.log(`Film availability: ${summary.uniqueVideos} videos / ${summary.mappings} mappings; ${summary.metadataPassed} metadata passed, ${summary.blocked} blocked, ${summary.incomplete} incomplete; browser playback not tested. Report: docs/film-link-health.json`)
process.exitCode = summary.blocked ? 1 : summary.incomplete ? 2 : 0
