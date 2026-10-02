import type { Defender, Engagement, FormationId, Frame, Look, Personnel, PlayOptions, Point, Protection, ReadDecision, ReceiverId, Routes, RunScheme, Simulation } from './model.ts';
import { receiversFor, qbStartFor } from './formations.ts';
import { FIELD, LINEMEN, RECEIVER_IDS, atDistance, clamp, curvePoints, distance, sanitizeRoute } from './engine.ts';

const FPS = 20;
const END = 6;
const RUN_SPEED = 98;
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const moveToward = (from: Point, to: Point, step: number): Point => distance(from, to) <= step ? { ...to } : lerp(from, to, step / distance(from, to));
const bounded = (p: Point): Point => ({ x: clamp(p.x, 24, 696), y: clamp(p.y, 28, 481) });
const yardsAt = (p: Point) => (FIELD.los - p.y) / 12;
const goalDistance = (options: PlayOptions) => Number.isFinite(options.yardsToGoal) ? clamp(options.yardsToGoal!, 0, 100) : Infinity;
const creditedYards = (yards: number, options: PlayOptions) => yards >= goalDistance(options) - 1e-8 ? goalDistance(options) : yards;

function zone(id: string, start: Point, drop: Point, width: number, height: number, depth: 'deep' | 'underneath', label: string): Defender {
  return { id, start, drop, assignment: 'zone', zone: { label, x: drop.x - width / 2, y: drop.y - height / 2, width, height, depth } };
}

// These are assignments and landmarks, not evenly spaced dots. Sky rotates its
// strong safety down; Cover 6 keeps a half-field safety opposite two quarters.
export function defenseFor(look: Look, personnel: Personnel, formation?: FormationId): Defender[] {
  const receivers = receiversFor(personnel, formation), qb = qbStartFor(personnel, formation);
  const fronts: Record<string, number[]> = { Even: [260, 315, 385, 440], Over: [260, 336, 391, 450], Under: [250, 309, 364, 440], 'Wide 9': [220, 315, 385, 480] };
  const rushers: Defender[] = (fronts[look.front ?? 'Even'] ?? fronts.Even).map((x, i) => ({ id: `D${i + 1}`, start: { x, y: 344 }, drop: qb, assignment: 'rush' }));
  const blitz = Math.floor(clamp(look.blitz, 0, 2));
  for (let i = 0; i < blitz; i++) rushers.push({ id: `B${i + 1}`, start: { x: look.rushSide === 'left' ? 216 - i * 28 : look.rushSide === 'right' ? 486 + i * 28 : 333 + i * 38, y: 316 }, drop: qb, assignment: 'rush' });
  if (look.coverage <= 1) {
    const men: Defender[] = receivers.map(r => ({ id: `M${r.id}`, start: { x: r.start.x + (r.start.x < 350 ? 8 : -8), y: Math.min(look.press ? r.start.y - 40 : r.start.y - 83, 341) }, drop: r.start, assignment: 'man', target: r.id }));
    const help = look.coverage === 1 ? [zone('FS', { x: 350, y: 150 }, { x: 350, y: 105 }, 660, 180, 'deep', 'Middle help')] : [];
    while (rushers.length + men.length + help.length < 11) help.push(zone(`R${help.length}`, { x: 350, y: 290 }, { x: 350, y: 245 }, 220, 120, 'underneath', 'Low hole'));
    return [...rushers, ...men, ...help].slice(0, 11);
  }
  const deep: Defender[] = [], under: Defender[] = [];
  if (look.coverage === 2) {
    deep.push(zone('SL', { x: 220, y: 160 }, { x: 185, y: 115 }, 350, 190, 'deep', 'Left half'), zone('SR', { x: 500, y: 160 }, { x: 535, y: 115 }, 350, 190, 'deep', 'Right half'));
    under.push(zone('CL', { x: 78, y: 322 }, { x: 85, y: 282 }, 145, 110, 'underneath', 'Left flat'), zone('HL', { x: 252, y: 315 }, { x: 238, y: 245 }, 160, 135, 'underneath', 'Left hook'), zone('MIKE', { x: 350, y: 305 }, { x: 350, y: 213 }, 150, 150, 'underneath', 'Middle hook'), zone('HR', { x: 446, y: 315 }, { x: 478, y: 245 }, 160, 135, 'underneath', 'Right hook'), zone('CR', { x: 642, y: 322 }, { x: 635, y: 282 }, 145, 110, 'underneath', 'Right flat'));
  } else if (look.coverage === 3) {
    deep.push(zone('CL', { x: 80, y: 267 }, { x: 120, y: 115 }, 230, 190, 'deep', 'Left third'), zone('FS', { x: 350, y: 150 }, { x: 360, y: 105 }, 240, 190, 'deep', 'Middle third'), zone('CR', { x: 642, y: 267 }, { x: 600, y: 115 }, 230, 190, 'deep', 'Right third'));
    under.push(zone('WILL', { x: 225, y: 313 }, { x: 132, y: 274 }, 190, 120, 'underneath', 'Left curl / flat'), zone('HL', { x: 303, y: 302 }, { x: 276, y: 239 }, 170, 135, 'underneath', 'Left hook'), zone('HR', { x: 408, y: 305 }, { x: 426, y: 239 }, 170, 135, 'underneath', 'Right hook'), zone('SS', { x: 482, y: 215 }, { x: 584, y: 274 }, 190, 120, 'underneath', 'Sky curl / flat'));
  } else if (look.coverage === 4) {
    deep.push(...[90, 270, 450, 630].map((x, i) => zone(['CL', 'SL', 'SR', 'CR'][i], { x, y: i === 0 || i === 3 ? 265 : 172 }, { x, y: 112 }, 175, 190, 'deep', ['Left outside quarter', 'Left inside quarter', 'Right inside quarter', 'Right outside quarter'][i])));
    under.push(zone('WILL', { x: 215, y: 310 }, { x: 166, y: 270 }, 220, 150, 'underneath', 'Left curl / flat'), zone('MIKE', { x: 350, y: 306 }, { x: 350, y: 245 }, 200, 160, 'underneath', 'Middle hook'), zone('SAM', { x: 487, y: 310 }, { x: 552, y: 270 }, 220, 150, 'underneath', 'Right curl / flat'));
  } else {
    deep.push(zone('SL', { x: 205, y: 162 }, { x: 182, y: 112 }, 350, 190, 'deep', 'Left half'), zone('SR', { x: 450, y: 172 }, { x: 450, y: 112 }, 175, 190, 'deep', 'Right inside quarter'), zone('CR', { x: 630, y: 265 }, { x: 630, y: 112 }, 175, 190, 'deep', 'Right outside quarter'));
    under.push(zone('CL', { x: 78, y: 322 }, { x: 85, y: 282 }, 145, 110, 'underneath', 'Half-side flat'), zone('HL', { x: 252, y: 315 }, { x: 237, y: 245 }, 175, 140, 'underneath', 'Half-side hook'), zone('MIKE', { x: 375, y: 310 }, { x: 375, y: 239 }, 180, 150, 'underneath', 'Quarter-side hook'), zone('SAM', { x: 495, y: 310 }, { x: 552, y: 270 }, 220, 150, 'underneath', 'Quarter-side curl / flat'));
  }
  // An extra pressure removes its underneath replacement, never a deep third.
  for (let i = 0; i < blitz; i++) under.splice(look.rushSide === 'left' ? 0 : look.rushSide === 'right' ? under.length - 1 : Math.floor(under.length / 2), 1);
  return [...rushers, ...deep, ...under];
}

