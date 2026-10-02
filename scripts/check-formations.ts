import assert from 'node:assert/strict'
import { defaultFormation, formationsFor, ON_LINE_Y, qbStartFor, receiversFor } from '../src/game/formations.ts'
import { adjustRouteDepth, editRouteHandle, qbPreset, routeDepth, routeHandles, ROUTE_NAMES, routePreset, runRoutePreset } from '../src/game/routeEditing.ts'
import type { Personnel, Point, RunScheme } from '../src/game/model.ts'

const personnel: Personnel[]=['10','11','12','empty']
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y)
const bounds=(points:Point[])=>points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=24&&p.x<=696&&p.y>=28&&p.y<=481)
let formationCount=0,presetCount=0
for (const pack of personnel) {
  const formations=formationsFor(pack)
  assert.ok(formations.length>=3,`${pack} offers several alignments.`)
  assert.ok(formations.some(f=>f.id===defaultFormation(pack)))
  const geometries=new Set<string>()
  for (const formation of formations) {
    formationCount++
    const players=receiversFor(pack,formation.id),qb=qbStartFor(pack,formation.id)
    assert.equal(players.length,5)
    assert.equal(new Set(players.map(p=>p.id)).size,5)
    assert.equal(players.filter(p=>p.onLine).length,2,'Five OL plus two eligible ends make seven on the line.')
    assert.equal(players.filter(p=>!p.onLine).length+1,4,'Three eligible backs plus the QB make four off the line.')
    const ends=players.filter(p=>p.onLine).sort((a,b)=>a.start.x-b.start.x)
    assert.ok(ends[0].start.x<294&&ends[1].start.x>406,'The eligible ends must flank all five ineligible linemen.')
    assert.ok(ends.every(p=>p.start.y===ON_LINE_Y))
    assert.ok(players.filter(p=>!p.onLine).every(p=>p.start.y>=ON_LINE_Y+24),'Off-line players are visibly behind the line.')
    assert.equal(players.filter(p=>p.role==='running back').length,pack==='empty'?0:1)
    assert.equal(players.filter(p=>p.role==='tight end').length,pack==='12'?2:pack==='11'?1:0)
    assert.equal(players.filter(p=>p.role.includes('receiver')).length,pack==='10'?4:pack==='11'?3:pack==='12'?2:5)
    assert.ok(bounds([...players.map(p=>p.start),qb]))
    for (const player of players) {
      assert.ok(distance(player.start,qb)>=28,'An eligible player cannot overlap the quarterback.')
      for (const other of players) if (other.id!==player.id) assert.ok(distance(player.start,other.start)>=28,'Formation nodes stay distinct.')
    }
    const geometry=JSON.stringify([players.map(p=>p.start),qb])
    assert.ok(!geometries.has(geometry),`Duplicate ${pack} alignment: ${formation.id}`)
    geometries.add(geometry)
    if (formation.id==='pistol') {
      const back=players.find(p=>p.id==='RB')!
      assert.equal(back.start.x,qb.x)
      assert.ok(back.start.y-qb.y>=36,'Pistol back is behind its shallower QB.')
      assert.ok(qb.y<qbStartFor(pack,'spread').y)
    }
    if (pack==='10'&&formation.id.startsWith('bunch')) {
      const sign=formation.id==='bunch-right'?1:-1
      const wideouts=players.filter(p=>p.role.includes('receiver'))
      const bunch=wideouts.filter(p=>(p.start.x-350)*sign>0)
      const isolated=wideouts.filter(p=>(p.start.x-350)*sign<0)
      assert.equal(bunch.length,3,'10 bunch is 3x1, not a mislabeled 2x2.')
      assert.equal(isolated.length,1)
      assert.equal(bunch.filter(p=>p.onLine).length,1)
      assert.ok(isolated[0].onLine)
      assert.ok(Math.max(...bunch.map(p=>p.start.x))-Math.min(...bunch.map(p=>p.start.x))<=80)
    }
    for (const player of players) for (const name of ROUTE_NAMES) {
      presetCount++
      const points=routePreset(player,name)
      assert.deepEqual(points[0],player.start)
      assert.ok(bounds(points))
      assert.equal(points.length===1,name==='Block')
      if (name==='Block') continue
      const original=structuredClone(points),deep=adjustRouteDepth(points,18),shallow=adjustRouteDepth(points,4)
      assert.deepEqual(points,original,'Depth editing does not mutate prior undo snapshots.')
      assert.deepEqual(deep[0],player.start)
      assert.equal(deep.length,points.length)
      assert.ok(Math.abs(routeDepth(deep)-18)<1e-8)
      assert.ok(Math.abs(routeDepth(shallow)-4)<1e-8)
      assert.ok(bounds(deep)&&bounds(shallow))
      assert.deepEqual(deep.map(p=>p.x),points.map(p=>p.x),'Depth changes preserve route width.')
      if (name==='Curl'||name==='Comeback') {
        assert.ok(points.at(-1)!.y>points.at(-2)!.y,'Return routes turn back toward the quarterback.')
        assert.ok(deep.at(-1)!.y>deep.at(-2)!.y,'Depth edits preserve the return segment.')
        const dx=points.at(-1)!.x-points.at(-2)!.x,inward=player.start.x<350?1:-1
        assert.ok(name==='Curl'?dx*inward>0:dx*inward<0,'Curl breaks inward; comeback breaks outward.')
      }
      if (name==='Out') assert.equal(points.at(-1)!.y,points.at(-2)!.y)
      if (name==='Flat') assert.ok(routeDepth(points)<3)
      const moved=editRouteHandle(points,points.length-1,{x:-200,y:700})
      assert.deepEqual(moved[0],player.start)
      assert.deepEqual(moved.at(-1),{x:24,y:481})
      assert.deepEqual(points,original,'Handle edits do not mutate the old route.')
      assert.deepEqual(editRouteHandle(points,0,{x:123,y:123}),points,'The alignment anchor cannot be dragged.')
    }
  }
  const first=receiversFor(pack)
  first[0].start.x=-1
  assert.ok(receiversFor(pack)[0].start.x>0,'Formation callers receive fresh coordinates.')
}

