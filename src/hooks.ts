import { useEffect, useRef, useState } from 'react'

export function useLocal<T>(key:string,initial:T) {
 const [value,setValue]=useState<T>(()=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v) as T:initial}catch{return initial}})
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Storage is optional. */}},[key,value])
 return [value,setValue] as const
}

export function usePlayback(id:string) {
 const [progress,setProgress]=useState(0), [playing,setPlaying]=useState(false), [speed,setSpeed]=useState(1)
 const progressRef=useRef(progress)
 useEffect(()=>{progressRef.current=progress},[progress])
 useEffect(()=>{setProgress(0);setPlaying(false)},[id])
 useEffect(()=> {
   if(!playing)return
   let frame=0,previous=0
   const tick=(time:number)=>{if(previous){const next=Math.min(1,progressRef.current+(time-previous)*speed/4500);progressRef.current=next;setProgress(next);if(next>=1){setPlaying(false);return}}previous=time;frame=requestAnimationFrame(tick)}
   frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)
 },[playing,speed])
 const toggle=()=>{if(progressRef.current>=1){progressRef.current=0;setProgress(0)}setPlaying(p=>!p)}
 const reset=()=>{setPlaying(false);progressRef.current=0;setProgress(0)}
 const scrub=(value:number)=>{setPlaying(false);progressRef.current=value;setProgress(value)}
 return {progress,playing,speed,setSpeed,toggle,reset,scrub}
}