// Base protection hold, retained for the legacy call-builder display. simulate()
// measures the actual first contact with the moving quarterback separately.
export function pocketTime(look: Look, personnel: Personnel, protection: Protection, routes: Routes, formation?: FormationId): number {
  const extra = receiversFor(personnel, formation).filter(r => routes[r.id].length < 2 && ['running back', 'tight end'].includes(r.role)).length;
  const slide = look.rushSide !== 'balanced' ? protection === look.rushSide ? .42 : protection === 'balanced' ? 0 : -.35 : protection === 'balanced' ? .14 : -.18;
  return clamp(3.35 - look.blitz * .66 + extra * .47 + slide - Math.min(look.level - 1, 10) * .04, 1.1, 4.2);
}

type Call = { receivers: ReturnType<typeof receiversFor>; routes: Routes; defense: Defender[]; qb: Point; options: PlayOptions; look: Look; personnel: Personnel };
function prepare(look: Look, personnel: Personnel, drawn: Routes, options: PlayOptions): Call {
  const receivers = receiversFor(personnel, options.formation);
  return { receivers, routes: Object.fromEntries(receivers.map(r => [r.id, curvePoints(sanitizeRoute(drawn[r.id] ?? [], r.start))])) as Routes, defense: defenseFor(look, personnel, options.formation), qb: qbStartFor(personnel, options.formation), options, look, personnel };
}

function coverageStep(d: Defender, from: Point, offense: Frame['receivers'], routes: Routes, time: number, look: Look): Point {
  const speed = Math.min(110, 104 + (look.level - 1) * 1.2);
  if (d.assignment === 'man' && d.target) {
    const route = routes[d.target], earlier = atDistance(route, Math.max(0, time - .5) * 109), middle = atDistance(route, Math.max(0, time - .25) * 109), current = offense[d.target];
    const a = { x: middle.x - earlier.x, y: middle.y - earlier.y }, b = { x: current.x - middle.x, y: current.y - middle.y };
    const lengths = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
    const turnLag = lengths > 1 ? clamp(1 - (a.x * b.x + a.y * b.y) / lengths, 0, 1) * .5 : 0;
    const trail = atDistance(route, Math.max(0, time - Math.max(.23, .34 - (look.level - 1) * .017) - turnLag) * 109);
    return moveToward(from, { x: trail.x + (trail.x < 350 ? 7 : -7), y: Math.min(350, trail.y - 10) }, speed / FPS);
  }
  const area = d.zone;
  const candidates = Object.values(offense).filter(p => area ? p.x >= area.x - 25 && p.x <= area.x + area.width + 25 && (area.depth === 'deep' ? p.y < 265 : p.y >= area.y - 20 && p.y <= area.y + area.height + 55) : distance(p, d.drop) < 160);
  const threat = candidates.sort((a, b) => distance(a, d.drop) - distance(b, d.drop))[0];
  let destination = d.drop;
  if (threat && time > .4) {
    if (area?.depth === 'deep') destination = { x: clamp(threat.x, area.x + 18, area.x + area.width - 18), y: Math.min(d.drop.y + 72, threat.y - 25) };
    else destination = lerp(d.drop, threat, .72);
  }
  return bounded(moveToward(from, destination, speed / FPS));
}

