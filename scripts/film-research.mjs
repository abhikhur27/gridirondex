import { writeFile, mkdir } from 'node:fs/promises'

function extract(text, marker) {
 const start=text.indexOf(marker)
 if(start<0)return null
 const begin=text.indexOf('{',start+marker.length)
 let depth=0, quoted=false, escaped=false
 for(let i=begin;i<text.length;i++) {
   const ch=text[i]
   if(escaped){escaped=false;continue}
   if(ch==='\\'&&quoted){escaped=true;continue}
   if(ch==='"'){quoted=!quoted;continue}
   if(!quoted){if(ch==='{')depth++;if(ch==='}')depth--;if(depth===0)return JSON.parse(text.slice(begin,i+1))}
 }
 return null
}
function videos(data,result=[]) {
 if(!data||typeof data!=='object')return result
 if(data.videoRenderer) {const v=data.videoRenderer;result.push({id:v.videoId,title:v.title?.runs?.map(r=>r.text).join(''),channel:v.ownerText?.runs?.map(r=>r.text).join(''),length:v.lengthText?.simpleText})}
 for(const v of Object.values(data))if(v&&typeof v==='object')videos(v,result)
 return result
}
async function search(q) {
 const text=await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,{signal:AbortSignal.timeout(20000)}).then(r=>r.text())
 return videos(extract(text,'var ytInitialData =')).slice(0,5)
}
async function video(id) {
 const text=await fetch(`https://www.youtube.com/watch?v=${id}`,{signal:AbortSignal.timeout(20000)}).then(r=>r.text())
 const p=extract(text,'var ytInitialPlayerResponse =')
 if(!p)return {id,error:'No player metadata'}
 const en=p.captions?.playerCaptionsTracklistRenderer?.captionTracks?.find(c=>c.languageCode==='en')
 let transcript
 if(en) {const res=await fetch(en.baseUrl+'&fmt=json3',{signal:AbortSignal.timeout(20000)});const t=await res.text();try{const data=JSON.parse(t);transcript=data.events?.filter(e=>e.segs).map(e=>({start:e.tStartMs/1000,text:e.segs.map(s=>s.utf8).join('')}))}catch{transcript=t.slice(0,100)}}
 return {id,title:p.videoDetails?.title,channel:p.videoDetails?.author,length:p.videoDetails?.lengthSeconds,description:p.videoDetails?.shortDescription,embeddable:p.playabilityStatus?.playableInEmbed,status:p.playabilityStatus?.status,transcript}
}
const [mode,...args]=process.argv.slice(2)
await mkdir('output/research',{recursive:true})
const results=await Promise.all(args.map(async q=>{try{const r=mode==='video'?await video(q):await search(q);await writeFile(`output/research/${q.replace(/[^a-z0-9]/gi,'-').slice(0,100)}.json`,JSON.stringify(r,null,2));return {query:q,result:mode==='video'?{...r,transcript:Array.isArray(r.transcript)?r.transcript.slice(0,10):r.transcript}:r}}catch(e){return {query:q,error:e.message}}}))
console.log(JSON.stringify(results,null,2))
