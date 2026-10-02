import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { concepts } from '../src/data/concepts.ts'
import { films } from '../src/data/sources.ts'
import { offenseFilms } from '../src/data/filmAuditOffense.ts'
import { defenseFilms } from '../src/data/filmAuditDefense.ts'
import { youtubeEmbedUrl, youtubeSourceUrl, type VerifiedFilm } from '../src/data/filmModel.ts'

type AuditProof = VerifiedFilm['verification']
interface AuditMapping { id?: string; videoId?: string; start: number; end: number; durationSeconds: number }
interface AuditRecord {
  conceptId: string; status: string; reason?: string
  result?: AuditMapping; currentMapping?: AuditMapping
  proof?: AuditProof; verification?: AuditProof
  playerCheck?: { status: string; playableInEmbed: boolean; durationSeconds: number }
}
interface AuditDocument {
  lessons?: AuditRecord[]; records?: AuditRecord[]
  videos?: { id: string; status: string; embeddable: boolean; durationSeconds: number }[]
}
const offenseAudit: AuditDocument = JSON.parse(readFileSync(new URL('../docs/film-audit-offense.json', import.meta.url), 'utf8'))
const defenseAudit: AuditDocument = JSON.parse(readFileSync(new URL('../docs/film-audit-defense.json', import.meta.url), 'utf8'))
const linkHealth: { videos: { id: string; mappings: { conceptId: string; start: number; end: number }[]; embed: { status: string; playableInEmbed: boolean } }[] } = JSON.parse(readFileSync(new URL('../docs/film-link-health.json', import.meta.url), 'utf8'))
const records = [...offenseAudit.lessons ?? [], ...defenseAudit.records ?? []]
const reviewed = { ...offenseFilms, ...defenseFilms }
assert.deepEqual(new Set(linkHealth.videos.map(v => v.id)), new Set(Object.values(reviewed).map(f => f.id)), 'Run check:films-live after changing the video library')
const conceptIds = new Set(concepts.map(c => c.id))
const audits = new Map(records.map(r => [r.conceptId, r]))

// Missing lessons and category keys are both dangerous: they previously allowed
// a generic long video to masquerade as a clip for an unrelated lesson.
assert.equal(concepts.length, 105, 'The complete 105-lesson library must be audited')
assert.equal(records.length, concepts.length, 'Every lesson needs an explicit film decision')
assert.equal(audits.size, records.length, 'Duplicate audit decisions')
assert.deepEqual(new Set(audits.keys()), conceptIds, 'Audit is missing or inventing a lesson')
assert.equal(Object.keys(offenseFilms).filter(id => id in defenseFilms).length, 0, 'Two registries own the same lesson')
assert.deepEqual(new Set(Object.keys(films)), new Set(Object.keys(reviewed)), 'Runtime registry contains an unaudited film or category fallback')
for (const id of Object.keys(reviewed)) assert(conceptIds.has(id), `Film is keyed by a category instead of a lesson: ${id}`)
// These returned explicit NFL copyright blocks in the embed response, even
// while watch-page metadata said playableInEmbed=true. Do not reintroduce them.
const rejectedIds = new Set(['gBHQZOulvIY', '_WXKHRTSMm4', 'u7sjtJfJuAk', 'SALBQ-p647I', 'FQDh04WRz7M'])
for (const [id, film] of Object.entries(reviewed)) assert(!rejectedIds.has(film.id), `${id}: known blocked, unavailable, or uninformative clip restored`)
assert(reviewed['gap-b'], 'B-gap needs an instructional replacement, not just removal')