function passFrames(call: Call, protection: Protection): { frames: Frame[]; pocket: number } {
  const { receivers, routes, defense, qb, options, look, personnel } = call;
  const nominal = pocketTime(look, personnel, protection, routes, options.formation);
  // Forward-pass rollouts stay behind the line. Runs cross it in runFrames().
  const qbRoute = curvePoints(sanitizeRoute((options.qbRoute ?? [qb]).map(p => ({ x: p.x, y: Math.max(FIELD.los + 12, p.y) })), qb));
  const blockers = [...LINEMEN, ...receivers.filter(r => routes[r.id].length < 2 && ['running back', 'tight end'].includes(r.role))];
  const available = new Set(blockers.map(b => b.id));
  const assignments = new Map<string, { blocker: string; point: Point; release: number }>();
  const rushers = defense.filter(d => d.assignment === 'rush').sort((a, b) => protection === 'right' ? b.start.x - a.start.x : protection === 'left' ? a.start.x - b.start.x : Math.abs(a.start.x - qb.x) - Math.abs(b.start.x - qb.x));
  const rushSpeed = Math.min(142, 126 + look.level * .7);
  for (const d of rushers) {
    const blocker = blockers.filter(b => available.has(b.id)).sort((a, b) => distance(a.start, d.start) - distance(b.start, d.start))[0];
    if (blocker) {
      available.delete(blocker.id);
      const point = { x: (blocker.start.x + d.start.x) / 2, y: 379 };
      assignments.set(d.id, { blocker: blocker.id, point, release: Math.max(.62, nominal - distance({ x: point.x, y: point.y - 12 }, qb) / rushSpeed) });
    }
  }
  let positions = Object.fromEntries(defense.map(d => [d.id, { ...d.start }]));
  let pocket = END, sackPoint: Point | undefined;
  const frames: Frame[] = [];
  for (let step = 0; step <= END * FPS; step++) {
    const time = step / FPS, currentQB = sackPoint ?? atDistance(qbRoute, Math.max(0, time - .12) * 78);
    const offense = Object.fromEntries(receivers.map(r => [r.id, atDistance(routes[r.id], Math.max(0, time - (look.press && r.onLine ? .13 : 0)) * 109)])) as Frame['receivers'];
    const linemen = Object.fromEntries(LINEMEN.map(n => [n.id, { ...n.start }]));
    const engagements: Engagement[] = [];
    for (const [rusher, assignment] of assignments) {
      const blocker = blockers.find(b => b.id === assignment.blocker)!;
      const p = lerp(blocker.start, { x: assignment.point.x, y: assignment.point.y + 12 }, Math.min(time / .45, 1));
      if (assignment.blocker in linemen) linemen[assignment.blocker] = p;
      else offense[assignment.blocker as ReceiverId] = p;
      if (time >= .45 && time <= assignment.release && time < pocket) engagements.push({ blocker: assignment.blocker, rusher, point: assignment.point });
    }
    if (step) positions = Object.fromEntries(defense.map(d => {
      if (d.assignment !== 'rush') return [d.id, coverageStep(d, positions[d.id], offense, routes, time, look)];
      const assignment = assignments.get(d.id);
      if (assignment) {
        const contact = { x: assignment.point.x, y: assignment.point.y - 12 };
        if (time < .45) return [d.id, lerp(d.start, contact, time / .45)];
        if (time <= assignment.release) return [d.id, contact];
      }
      // Pursuit recalculates every frame: a rollout changes the rush angle and
      // escape distance, rather than receiving a flat pocket-time bonus.
      return [d.id, moveToward(positions[d.id], currentQB, rushSpeed / FPS)];
    }));
    if (!sackPoint && time > .3 && rushers.some(d => distance(positions[d.id], currentQB) <= 18)) { pocket = time; sackPoint = { ...currentQB }; }
    frames.push({ time, receivers: offense, defenders: { ...positions }, linemen, engagements, qb: { ...currentQB }, ball: { ...currentQB } });
  }
  return { frames, pocket };
}

