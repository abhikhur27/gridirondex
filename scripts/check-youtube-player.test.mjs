import assert from 'node:assert/strict'
import test from 'node:test'

let sequence = 0
async function fixture(t) {
  const priorWindow = globalThis.window, priorDocument = globalThis.document
  const scripts = []
  globalThis.window = {}
  globalThis.document = {
    createElement: () => ({ removed: false, remove() { this.removed = true } }),
    head: { append(script) { scripts.push(script) } },
  }
  t.after(() => { globalThis.window = priorWindow; globalThis.document = priorDocument })
  return { scripts, ...await import(`../src/youtubePlayer.ts?test=${sequence++}`) }
}

test('concurrent drawers share the SDK request and preserve a previous ready callback', async t => {
  const { scripts, loadYouTubeApi } = await fixture(t)
  let calls = 0
  const previous = () => calls++
  window.onYouTubeIframeAPIReady = previous
  const first = loadYouTubeApi(), second = loadYouTubeApi()
  assert.equal(first, second)
  assert.equal(scripts.length, 1)
  assert.equal(scripts[0].src, 'https://www.youtube.com/iframe_api')
  const api = { Player: class {} }
  window.YT = api
  window.onYouTubeIframeAPIReady()
  assert.equal(await first, api)
  assert.equal(window.onYouTubeIframeAPIReady, previous)
  assert.equal(calls, 1)
  assert.equal(await loadYouTubeApi(), api)
  assert.equal(scripts.length, 1)
})

test('a failed SDK download can be retried without reloading the page', async t => {
  const { scripts, loadYouTubeApi } = await fixture(t)
  const pending = loadYouTubeApi()
  const rejected = assert.rejects(pending, /did not load/)
  scripts[0].onerror()
  await rejected
  assert.equal(scripts[0].removed, true)
  const retried = loadYouTubeApi()
  assert.equal(scripts.length, 2)
  window.YT = { Player: class {} }
  window.onYouTubeIframeAPIReady()
  assert.equal(await retried, window.YT)
})

test('a stalled SDK rejects after the deadline and does not poison the next attempt', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { scripts, loadYouTubeApi } = await fixture(t)
  const rejected = assert.rejects(loadYouTubeApi(), /did not load/)
  t.mock.timers.tick(15000)
  await rejected
  assert.equal(scripts[0].removed, true)
  const retried = loadYouTubeApi()
  window.YT = { Player: class {} }
  window.onYouTubeIframeAPIReady()
  await retried
  assert.equal(scripts.length, 2)
})

test('publisher blocks, removal, and load failure have actionable messages', async t => {
  const { playbackError } = await fixture(t)
  assert.match(playbackError(101), /only allows playback on YouTube/)
  assert.equal(playbackError(101), playbackError(150))
  assert.match(playbackError(100), /no longer available/)
  assert.match(playbackError(), /Retry/)
  assert.match(playbackError(153), /Try again/)
})
