'use client';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls, Center } from '@react-three/drei';
import { Component, type ReactNode } from 'react';
import { length, type Project, type Product } from '@/lib/project';
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
 state = { failed: false };
 static getDerivedStateFromError() { return { failed: true }; }
 render() { return this.state.failed ? <div className="empty">Podgląd 3D wymaga przeglądarki z obsługą WebGL. Możesz nadal pracować w 2D.</div> : this.props.children; }
}
export default function Scene({ project, product }: { project: Project; product: Product }) {
 return <Boundary><Canvas shadows camera={{ position: [30, 25, 32], fov: 45 }} fallback={<div className="empty">Brak obsługi WebGL — wybierz widok 2D.</div>}><color attach="background" args={['#15191d']} /><ambientLight intensity={1.5} /><directionalLight position={[10, 20, 10]} intensity={3} castShadow /><Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#30373d" sectionColor="#495159" fadeDistance={90} />
 <Center top>{project.segments.map(s => {
 const l = length(s), h = project.height, count = Math.ceil(l / product.moduleWidth), gate = s.kind !== 'fence';
 return <group key={s.id} position={[(s.a.x + s.b.x)/2, 0, (s.a.y + s.b.y)/2]} rotation={[0, -Math.atan2(s.b.y-s.a.y, s.b.x-s.a.x), 0]}>
 {Array.from({ length: gate ? 2 : count + 1 }, (_, i) => <mesh key={`p${i}`} position={[-l/2 + i*l/(gate ? 1 : count), h/2, 0]} castShadow><boxGeometry args={[.1, h+.1, .1]} /><meshStandardMaterial color={project.color} /></mesh>)}
 {product.style === 'horizontal' ? Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, .1+i*(h-.15)/8, 0]} castShadow><boxGeometry args={[Math.max(.05,l-.12), .09, .05]} /><meshStandardMaterial color={gate ? '#697981' : project.color} /></mesh>) : Array.from({ length: Math.ceil(l/.15) }, (_, i) => <mesh key={i} position={[-l/2+.1+i*.15, h/2, 0]} castShadow><boxGeometry args={[product.style === 'mesh' ? .015 : .04, h-.1, .04]} /><meshStandardMaterial color={project.color} /></mesh>)}
 {[.2, h-.2].map(y => <mesh key={y} position={[0,y,0]}><boxGeometry args={[l,.035,.05]} /><meshStandardMaterial color={project.color} /></mesh>)}
 {s.kind === 'gate' && <mesh position={[0,h/2,0]}><boxGeometry args={[.05,h,.07]} /><meshStandardMaterial color="#90a5ae" /></mesh>}
 </group>; })}</Center><OrbitControls makeDefault target={[0,0,0]} minDistance={3} maxDistance={100} maxPolarAngle={Math.PI/2-.02} /></Canvas></Boundary>;
}
