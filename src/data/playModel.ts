import type { BlueprintNode, BlueprintArea } from './blueprints.ts'
import type { Point } from './vectorGeometry.ts'

export const PLAY_DURATION = 4.2
export interface PlayFrame { at: number; pos: Point }
export interface PlayTrack { player: string; frames: PlayFrame[]; dashed?: boolean; presnap?: boolean }
export interface PlayContact { a: string; b: string; start: number; end: number; point: Point; finish?: Point; label: string }
export interface PlayArea extends BlueprintArea { start: number; end: number; tone?: 'lane' | 'danger'; label: string }
export interface PlayRead { from: string; to: string; start: number; end: number; label: string }
export interface PlayBeat { at: number; text: string }
export interface PlayBall { from: string; to: string; release: number; arrival: number; kind: 'pass' | 'handoff' | 'kick'; target?: Point }
export interface PlayScene {
  id: string; offensiveNodes: BlueprintNode[]; defensiveNodes: BlueprintNode[];
  tracks: PlayTrack[]; contacts: PlayContact[]; areas: PlayArea[]; reads: PlayRead[];
  beats: PlayBeat[]; ball?: PlayBall; duration: number;
}
