import type { Point, Receiver, RouteName, RunScheme } from './model.ts'

export const ROUTE_NAMES: RouteName[] = ['Slant', 'Out', 'Curl', 'Post', 'Flat', 'Wheel', 'Go', 'Drag', 'Comeback', 'Block']
export const ROUTE_PIXELS_PER_YARD = 12
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const bounded = (p: Point): Point => ({ x:clamp(p.x,24,696), y:clamp(p.y,28,481) })
const finite = (p: Point | undefined): p is Point => !!p && Number.isFinite(p.x) && Number.isFinite(p.y)
const dist = (a: Point,b: Point) => Math.hypot(a.x-b.x,a.y-b.y)
function route(points: Point[], start: Point): Point[] {
  return [{ ...start }, ...points.filter(finite).map(bounded).filter((p,i,all) => dist(p,i ? all[i-1] : start) >= .1)]
}

export function routePreset(receiver: Receiver, name: RouteName): Point[] {
  const p = receiver.start, inward = p.x < 350 ? 1 : -1
  const out = (width: number) => p.x - inward * width
  const shape: Record<RouteName, Point[]> = {
    Slant:[{x:p.x,y:p.y-42},{x:p.x+inward*140,y:p.y-163}],
    Out:[{x:p.x,y:p.y-120},{x:out(104),y:p.y-120}],
    Curl:[{x:p.x,y:p.y-144},{x:p.x+inward*22,y:p.y-108}],
    Post:[{x:p.x,y:p.y-132},{x:p.x+inward*138,y:p.y-283}],
    Flat:[{x:out(45),y:p.y-20},{x:out(120),y:p.y-32}],
    Wheel:[{x:out(75),y:p.y-30},{x:out(114),y:p.y-65},{x:out(114),y:62}],
    Go:[{x:p.x,y:44}],
    Drag:[{x:p.x,y:p.y-57},{x:p.x+inward*238,y:p.y-72}],
    Comeback:[{x:p.x,y:p.y-192},{x:out(44),y:p.y-144}],
    Block:[],
  }
  return route(shape[name],p)
}

/** Maximum upfield travel from the player's frozen origin, in field-grid yards. */
export function routeDepth(points: Point[]): number {
  if (!finite(points[0])) return 0
  return Math.max(0, ...points.filter(finite).map(p => points[0].y-p.y)) / ROUTE_PIXELS_PER_YARD
}

/** Scale vertical geometry together, preserving cut direction and return stems. */
export function adjustRouteDepth(points: Point[], depthYards: number, start = points[0]): Point[] {
  if (!finite(start)) return []
  if (points.length < 2 || !Number.isFinite(depthYards)) return points.map(p => ({...p}))
  const depth = clamp(depthYards,1,(start.y-28)/ROUTE_PIXELS_PER_YARD)*ROUTE_PIXELS_PER_YARD
  const oldDepth = Math.max(0,...points.filter(finite).map(p=>start.y-p.y))
  return [{...start}, ...points.slice(1).map((point,index) => {
    if (!finite(point)) return {...start}
    // A drawn horizontal line has no depth yet; introduce a gradual upfield stem.
    const offset = oldDepth > .01 ? (start.y-point.y)*depth/oldDepth : depth*(index+1)/(points.length-1)
    return bounded({x:point.x,y:start.y-offset})
  })]
}

/** Indices remain stable while a handle is dragged; the first point never moves. */
export function editRouteHandle(points: Point[], index: number, target: Point, start = points[0]): Point[] {
  if (!finite(start)) return []
  const result = points.map(p=>({...p}))
  if (!result.length) return [{...start}]
  result[0] = {...start}
  if (Number.isInteger(index) && index > 0 && index < result.length && finite(target)) result[index] = bounded(target)
  return result
}

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy
  const t=length ? clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/length,0,1) : 0
  return dist(point,{x:a.x+dx*t,y:a.y+dy*t})
}

/** Keep the endpoint and significant bends of freehand paths, not every sample. */
export function routeHandles(points: Point[], maxHandles = 8): { index: number; point: Point }[] {
  if (points.length < 2) return []
  const limit=clamp(Math.floor(Number.isFinite(maxHandles) ? maxHandles : 8),1,20)
  const selected=[0,points.length-1]
  while (selected.length-1 < limit) {
    let best=-1,error=1
    for (let segment=1;segment<selected.length;segment++) {
      const first=selected[segment-1],last=selected[segment]
      for (let index=first+1;index<last;index++) {
        const candidate=distanceToSegment(points[index],points[first],points[last])
        if (candidate>error) {best=index;error=candidate}
      }
    }
    if (best<0) break
    selected.push(best);selected.sort((a,b)=>a-b)
  }
  return selected.slice(1).map(index=>({index,point:{...points[index]}}))
}

export function qbPreset(start: Point, direction: 'left' | 'right' | 'stay'): Point[] {
  if (direction==='stay') return [{...start}]
  const side=direction==='left' ? -1 : 1
  return route([{x:start.x+side*65,y:start.y+5},{x:start.x+side*145,y:start.y-30}],start)
}

export function runRoutePreset(start: Point, scheme: RunScheme, side: 'left' | 'right'): Point[] {
  const sign=side==='left' ? -1 : 1
  const mesh={x:350,y:434}
  const gap=(offset: number,y: number): Point=>({x:350+sign*offset,y})
  const shape: Record<RunScheme,Point[]>={
    'Zone Read':[mesh,gap(34,380),gap(52,320),gap(65,250)],
    Power:[mesh,gap(75,392),gap(96,340),gap(102,245)],
    Draw:[{x:350,y:448},gap(0,408),gap(30,348),gap(40,250)],
    Counter:[gap(-48,443),gap(-54,418),gap(36,389),gap(88,335),gap(105,245)],
  }
  return route(shape[scheme],start)
}
