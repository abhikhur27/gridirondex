import type { Outcome, Simulation } from './model.ts'

export type Down = 1 | 2 | 3 | 4
export type DriveStatus = 'active' | 'touchdown' | 'turnover' | 'safety'
export interface DrivePlay {
  play: number
  down: Down
  start: number
  end: number
  lineToGain: number
  gain: number
  outcome: Outcome
  timeToThrow: number
}
export interface Drive {
  seed: number
  fieldPosition: number
  down: Down
  lineToGain: number
  plays: number
  status: DriveStatus
  history: DrivePlay[]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/** Field position counts yards from the offense's own goal line. */
export function newDrive(seed = Math.floor(Math.random() * 0x100000000)): Drive {
  return { seed: seed >>> 0, fieldPosition: 25, down: 1, lineToGain: 35, plays: 0, status: 'active', history: [] }
}

/** A new seeded look each snap; a replay of the same snap keeps the same opponent. */
export function driveLookSeed(drive: Pick<Drive, 'seed' | 'plays'>): number {
  let value = (drive.seed + Math.imul(drive.plays + 1, 0x9e3779b9)) >>> 0
  value = Math.imul(value ^ value >>> 16, 0x21f0aaad)
  value = Math.imul(value ^ value >>> 15, 0x735a2d97)
  return (value ^ value >>> 15) >>> 0
}

/** Advance the chains from actual yards. The Tactical Draft score never decides a first down. */
export function advanceDrive(drive: Drive, result: Pick<Simulation, 'gain' | 'outcome' | 'throwTime'>): Drive {
  if (drive.status !== 'active') return drive
  const reported = Number.isFinite(result.gain) ? result.gain : 0
  const gain = result.outcome === 'incomplete' ? 0 : result.outcome === 'sack' ? Math.min(0, reported) : reported
  const end = clamp(drive.fieldPosition + gain, 0, 100)
  const record: DrivePlay = {
    play: drive.plays + 1,
    down: drive.down,
    start: drive.fieldPosition,
    end,
    lineToGain: drive.lineToGain,
    gain: end - drive.fieldPosition,
    outcome: result.outcome,
    timeToThrow: Number.isFinite(result.throwTime) ? Math.max(0, result.throwTime) : 0,
  }
  const next: Drive = { ...drive, fieldPosition: end, plays: drive.plays + 1, history: [...drive.history, record] }
  if (end >= 100) return { ...next, status: 'touchdown' }
  if (end <= 0) return { ...next, status: 'safety' }
  if (end >= drive.lineToGain) return { ...next, down: 1, lineToGain: Math.min(100, end + 10) }
  if (drive.down === 4) return { ...next, status: 'turnover' }
  return { ...next, down: (drive.down + 1) as Down }
}

export function fieldPositionLabel(fieldPosition: number): string {
  const position = clamp(Number.isFinite(fieldPosition) ? fieldPosition : 25, 0, 100)
  const label = (yards: number) => Number(yards.toFixed(1)).toString()
  return position === 50 ? 'Midfield' : position < 50 ? `Own ${label(position)}` : `Opp ${label(100 - position)}`
}