type Window = { score: number; target: ReceiverId | null; time: number; catchTime: number; point: Point; release: Point; separation: number; yards: number; spacing: number; laneClearance: number; viable: boolean; anglePenalty: number };
function chooseWindow(call: Call, frames: Frame[], pocket: number, earliest = .6, latest = END, conflict?: Defender): Window {
  const { defense, receivers, routes, qb } = call;
  const goal = goalDistance(call.options), minimumYards = Math.min(2, goal);
  const fallbackTime = Math.min(pocket, latest, Math.max(earliest, 2.4)), fallbackPoint = frames[Math.min(frames.length - 1, Math.round(fallbackTime * FPS))].qb;
  let best: Window = { score: 0, target: null, time: fallbackTime, catchTime: fallbackTime, point: fallbackPoint, release: fallbackPoint, separation: 0, yards: 0, spacing: 0, laneClearance: 0, viable: false, anglePenalty: 0 };
  for (let index = Math.ceil(earliest * FPS); index < frames.length; index += 2) {
    const frame = frames[index];
    if (frame.time >= Math.min(pocket - .12, latest)) break;
    for (const receiver of receivers) {
      if (routes[receiver.id].length < 2 || call.options.rpo && receiver.role === 'running back') continue;
      const prior = frames[Math.max(0, index - 3)].qb, vx = (frame.qb.x - prior.x) / .15;
      const lateralThrow = frame.receivers[receiver.id].x - frame.qb.x;
      const acrossBody = vx * lateralThrow < 0 ? clamp(Math.abs(vx) / 78, 0, 1) * clamp(Math.abs(lateralThrow) / 220, 0, 1) : 0;
      const anglePenalty = acrossBody * .3;
      const releaseIndex = Math.min(frames.length - 1, index + Math.ceil(anglePenalty * FPS)), releaseFrame = frames[releaseIndex];
      if (releaseFrame.time >= pocket - .1 || releaseFrame.time > latest) continue;
      const ballSpeed = 470 * (1 - acrossBody * .24);
      let catchIndex = releaseIndex, point = releaseFrame.receivers[receiver.id];
      for (let prediction = 0; prediction < 3; prediction++) {
        catchIndex = Math.min(frames.length - 1, releaseIndex + Math.ceil(distance(releaseFrame.qb, point) / ballSpeed * FPS));
        point = frames[catchIndex].receivers[receiver.id];
      }
      const catchFrame = frames[catchIndex], yards = Math.max(0, yardsAt(point));
      // A drive has a real back line, ten yards beyond the goal. The draft's
      // unbounded teaching field is unchanged when yardsToGoal is omitted.
      if (yards < minimumYards || yards > goal + 10 + 1e-8) continue;
      // An RPO replaces the read defender, rather than crediting an unrelated
      // route on the other side of the field for a run-fit decision.
      if (conflict && ((point.x - qb.x) * (conflict.start.x - qb.x) < 0 || Math.abs(point.x - conflict.start.x) > 180 || point.y >= frames[Math.round(earliest * FPS)].defenders[conflict.id].y)) continue;
      const separation = Math.min(...defense.filter(d => d.assignment !== 'rush').map(d => distance(point, catchFrame.defenders[d.id])));
      const spacing = Math.min(...receivers.filter(r => r.id !== receiver.id).map(r => distance(point, catchFrame.receivers[r.id])));
      let laneClearance = Infinity;
      for (let passIndex = releaseIndex + 1; passIndex <= catchIndex; passIndex++) {
        const progress = (passIndex - releaseIndex) / Math.max(1, catchIndex - releaseIndex);
        const passPoint = lerp(releaseFrame.qb, point, progress);
        for (const d of defense) {
          // Rushers can bat a pass once it gets clear of the releasing QB.
          if (d.assignment === 'rush' && progress < .22) continue;
          laneClearance = Math.min(laneClearance, distance(passPoint, frames[passIndex].defenders[d.id]));
        }
      }
      const lanePenalty = clamp((18 - laneClearance) * 1.8, 0, 32);
      const score = Math.round(clamp(clamp(separation / 68 * 56, 0, 56) + clamp(yards / 14 * 26, 0, 26) + clamp(spacing / 95 * 10, 0, 10) + clamp((pocket - releaseFrame.time) / 1.25 * 8, 0, 8) - lanePenalty, 0, 100));
      const viable = yards >= minimumYards && separation >= 17 + acrossBody * 7 && laneClearance >= 9 + acrossBody * 3;
      const priority = viable ? yards >= Math.min(5, goal) ? 2 : 1 : 0, bestPriority = best.viable ? best.yards >= Math.min(5, goal) ? 2 : 1 : 0;
      if (priority > bestPriority || priority === bestPriority && score > best.score) best = { score, target: receiver.id, time: releaseFrame.time, catchTime: catchFrame.time, point, release: releaseFrame.qb, separation, yards, spacing, laneClearance, viable, anglePenalty };
    }
  }
  return best;
}

function passBall(frames: Frame[], window: Window, completed: boolean): void {
  for (const frame of frames) {
    if (!window.target || frame.time < window.time) frame.ball = { ...frame.qb };
    else if (frame.time <= window.catchTime) frame.ball = lerp(window.release, window.point, clamp((frame.time - window.time) / Math.max(.05, window.catchTime - window.time), 0, 1));
    else frame.ball = { ...window.point };
    // End the receiver at the recorded catch, so the marker and awarded gain
    // agree. Incompletions stop the ball there without crediting those yards.
    if (completed && window.target && frame.time >= window.catchTime) frame.receivers[window.target] = { ...window.point };
  }
}

