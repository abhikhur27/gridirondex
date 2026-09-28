import type { Concept, Coverage } from './types'

export interface Player { id: string; label: string; x: number; y: number; team: 'offense' | 'defense'; assignment: string; line?: boolean }
export interface Route { player: string; d: string; color: 'cyan' | 'amber' | 'red'; label?: string; block?: boolean }
export interface Zone { x: number; y: number; width: number; height: number; label: string }

export function path(points: number[][]): string {
  if(points.length<2) return ''
  let d=`M ${points[0][0]} ${points[0][1]}`
  for(let i=1;i<points.length-1;i++) {
    const prev=points[i-1], p=points[i], next=points[i+1]
    const a=Math.hypot(p[0]-prev[0],p[1]-prev[1]), b=Math.hypot(next[0]-p[0],next[1]-p[1]), r=Math.min(14,a/3,b/3)
    d+=` L ${p[0]-(p[0]-prev[0])/a*r} ${p[1]-(p[1]-prev[1])/a*r} Q ${p[0]} ${p[1]} ${p[0]+(next[0]-p[0])/b*r} ${p[1]+(next[1]-p[1])/b*r}`
  }
  return d+` L ${points.at(-1)![0]} ${points.at(-1)![1]}`
}
const r=(player:string, points:number[][], color:Route['color']='cyan',label?:string):Route=>({player,d:path(points),color,label})
const O: Player[] = [
 {id:'X',label:'X',x:112,y:385,team:'offense',assignment:'Split end · outside receiver'},
 {id:'H',label:'H',x:285,y:410,team:'offense',assignment:'Slot · inside receiver'},
 {id:'Y',label:'Y',x:585,y:385,team:'offense',assignment:'Tight end · inside receiver'},
 {id:'Z',label:'Z',x:788,y:410,team:'offense',assignment:'Flanker · outside receiver'},
 ...['LT','LG','C','RG','RT'].map((id,i)=>({id,label:id,x:378+i*36,y:385,team:'offense' as const,line:true,assignment:i===2?'Center · snap and protect the interior':'Offensive line · protect the pocket'})),
 {id:'QB',label:'QB',x:450,y:455,team:'offense',assignment:'Quarterback · work the read progression'},
 {id:'RB',label:'RB',x:345,y:467,team:'offense',assignment:'Running back · outlet or protection'},
]

export function offense(concept:Concept): Player[] {
 const players=O.map(p=>({...p}))
 const set=(id:string,x:number,y:number,label?:string)=> {const p=players.find(a=>a.id===id)!;p.x=x;p.y=y;if(label){p.label=label;p.assignment=label==='FB'?'Fullback · lead blocker':label==='Y2'?'Second tight end · edge of the run surface':'Wide receiver · spread the field'}}
 const personnel=concept.personnel
 if(personnel==='12'){set('H',555,405,'Y2')}
 if(personnel==='21'){set('H',450,506,'FB')}
 if(personnel==='22'){set('H',450,506,'FB');set('Z',555,405,'Y2')}
 if(personnel==='10'){set('Y',625,385,'S')}
 if(personnel==='00'){set('RB',680,410,'W');set('Y',585,385,'S')}
 if(cName(concept)==='fullback'){set('H',450,506,'FB')}
 if(concept.diagram==='run'){set('Y',560,385);set('H',680,410);set('QB',450,432);set('RB',450,497)}
 return players
}
const cName=(concept:Concept)=>concept.route??concept.id

