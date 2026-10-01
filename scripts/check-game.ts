import assert from 'node:assert/strict';
import { advanceRun, arrowGeometry, defenseFor, emptyRoutes, frameAt, lookForLevel, newRun, pocketTime, receiversFor, routePreset, sanitizeRoute, simulate } from '../src/game/engine.ts';
import type { Look, Personnel, Routes } from '../src/game/engine.ts';

const man: Look = { name: 'test man', coverage: 1, press: true, rushSide: 'right', blitz: 1, hint: '', level: 1, targetScore: 48 };
const zone: Look = { ...man, name: 'test quarters', coverage: 4, press: false, rushSide: 'balanced', blitz: 0 };
const makeCall = (personnel: Personnel, names: Parameters<typeof routePreset>[1][]): Routes => Object.fromEntries(receiversFor(personnel).map((r, i) => [r.id, routePreset(r, names[i])])) as Routes;
const bad = emptyRoutes('11');
const good = makeCall('11', ['Slant', 'Post', 'Out', 'Block', 'Drag']);
const badResult = simulate(man, '11', bad, 'left');
const goodResult = simulate(man, '11', good, 'right');
assert.equal(badResult.won, false, 'A call without routes cannot win.');
assert.equal(badResult.score, 0);
assert.equal(goodResult.won, true, JSON.stringify(goodResult.feedback));
assert.ok(goodResult.score > badResult.score + 30);
assert.deepEqual(simulate(man, '11', good, 'right'), goodResult, 'The same routes, look and protection must produce the same result.');
assert.ok(pocketTime(man, '11', 'right', good) > pocketTime(man, '11', 'left', good), 'Sliding into an edge blitz buys time.');
const releasingBack = makeCall('11', ['Slant', 'Post', 'Out', 'Go', 'Drag']);
assert.ok(pocketTime(man, '11', 'right', good) > pocketTime(man, '11', 'right', releasingBack), 'Keeping the back in buys time.');
assert.notDeepEqual(receiversFor('11'), receiversFor('12'));
assert.notDeepEqual(receiversFor('11'), receiversFor('empty'));
assert.equal(receiversFor('empty').filter(r => r.role === 'tight end' || r.role === 'running back').length, 0, 'Five-wide cannot get a tight-end blocking bonus.');
for (const personnel of ['11', '12', 'empty'] as const) {
  assert.equal(receiversFor(personnel).length, 5);
  assert.equal(receiversFor(personnel).filter(r => r.start.y === 381).length, 2, 'Five linemen plus two uncovered ends make seven on the line.');
  for (let level = 1; level < 12; level++) {
    const look = lookForLevel(1000, level);
    assert.equal(defenseFor(look, personnel).length, 11, `Defense has 11 players for ${look.name}.`);
    const call = makeCall(personnel, ['Slant', 'Post', 'Out', 'Wheel', 'Drag']);
    const result = simulate(look, personnel, call, 'balanced');
    assert.ok(Number.isFinite(result.score) && result.score >= 0 && result.score <= 100);
    for (const frame of result.frames) for (const point of [...Object.values(frame.receivers), ...Object.values(frame.defenders)]) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
      assert.ok(point.x >= 0 && point.x <= 720 && point.y >= 0 && point.y <= 510);
    }
    assert.deepEqual(frameAt(result, 0), result.frames[0]);
  }
}
const zoneCall = makeCall('empty', ['Go', 'Out', 'Post', 'Drag', 'Slant']);
assert.ok(simulate(zone, 'empty', zoneCall, 'balanced').won, 'A spaced call can beat an early zone level.');
const backwardCall = Object.fromEntries(receiversFor('11').map(r => [r.id, [r.start, { x: r.start.x, y: 478 }]])) as Routes;
assert.equal(simulate(man, '11', backwardCall, 'right').won, false, 'Drawing every route backwards never earns a first down.');
assert.ok(goodResult.score > simulate(man, '11', backwardCall, 'right').score + 30, 'A real upfield concept beats a drawn call with no forward progress.');
const start = { x: 75, y: 381 };
const safe = sanitizeRoute([{ x: NaN, y: Infinity }, { x: -100, y: 900 }, ...Array.from({ length: 2000 }, (_, i) => ({ x: i % 720, y: i % 510 }))], start);
assert.ok(safe.length <= 100);
assert.deepEqual(safe[0], start);
assert.ok(safe.every(p => Number.isFinite(p.x) && p.x >= 24 && p.x <= 696 && p.y >= 28 && p.y <= 481));
const arrow = arrowGeometry([{ x: 30, y: 100 }, { x: 30, y: 30 }]);
assert.ok(arrow.line[1].y > 30, 'The shaft ends behind the arrow tip.');
const run = newRun(123);
assert.equal(advanceRun(run, { won: true, score: 80 }).level, 2);
assert.equal(advanceRun(run, { won: true, score: 80 }).total, 80);
let failed = run;
for (let i = 0; i < 3; i++) failed = advanceRun(failed, { won: false, score: 0 });
assert.equal(failed.lives, 0);
assert.equal(failed.status, 'over');
assert.deepEqual(advanceRun(failed, { won: true, score: 100 }), failed);
assert.ok(lookForLevel(123, 10).targetScore > lookForLevel(123, 1).targetScore);
const lateCall = makeCall('11', ['Out', 'Out', 'Block', 'Post', 'Post']);
assert.equal(simulate({ ...man, level: 15, targetScore: lookForLevel(123, 15).targetScore }, '11', lateCall, 'right').won, true, 'Late-level man coverage still has a reachable winning call.');
assert.deepEqual(lookForLevel(123, 3), lookForLevel(123, 3));
assert.ok(new Set(Array.from({ length: 30 }, (_, seed) => lookForLevel(seed, 1).name)).size >= 5);
console.log(`Tactical Draft: deterministic simulation, personnel, coverage, protection, safe geometry, arrow caps, and run progression passed. Man call ${goodResult.score}/100; empty call ${badResult.score}/100.`);
