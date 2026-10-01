export type Point = { x: number; y: number };
export type Personnel = '11' | '12' | 'empty';
export type Protection = 'balanced' | 'left' | 'right';
export type ReceiverId = 'X' | 'Z' | 'Y' | 'RB' | 'H';
export type RouteName = 'Slant' | 'Post' | 'Out' | 'Wheel' | 'Go' | 'Drag' | 'Block';
export type Routes = Record<ReceiverId, Point[]>;
export type Receiver = { id: ReceiverId; start: Point; role: string };
export type Defender = { id: string; start: Point; drop: Point; assignment: 'man' | 'zone' | 'rush'; target?: ReceiverId };
export type Look = { name: string; coverage: 0 | 1 | 2 | 3 | 4; press: boolean; rushSide: Protection; blitz: number; hint: string; level: number; targetScore: number };
export type Frame = { time: number; receivers: Record<ReceiverId, Point>; defenders: Record<string, Point> };
export type Simulation = { frames: Frame[]; score: number; won: boolean; target: ReceiverId | null; throwTime: number; catchTime: number; catchPoint: Point; separation: number; yards: number; pocket: number; spacing: number; laneClearance: number; feedback: string[] };
export type Run = { seed: number; level: number; lives: number; total: number; status: 'playing' | 'over' };

export const FIELD = { width: 720, height: 510, los: 365, qb: { x: 350, y: 459 } };
export const RECEIVER_IDS: ReceiverId[] = ['X', 'Z', 'Y', 'RB', 'H'];
export const ROUTE_NAMES: RouteName[] = ['Slant', 'Post', 'Out', 'Wheel', 'Go', 'Drag', 'Block'];
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, Number.isFinite(n) ? n : low));
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

export function receiversFor(personnel: Personnel): Receiver[] {
  const positions = personnel === '12'
    ? [{ x: 75, y: 398 }, { x: 645, y: 398 }, { x: 446, y: 381 }, { x: 306, y: 438 }, { x: 252, y: 381 }]
    : personnel === 'empty'
      ? [{ x: 70, y: 381 }, { x: 650, y: 381 }, { x: 445, y: 398 }, { x: 540, y: 398 }, { x: 182, y: 398 }]
      : [{ x: 75, y: 381 }, { x: 645, y: 398 }, { x: 446, y: 381 }, { x: 306, y: 438 }, { x: 182, y: 398 }];
  return RECEIVER_IDS.map((id, i) => ({ id, start: positions[i], role: id === 'RB' ? personnel === 'empty' ? 'slot receiver' : 'running back' : personnel !== 'empty' && (id === 'Y' || id === 'H' && personnel === '12') ? 'tight end' : 'receiver' }));
}

// Reject invalid input and bound route complexity before either rendering or simulation.
export function sanitizeRoute(points: Point[], start: Point): Point[] {
  const result: Point[] = [{ ...start }];
  for (const point of points.slice(0, 1600)) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    const next = { x: clamp(point.x, 24, 696), y: clamp(point.y, 28, 481) };
    if (distance(result[result.length - 1], next) >= 7) result.push(next);
    if (result.length >= 100) break;
  }
  return result;
}

export function emptyRoutes(personnel: Personnel): Routes {
  return Object.fromEntries(receiversFor(personnel).map(r => [r.id, [r.start]])) as Routes;
}

export function routePreset(receiver: Receiver, name: RouteName): Point[] {
  const p = receiver.start, inward = p.x < 350 ? 1 : -1;
  const coordinates: Record<RouteName, Point[]> = {
    Slant: [p, { x: p.x, y: p.y - 42 }, { x: p.x + inward * 140, y: p.y - 163 }],
    Post: [p, { x: p.x, y: p.y - 132 }, { x: p.x + inward * 138, y: p.y - 283 }],
    Out: [p, { x: p.x, y: p.y - 113 }, { x: p.x - inward * 104, y: p.y - 113 }],
    Wheel: [p, { x: p.x - inward * 75, y: p.y - 30 }, { x: p.x - inward * 114, y: p.y - 65 }, { x: p.x - inward * 114, y: 62 }],
    Go: [p, { x: p.x, y: 44 }],
    Drag: [p, { x: p.x, y: p.y - 57 }, { x: p.x + inward * 238, y: p.y - 72 }],
    Block: [p],
  };
  return sanitizeRoute(coordinates[name], p);
}

