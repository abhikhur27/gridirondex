export type Side = 'offense' | 'defense' | 'special'
export type Coverage = 'Cover 0' | 'Cover 1' | 'Cover 2' | 'Cover 3' | 'Cover 4' | 'Cover 6'
export type Diagram = 'mesh' | 'smash' | 'flood' | 'verticals' | 'drive' | 'dagger' | 'cross' | 'scissors' | 'boot' | 'route' | 'run' | 'protection' | 'personnel' | 'coverage' | 'front' | 'read' | 'formation' | 'stunt' | 'gap' | 'special'
export interface Source { title: string; publisher: string; url: string }
export interface Film { id: string; title: string; channel: string; start: number; end?: number; note?: string; companion?: Film }
export interface Concept {
  id: string; name: string; side: Side; category: string; subtitle: string; summary: string
  diagram: Diagram; difficulty: 'Fundamentals' | 'Intermediate' | 'Advanced'; tags: string[]
  read: string[]; watch: string; counter: string; sources: Source[]; film?: Film
  route?: string; coverage?: Coverage; personnel?: string; related?: string[]
}
