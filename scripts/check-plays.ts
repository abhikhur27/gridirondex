import assert from 'node:assert/strict'
import { concepts } from '../src/data/concepts.ts'
import { sceneFor } from '../src/data/playScenes.ts'
import { samplePlay, trackPosition } from '../src/data/playEngine.ts'
const signatures = new Set<string>()
const near = (a: number[], b: number[], epsilon = .001) => Math.hypot(a[0]-b[0],a[1]-b[1]) < epsilon
for (const concept of concepts) {
  const s = sceneFor(concept), players = [...s.offensiveNodes,...s.defensiveNodes], ids = new Set(players.map(n=>n.id))
  assert.equal(s.offensiveNodes.length,11,`${s.id}: eleven offensive players`)
  assert.equal(s.defensiveNodes.length,11,`${s.id}: eleven defensive players`)
  assert.equal(ids.size,players.length,`${s.id}: player IDs must be unique across teams`)
  assert(s.tracks.some(t=>s.offensiveNodes.some(n=>n.id===t.player)),`${s.id}: offense must react`)
  assert(s.tracks.some(t=>s.defensiveNodes.some(n=>n.id===t.player)),`${s.id}: defense must react`)
  assert(s.contacts.length || s.reads.length,`${s.id}: missing tactical conflict`)
  assert(s.areas.length,`${s.id}: missing timed lane or zone cue`)
  assert(s.ball,`${s.id}: missing functional ball outcome`)
  assert(ids.has(s.ball.from) && ids.has(s.ball.to),`${s.id}: unknown ball actor`)
  assert(s.ball.release>=0&&s.ball.arrival>s.ball.release&&s.ball.arrival<=s.duration,`${s.id}: invalid ball timing`)
  assert(s.beats.length>=4&&s.beats[0].at===0,`${s.id}: missing stages`)
  assert(new Set(s.beats.map(b=>b.text)).size===s.beats.length,`${s.id}: repetitive captions`)
  assert(s.beats.every((b,i)=>b.text.length>20&&(!i||b.at>s.beats[i-1].at)),`${s.id}: invalid caption clock`)
  const signature=JSON.stringify({nodes:players.map(n=>[n.x,n.y,n.team]),tracks:s.tracks.map(t=>t.frames),contacts:s.contacts.map(c=>[c.point,c.finish,c.start,c.end]),areas:s.areas.map(a=>[a.x,a.y,a.width,a.height])})
  assert(!signatures.has(signature),`${s.id}: duplicate tactical sequence`); signatures.add(signature)
  for(const t of s.tracks){
    assert(ids.has(t.player),`${s.id}: unknown track actor ${t.player}`)
    assert(t.frames.length>=2,`${s.id}: track needs at least two keys`)
    assert(t.frames.every((k,i)=>Number.isFinite(k.at)&&k.at>=0&&k.at<=s.duration+.001&&k.pos.every(Number.isFinite)&&(!i||k.at>t.frames[i-1].at)),`${s.id}/${t.player}: invalid keyframes`)
    const n=players.find(n=>n.id===t.player)!
    assert(near(t.frames[0].pos,[n.x,n.y]),`${s.id}/${t.player}: track must begin at presnap node`)
    if(!t.presnap)assert(near(trackPosition(t,.3),[n.x,n.y]),`${s.id}/${t.player}: post-snap assignment starts before snap`)
  }
  for(const c of s.contacts){
    assert(ids.has(c.a)&&ids.has(c.b)&&c.a!==c.b,`${s.id}: invalid engagement`)
    assert(c.start<c.end&&c.start>=0&&c.end<=s.duration,`${s.id}: invalid engagement clock`)
    assert(players.find(n=>n.id===c.a)!.team!==players.find(n=>n.id===c.b)!.team,`${s.id}: block needs opposing actors`)
    assert(c.label,`${s.id}: contact has no meaning`)
  }
  for(const r of s.reads)assert(ids.has(r.from)&&ids.has(r.to)&&r.start<r.end,`${s.id}: invalid read`)
  for(let ms=0;ms<=4200;ms+=100){
    const f=samplePlay(s,ms/1000)
    assert.equal(f.positions.size,ids.size,`${s.id}: sampled players lost`)
    for(const [id,p] of f.positions)assert(p.every(Number.isFinite)&&p[0]>=25&&p[0]<=875&&p[1]>=20&&p[1]<=540,`${s.id}/${id}: sampled position ${p} outside field at ${ms}`)
    assert(f.caption.length>20,`${s.id}: timeline caption blank`)
    assert(f.ball?.every(Number.isFinite),`${s.id}: ball missing`)
    for(const c of f.contacts){
      const a=f.positions.get(c.a)!,b=f.positions.get(c.b)!
      const separation=Math.hypot(a[0]-b[0],a[1]-b[1])
      assert(separation>=20&&separation<=52,`${s.id}: engaged nodes overlap or lose contact`)
    }
  }
  assert.deepEqual(samplePlay(s,1.9),samplePlay(s,1.9),`${s.id}: scrub must be deterministic`)
  assert.equal(samplePlay(s,0).phase,'PRE-SNAP');assert.equal(samplePlay(s,.8).phase,'SNAP');assert.equal(samplePlay(s,2).phase,'DEVELOPMENT');assert.equal(samplePlay(s,4.2).phase,'RESULT')
}
const chip=sceneFor({id:'chip'})
assert(chip.contacts.some(c=>[c.a,c.b].includes('Y')&&[c.a,c.b].includes('ER')), 'Chip needs actual TE vs edge engagement')
const contact=chip.contacts.find(c=>[c.a,c.b].includes('Y')&&[c.a,c.b].includes('ER'))!
assert(contact.start<=.8&&contact.end>=.8,'TE chip is present at 0.8s')
assert(chip.contacts.some(c=>[c.a,c.b].includes('RT')&&[c.a,c.b].includes('ER')&&c.start>=contact.start),'OT takes over edge after chip')
const chipRoute=chip.tracks.find(t=>t.player==='Y')!
assert(trackPosition(chipRoute,3.5)[0]>trackPosition(chipRoute,contact.end)[0]+70,'TE releases to flat after contact')
for(const id of ['inside-zone','outside-zone']){
  const s=sceneFor({id})
  assert(s.contacts.some(c=>['LT','RT','Y'].includes(c.a)&&['M','W','N'].includes(c.b)),`${id}: tackle or TE climbs to a linebacker`)
  assert(s.areas.some(a=>a.start>=.8),`${id}: lane opens after contact`)
}
const twelve=sceneFor({id:'personnel-12'})
assert(twelve.tracks.some(t=>t.player==='SS'&&trackPosition(t,1.35)[1]>200),'12 personnel draws safety into box')
console.log(`Contextual play checks passed: ${concepts.length} unique two-team scenes, coordinated tracks, contact, outcome, timed cues and reversible scrub samples.`)