type RunBuild = { frames: Frame[]; pocket: number; stop: number; point: Point; gain: number; keeper: boolean; mesh: number; conflict: Defender; action: ReadDecision['action']; runScheme: RunScheme };

function runFrames(call: Call, rpoPass = false): RunBuild {
  const { receivers, routes, defense, qb, look, options } = call;
  const scheme = options.runScheme ?? 'Zone Read', sign = options.runSide === 'left' ? -1 : 1;
  const goal = goalDistance(options), goalY = FIELD.los - goal * 12;
  const mesh = scheme === 'Draw' ? 1.25 : scheme === 'Counter' ? .95 : .8;
  const back = receivers.find(r => r.role === 'running back')!;
  let laneX = qb.x + sign * (scheme === 'Power' || scheme === 'Counter' ? 75 : scheme === 'Draw' ? 0 : 40);
  let meshPoint = { x: qb.x + sign * 16, y: 420 }, meshTravel = 0;
  const customRun = routes[back.id].length > 1;
  if (customRun) {
    // The handoff occurs on the same rounded curve shown in the editor. Pick
    // the back's closest approach to the QB in the backfield, then continue
    // along that exact curve; editing a bend therefore changes the run itself.
    let traveled = 0, closest = Infinity;
    const path = routes[back.id];
    for (let i = 1; i < path.length; i++) {
      traveled += distance(path[i - 1], path[i]);
      if (path[i].y >= FIELD.los + 25 && traveled <= 180 && distance(path[i], qb) < closest) { closest = distance(path[i], qb); meshPoint = path[i]; meshTravel = traveled; }
      if (path[i - 1].y >= FIELD.los && path[i].y < FIELD.los) {
        laneX = lerp(path[i - 1], path[i], (path[i - 1].y - FIELD.los) / (path[i - 1].y - path[i].y)).x;
        break;
      }
    }
    if (!Number.isFinite(closest)) { meshPoint = path[0]; meshTravel = 0; }
  }
  const readEdge = defense.find(d => d.id === (sign > 0 ? 'D1' : 'D4'))!;
  const apex = defense.filter(d => d.assignment !== 'rush' && d.zone?.depth !== 'deep').sort((a, b) => distance(a.start, { x: qb.x + sign * 120, y: 300 }) - distance(b.start, { x: qb.x + sign * 120, y: 300 }))[0] ?? readEdge;
  const conflict = options.rpo ? apex : readEdge;
  const routeThreat = receivers.filter(r => r.id !== back.id).map(r => ({ receiver: r, point: atDistance(routes[r.id], mesh * 109) })).filter(r => (r.point.x - qb.x) * sign > 30).sort((a, b) => Math.abs(a.point.y - 300) - Math.abs(b.point.y - 300))[0];
  const crash = options.rpo ? look.coverage === 4 || look.coverage === 3 || look.blitz > 0 && conflict.assignment === 'rush' : look.coverage === 1 || look.coverage === 3 || look.rushSide === (sign > 0 ? 'left' : 'right');
  const conflictTarget = crash ? { x: laneX, y: 382 } : options.rpo && routeThreat ? { x: routeThreat.point.x, y: Math.min(315, routeThreat.point.y) } : { x: readEdge.start.x - sign * 35, y: 382 };
  const atRead = moveToward(conflict.start, conflictTarget, Math.max(0, mesh - .15) * 108);
  // Read the defender's actual displacement at the mesh, not the label on the
  // shell. Inside-and-down is a crash; width/depth preserved is a give.
  const action: ReadDecision['action'] = atRead.y > conflict.start.y + 12 && Math.abs(atRead.x - laneX) < Math.abs(conflict.start.x - laneX) - 8 ? 'crash' : Math.abs(atRead.x - qb.x) > Math.abs(conflict.start.x - qb.x) + 12 ? 'widen' : 'sit';
  const keeper = !options.rpo && scheme === 'Zone Read' && action === 'crash';
  const rbPath = customRun ? routes[back.id] : curvePoints(scheme === 'Counter'
    ? [meshPoint, { x: qb.x - sign * 42, y: 415 }, { x: laneX, y: 385 }, { x: laneX + sign * 20, y: 310 }, { x: laneX + sign * 42, y: 72 }]
    : scheme === 'Power'
      ? [meshPoint, { x: laneX - sign * 22, y: 404 }, { x: laneX, y: 338 }, { x: laneX + sign * 18, y: 72 }]
      : scheme === 'Draw'
        ? [meshPoint, { x: laneX, y: 360 }, { x: laneX + sign * 28, y: 280 }, { x: laneX + sign * 40, y: 72 }]
        : [meshPoint, { x: laneX, y: 377 }, { x: laneX + sign * 12, y: 285 }, { x: laneX + sign * 35, y: 72 }]);
  const keepPath = curvePoints([meshPoint, { x: qb.x - sign * 100, y: 410 }, { x: qb.x - sign * 125, y: 320 }, { x: qb.x - sign * 135, y: 72 }]);
  const blockers = [...LINEMEN, ...receivers.filter(r => r.role === 'tight end' && (!options.rpo || routes[r.id].length < 2))];
  const pulling = scheme === 'Power' ? [sign > 0 ? 'LG' : 'RG'] : scheme === 'Counter' ? sign > 0 ? ['LG', 'LT'] : ['RG', 'RT'] : [];
  const freeTargets = new Set(defense.filter(d => d.zone?.depth !== 'deep' && !(d.id === conflict.id && (options.rpo || scheme === 'Zone Read'))).map(d => d.id));
  const blocks = new Map<string, { blocker: typeof blockers[number]; defender: Defender; point: Point; arrive: number; release: number; pull: boolean }>();
  // Pullers are reserved for the playside edge/second level; the remaining line
  // works from its actual alignment. An unblocked read defender stays unblocked.
  for (const blocker of [...blockers.filter(b => pulling.includes(b.id)), ...blockers.filter(b => !pulling.includes(b.id))]) {
    const pull = pulling.includes(blocker.id), desired = pull ? { x: laneX + sign * 24, y: 315 + (blocker.id.endsWith('T') ? -35 : 20) } : blocker.start;
    const defender = defense.filter(d => freeTargets.has(d.id)).sort((a, b) => distance(a.start, desired) - distance(b.start, desired))[0];
    if (!defender) continue;
    freeTargets.delete(defender.id);
    const point = { x: pull ? laneX + sign * 34 : (blocker.start.x + defender.start.x) / 2 + sign * (scheme === 'Zone Read' ? 18 : 0), y: pull ? 332 : scheme === 'Draw' ? 390 : 350 };
    blocks.set(defender.id, { blocker, defender, point, arrive: pull ? 1.1 : scheme === 'Draw' ? .45 : .42, release: pull ? 2.45 : scheme === 'Draw' ? 2.25 : 2.05, pull });
  }
  const frames: Frame[] = [];
  let positions = Object.fromEntries(defense.map(d => [d.id, { ...d.start }]));
  let stop = END, stopped: Point | undefined, pocket = END;
  for (let step = 0; step <= END * FPS; step++) {
    const time = step / FPS;
    const rbPlanned = time < mesh ? customRun ? atDistance(rbPath, meshTravel * time / mesh) : lerp(back.start, meshPoint, clamp(time / mesh, 0, 1)) : atDistance(rbPath, meshTravel + (time - mesh) * RUN_SPEED);
    const keepPlanned = time < mesh ? lerp(qb, meshPoint, clamp(time / mesh, 0, 1)) : atDistance(keepPath, (time - mesh) * 92);
    let carrier = stopped ?? (keeper ? keepPlanned : rbPlanned);
    if (!rpoPass && !stopped && time >= mesh && carrier.y <= goalY) {
      const priorFrame = frames.at(-1), prior = priorFrame ? keeper ? priorFrame.qb : priorFrame.receivers[back.id] : meshPoint;
      const crossing = prior.y === carrier.y ? 1 : clamp((prior.y - goalY) / (prior.y - carrier.y), 0, 1);
      carrier = { ...lerp(prior, carrier, crossing), y: goalY };
      // Touchdown ends the run before later pursuit can create a tackle. The
      // crossing is placed exactly on the goal at this 20 Hz contact sample.
      stop = time; stopped = { ...carrier };
    }
    const currentQB = keeper ? carrier : time <= mesh ? lerp(qb, meshPoint, time / mesh) : lerp(meshPoint, options.rpo ? { x: meshPoint.x - sign * 8, y: meshPoint.y + 15 } : { x: meshPoint.x - sign * 35, y: meshPoint.y + 16 }, Math.min((time - mesh) / .35, 1));
    const offense = Object.fromEntries(receivers.map(r => [r.id, r.id === back.id ? keeper ? rbPlanned : carrier : atDistance(routes[r.id], time * 109)])) as Frame['receivers'];
    const linemen = Object.fromEntries(LINEMEN.map(n => [n.id, { ...n.start }]));
    const engagements: Engagement[] = [];
    for (const [rusher, block] of blocks) {
      const advance = clamp((time - block.arrive) / 1.1, 0, 1);
      const point = { x: block.point.x + (scheme === 'Draw' ? -sign * 15 : sign * 17) * advance, y: block.point.y - (scheme === 'Draw' ? 10 : 35) * advance };
      const set = { x: point.x, y: point.y + 12 };
      const pullPath = curvePoints([block.blocker.start, { x: block.blocker.start.x + sign * 28, y: 407 }, { x: laneX + sign * 35, y: 389 }, set]);
      const pullLength = pullPath.slice(1).reduce((sum, p, i) => sum + distance(pullPath[i], p), 0);
      let p = block.pull && time < block.arrive ? atDistance(pullPath, time / block.arrive * pullLength) : lerp(block.blocker.start, set, Math.min(time / block.arrive, 1));
      if (time >= block.arrive) p = set;
      if (block.blocker.id in linemen) linemen[block.blocker.id] = p; else offense[block.blocker.id as ReceiverId] = p;
      if (time >= block.arrive && time <= block.release && time < stop) engagements.push({ blocker: block.blocker.id, rusher, point });
    }
    if (step) positions = Object.fromEntries(defense.map(d => {
      const from = positions[d.id], block = blocks.get(d.id), engagement = engagements.find(e => e.rusher === d.id);
      if (engagement) return [d.id, { x: engagement.point.x, y: engagement.point.y - 12 }];
      if (block && time < block.arrive) return [d.id, moveToward(from, { x: block.point.x, y: block.point.y - 12 }, 94 / FPS)];
      if (d.id === conflict.id && time <= mesh + (keeper ? .55 : .18)) return [d.id, time <= .15 ? from : moveToward(from, conflictTarget, 108 / FPS)];
      if (rpoPass && d.assignment !== 'rush') {
        if (d.id === conflict.id && time < mesh + .55) return [d.id, moveToward(from, conflictTarget, 108 / FPS)];
        return [d.id, coverageStep(d, from, offense, routes, time, look)];
      }
      if (rpoPass && d.assignment === 'rush') return [d.id, moveToward(from, currentQB, 126 / FPS)];
      if (options.rpo && d.id === conflict.id && !crash) return [d.id, coverageStep(d, from, offense, routes, time, look)];
      const isDeep = d.zone?.depth === 'deep', manAttached = d.assignment === 'man' && d.target !== back.id && time < mesh + .8;
      if (time < mesh || manAttached || isDeep && time < mesh + .8) return [d.id, d.assignment === 'rush' ? moveToward(from, { x: qb.x, y: 418 }, 94 / FPS) : coverageStep(d, from, offense, routes, time, look)];
      // Fit the ball's lane after the handoff. Deep support arrives from its
      // actual safety landmark; it cannot teleport into a successful run.
      const destination = time < mesh + .32 ? { x: laneX, y: 342 } : carrier;
      return [d.id, bounded(moveToward(from, destination, (isDeep ? 106 : 94) / FPS))];
    }));
    if (!rpoPass && time >= mesh + .12 && !stopped && defense.some(d => !engagements.some(e => e.rusher === d.id) && distance(positions[d.id], carrier) <= 18)) { stop = time; stopped = { ...carrier }; }
    if (pocket === END && time > mesh && defense.filter(d => d.assignment === 'rush' && !engagements.some(e => e.rusher === d.id)).some(d => distance(positions[d.id], currentQB) <= 18)) pocket = time;
    const ball = time < mesh ? currentQB : carrier;
    frames.push({ time, receivers: offense, defenders: { ...positions }, linemen, engagements, qb: currentQB, ball: { ...ball } });
  }
  const point = stopped ?? (keeper ? frames.at(-1)!.qb : frames.at(-1)!.receivers[back.id]);
  return { frames, pocket, stop, point, gain: point.y === goalY ? goal : yardsAt(point), keeper, mesh, conflict, action, runScheme: scheme };
}

