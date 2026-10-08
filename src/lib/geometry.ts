import { length, type Point, type Segment } from './project';
export const direction = (s: Pick<Segment, 'a'|'b'>) => ((Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x)*180/Math.PI)%360+360)%360;
export function endpoint(a:Point, distance:number, angle:number):Point { return {x:a.x+distance*Math.cos(angle*Math.PI/180),y:a.y+distance*Math.sin(angle*Math.PI/180)}; }
export function wheelAngle(angle:number, delta:number, shift=false, ctrl=false) { return ((angle+(delta<0?1:-1)*(ctrl?.1:shift?5:1))%360+360)%360; }
export function cornerAngles(segments:Segment[]) {
 const result:{id:string;point:Point;angle:number;from:number;to:number}[]=[];
 for(let i=0;i<segments.length;i++) for(let j=i+1;j<segments.length;j++) {
  const a=segments[i],b=segments[j];
  for(const p of [a.a,a.b]) for(const q of [b.a,b.b]) if(Math.hypot(p.x-q.x,p.y-q.y)<1e-5) {
   const otherA=p===a.a?a.b:a.a,otherB=q===b.a?b.b:b.a;
   const from=direction({a:p,b:otherA}),to=direction({a:p,b:otherB}); let delta=(to-from+360)%360;
   result.push({id:`${a.id}:${b.id}`,point:p,angle:Math.min(delta,360-delta),from:delta<=180?from:to,to:delta<=180?to:from});
  }
 }
 return result;
}
export function arcPath(point:Point, from:number, angle:number, radius=25, scale=20) {
 const a=endpoint({x:point.x*scale,y:point.y*scale},radius,from), b=endpoint({x:point.x*scale,y:point.y*scale},radius,from+angle);
 return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${angle>180?1:0} 1 ${b.x} ${b.y}`;
}
export function resizeConnected(segments:Segment[],id:string,distance:number,angle:number) {
 const s=segments.find(x=>x.id===id); if(!s||!Number.isFinite(distance)||distance<.25||distance>100||!Number.isFinite(angle)) return segments;
 const next=endpoint(s.a,distance,angle);
 const same=(p:Point)=>Math.hypot(p.x-s.b.x,p.y-s.b.y)<1e-5;
 return segments.map(x=>({...x,a:same(x.a)?next:x.a,b:same(x.b)?next:x.b})).filter(x=>length(x)>=.25);
}
