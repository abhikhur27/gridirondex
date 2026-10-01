import type { Concept, Side } from './types'

export const sections = [
  { key: 'routes', name: 'ROUTES', category: 'Route tree', side: 'offense' },
  { key: 'concepts', name: 'CONCEPTS', category: 'Passing concepts', side: 'offense' },
  { key: 'formations', name: 'FORMATIONS', category: 'Offensive formations', side: 'offense' },
  { key: 'blocking', name: 'BLOCKING', category: 'Run game & blocking', side: 'offense' },
  { key: 'gaps', name: 'GAPS', category: 'Gaps & run fits', side: 'offense' },
  { key: 'personnel', name: 'PERSONNEL', category: 'Personnel groups', side: 'offense' },
  { key: 'positions', name: 'POSITIONS', category: 'Offensive positions', side: 'offense' },
  { key: 'reads', name: 'READS', category: 'Quarterback reads', side: 'offense' },
  { key: 'situations', name: 'SITUATIONS', category: 'Situational adjustments', side: 'offense' },
  { key: 'coverages', name: 'COVERAGES', category: 'Coverages & shells', side: 'defense' },
  { key: 'fronts', name: 'FRONTS', category: 'Fronts & packages', side: 'defense' },
  { key: 'stunts', name: 'STUNTS', category: 'Stunts & pressures', side: 'defense' },
  { key: 'fits', name: 'RUN FITS', category: 'Gaps & run fits', side: 'defense' },
  { key: 'positions', name: 'POSITIONS', category: 'Defensive positions', side: 'defense' },
  { key: 'reactions', name: 'REACTIONS', category: 'Defensive reactions', side: 'defense' },
  { key: 'teams', name: 'SPECIAL TEAMS', category: 'Special teams', side: 'special' },
] as const

export type Page = { side: Side | null; section: string | null; game?: boolean; concept?: string; position?: string }
export const homePage: Page = { side: null, section: null }
export function conceptPage(concept: Concept): Page {
  const section = sections.find(s => s.side === concept.side && s.category === concept.category)
  return { side: concept.side, section: section?.key ?? null, concept: concept.id }
}
export function pageHash(page: Page) {
  if (page.position) return `#positions/${page.position}`
  if (page.game) return '#draft'
  return page.side ? `#${page.side}${page.section ? `/${page.section}` : ''}${page.concept ? `/${page.concept}` : ''}` : ''
}
export function readPage(): Page {
  const directPosition = location.pathname.match(/^\/positions\/([^/]+)\/?$/)?.[1]
  if (!location.hash && directPosition) return { ...homePage, position: decodeURIComponent(directPosition) }
  const [side, section, concept] = location.hash.slice(1).split('/')
  if (side === 'positions' && section) return { ...homePage, position: decodeURIComponent(section) }
  if (side === 'draft') return { ...homePage, game: true }
  if (side !== 'offense' && side !== 'defense' && side !== 'special') return homePage
  const found = sections.find(s => s.side === side && s.key === section)
  return { side, section: found?.key ?? (side === 'special' ? 'teams' : null), concept: found ? concept : undefined }
}
