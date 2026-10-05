'use client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,PerspectiveCamera} from '@react-three/drei';
import {Component,useMemo,useEffect,type ReactNode} from 'react';
import {PlaneGeometry} from 'three';
import {category,length,type Project,type Product,type Segment} from '@/lib/project';
import OpeningModel from './opening-model';
import PhotoSurface from './photo-surface';
import {elevation,terrainHeight} from '@/lib/geometry';
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<div className="empty">Brak obsługi WebGL. Możesz nadal pracować w 2D.</div>:this.props.children;}}
function Rail({x,y,width,rise,color}:{x:number;y:number;width:number;rise:number;color:string}){return <mesh position={[x,y,0]} rotation={[0,0,Math.atan2(rise,width)]} castShadow><boxGeometry args={[Math.hypot(width,rise),.055,.055]}/><meshStandardMaterial color={color} roughness={.7} metalness={.25}/></mesh>;}
function Fence({s,product,project,cx,cy}:{s:Segment;product:Product;project:Project;cx:number;cy:number}){
 const l=length(s),h=project.height,opening=s.kind!=='fence',count=opening?1:Math.ceil(l/product.moduleWidth);
 const ground=(t:number)=>elevation(s.a)+(elevation(s.b)-elevation(s.a))*t;
 const panelWidth=(i:number)=>opening?l:Math.min(product.moduleWidth,l-i*product.moduleWidth);
 return <group position={[(s.a.x+s.b.x)/2-cx,0,(s.a.y+s.b.y)/2-cy]} rotation={[0,-Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x),0]}>
 {Array.from({length:count+1},(_,i)=>{const x=opening?i*l:Math.min(l,i*product.moduleWidth);return <mesh key={`post${i}`} position={[-l/2+x,ground(x/l)+h/2+.025,0]} castShadow><boxGeometry args={[.12,h+.13,.12]}/><meshStandardMaterial color={project.color} metalness={.35} roughness={.6}/></mesh>;})}
 {Array.from({length:count},(_,i)=>{const width=panelWidth(i),begin=opening?0:i*product.moduleWidth,za=ground(begin/l),zb=ground((begin+width)/l),rise=opening||product.mounting==='steps'?0:zb-za,base=opening||product.mounting==='steps'?Math.max(za,zb):za;
 return <group key={i} position={[-l/2+begin,base+.08,0]}>
 {opening?<OpeningModel width={width} height={h} product={product} color={project.color} wicket={s.kind==='wicket'} automated={!!s.automationId}/>:<>{product.style==='horizontal'?Array.from({length:9},(_,j)=><Rail key={j} x={width/2} y={.08+j*(h-.2)/8+rise/2} width={Math.max(.05,width-.14)} rise={rise} color={project.color}/>):Array.from({length:Math.max(1,Math.floor(width/.15))},(_,j)=>{const x=.12+j*.15;return <mesh key={j} position={[x,h/2+rise*x/width,0]} castShadow><boxGeometry args={[product.style==='mesh'?.018:.045,h-.1,.04]}/><meshStandardMaterial color={project.color} roughness={.7}/></mesh>;})}
 {product.style==='mesh'&&Array.from({length:Math.max(2,Math.floor((h-.1)/.15))},(_,j)=><group key={'wire'+j} position={[width/2,.08+j*.15+rise/2,0]} rotation={[0,0,Math.atan2(rise,width)]}><mesh castShadow><boxGeometry args={[Math.hypot(width-.14,rise),.015,.018]}/><meshStandardMaterial color={project.color} roughness={.7}/></mesh></group>)}
 {[.15,h-.15].map(y=><Rail key={y} x={width/2} y={y+rise/2} width={Math.max(.05,width-.12)} rise={rise} color={project.color}/>)}
 </>}{product.usePhoto&&product.image&&<PhotoSurface image={product.image} width={width} height={h}/>}
 </group>;})}</group>;
}
function World({project,product,catalog}:{project:Project;product:Product;catalog:Product[]}){
 const points=project.segments.flatMap(s=>[s.a,s.b]);
 const minX=Math.min(0,...points.map(p=>p.x)),maxX=Math.max(8,...points.map(p=>p.x)),minY=Math.min(0,...points.map(p=>p.y)),maxY=Math.max(8,...points.map(p=>p.y));
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2,extent=Math.max(12,maxX-minX,maxY-minY),targetY=points.length?points.reduce((n,p)=>n+elevation(p),0)/points.length:0;
 const terrain=useMemo(()=>{const geo=new PlaneGeometry(extent+18,extent+18,64,64);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,terrainHeight({x:pos.getX(i)+cx,y:pos.getZ(i)+cy},project.segments)-.015);geo.computeVertexNormals();return geo;},[project.segments,extent,cx,cy]);
 useEffect(()=>()=>terrain.dispose(),[terrain]);
 return <><color attach="background" args={['#dce3e6']}/><fog attach="fog" args={['#dce3e6',extent*2,extent*6]}/><PerspectiveCamera makeDefault position={[extent*.9,targetY+extent*.65,extent*.95]} fov={42}/><hemisphereLight args={['#f7f5ee','#6c7762',2.5]}/><directionalLight position={[extent*.5,targetY+extent,extent*.3]} intensity={3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-extent} shadow-camera-right={extent} shadow-camera-top={extent} shadow-camera-bottom={-extent} shadow-camera-far={extent*4} shadow-bias={-.0002}/>
 <mesh geometry={terrain} receiveShadow><meshStandardMaterial color="#8e9a7b" roughness={1}/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,Math.min(0,...points.map(elevation))-.12,0]} receiveShadow><planeGeometry args={[extent*12,extent*12]}/><meshStandardMaterial color="#a9b097" roughness={1}/></mesh>
 {project.segments.map(s=><Fence key={s.id} s={s} product={catalog.find(p=>p.id===s.openingProductId&&category(p)===s.kind)??product} project={project} cx={cx} cy={cy}/>)}
 <OrbitControls makeDefault target={[0,targetY+.5,0]} minDistance={2} maxDistance={extent*4} maxPolarAngle={Math.PI/2-.03}/></>;
}
export default function Scene(props:{project:Project;product:Product;catalog:Product[]}){return <Boundary><Canvas shadows dpr={[1,1.5]} fallback={<div className="empty">WebGL niedostępny — wybierz widok 2D.</div>}><World {...props}/></Canvas></Boundary>;}