const freehand=[{x:100,y:400},{x:100,y:350},{x:100,y:300},{x:150,y:300},{x:200,y:300},{x:250,y:250}]
const handles=routeHandles(freehand,3)
assert.ok(handles.some(h=>h.index===2),'Handle selection retains the actual stem break.')
assert.equal(handles.at(-1)!.index,freehand.length-1)
assert.ok(handles.every(h=>h.index>0)&&handles.length<=3)
assert.equal(routeHandles([freehand[0]]).length,0)
assert.deepEqual(editRouteHandle(freehand,-1,{x:300,y:300}),freehand)
assert.deepEqual(editRouteHandle(freehand,2,{x:NaN,y:Infinity}),freehand)
assert.equal(routeDepth(adjustRouteDepth(freehand,12)),12)
assert.equal(routeDepth(adjustRouteDepth([{x:100,y:400},{x:180,y:400},{x:250,y:400}],6)),6,'A horizontal freehand path can acquire useful depth.')
assert.deepEqual(adjustRouteDepth([],12),[])

const qb={x:350,y:459}
assert.deepEqual(qbPreset(qb,'stay'),[qb])
assert.ok(qbPreset(qb,'left').at(-1)!.x<qb.x&&qbPreset(qb,'right').at(-1)!.x>qb.x)
const runShapes=new Set<string>()
for (const scheme of ['Zone Read','Power','Draw','Counter'] as RunScheme[]) for (const side of ['left','right'] as const) {
  const start={x:306,y:448},points=runRoutePreset(start,scheme,side)
  assert.deepEqual(points[0],start)
  assert.ok(bounds(points))
  assert.ok(points.at(-1)!.y<300,'Every run path progresses through the line.')
  assert.ok(side==='left'?points.at(-1)!.x<350:points.at(-1)!.x>350)
  runShapes.add(JSON.stringify(points))
}
assert.equal(runShapes.size,8,'Run schemes and direction produce distinct mesh/cut geometry.')
console.log(`Formations: ${formationCount} legal alignments, ${presetCount} preset cases, both 10-personnel bunches, editable route depth/handles, QB rollouts, and eight run paths passed.`)