function rolloutOf(call: Call): 'left' | 'right' | null {
  const end = call.options.qbRoute?.at(-1);
  return !end || Math.abs(end.x - call.qb.x) < 25 ? null : end.x < call.qb.x ? 'left' : 'right';
}

export function simulate(look: Look, personnel: Personnel, drawn: Routes, protection: Protection, options: PlayOptions = {}): Simulation {
  const hasBack = receiversFor(personnel, options.formation).some(r => r.role === 'running back');
  const runPlay = hasBack && (options.kind === 'run' || options.rpo);
  const call = prepare(look, personnel, drawn, runPlay ? options : { ...options, kind: 'pass', rpo: false });
  if (runPlay) {
    const run = runFrames(call);
    const pulls = options.rpo && run.action === 'crash';
    const pass = options.rpo ? runFrames(call, true) : undefined;
    const window = pass ? chooseWindow(call, pass.frames, pass.pocket, run.mesh, run.mesh + .5, run.conflict) : undefined;
    const decision: ReadDecision['decision'] = pulls ? 'pull' : run.keeper ? 'keep' : 'give';
    const text = `${run.conflict.id} ${run.action === 'crash' ? 'steps inside toward the run' : run.action === 'widen' ? 'widens with the outside threat' : 'holds outside leverage'} at the mesh. ${pulls ? 'Pull and throw behind that fit.' : run.keeper ? 'Keep around the unblocked edge.' : 'Give the ball into the called lane.'}`;
    const read: ReadDecision | undefined = options.rpo || run.runScheme === 'Zone Read' ? { defender: run.conflict.id, at: run.mesh, decision, action: run.action, text, runGain: run.gain, passGain: window?.viable ? creditedYards(window.yards, options) : 0 } : undefined;
    if (pulls && window && pass) {
      passBall(pass.frames, window, window.viable);
      // The mesh fake never hands the ball to the back on a pull.
      for (const f of pass.frames) if (f.time < window.time) f.ball = { ...f.qb };
      const gain = window.viable ? creditedYards(window.yards, options) : 0;
      return { frames: pass.frames, score: window.score, won: window.viable && gain >= 5 && window.score >= look.targetScore, target: window.target, throwTime: window.time, catchTime: window.catchTime, catchPoint: window.point, separation: window.separation, yards: gain, gain, outcome: window.viable ? 'complete' : 'incomplete', pocket: pass.pocket, spacing: window.spacing, laneClearance: window.laneClearance, releasePoint: window.release, rollout: null, anglePenalty: window.anglePenalty, read, runScheme: run.runScheme, feedback: [text, window.viable ? `${window.target} catches the ball behind the vacated fit for ${gain.toFixed(1)} yards.` : 'The run defender commits, but the quick route does not clear the remaining coverage. The pass falls incomplete.'] };
    }
    const score = Math.round(clamp(run.gain * 10, 0, 100));
    return { frames: run.frames, score, won: run.gain >= 5 && score >= look.targetScore, target: run.keeper ? null : 'RB', throwTime: run.mesh, catchTime: run.stop, catchPoint: run.point, separation: 0, yards: run.gain, gain: run.gain, outcome: run.keeper ? 'qb-run' : 'run', pocket: run.pocket, spacing: 0, laneClearance: 0, releasePoint: frameAt({ frames: run.frames } as Simulation, run.mesh).qb, rollout: run.keeper ? options.runSide === 'left' ? 'right' : 'left' : null, anglePenalty: 0, read, runScheme: run.runScheme, feedback: [read?.text ?? (run.runScheme === 'Power' ? 'The backside guard pulls through the playside gap while the edge blocker kicks the force player out.' : run.runScheme === 'Counter' ? 'The back steps away first, then follows two pullers back across the formation.' : 'The line shows pass sets. The back takes the delayed handoff underneath the upfield rush.'), run.gain >= goalDistance(options) ? `${run.keeper ? 'The quarterback' : 'The back'} crosses the goal line for a ${run.gain.toFixed(1)}-yard touchdown.` : `${run.keeper ? 'The quarterback' : 'The back'} reaches ${run.gain.toFixed(1)} yards before ${run.stop < END ? 'the first unblocked defender makes contact' : 'the six-second whistle'}.`] };
  }
  const { frames, pocket } = passFrames(call, protection), window = chooseWindow(call, frames, pocket);
  const completed = !!window.target && window.viable;
  passBall(frames, window, completed);
  const sack = !window.target && pocket < END;
  const sackFrame = frames[Math.min(frames.length - 1, Math.round(pocket * FPS))];
  const gain = completed ? creditedYards(window.yards, options) : sack ? Math.min(0, yardsAt(sackFrame.qb)) : 0;
  const catchPoint = sack ? sackFrame.qb : window.point;
  const feedback = [completed ? `${window.target} has ${(window.separation / 12).toFixed(1)} yards of room at the catch. The completion gains ${gain.toFixed(1)} yards.` : window.target ? window.laneClearance < 9 ? 'The defender crosses the throwing lane before the ball arrives. Incomplete.' : 'The catch window closes before the ball arrives. Incomplete.' : sack ? `Nobody clears a throwing window. The rush reaches the quarterback at ${pocket.toFixed(2)}s.` : 'No receiver reaches an open window before the play ends.'];
  if (rolloutOf(call)) feedback.push(`The quarterback rolls ${rolloutOf(call)} and the rush changes its pursuit angle.${window.anglePenalty > .02 ? ` Throwing back across the field needs ${window.anglePenalty.toFixed(2)}s to reset and a longer ball flight.` : ' The ball comes out from the moving pocket.'}`);
  else {
    const last = frames.at(-1)!, contact = pocket < END || call.defense.some(d => d.assignment === 'rush' && distance(last.defenders[d.id], last.qb) <= 18);
    feedback.push(`${contact ? `The rush first reaches the quarterback at ${pocket.toFixed(2)}s.` : 'No rusher reaches the quarterback during the six-second play.'} ${look.coverage <= 1 ? 'Break away from the trailing man.' : 'Put routes at different depths inside one zone.'}`);
  }
  return { frames, score: window.score, won: completed && gain >= 5 && window.score >= look.targetScore, target: window.target, throwTime: sack ? pocket : window.time, catchTime: sack ? pocket : window.catchTime, catchPoint, separation: window.separation, yards: gain, gain, outcome: completed ? 'complete' : sack ? 'sack' : 'incomplete', pocket, spacing: window.spacing, laneClearance: window.laneClearance, feedback, releasePoint: sack ? sackFrame.qb : window.release, rollout: rolloutOf(call), anglePenalty: window.anglePenalty };
}

export function frameAt(result: Pick<Simulation, 'frames'>, time: number): Frame {
  const boundedTime = clamp(time, 0, result.frames.at(-1)!.time), index = Math.min(result.frames.length - 1, Math.floor(boundedTime * FPS));
  const from = result.frames[index], to = result.frames[Math.min(index + 1, result.frames.length - 1)], t = clamp((boundedTime - from.time) * FPS, 0, 1);
  return { time: boundedTime, receivers: Object.fromEntries(RECEIVER_IDS.map(id => [id, lerp(from.receivers[id], to.receivers[id], t)])) as Frame['receivers'], defenders: Object.fromEntries(Object.keys(from.defenders).map(id => [id, lerp(from.defenders[id], to.defenders[id], t)])), linemen: Object.fromEntries(LINEMEN.map(n => [n.id, lerp(from.linemen[n.id], to.linemen[n.id], t)])), engagements: from.engagements, qb: lerp(from.qb, to.qb, t), ball: lerp(from.ball, to.ball, t) };
}
