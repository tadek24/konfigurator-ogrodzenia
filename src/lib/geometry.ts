import { length, type Point, type Segment } from './project';
export const elevation = (p: Point) => p.z ?? 0;
export function interpolate(a: Point, b: Point, t: number): Point {
 return { x: a.x+(b.x-a.x)*t, y: a.y+(b.y-a.y)*t, z:elevation(a)+(elevation(b)-elevation(a))*t };
}
export function splitOpening(s: Segment, kind: 'gate'|'wicket', width: number, offset: number): Segment[] {
 const l=length(s);
 if (s.kind!=='fence'||!Number.isFinite(width)||!Number.isFinite(offset)||width<.5||offset<0||offset+width>l+1e-8) throw new Error('Otwór musi mieścić się w zaznaczonym odcinku.');
 if((offset>.001&&offset<.25)||(l-offset-width>.001&&l-offset-width<.25))throw new Error('Pozostały fragment ogrodzenia musi mieć co najmniej 0,25 m.');
 const a=interpolate(s.a,s.b,offset/l), b=interpolate(s.a,s.b,(offset+width)/l);
 const segments: Segment[]=[];
 if(offset>.001)segments.push({...s,id:crypto.randomUUID(),b:a});
 segments.push({id:crypto.randomUUID(),a,b,kind});
 if(l-offset-width>.001)segments.push({...s,id:crypto.randomUUID(),a:b});
 return segments;
}
export function terrainHeight(p: Point, segments: Segment[]): number {
 if (!segments.length) return 0;
 let sum=0, weights=0;
 for(const s of segments){const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,den=dx*dx+dy*dy;
  const t=den?Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.y-s.a.y)*dy)/den)):0;
  const nearest=interpolate(s.a,s.b,t),d=Math.hypot(p.x-nearest.x,p.y-nearest.y);
  if(d<.001)return elevation(nearest);
  const w=1/(d*d);sum+=elevation(nearest)*w;weights+=w;
 }
 return sum/weights;
}
export function setNodeElevation(segments: Segment[], node: Point, z: number): Segment[] {
 const update=(p:Point)=>Math.hypot(p.x-node.x,p.y-node.y)<.0001?{...p,z}:p;
 return segments.map(s=>({...s,a:update(s.a),b:update(s.b)}));
}

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
 const next={...endpoint(s.a,distance,angle),z:s.b.z};
 if(Math.abs(next.x)>500||Math.abs(next.y)>500)return segments;
 const same=(p:Point)=>Math.hypot(p.x-s.b.x,p.y-s.b.y)<1e-5;
 const result=segments.map(x=>({...x,a:same(x.a)?{...next,z:x.a.z}:x.a,b:same(x.b)?{...next,z:x.b.z}:x.b}));
 return result.every(x=>length(x)>=.25&&length(x)<=200)?result:segments;
}
