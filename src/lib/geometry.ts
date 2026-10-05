import { length, type Point, type Segment } from './project';
export const elevation = (p: Point) => p.z ?? 0;
export function interpolate(a: Point, b: Point, t: number): Point {
 return { x: a.x+(b.x-a.x)*t, y: a.y+(b.y-a.y)*t, z:elevation(a)+(elevation(b)-elevation(a))*t };
}
export function splitOpening(s: Segment, kind: 'gate'|'wicket', width: number, offset: number): Segment[] {
 const l=length(s);
 if (s.kind!=='fence'||!Number.isFinite(width)||!Number.isFinite(offset)||width<.5||offset<0||offset+width>l+1e-8) throw new Error('Otwór musi mieścić się w zaznaczonym odcinku.');
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