export function routeTree(kind:string,x=112,y=385):Route[] {
 const inward=1
 const trees:Record<string,number[][]>={
  flat:[[x,y],[x+18,y-26],[55,y-30]], slant:[[x,y],[x,y-55],[x+165*inward,y-195]],
  comeback:[[x,y],[x,y-235],[x-47,y-185]], curl:[[x,y],[x,y-155],[x+24,y-125]],
  out:[[x,y],[x,y-170],[48,y-170]], dig:[[x,y],[x,y-195],[x+220,y-195]],
  corner:[[x,y],[x+45,y-150],[50,y-285]], post:[[x,y],[x,y-140],[x+210,y-295]],
  go:[[x,y],[x,y-310]], option:[[285,410],[285,280],[390,280]],
  wheel:[[345,467],[235,440],[170,390],[170,110]],angle:[[345,467],[265,420],[270,385],[395,300]],
 }
 return [r(['wheel','angle'].includes(kind)?'RB':kind==='option'?'H':'X',trees[kind]??trees.go,'amber',kind==='option'?'READ LEVERAGE':undefined)]
}

export function routesFor(c:Concept):Route[] {
 if(c.diagram==='route')return routeTree(c.route??'go')
 const diagrams:Record<string,Route[]>={
  mesh:[r('X',[[112,385],[112,202],[52,142]],'cyan','CORNER'),r('H',[[285,410],[285,328],[600,328],[738,328]],'amber','SHALLOW CROSS'),r('Y',[[585,385],[585,301],[205,301],[155,301]],'cyan','SHALLOW CROSS'),r('Z',[[788,410],[788,234],[744,216],[630,216]],'cyan','SIT'),r('RB',[[345,467],[260,467],[150,457],[76,421]],'cyan','SWING')],
  smash:[r('X',[[112,385],[112,300],[137,318]],'cyan','HITCH'),r('H',[[285,410],[285,228],[100,95]],'amber','CORNER'),r('Y',[[585,385],[585,230],[785,93]],'cyan','CORNER'),r('Z',[[788,410],[788,300],[765,318]],'cyan','HITCH'),r('RB',[[345,467],[345,407],[240,407]],'cyan','OUTLET')],
  flood:[r('X',[[112,385],[112,85]],'cyan'),r('H',[[285,410],[285,236],[718,236]],'amber','SAIL'),r('Y',[[585,385],[585,331],[808,331]],'cyan','FLAT'),r('Z',[[788,410],[788,85]],'cyan','CLEAR-OUT'),r('RB',[[345,467],[345,432],[220,432]],'cyan')],
  verticals:[r('X',[[112,385],[112,65]],'cyan','GO'),r('H',[[285,410],[285,190],[340,65]],'amber','SEAM'),r('Y',[[585,385],[585,190],[565,65]],'cyan','SEAM'),r('Z',[[788,410],[788,65]],'cyan','GO'),r('RB',[[345,467],[345,370],[420,345]],'cyan','CHECKDOWN')],
  drive:[r('X',[[112,385],[112,205],[530,205]],'amber','DIG'),r('H',[[285,410],[285,324],[750,324]],'cyan','SHALLOW'),r('Y',[[585,385],[585,70]],'cyan'),r('Z',[[788,410],[788,80]],'cyan'),r('RB',[[345,467],[240,432],[130,408]],'cyan')],
  dagger:[r('X',[[112,385],[112,210],[490,210]],'amber','DIG'),r('H',[[285,410],[285,170],[400,60]],'cyan','CLEAR-OUT'),r('Y',[[585,385],[585,320],[210,320]],'cyan','SHALLOW'),r('Z',[[788,410],[788,68]],'cyan'),r('RB',[[345,467],[240,432],[130,408]],'cyan')],
  cross:[r('X',[[112,385],[112,60]],'cyan','CLEAR-OUT'),r('H',[[285,410],[285,330],[115,330]],'cyan','FLAT'),r('Y',[[585,385],[585,230],[235,160],[112,160]],'amber','Y-CROSS'),r('Z',[[788,410],[788,220],[690,205]],'cyan'),r('RB',[[345,467],[345,371],[440,371]],'cyan')],
  scissors:[r('X',[[112,385],[112,245],[430,75]],'cyan','POST'),r('H',[[285,410],[285,220],[85,70]],'amber','CORNER'),r('Y',[[585,385],[585,300],[750,300]],'cyan'),r('Z',[[788,410],[788,250],[660,250]],'cyan')],
  boot:[r('X',[[112,385],[112,260],[708,180]],'amber','CROSS'),r('H',[[285,410],[285,245],[750,245]],'cyan'),r('Y',[[585,385],[630,345],[820,345]],'cyan','FLAT'),r('Z',[[788,410],[788,70]],'cyan'),r('QB',[[450,455],[490,475],[650,455]],'amber','ROLLOUT'),r('RB',[[345,467],[440,475],[300,420]],'cyan')],
 }
 if(diagrams[c.diagram]) return diagrams[c.diagram]
 if(c.diagram==='read')return diagrams[c.id==='zero-beater'?'mesh':c.side==='defense'?'verticals':'flood']
 if(c.diagram==='coverage')return diagrams.verticals
 if(c.diagram==='protection')return [...O.filter(p=>p.line).map(p=>({...r(p.id,[[p.x,p.y],[p.x+(c.route==='slide'?-32:0),345]]),block:true})),r('RB',[[345,467],[340,403],[335,350]],'amber','SCAN')]
 if(c.diagram==='run') {
  const k=c.route, outside=k==='outside-zone', gap=['power','counter','trap'].includes(k??'')
  const blocks=offense(c).filter(p=>p.line).map(p=>({...r(p.id,[[p.x,p.y],[p.x+(outside?60:gap?-25:20),335]]),block:true}))
  if(gap){const puller=blocks.find(p=>p.player==='LG')!;puller.d=path([[414,385],[414,415],[545,415],[565,k==='trap'?355:298]]);puller.color='amber';if(k==='counter')blocks.find(p=>p.player==='LT')!.d=path([[378,385],[378,432],[550,432],[555,270]])}
  return [...blocks,r('RB',outside?[[450,497],[550,455],[635,400],[665,285]]:k==='counter'?[[450,497],[420,467],[510,430],[555,300]]:[[450,497],[480,440],[gap?555:480,305],[gap?585:470,225]],'amber',outside?'PRESS THE EDGE':'RUN LANE')]
 }
 return []
}

