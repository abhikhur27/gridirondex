import assert from 'node:assert/strict'
import { concepts, categories } from '../src/data/concepts.ts'
import { offense, defense, routesFor, zones } from '../src/data/diagrams.ts'
import type { Coverage } from '../src/data/types.ts'

const ids=new Set<string>()
for(const c of concepts){
 assert(!ids.has(c.id),`Duplicate concept: ${c.id}`);ids.add(c.id)
 assert(categories.includes(c.category),`Missing category: ${c.id}`)
 assert(c.summary.length>60&&c.watch.length>20&&c.counter.length>20,`Incomplete explanation: ${c.id}`)
 assert.equal(c.read.length,3,`Read progression: ${c.id}`)
 assert(c.sources.length>0&&c.sources.every(s=>s.url.startsWith('https://')&&s.title&&s.publisher),`Sources: ${c.id}`)
 assert(/^[\w-]{11}$/.test(c.film.id),`Video ID: ${c.id}`)
 assert(c.film.start>=0&&(!c.film.end||c.film.end>c.film.start),`Film segment: ${c.id}`)
 assert.equal(offense(c).length,11,`Offense count: ${c.id}`)
 for(const cov of ['Cover 0','Cover 1','Cover 2','Cover 3','Cover 4','Cover 6'] as Coverage[])assert.equal(defense(cov,c).length,11,`Defense count: ${c.id}`)
 for(const route of routesFor(c)){
  assert(offense(c).some(p=>p.id===route.player),`Unknown player: ${c.id}/${route.player}`)
  assert(!/NaN|Infinity/.test(route.d),`Invalid route geometry: ${c.id}`)
  const p=offense(c).find(p=>p.id===route.player)!,match=route.d.match(/^M ([\d.]+) ([\d.]+)/)
  assert(match&&Math.hypot(Number(match[1])-p.x,Number(match[2])-p.y)<1,`Route does not start at player: ${c.id}/${route.player}`)
 }
}
assert.equal(zones('Cover 0').length,0)
assert.equal(zones('Cover 1').length,1)
assert.equal(zones('Cover 3').filter(z=>z.label==='DEEP THIRD').length,3)
assert.equal(zones('Cover 6').filter(z=>z.label==='DEEP HALF').length,1)
for(const key of ['mesh','smash','flood','drive','y-cross','four-verticals','dagger','scissors','boot','cover-0','cover-6','personnel-00','personnel-22'])assert(ids.has(key),`Missing required concept: ${key}`)
console.log(`Verified ${concepts.length} lessons, ${categories.length} categories, film segments, sources, player counts and route geometry.`)
