import {length,type Point,type Segment,type Product,category} from './project';
import {interpolate,splitOpening} from './geometry';
export function openingPlacement(segments:Segment[],p:Point,width:number,tolerance=.7){
 if(!Number.isFinite(width)||width<.5||width>12)return null;
 let best:{segment:Segment;offset:number;a:Point;b:Point;distance:number}|null=null;
 for(const s of segments){if(s.kind!=='fence'||length(s)+1e-8<width)continue;const l=length(s),dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,t=Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.y-s.a.y)*dy)/(l*l))),near=interpolate(s.a,s.b,t),distance=Math.hypot(near.x-p.x,near.y-p.y);let offset=Math.max(0,Math.min(l-width,t*l-width/2));if(offset<.25)offset=0;else if(l-offset-width<.25)offset=l-width;if(distance<=tolerance&&(!best||distance<best.distance))best={segment:s,offset,a:interpolate(s.a,s.b,offset/l),b:interpolate(s.a,s.b,(offset+width)/l),distance};}
 return best;
}
export function dropOpening(segments:Segment[],p:Point,item:Product){
 const kind=category(item);if(kind!=='gate'&&kind!=='wicket')throw Error('Wybierz bramę lub furtkę.');
 const found=openingPlacement(segments,p,item.moduleWidth);if(!found)throw Error('Upuść element na odcinku ogrodzenia dłuższym niż wybrany otwór.');
 const pieces=splitOpening(found.segment,kind,item.moduleWidth,found.offset).map(s=>s.kind===kind?{...s,openingProductId:item.id}:s);
 const result=segments.flatMap(s=>s.id===found.segment.id?pieces:[s]);if(result.length>500)throw Error('Maksymalnie 500 odcinków.');return {segments:result,selected:pieces.find(s=>s.kind===kind)!.id};
}