export function defense(coverage:Coverage,c:Concept):Player[] {
 const man=coverage==='Cover 0'||coverage==='Cover 1'
 const two=coverage==='Cover 2'||coverage==='Cover 4'||coverage==='Cover 6'
 const d:Player[]=[
 {id:'CB1',label:'CB',x:112,y:man?351:two?305:253,team:'defense',assignment:man?'Cornerback · man on X':coverage==='Cover 2'?'Cornerback · flat zone':'Cornerback · outside deep zone'},
 {id:'CB2',label:'CB',x:788,y:man?362:coverage==='Cover 2'?305:253,team:'defense',assignment:man?'Cornerback · man on Z':coverage==='Cover 2'?'Cornerback · flat zone':'Cornerback · outside deep zone'},
 ...['E1','T1','T2','E2'].map((id,i)=>({id,label:i===0||i===3?'E':'T',x:340+i*72,y:350,team:'defense' as const,assignment:'Defensive line · rush or assigned run gap'})),
 {id:'W',label:'W',x:355,y:290,team:'defense',assignment:man?'WILL · man on RB':'WILL · underneath hook zone'},
 {id:'M',label:'M',x:455,y:267,team:'defense',assignment:'MIKE · middle hook or coverage assignment'},
 {id:'N',label:'N',x:285,y:man?365:280,team:'defense',assignment:man?'Nickel · man on slot':'Nickel · curl / flat defender'},
 {id:'SS',label:'SS',x:two?620:585,y:two?140:man?340:255,team:'defense',assignment:two?'Safety · deep half or quarter':'Safety · rotate down / cover Y'},
 {id:'FS',label:'FS',x:two?330:450,y:coverage==='Cover 0'?305:two?140:100,team:'defense',assignment:coverage==='Cover 0'?'Safety · pressure / no deep help':two?'Safety · deep half or quarter':'Safety · deep middle'},
 ]
 if(c.diagram==='front') {
 const kind=c.route
 if(kind==='3-4'){d.find(p=>p.id==='T1')!.x=450;d.find(p=>p.id==='T2')!.y=300;d.find(p=>p.id==='T2')!.x=555;d.find(p=>p.id==='E1')!.x=365;d.find(p=>p.id==='E2')!.x=535;d.find(p=>p.id==='N')!.x=310;d.find(p=>p.id==='N')!.y=353;d.find(p=>p.id==='SS')!.x=590;d.find(p=>p.id==='SS')!.y=353;d.find(p=>p.id==='T1')!.label='NT';d.find(p=>p.id==='T2')!.label='LB'}
 if(kind==='bear'||kind==='penny'){d.find(p=>p.id==='T1')!.x=414;d.find(p=>p.id==='T2')!.x=486;d.find(p=>p.id==='M')!.x=450;d.find(p=>p.id==='M')!.y=350;d.find(p=>p.id==='M')!.label='NT'}
 if(kind==='dollar'){d.forEach(p=>{if(['W','N','M'].includes(p.id)){p.label='DB';p.y-=50}});d.find(p=>p.id==='T2')!.y=175;d.find(p=>p.id==='T2')!.label='DB'}
 }
 return d
}

