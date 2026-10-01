import type { Source } from './types'
import { offenseFilms } from './filmAuditOffense.ts'
import { defenseFilms } from './filmAuditDefense.ts'

export const sources: Record<string, Source> = {
  formations: { title: 'Offensive formations and eligible receivers', publisher: 'NFL Football Operations', url: 'https://operations.nfl.com/rules-officiating/nfl-football-basics/formations' },
  pistol: { title: 'The Pistol Formation Study', publisher: 'X&O Labs · Tom MacPherson and contributing coaches', url: 'https://www.xandolabs.com/wp-content/uploads/2023/12/The-Pistol-Formation-Study-small.pdf' },
  wishbone: { title: 'FirstDown PlayBook: defending the Wishbone', publisher: 'USA Football', url: 'https://assets.usafootball.com/documents/fdpb/FDPB-DEFENSE-PLAYBOOK_final.pdf' },
  flexbone: { title: 'Flexbone and Triple Option Basic Formational Utilization', publisher: 'Flexbone Association', url: 'https://flexboneassociation.wordpress.com/2014/02/05/flexbone-and-triple-option-basic-formational-utilization/' },
  twists: { title: 'Tackle-end, end-tackle and coffeehouse stunts', publisher: 'USA Football · Brandon Thorn', url: 'https://blogs.usafootball.com/blog/6442/how-the-coffeehouse-stunt-can-help-your-defense' },
  crossDog: { title: 'Eagle Eye: picking up a cross-dog blitz', publisher: 'Philadelphia Eagles · Fran Duffy', url: 'https://www.philadelphiaeagles.com/news/eagle-eye-inside-the-td-that-has-fans-excited-for-the-season-19174558' },
  fireZone: { title: 'Manny Diaz’s fire-zone pressures', publisher: 'USA Football · Brady Grayvold', url: 'https://blogs.usafootball.com/blog/6996/learn-how-manny-diaz-s-fire-zone-s-helped-miami-lead-the-country-in-tfl-s' },
  gaps: { title: 'A gap: the gap-lettering system', publisher: 'LINEPLAY · Coach Jay Freeman', url: 'https://lineplayfootball.com/trench-dictionary/a-gap' },
  fits: { title: 'Defensive line techniques for defeating one-on-one blocks', publisher: 'USA Football · Mike Kuchar', url: 'https://blogs.usafootball.com/blog/583/defensive-line-techniques-for-defeating-one-on-one-blocks' },
  kickBlock: { title: 'Special teams scouting: field-goal block and fake responsibilities', publisher: 'Southwest Baptist University · Coach Allen archive', url: 'https://www.coachallen.com/PDFs/MWSU-st.pdf' },
  aGapBlock: { title: 'Calais Campbell’s A-gap field-goal block', publisher: 'Baltimore Ravens', url: 'https://www.baltimoreravens.com/news/calais-campbell-wins-afc-special-teams-player-week' },
  shieldPunt: { title: 'Installing the shield punt', publisher: 'Coach Chris Fore', url: 'https://coachchrisfore.wordpress.com/2012/04/05/shield-punt-maximizing-field-position-minimizing-blocks-and-returns/' },
  proPunt: { title: 'Installing a Pro Style Spread Punt', publisher: 'X&O Labs · Coach Christopher Smithley', url: 'https://www.xandolabs.com/the-lab/special-teams/punt/installing-a-pro-style-spread-punt/' },
  gunners: { title: 'Neutralizing the punt team gunners', publisher: 'Coach Chris Fore', url: 'https://coachfore.org/2015/09/07/neutralizing-the-punt-team-gunners/' },
  puntWall: { title: 'Wall Punt Return', publisher: 'Human Kinetics · American Sport Education Program', url: 'https://coachesinsider.com/football/wall-punt-return-article/' },
  mesh: { title: 'The Mesh Concept', publisher: 'Weekly Spiral', url: 'https://weeklyspiral.com/2021/03/15/mesh-concept/' },
  smash: { title: 'Smash concept coaching clinic', publisher: 'Glazier Clinics', url: 'https://www.glazierclinics.com/football-coach-resources/basic-passing-concepts-smash-concept' },
  pass: { title: 'Passing concepts: coaching guide', publisher: 'NFL FLAG', url: 'https://static.www.nfl.com/image/upload/league/w7jrxyki5ffvoncw3ckg.pdf' },
  verts: { title: 'Four Verticals: scouting glossary', publisher: 'The Scouting Academy', url: 'https://scoutingacademy.com/itp-glossary-four-verticals-concept/' },
  routes: { title: 'Passing routes: coaching guide', publisher: 'NFL FLAG', url: 'https://static.www.nfl.com/image/upload/league/w7jrxyki5ffvoncw3ckg.pdf' },
  zone: { title: 'Coaching the inside zone', publisher: 'USA Football', url: 'https://blogs.usafootball.com/blog/1428/building-an-offensive-line-coaching-the-inside-zone' },
  blocks: { title: 'Blocking and defeating blocks', publisher: 'USA Football', url: 'https://usafootball.com/coaches-organizations/blocking-defeating-blocks' },
  personnel: { title: 'Utilizing personnel packages on offense and defense', publisher: 'USA Football', url: 'https://blogs.usafootball.com/blog/2177/utilizing-personnel-packages-on-offense-and-defense' },
  coverage: { title: 'Football terms and defensive responsibilities', publisher: 'NFL Football Operations', url: 'https://operations.nfl.com/rules-officiating/nfl-football-basics/football-terms' },
  cover3: { title: 'Cover 3: zone and match responsibilities', publisher: 'Weekly Spiral', url: 'https://weeklyspiral.com/2021/07/26/cover-3/' },
  positions: { title: 'Player positions and formations', publisher: 'NFL Football Operations', url: 'https://operations.nfl.com/rules-officiating/nfl-football-basics/formations' },
  qb: { title: 'All-22 study and quarterback education', publisher: "The QB School · JT O’Sullivan", url: 'https://theqbschool.com/free-resources/' },
  fronts: { title: 'Defensive leverage and coaching', publisher: 'All Eyes DB Camp · Coach Chad Wilson', url: 'https://alleyesdbcamp.com/how-to-play-cover-3-cloud-and-sky/' },
}

// A missing exact-topic segment stays absent; never substitute a category video.
export const films = { ...offenseFilms, ...defenseFilms }