export function smoothPath(points: Point[]): string {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const middle = lerp(points[i], points[i + 1], .5);
    path += ` Q ${points[i].x} ${points[i].y} ${middle.x} ${middle.y}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

// Render and simulate the same rounded polyline. This avoids scoring invisible corners.
export function curvePoints(points: Point[]): Point[] {
  if (points.length < 3) return points;
  const output = [points[0]];
  let from = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const to = lerp(points[i], points[i + 1], .5);
    for (let step = 1; step <= 6; step++) {
      const t = step / 6;
      output.push({ x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * points[i].x + t * t * to.x, y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * points[i].y + t * t * to.y });
    }
    from = to;
  }
  output.push(points[points.length - 1]);
  return output;
}

export function atDistance(points: Point[], travel: number): Point {
  if (!points.length) return { ...FIELD.qb };
  for (let i = 1; i < points.length; i++) {
    const length = distance(points[i - 1], points[i]);
    if (travel <= length && length > 0) return lerp(points[i - 1], points[i], clamp(travel / length, 0, 1));
    travel -= length;
  }
  return points[points.length - 1];
}

export function arrowGeometry(points: Point[], size = 12): { line: Point[]; cap: string } {
  if (points.length < 2) return { line: points, cap: '' };
  const tip = points[points.length - 1];
  const previous = points[points.length - 2];
  const length = distance(previous, tip);
  if (length < .01) return { line: points.slice(0, -1), cap: '' };
  const capLength = Math.min(size, length * .8);
  const dx = (tip.x - previous.x) / length, dy = (tip.y - previous.y) / length;
  const base = { x: tip.x - dx * capLength, y: tip.y - dy * capLength };
  const half = capLength * .48;
  return { line: [...points.slice(0, -1), base], cap: `${tip.x},${tip.y} ${base.x - dy * half},${base.y + dx * half} ${base.x + dy * half},${base.y - dx * half}` };
}

const LOOKS: Omit<Look, 'level' | 'targetScore'>[] = [
  { name: 'Press Cover 1 · edge blitz', coverage: 1, press: true, rushSide: 'right', blitz: 1, hint: 'One deep safety. Break across a man defender, and account for the extra edge rusher.' },
  { name: 'Soft Cover 4 shell', coverage: 4, press: false, rushSide: 'balanced', blitz: 0, hint: 'Four defenders start deep. Use the space underneath before they close it.' },
  { name: 'Cover 3 · left overload', coverage: 3, press: false, rushSide: 'left', blitz: 1, hint: 'Three deep zones. Make an underneath defender choose between two routes.' },
  { name: 'Cover 2 squat corners', coverage: 2, press: false, rushSide: 'balanced', blitz: 0, hint: 'The corners own the flats. Stretch a sideline at two different depths.' },
  { name: 'Cover 0 · double A-gap', coverage: 0, press: true, rushSide: 'balanced', blitz: 2, hint: 'No safety help. The ball has to leave fast; keep someone in to handle the rush.' },
  { name: 'Cover 1 · left pressure', coverage: 1, press: false, rushSide: 'left', blitz: 1, hint: 'Man coverage with a free safety. A sharp break can buy a throwing window.' },
];

export function newRun(seed = Math.floor(Math.random() * 0x7fffffff)): Run {
  return { seed: seed >>> 0, level: 1, lives: 3, total: 0, status: 'playing' };
}

export function lookForLevel(seed: number, level: number): Look {
  const safeLevel = Math.max(1, Math.floor(level));
  let state = (seed + Math.imul(safeLevel, 2654435761)) >>> 0;
  state ^= state >>> 16; state = Math.imul(state, 2246822507); state ^= state >>> 13;
  const choice = LOOKS[(state >>> 0) % LOOKS.length];
  return { ...choice, level: safeLevel, targetScore: Math.min(64, 48 + (safeLevel - 1) * 3) };
}

export function advanceRun(run: Run, result: Pick<Simulation, 'won' | 'score'>): Run {
  if (run.status === 'over') return run;
  if (result.won) return { ...run, level: run.level + 1, total: run.total + result.score };
  const lives = Math.max(0, run.lives - 1);
  return { ...run, lives, status: lives === 0 ? 'over' : 'playing' };
}

export function defenseFor(look: Look, personnel: Personnel): Defender[] {
  const receivers = receiversFor(personnel);
  const rushers = [260, 315, 385, 440].map((x, i): Defender => ({ id: `D${i + 1}`, start: { x, y: 344 }, drop: FIELD.qb, assignment: 'rush' }));
  for (let i = 0; i < look.blitz; i++) {
    const x = look.rushSide === 'left' ? 216 : look.rushSide === 'right' ? 486 : 335 + i * 38;
    rushers.push({ id: `B${i + 1}`, start: { x, y: 318 }, drop: FIELD.qb, assignment: 'rush' });
  }
  if (look.coverage <= 1) {
    const men: Defender[] = receivers.map(r => ({ id: `M${r.id}`, start: { x: r.start.x + (r.start.x < 350 ? 8 : -8), y: Math.min(look.press ? r.start.y - 40 : r.start.y - 83, 341) }, drop: r.start, assignment: 'man', target: r.id }));
    const safety: Defender[] = look.coverage === 1 ? [{ id: 'FS', start: { x: 350, y: 150 }, drop: { x: 350, y: 95 }, assignment: 'zone' }] : [];
    const spare: Defender[] = [...men, ...safety].length + rushers.length < 11 ? [{ id: 'R', start: { x: 350, y: 295 }, drop: { x: 350, y: 256 }, assignment: 'zone' }] : [];
    return [...rushers, ...men, ...safety, ...spare].slice(0, 11);
  }
  const deepCount = look.coverage;
  const zones: Defender[] = Array.from({ length: deepCount }, (_, i) => ({ id: `S${i + 1}`, start: { x: 65 + (590 / Math.max(1, deepCount - 1)) * i, y: 155 + i % 2 * 18 }, drop: { x: 75 + 570 / Math.max(1, deepCount - 1) * i, y: 96 }, assignment: 'zone' }));
  const underneath = 11 - rushers.length - deepCount;
  for (let i = 0; i < underneath; i++) {
    const x = 76 + (568 / Math.max(1, underneath - 1)) * i;
    zones.push({ id: `U${i + 1}`, start: { x, y: 308 }, drop: { x, y: look.coverage === 2 && (i === 0 || i === underneath - 1) ? 296 : 244 }, assignment: 'zone' });
  }
  return [...rushers, ...zones];
}

export function pocketTime(look: Look, personnel: Personnel, protection: Protection, routes: Routes): number {
  const receivers = receiversFor(personnel);
  const extraBlockers = receivers.filter(r => routes[r.id].length < 2 && (r.role === 'running back' || r.role === 'tight end')).length;
  const slide = look.rushSide !== 'balanced' ? protection === look.rushSide ? .42 : protection === 'balanced' ? 0 : -.35 : protection === 'balanced' ? .14 : -.18;
  return clamp(3.35 - look.blitz * .66 + extraBlockers * .47 + slide - Math.min(look.level - 1, 10) * .04, 1.1, 4.2);
}

function moveToward(from: Point, to: Point, step: number): Point {
  const d = distance(from, to);
  return d <= step ? to : lerp(from, to, step / d);
}

export function simulate(look: Look, personnel: Personnel, drawn: Routes, protection: Protection): Simulation {
  const receivers = receiversFor(personnel);
  const routes = Object.fromEntries(receivers.map(r => [r.id, curvePoints(sanitizeRoute(drawn[r.id] ?? [], r.start))])) as Routes;
  const defense = defenseFor(look, personnel);
  const pocket = pocketTime(look, personnel, protection, routes);
  const speed = 109;
  const reaction = Math.max(.23, .34 - (look.level - 1) * .017);
  const defenderSpeed = Math.min(110, 104 + (look.level - 1) * 1.2);
  const frames: Frame[] = [];
  let positions = Object.fromEntries(defense.map(d => [d.id, d.start]));
  for (let step = 0; step <= 90; step++) {
    const time = step / 20;
    const offense = Object.fromEntries(receivers.map(r => [r.id, atDistance(routes[r.id], Math.max(0, time - (look.press && r.start.y < 400 ? .13 : 0)) * speed)])) as Frame['receivers'];
    if (step) positions = Object.fromEntries(defense.map(d => {
      const from = positions[d.id];
      if (d.assignment === 'rush') {
        const t = Math.min(time / pocket, 1);
        return [d.id, { x: d.start.x + (FIELD.qb.x - d.start.x) * t, y: d.start.y + (FIELD.qb.y - d.start.y) * t }];
      }
      if (d.assignment === 'man' && d.target) {
        const route = routes[d.target];
        const earlier = atDistance(route, Math.max(0, time - .5) * speed);
        const middle = atDistance(route, Math.max(0, time - .25) * speed);
        const current = offense[d.target];
        const a = { x: middle.x - earlier.x, y: middle.y - earlier.y }, b = { x: current.x - middle.x, y: current.y - middle.y };
        const lengths = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
        const turnLag = lengths > 1 ? clamp(1 - (a.x * b.x + a.y * b.y) / lengths, 0, 1) * .5 : 0;
        const trail = atDistance(route, Math.max(0, time - reaction - turnLag) * speed);
        // Keep inside leverage and wait at the line for a back to release.
        const leverage = { x: trail.x + (trail.x < 350 ? 7 : -7), y: Math.min(350, trail.y - 10) };
        return [d.id, moveToward(from, leverage, defenderSpeed / 20)];
      }
      // Zone defenders guard landmarks, then drive on the nearest threat in their area.
      const candidates = Object.values(offense).filter(p => distance(p, d.drop) < 155);
      const threat = candidates.sort((a, b) => distance(a, d.drop) - distance(b, d.drop))[0];
      const destination = threat && time > .4 ? lerp(d.drop, threat, .7) : d.drop;
      return [d.id, moveToward(from, destination, defenderSpeed / 20)];
    }));
    frames.push({ time, receivers: offense, defenders: { ...positions } });
  }
  let best = { score: 0, target: null as ReceiverId | null, time: Math.min(pocket, 2.4), catchTime: Math.min(pocket, 2.4), point: FIELD.qb, separation: 0, yards: 0, spacing: 0, laneClearance: 0, viable: false };
  for (let index = 12; index < frames.length; index += 2) {
    const frame = frames[index];
    if (frame.time >= pocket - .12) break;
    for (const receiver of receivers) {
      if (routes[receiver.id].length < 2) continue;
      const flight = distance(FIELD.qb, frame.receivers[receiver.id]) / 470;
      const catchFrame = frames[Math.min(frames.length - 1, index + Math.ceil(flight * 20))];
      const point = catchFrame.receivers[receiver.id];
      const yards = Math.max(0, (FIELD.los - point.y) / 12);
      if (yards < 2) continue;
      const separation = Math.min(...defense.filter(d => d.assignment !== 'rush').map(d => distance(point, catchFrame.defenders[d.id])));
      const spacing = Math.min(...receivers.filter(r => r.id !== receiver.id).map(r => distance(point, catchFrame.receivers[r.id])));
      let laneClearance = Infinity;
      for (let passStep = 1; passStep <= 7; passStep++) {
        const progress = passStep / 7;
        const passPoint = lerp(FIELD.qb, point, progress);
        const passFrame = frames[Math.min(frames.length - 1, index + Math.ceil(flight * 20 * progress))];
        for (const defender of defense.filter(d => d.assignment !== 'rush')) laneClearance = Math.min(laneClearance, distance(passPoint, passFrame.defenders[defender.id]));
      }
      // Predict the catch, not just the release. Crowded routes and late throws lose value.
      const lanePenalty = clamp((18 - laneClearance) * 1.8, 0, 32);
      const score = Math.round(clamp(clamp(separation / 68 * 56, 0, 56) + clamp(yards / 14 * 26, 0, 26) + clamp(spacing / 95 * 10, 0, 10) + clamp((pocket - frame.time) / 1.25 * 8, 0, 8) - lanePenalty, 0, 100));
      const viable = yards >= 5 && separation >= 17 && laneClearance >= 9;
      if (viable && !best.viable || viable === best.viable && score > best.score) best = { score, target: receiver.id, time: frame.time, catchTime: catchFrame.time, point, separation, yards, spacing, laneClearance, viable };
    }
  }
  const won = best.score >= look.targetScore && best.viable;
  const feedback = best.target
    ? [`Throw to ${best.target} at ${best.time.toFixed(1)}s: ${Math.round(best.separation / 12 * 10) / 10} yards of room at the catch. ${won ? `The completion gains ${Math.round(best.yards)} yards.` : best.laneClearance < 9 ? 'A defender cuts across the throwing lane.' : best.separation < 17 ? 'The defender closes the catch window.' : best.yards < 5 ? 'It stays short of the five yards you need.' : 'There is a window, but this level needs more space or depth.'}`]
    : ['Nobody gets to a usable window before the rush arrives. Draw at least one route upfield.'];
  if (look.blitz) feedback.push(protection === look.rushSide || look.rushSide === 'balanced' && protection === 'balanced' ? `The protection handles the pressure for ${pocket.toFixed(1)}s.` : `The ${look.rushSide === 'balanced' ? 'A-gap' : `${look.rushSide} edge`} rush gets home in ${pocket.toFixed(1)}s. ${look.rushSide === 'balanced' ? 'Keep a back or tight end in to block.' : `Slide protection ${look.rushSide}, or keep a back in.`}`);
  else if (best.spacing < 55) feedback.push('Two routes crowd the same patch of grass. Give the next receiver a different depth.');
  else feedback.push(look.coverage <= 1 ? 'Change direction to make a man defender chase. A second crossing route can split the help.' : 'Stretch the zone with routes at different depths. One defender cannot sit on both.');
  return { frames, score: best.score, won, target: best.target, throwTime: best.time, catchTime: best.catchTime, catchPoint: best.point, separation: best.separation, yards: best.yards, pocket, spacing: best.spacing, laneClearance: best.laneClearance, feedback };
}

export function frameAt(result: Simulation, time: number): Frame {
  const index = Math.min(result.frames.length - 1, Math.max(0, Math.floor(time * 20)));
  const from = result.frames[index], to = result.frames[Math.min(index + 1, result.frames.length - 1)];
  const t = clamp((time - from.time) * 20, 0, 1);
  return { time, receivers: Object.fromEntries(RECEIVER_IDS.map(id => [id, lerp(from.receivers[id], to.receivers[id], t)])) as Frame['receivers'], defenders: Object.fromEntries(Object.keys(from.defenders).map(id => [id, lerp(from.defenders[id], to.defenders[id], t)])) };
}