const signatureOwners = new Map<string, string[]>()
let playable = 0
for (const concept of concepts) {
  const { id } = concept
  const audit = audits.get(id)!
  const approved = audit.status.startsWith('verified')
  const film = reviewed[id]
  if (!approved) {
    assert(['withheld', 'animation-only'].includes(audit.status), `${id}: unknown audit decision`)
    assert(audit.reason && audit.reason.length > 30, `${id}: explain why its clip is withheld`)
    assert.equal(film, undefined, `${id}: withheld film was added to the registry`)
    assert.equal(films[id], undefined, `${id}: withheld film has a runtime fallback`)
    assert.equal(concept.film, undefined, `${id}: withheld lesson still opens a generic film`)
    continue
  }

  playable++
  assert(film, `${id}: approved audit has no film`)
  assert.deepEqual(concept.film, film, `${id}: displayed film differs from its own approved mapping`)
  assert.deepEqual(films[id], film, `${id}: runtime film differs from reviewed source`)
  assert(/^[\w-]{11}$/.test(film.id), `${id}: malformed YouTube ID`)
  assert(film.title.trim() && film.channel.trim(), `${id}: missing attribution`)
  assert(Number.isInteger(film.start) && film.start >= 0, `${id}: invalid start`)
  assert(Number.isInteger(film.end) && film.end! > film.start, `${id}: explicit finite end required`)
  assert(Number.isInteger(film.durationSeconds) && film.durationSeconds > 0, `${id}: verified full duration required`)
  assert(film.end! <= film.durationSeconds, `${id}: clip extends beyond the actual video`)
  assert(!film.companion, `${id}: unaudited companion videos must not bypass the registry`)

  const proof = film.verification
  assert(['publisher-chapter', 'transcript', 'short-topic', 'visual-review'].includes(proof.kind), `${id}: invalid verification method`)
  assert(proof.excerpt.trim().length >= 12 && /^\d{4}-\d{2}-\d{2}$/.test(proof.checkedOn), `${id}: missing verification evidence`)
  const proofUrl = new URL(proof.sourceUrl)
  assert.equal(proofUrl.protocol, 'https:', `${id}: insecure evidence URL`)
  assert.equal(proofUrl.hostname, 'www.youtube.com', `${id}: evidence must identify the source video`)
  assert.equal(proofUrl.searchParams.get('v'), film.id, `${id}: evidence references a different video`)
  if (proof.kind === 'short-topic') {
    assert(film.durationSeconds < 120, `${id}: a long video cannot pass as a short topic clip`)
    assert.equal(film.start, 0, `${id}: a short-topic claim must include the entire clip`)
    assert.equal(film.end, film.durationSeconds, `${id}: a short-topic claim must include the entire clip`)
  }
  // A named instructional opening chapter can start at zero. An arbitrary
  // one-second offset does not make an intro more relevant.
  if (film.start === 0 && film.durationSeconds >= 120) {
    assert.equal(proof.kind, 'publisher-chapter', `${id}: a long opening segment needs an exact publisher chapter`)
    assert(/(?:0:00|00:00|0s)/.test(proof.excerpt), `${id}: evidence must identify the opening chapter`)
  }

  const mapping = audit.result ?? audit.currentMapping
  assert(mapping, `${id}: audit lacks its exact accepted segment`)
  assert.deepEqual([film.id, film.start, film.end, film.durationSeconds], [mapping.videoId ?? mapping.id, mapping.start, mapping.end, mapping.durationSeconds], `${id}: audit and code segment drifted`)
  assert.deepEqual(proof, audit.proof ?? audit.verification, `${id}: code and audit evidence disagree`)
  const metadata = audit.playerCheck ?? offenseAudit.videos?.find(v => v.id === film.id)
  assert(metadata, `${id}: missing saved public player check`)
  assert.equal(metadata.status, 'OK', `${id}: player was unavailable when audited`)
  assert.equal('playableInEmbed' in metadata ? metadata.playableInEmbed : metadata.embeddable, true, `${id}: publisher disallows embedding`)
  assert.equal(metadata.durationSeconds, film.durationSeconds, `${id}: metadata duration differs from the claimed duration`)
  // The watch page advertised embedding for NFL clips that the embed itself
  // rejected. Require the independent embed preview, not just HTTP 200.
  const health = linkHealth.videos.find(v => v.id === film.id)!
  assert.equal(health.embed.status, 'OK', `${id}: embedded-player preview did not pass`)
  assert.equal(health.embed.playableInEmbed, true, `${id}: embedded player disallows playback`)
  const healthMapping = health.mappings.find(m => m.conceptId === id)
  assert(healthMapping && healthMapping.start === film.start && healthMapping.end === film.end, `${id}: link-health audit references a different segment`)

  // Exercise the actual URL builders used by the drawer and external link.
  // Zero is a real start value and must stay explicit in both outputs.
  const embed = new URL(youtubeEmbedUrl(film)), source = new URL(youtubeSourceUrl(film))
  assert.equal(embed.origin, 'https://www.youtube-nocookie.com', `${id}: unexpected embed host`)
  assert.equal(embed.pathname, `/embed/${film.id}`, `${id}: wrong embedded video`)
  assert.equal(embed.searchParams.get('start'), String(film.start), `${id}: iframe dropped the verified start`)
  assert.equal(embed.searchParams.get('end'), String(film.end), `${id}: iframe dropped the verified end`)
  assert.equal(embed.searchParams.get('enablejsapi'), '1', `${id}: iframe must report playback failures`)
  const identified = new URL(youtubeEmbedUrl(film, 'https://gridiron-dex.com'))
  assert.equal(identified.searchParams.get('origin'), 'https://gridiron-dex.com', `${id}: player origin must match the current site`)
  assert.equal(source.origin, 'https://www.youtube.com', `${id}: unexpected source host`)
  assert.equal(source.searchParams.get('v'), film.id, `${id}: external link opens a different video`)
  assert.equal(source.searchParams.get('t'), `${film.start}s`, `${id}: external link dropped the verified start`)
  assert(concept.sources.some(s => s.url === source.href), `${id}: lesson citations omit the actual verified clip`)

  const signature = `${film.id}:${film.start}:${film.end}`
  signatureOwners.set(signature, [...signatureOwners.get(signature) ?? [], id])
}

// Reuse is intentional only where two lessons actually teach the same thing.
// This catches a restored category fallback even if someone copies audit rows.
const sharedTopics = [new Set(['mesh', 'mesh-crossers']), new Set(['one-gap', 'fit-one-gap']), new Set(['two-gap', 'fit-two-gap'])]
for (const owners of signatureOwners.values()) {
  if (owners.length > 1) assert(sharedTopics.some(group => owners.every(id => group.has(id))), `Unrelated lessons share the same clip: ${owners.join(', ')}`)
}

console.log(`Film checks: all ${concepts.length} lessons audited; ${playable} bounded, evidenced clips; ${concepts.length - playable} explicit omissions; no category fallbacks; iframe/source timestamps preserved.`)
