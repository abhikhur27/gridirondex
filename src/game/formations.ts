import type { FormationId, FormationOption, Personnel, Point, Receiver, ReceiverId } from './model.ts'

// Player centers are behind the drawn LOS; the five linemen use this same baseline.
export const ON_LINE_Y = 379
const OFF_LINE_Y = 413
const IDS: ReceiverId[] = ['X', 'Z', 'Y', 'RB', 'H']
type Alignment = Record<ReceiverId, readonly [number, number]>
const p = (x: number, y = ON_LINE_Y): readonly [number, number] => [x, y]

const spread10: Alignment = { X:p(75), Z:p(645), Y:p(490,OFF_LINE_Y), RB:p(306,448), H:p(182,OFF_LINE_Y) }
const spread11: Alignment = { X:p(75), Z:p(645,OFF_LINE_Y), Y:p(490), RB:p(306,448), H:p(182,OFF_LINE_Y) }
const inline12: Alignment = { X:p(75,OFF_LINE_Y), Z:p(645,OFF_LINE_Y), Y:p(446), RB:p(306,448), H:p(254) }
const stack: Alignment = { X:p(140), Z:p(580), Y:p(580,417), RB:p(306,448), H:p(140,417) }
const bunchRight: Alignment = { X:p(75), Z:p(587,415), Y:p(550), RB:p(306,448), H:p(513,415) }
const mirror = (alignment: Alignment): Alignment => Object.fromEntries(IDS.map(id => [id, p(720 - alignment[id][0], alignment[id][1])])) as Alignment
const pistol = (alignment: Alignment): Alignment => ({ ...alignment, RB:p(350,480) })

// A bunch has one receiver on the line at its point and two clearly off it.
// Only two eligible ends are on the line, so a flexed TE is never covered up.
const ALIGNMENTS: Record<Personnel, Partial<Record<FormationId, Alignment>>> = {
  '10': {
    spread:spread10,
    stack,
    pistol:pistol(spread10),
    'bunch-left':mirror(bunchRight),
    'bunch-right':bunchRight,
  },
  '11': {
    spread:spread11,
    stack,
    pistol:pistol(spread11),
    'bunch-left':mirror(bunchRight),
    'bunch-right':bunchRight,
    inline:{ ...spread11, Y:p(446) },
    'wing-left':{ X:p(75), Z:p(645), Y:p(252,OFF_LINE_Y), RB:p(394,448), H:p(180,OFF_LINE_Y) },
    'wing-right':{ X:p(75), Z:p(645), Y:p(448,OFF_LINE_Y), RB:p(306,448), H:p(540,OFF_LINE_Y) },
  },
  '12': {
    inline:inline12,
    'wing-left':{ X:p(75), Z:p(645,OFF_LINE_Y), Y:p(446), RB:p(394,448), H:p(252,OFF_LINE_Y) },
    'wing-right':{ X:p(75,OFF_LINE_Y), Z:p(645), Y:p(448,OFF_LINE_Y), RB:p(306,448), H:p(254) },
    pistol:pistol(inline12),
    spread:{ ...spread10, H:p(215,OFF_LINE_Y) },
    stack,
  },
  empty: {
    spread:{ X:p(70), Z:p(650), Y:p(445,OFF_LINE_Y), RB:p(540,OFF_LINE_Y), H:p(182,OFF_LINE_Y) },
    stack:{ ...stack, RB:p(470,OFF_LINE_Y) },
    'bunch-right':{ ...bunchRight, RB:p(190,OFF_LINE_Y) },
    'bunch-left':{ ...mirror(bunchRight), RB:p(530,OFF_LINE_Y) },
  },
}

const LABELS: Record<FormationId, string> = {
  spread:'Spread', stack:'Stack', pistol:'Pistol', 'bunch-left':'Bunch left', 'bunch-right':'Bunch right', inline:'Inline', 'wing-left':'Wing left', 'wing-right':'Wing right',
}

function description(personnel: Personnel, formation: FormationId): string {
  if (formation.startsWith('bunch')) return personnel === 'empty' ? 'Three receivers in the bunch; two on the other side.' : 'Three in the bunch; one receiver isolated opposite.'
  if (formation === 'pistol') return 'The back aligns directly behind a shallower quarterback.'
  if (formation === 'stack') return 'A receiver starts behind each wide on-line end.'
  if (formation.startsWith('wing')) return personnel === '12' ? 'One tight end stays inline; the other aligns off the tackle.' : 'The tight end aligns off the tackle, free to release or block.'
  if (formation === 'inline') return personnel === '12' ? 'Both tight ends extend the line; both wide receivers are off it.' : 'The tight end extends the line on the right.'
  return personnel === 'empty' ? 'Five receivers spread across a three-by-two set.' : personnel === '12' ? 'Both tight ends split away from the tackles.' : 'Space the receivers across the field with one back beside the quarterback.'
}

export function formationsFor(personnel: Personnel): FormationOption[] {
  return (Object.keys(ALIGNMENTS[personnel]) as FormationId[]).map(id => ({ id, label:LABELS[id], description:description(personnel,id) }))
}

export function defaultFormation(personnel: Personnel): FormationId {
  return personnel === '12' ? 'inline' : 'spread'
}

function resolve(personnel: Personnel, formation?: FormationId) {
  const id = formation && ALIGNMENTS[personnel][formation] ? formation : defaultFormation(personnel)
  return { id, alignment:ALIGNMENTS[personnel][id]! }
}

export function receiversFor(personnel: Personnel, formation?: FormationId): Receiver[] {
  const { alignment } = resolve(personnel, formation)
  return IDS.map(id => {
    const [x,y] = alignment[id]
    const role = personnel !== 'empty' && id === 'RB' ? 'running back'
      : (personnel === '11' || personnel === '12') && id === 'Y' || personnel === '12' && id === 'H' ? 'tight end'
      : id === 'X' || id === 'Z' ? 'wide receiver' : 'slot receiver'
    return { id, start:{ x,y }, role, onLine:y === ON_LINE_Y }
  })
}

export function qbStartFor(personnel: Personnel, formation?: FormationId): Point {
  return { x:350, y:resolve(personnel, formation).id === 'pistol' ? 434 : 459 }
}
