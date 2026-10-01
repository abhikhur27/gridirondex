export type Point = [number, number]

const distance = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1])
const mix = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const clean = (points: Point[]) => points.filter((p, i) => !i || distance(points[i - 1], p) > .01)

/** The shaft stops at the triangle's base; a butt cap cannot bleed past its tip. */
export function arrowGeometry(input: Point[], size = 18) {
  const points = clean(input)
  if (points.length < 2) return { shaft: '', cap: '', tip: points[0] ?? [0, 0] as Point, base: points[0] ?? [0, 0] as Point }
  const tip = points.at(-1)!, previous = points.at(-2)!
  const lastLength = distance(previous, tip), length = Math.min(size, lastLength * .6)
  const ux = (tip[0] - previous[0]) / lastLength, uy = (tip[1] - previous[1]) / lastLength
  const base: Point = [tip[0] - ux * length, tip[1] - uy * length]
  const wing = length * .52
  const cap = `${tip[0]},${tip[1]} ${base[0] - uy * wing},${base[1] + ux * wing} ${base[0] + uy * wing},${base[1] - ux * wing}`
  return { shaft: roundedPath([...points.slice(0, -1), base]), cap, tip, base }
}

export function roundedPath(input: Point[], radius = 16): string {
  const points = clean(input)
  if (!points.length) return ''
  let result = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const before = points[i - 1], corner = points[i], after = points[i + 1]
    const a = distance(before, corner), b = distance(corner, after), r = Math.min(radius, a / 3, b / 3)
    const entry = mix(corner, before, r / a), exit = mix(corner, after, r / b)
    result += ` L ${entry[0]} ${entry[1]} Q ${corner[0]} ${corner[1]} ${exit[0]} ${exit[1]}`
  }
  const end = points.at(-1)!
  return result + ` L ${end[0]} ${end[1]}`
}

/** Sample the same rounded corners used in the SVG so scrubbed nodes stay on their route. */
export function sampleRoute(input: Point[], radius = 16): Point[] {
  const points = clean(input)
  if (points.length < 2) return points
  const sampled: Point[] = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    const before = points[i - 1], corner = points[i], after = points[i + 1]
    const a = distance(before, corner), b = distance(corner, after), r = Math.min(radius, a / 3, b / 3)
    const entry = mix(corner, before, r / a), exit = mix(corner, after, r / b)
    sampled.push(entry)
    for (let step = 1; step <= 8; step++) {
      const t = step / 8, u = 1 - t
      sampled.push([u * u * entry[0] + 2 * u * t * corner[0] + t * t * exit[0], u * u * entry[1] + 2 * u * t * corner[1] + t * t * exit[1]])
    }
  }
  sampled.push(points.at(-1)!)
  return sampled
}

export function positionAlong(points: Point[], progress: number): Point {
  const sampled = sampleRoute(points)
  if (sampled.length < 2) return sampled[0] ?? [0, 0]
  const lengths = sampled.slice(1).map((p, i) => distance(sampled[i], p))
  let remaining = lengths.reduce((sum, length) => sum + length, 0) * Math.min(1, Math.max(0, progress))
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) return mix(sampled[i], sampled[i + 1], lengths[i] ? remaining / lengths[i] : 0)
    remaining -= lengths[i]
  }
  return sampled.at(-1)!
}