export function zones(coverage:Coverage):Zone[] {
 if(coverage==='Cover 0')return []
 if(coverage==='Cover 1')return [{x:245,y:42,width:410,height:178,label:'DEEP MIDDLE'}]
 const halves=coverage==='Cover 2', thirds=coverage==='Cover 3', split=coverage==='Cover 6'
 const count=halves?2:thirds?3:4
 const z=split?[{x:60,y:42,width:195,height:180,label:'QUARTER'},{x:255,y:42,width:195,height:180,label:'QUARTER'},{x:450,y:42,width:390,height:180,label:'DEEP HALF'}]:Array.from({length:count},(_,i)=>({x:60+i*780/count,y:42,width:780/count,height:180,label:halves?'DEEP HALF':thirds?'DEEP THIRD':'DEEP QUARTER'}))
 return [...z,...Array.from({length:halves?5:4},(_,i)=>({x:60+i*780/(halves?5:4),y:235,width:780/(halves?5:4),height:105,label:i===0||i===(halves?4:3)?'FLAT':'HOOK'}))]
}

export function defensiveRoutes(coverage:Coverage,c:Concept):Route[] {
 const players=defense(coverage,c),offensiveRoutes=routesFor(c)
 const man=coverage==='Cover 0'||coverage==='Cover 1'
 const assignments:Record<string,string>={CB1:'X',CB2:'Z',N:'H',SS:'Y',W:'RB'}
 return players.map(p=> {
   const target=man&&assignments[p.id]?offensiveRoutes.find(r=>r.player===assignments[p.id]):undefined
   if(target)return {player:p.id,color:'red' as const,d:target.d.replace(/^M [\d.]+ [\d.]+/,`M ${p.x} ${p.y}`)}
   if(['E1','T1','T2','E2'].includes(p.id))return r(p.id,[[p.x,p.y],[p.x+(p.x<450?15:-15),p.y+55]],'red')
   if(c.diagram==='front')return r(p.id,[[p.x,p.y],[p.x,p.y+30]],'red')
   if(p.id==='FS')return r(p.id,[[p.x,p.y],[p.x,coverage==='Cover 0'?425:p.y-15]],'red')
   if(p.id==='SS')return r(p.id,[[p.x,p.y],[p.x+(coverage==='Cover 3'?85:20),p.y+(coverage==='Cover 3'?25:-15)]],'red')
   if(p.id.startsWith('CB'))return r(p.id,[[p.x,p.y],[p.x,coverage==='Cover 2'?325:coverage==='Cover 6'&&p.id==='CB2'?310:135]],'red')
   return r(p.id,[[p.x,p.y],[p.id==='N'?180:p.x,p.y-10]],'red')
 })
}
