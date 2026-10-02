import type { Point, Personnel, ReceiverId, Routes, Look, Simulation, Run, FormationId } from './model.ts';
import { receiversFor } from './formations.ts';
export type * from './model.ts';
export { receiversFor, formationsFor, defaultFormation, qbStartFor } from './formations.ts';
export { ROUTE_NAMES, routePreset, qbPreset, runRoutePreset, routeDepth, adjustRouteDepth, editRouteHandle, routeHandles } from './routeEditing.ts';
export { defenseFor, pocketTime, simulate, frameAt } from './simulation.ts';

export const FIELD = { width: 720, height: 510, los: 365, qb: { x: 350, y: 459 } };
export const LINEMEN = ['LT', 'LG', 'C', 'RG', 'RT'].map((id, i) => ({ id, start: { x: 294 + i * 28, y: 379 } }));
export const RECEIVER_IDS: ReceiverId[] = ['X', 'Z', 'Y', 'RB', 'H'];
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, Number.isFinite(n) ? n : low));
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Reject invalid input and bound route complexity before either rendering or simulation.
export function sanitizeRoute(points: Point[], start: Point): Point[] {
  const result: Point[] = [{ ...start }];
  for (const point of points.slice(0, 1600)) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    const next = { x: clamp(point.x, 24, 696), y: clamp(point.y, 28, 481) };
    if (distance(result[result.length - 1], next) >= .1) result.push(next);
    if (result.length >= 100) break;
  }
  return result;
}

export function emptyRoutes(personnel: Personnel, formation?: FormationId): Routes {
  return Object.fromEntries(receiversFor(personnel, formation).map(r => [r.id, [r.start]])) as Routes;
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
  { name: 'Cover 3 Sky · left overload', coverage: 3, press: false, rushSide: 'left', blitz: 1, hint: 'The strong safety rotates to the flat. Make an underneath defender choose between two routes.' },
  { name: 'Cover 2 squat corners', coverage: 2, press: false, rushSide: 'balanced', blitz: 0, hint: 'The corners own the flats. Stretch a sideline at two different depths.' },
  { name: 'Cover 0 · double A-gap', coverage: 0, press: true, rushSide: 'balanced', blitz: 2, hint: 'No safety help. The ball has to leave fast; keep someone in to handle the rush.' },
  { name: 'Cover 6 · half / quarters', coverage: 6, press: false, rushSide: 'balanced', blitz: 0, hint: 'The left safety owns a half; the right pair play quarters. Attack the two sides differently.' },
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
  return { ...choice, front: ['Even', 'Over', 'Under', 'Wide 9'][(state >>> 8) % 4], level: safeLevel, targetScore: Math.min(64, 48 + (safeLevel - 1) * 3) };
}

export function advanceRun(run: Run, result: Pick<Simulation, 'won' | 'score'>): Run {
  if (run.status === 'over') return run;
  if (result.won) return { ...run, level: run.level + 1, total: run.total + result.score };
  const lives = Math.max(0, run.lives - 1);
  return { ...run, lives, status: lives === 0 ? 'over' : 'playing' };
}
