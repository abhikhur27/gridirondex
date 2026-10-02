import assert from 'node:assert/strict';
import { FIELD, curvePoints, defenseFor, distance, emptyRoutes, formationsFor, frameAt, lookForLevel, receiversFor, routePreset, runRoutePreset, simulate } from '../src/game/engine.ts';
import type { Look, Personnel, PlayOptions, RouteName, Routes, Simulation } from '../src/game/model.ts';

const base: Look = { name: 'test shell', coverage: 2, press: false, rushSide: 'balanced', blitz: 0, hint: '', level: 1, targetScore: 48 };
const callFor = (personnel: Personnel, names: RouteName[] = ['Slant', 'Post', 'Out', 'Block', 'Drag'], formation?: PlayOptions['formation']): Routes => Object.fromEntries(receiversFor(personnel, formation).map((r, i) => [r.id, routePreset(r, names[i])])) as Routes;
const near = (a: number, b: number, label: string, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${label}: ${a} != ${b}`);

// Cover 6 is a half opposite two quarters; Sky rotates a safety rather than
// quietly reusing a static three-deep diagram. Every coverage has eleven roles.
const deepCounts = { 2: 2, 3: 3, 4: 4, 6: 3 } as const;
for (const coverage of [2, 3, 4, 6] as const) {
  const defense = defenseFor({ ...base, coverage }, '11');
  assert.equal(defense.length, 11);
  assert.equal(new Set(defense.map(d => d.id)).size, 11);
  assert.equal(defense.filter(d => d.zone?.depth === 'deep').length, deepCounts[coverage]);
  for (const d of defense.filter(d => d.assignment === 'zone')) assert.ok(d.zone && d.zone.width > 100 && d.zone.label.length > 3);
}
const six = defenseFor({ ...base, coverage: 6 }, '11');
assert.equal(six.find(d => d.id === 'SL')!.zone!.width, 350);
assert.equal(six.find(d => d.id === 'SR')!.zone!.width, 175);
assert.equal(six.find(d => d.id === 'CR')!.zone!.width, 175);
const sky = defenseFor({ ...base, coverage: 3 }, '11').find(d => d.id === 'SS')!;
assert.ok(sky.drop.x > sky.start.x + 90 && sky.drop.y > sky.start.y + 50);
const fronts = ['Even', 'Over', 'Under', 'Wide 9'].map(front => defenseFor({ ...base, front }, '11').filter(d => d.assignment === 'rush').map(d => d.start.x).join(','));
assert.equal(new Set(fronts).size, 4, 'Front labels must change actual techniques.');
const generated = Array.from({ length: 100 }, (_, seed) => lookForLevel(seed, 1));
assert.ok(generated.some(l => l.coverage === 6), 'Cover 6 must appear in real generated games.');
assert.equal(new Set(generated.map(l => l.front)).size, 4);

const onlyX = emptyRoutes('11');
onlyX.X = routePreset(receiversFor('11').find(r => r.id === 'X')!, 'Out');
const rolloutLook = { ...base, coverage: 3 as const, rushSide: 'right' as const };
const stay = simulate(rolloutLook, '11', onlyX, 'balanced');
const left = simulate(rolloutLook, '11', onlyX, 'balanced', { qbRoute: [{ x: 350, y: 459 }, { x: 40, y: 450 }] });
const right = simulate(rolloutLook, '11', onlyX, 'balanced', { qbRoute: [{ x: 350, y: 459 }, { x: 680, y: 450 }] });
assert.ok(left.pocket > stay.pocket + .5, 'An escape must change actual time to QB contact.');
assert.ok(frameAt(left, 2).qb.x < frameAt(stay, 2).qb.x - 100);
assert.ok(frameAt(right, 2).qb.x > frameAt(stay, 2).qb.x + 100);
assert.ok(distance(frameAt(left, 4).defenders.D1, frameAt(right, 4).defenders.D1) > 100, 'The rush must pursue the moving QB.');
assert.equal(left.outcome, 'complete');
assert.equal(right.outcome, 'incomplete', 'The same out route closes when thrown across a sustained opposite-field rollout.');
assert.ok(right.anglePenalty > .25 && left.anglePenalty === 0);
assert.ok(right.catchTime - right.throwTime > left.catchTime - left.throwTime + .3, 'Cross-body distance and slower flight must affect the actual ball trajectory.');
for (const result of [stay, left, right]) {
  assert.deepEqual(frameAt(result, result.throwTime).qb, result.releasePoint);
  assert.deepEqual(frameAt(result, result.throwTime).ball, result.releasePoint);
  const rushIds = defenseFor(rolloutLook, '11').filter(d => d.assignment === 'rush').map(d => d.id);
  const firstContact = result.frames.find(f => f.time > .3 && rushIds.some(id => distance(f.defenders[id], f.qb) <= 18));
  near(result.pocket, firstContact?.time ?? 6, 'Pocket equals first physical QB contact');
}

const runCall = callFor('11');
const runResults: Simulation[] = [];
for (const scheme of ['Zone Read', 'Power', 'Draw', 'Counter'] as const) {
  const routes = { ...runCall, RB: runRoutePreset(receiversFor('11').find(r => r.id === 'RB')!.start, scheme, 'right') };
  const result = simulate(base, '11', routes, 'balanced', { kind: 'run', runScheme: scheme });
  assert.equal(result.outcome, 'run');
  const mesh = frameAt(result, result.throwTime);
  assert.ok(distance(mesh.qb, mesh.receivers.RB) < 1e-7, `${scheme}: QB and RB must physically meet for the handoff.`);
  assert.ok(distance(mesh.ball, mesh.receivers.RB) < 1e-7);
  const finish = frameAt(result, result.catchTime);
  assert.deepEqual(finish.ball, result.catchPoint);
  near(result.gain, (FIELD.los - finish.ball.y) / 12, `${scheme}: gain comes from the carrier, not a scheme bonus`);
  assert.ok(result.frames.some(f => f.engagements.length >= 3), `${scheme} needs real blocking contacts.`);
  for (const frame of result.frames) for (const contact of frame.engagements) {
    const blocker = frame.linemen[contact.blocker] ?? frame.receivers[contact.blocker as keyof typeof frame.receivers];
    near(distance(blocker, frame.defenders[contact.rusher]), 24, 'Reciprocal block contact', .00001);
  }
  // Before a tackle the back remains on the drawn curve. Measuring distance to
  // the curve's line segments avoids false failures between sampled vertices.
  const curve = curvePoints(routes.RB);
  const segmentDistance = (p: { x: number; y: number }, a: typeof p, b: typeof p) => {
    const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, length ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / length : 0));
    return distance(p, { x: a.x + dx * t, y: a.y + dy * t });
  };
  for (const frame of result.frames.filter(f => f.time <= result.catchTime)) assert.ok(Math.min(...curve.slice(1).map((p, i) => segmentDistance(frame.receivers.RB, curve[i], p))) < .001, `${scheme} departed from its edited route.`);
  runResults.push(result);
}
assert.equal(new Set(runResults.map(r => JSON.stringify(r.frames.map(f => f.receivers.RB)))).size, 4, 'Each scheme must execute different path geometry.');
assert.ok(frameAt(runResults[1], .6).linemen.LG.x > frameAt(runResults[0], .6).linemen.LG.x + 25, 'Power must pull the backside guard.');
assert.ok(frameAt(runResults[3], .6).linemen.LT.x > frameAt(runResults[0], .6).linemen.LT.x + 25, 'Counter must pull its second blocker.');
assert.ok(runResults[2].throwTime > runResults[0].throwTime + .3, 'Draw must delay the handoff.');

const originalRB = runRoutePreset(receiversFor('11').find(r => r.id === 'RB')!.start, 'Zone Read', 'right');
const editedRB = originalRB.map((p, i) => i < 2 ? p : { x: 700 - p.x, y: p.y });
const original = simulate(base, '11', { ...runCall, RB: originalRB }, 'balanced', { kind: 'run' });
const edited = simulate(base, '11', { ...runCall, RB: editedRB }, 'balanced', { kind: 'run' });
assert.notDeepEqual(frameAt(original, 1.5).receivers.RB, frameAt(edited, 1.5).receivers.RB);
assert.ok(Math.abs(original.gain - edited.gain) > .1, 'Editing the RB bend must change contact and gain.');

const crash = simulate({ ...base, coverage: 4 }, '11', { ...runCall, RB: originalRB }, 'balanced', { kind: 'run', rpo: true });
const widen = simulate(base, '11', { ...runCall, RB: originalRB }, 'balanced', { kind: 'run', rpo: true });
assert.equal(crash.read!.action, 'crash');
assert.equal(crash.read!.decision, 'pull');
assert.equal(widen.read!.decision, 'give');
assert.equal(widen.outcome, 'run');
const readFrame = frameAt(crash, crash.read!.at), presnap = crash.frames[0].defenders[crash.read!.defender];
assert.ok(readFrame.defenders[crash.read!.defender].y > presnap.y + 12, 'The conflict defender must actually step toward the run before the pull.');
assert.ok(distance(readFrame.ball, readFrame.qb) < .001, 'The QB keeps the ball on an RPO pull.');
const editedGive = simulate(base, '11', { ...runCall, RB: editedRB }, 'balanced', { kind: 'run', rpo: true });
assert.notDeepEqual(frameAt(widen, 1.5).receivers.RB, frameAt(editedGive, 1.5).receivers.RB, 'RPO gives must also honor edited RB routes.');
const readKeep = simulate({ ...base, coverage: 1, rushSide: 'left' }, '12', callFor('12'), 'balanced', { kind: 'run', runScheme: 'Zone Read' });
assert.equal(readKeep.read!.decision, 'keep');
assert.equal(readKeep.outcome, 'qb-run');
assert.deepEqual(frameAt(readKeep, readKeep.catchTime).ball, frameAt(readKeep, readKeep.catchTime).qb);

// Goal-to-go uses a real ten-yard end zone. A receiver may catch inside it, but
// the drive only earns yards to the goal; a runner's ball stops on the line.
const openField = simulate(base, '11', runCall, 'balanced');
assert.deepEqual(simulate(base, '11', runCall, 'balanced', { yardsToGoal: 75 }), openField, 'A distant goal must not change normal draft geometry or timing.');
assert.deepEqual(simulate(base, '11', runCall, 'balanced', { yardsToGoal: NaN }), openField, 'Invalid goal data cannot poison geometry.');
const endZoneCatch = simulate(base, '11', runCall, 'balanced', { yardsToGoal: 4 });
assert.equal(endZoneCatch.outcome, 'complete');
assert.equal(endZoneCatch.gain, 4);
assert.equal(endZoneCatch.yards, 4);
assert.ok((FIELD.los - endZoneCatch.catchPoint.y) / 12 > 4 && (FIELD.los - endZoneCatch.catchPoint.y) / 12 <= 14, 'The credited touchdown must be caught inside the end zone.');
const shortGoal = simulate(base, '11', runCall, 'balanced', { yardsToGoal: 1 });
assert.ok((FIELD.los - openField.catchPoint.y) / 12 > 11, 'This fixture previously selected a catch beyond the short field.');
assert.equal(shortGoal.outcome, 'complete');
assert.notDeepEqual(shortGoal.catchPoint, openField.catchPoint, 'The QB must reject the former out-of-bounds window, not merely cap its yards.');
assert.ok((FIELD.los - shortGoal.catchPoint.y) / 12 <= 11);
assert.equal(shortGoal.gain, 1);
for (const goal of [.3, 1, 4, 9]) for (const coverage of [1, 2, 3, 4, 6] as const) {
  const result = simulate({ ...base, coverage }, '11', runCall, 'balanced', { yardsToGoal: goal });
  if (result.outcome === 'complete') {
    assert.ok((FIELD.los - result.catchPoint.y) / 12 <= goal + 10 + 1e-8);
    near(result.gain, Math.min(goal, (FIELD.los - result.catchPoint.y) / 12), 'End-zone catch credit');
  }
  assert.ok(result.frames.every(f => [f.ball, f.qb, ...Object.values(f.receivers), ...Object.values(f.defenders)].every(p => Number.isFinite(p.x) && Number.isFinite(p.y))));
}
for (const keeper of [false, true]) {
  const look = keeper ? { ...base, coverage: 1 as const, rushSide: 'left' as const } : base;
  const personnel = keeper ? '12' : '11';
  const options: PlayOptions = { kind: 'run', runScheme: keeper ? 'Zone Read' : 'Draw', yardsToGoal: .3 };
  const result = simulate(look, personnel, callFor(personnel), 'balanced', options);
  const unbounded = simulate(look, personnel, callFor(personnel), 'balanced', { ...options, yardsToGoal: undefined });
  assert.equal(result.outcome, keeper ? 'qb-run' : 'run');
  assert.equal(result.gain, .3, 'Fractional goal distances must reach the goal exactly, without floating-point lost touchdowns.');
  assert.equal(result.catchPoint.y, FIELD.los - .3 * 12);
  assert.ok(result.catchTime < unbounded.catchTime, 'A score ends the run before the later tackle.');
  for (const frame of result.frames.filter(f => f.time >= result.catchTime)) {
    assert.deepEqual(frame.ball, result.catchPoint);
    assert.deepEqual(keeper ? frame.qb : frame.receivers.RB, result.catchPoint);
  }
  assert.ok(frameAt(result, result.catchTime - .05).ball.y > result.catchPoint.y);
}
const goalRpo = simulate({ ...base, coverage: 4 }, '11', { ...runCall, RB: originalRB }, 'balanced', { kind: 'run', rpo: true, yardsToGoal: .3 });
assert.equal(goalRpo.read!.decision, 'pull');
assert.equal(goalRpo.outcome, 'complete');
assert.equal(goalRpo.gain, .3);
assert.equal(goalRpo.read!.passGain, .3);

// All real formations execute safely, including empty's explicit no-RB fallback.
let checked = 0;
for (const personnel of ['10', '11', '12', 'empty'] as const) for (const formation of formationsFor(personnel)) for (const coverage of [0, 1, 2, 3, 4, 6] as const) {
  const look = { ...base, coverage, blitz: coverage === 0 ? 2 : coverage === 1 ? 1 : 0 };
  const call = callFor(personnel, undefined, formation.id);
  const options = { formation: formation.id, kind: 'run' as const, rpo: true };
  const result = simulate(look, personnel, call, 'balanced', options);
  assert.equal(Object.keys(result.frames[0].defenders).length, 11);
  assert.ok(Number.isFinite(result.gain) && Number.isFinite(result.score));
  if (result.won) assert.ok(result.gain >= 5, 'A draft win still requires five real yards.');
  if (personnel === 'empty') assert.equal(result.read, undefined, 'Empty has no back for a fake handoff.');
  for (const frame of result.frames) for (const point of [frame.qb, frame.ball, ...Object.values(frame.receivers), ...Object.values(frame.defenders)]) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.x <= 720 && point.y >= 0 && point.y <= 510);
  assert.deepEqual(simulate(look, personnel, call, 'balanced', options), result, 'Mechanics must be deterministic, including reads and catches.');
  checked++;
}
console.log(`Game mechanics: ${checked} formation/shell calls; authored coverage/front landmarks, moving-QB pursuit, cross-body windows, four run schemes, visible mesh reads, edited RB paths, contact-derived gains, goal-line stops/end-zone bounds, and deterministic outcomes passed.`);
