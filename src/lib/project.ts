export type Point = { x: number; y: number; z?: number };
export type Segment = { id: string; a: Point; b: Point; kind: 'fence' | 'gate' | 'wicket'; openingProductId?: string; automationId?: string };
export type Product = { id: string; name: string; style: 'horizontal' | 'vertical' | 'mesh'; price: number; moduleWidth: number; priceMode: 'meter' | 'module'; gatePrice: number; wicketPrice: number; postPrice: number; category?: 'fence'|'gate'|'wicket'|'automation'; gateType?: 'swing'|'sliding'; compatibleWith?: 'swing'|'sliding'|'both'; image?: string; instructionsUrl?: string; clearance?: number; mounting?: 'slope'|'steps' };
export type Project = { version: 1; name: string; segments: Segment[]; productId: string; height: number; color: string };
export const products: Product[] = [
 { id: 'modern', name: 'Modern / poziome', style: 'horizontal', price: 420, moduleWidth: 2, priceMode: 'meter', gatePrice: 4200, wicketPrice: 1450, postPrice: 140 },
 { id: 'classic', name: 'Classic / pionowe', style: 'vertical', price: 310, moduleWidth: 2.5, priceMode: 'meter', gatePrice: 3200, wicketPrice: 1100, postPrice: 120 },
 { id: 'panel', name: 'Panel / siatka', style: 'mesh', price: 145, moduleWidth: 2.5, priceMode: 'meter', gatePrice: 2400, wicketPrice: 850, postPrice: 95 },
];
export const openingProducts:Product[]=[
 {...products[0],id:'gate-swing',name:'Brama dwuskrzydłowa',category:'gate',gateType:'swing',moduleWidth:4,priceMode:'module',price:4200,clearance:2},
 {...products[0],id:'gate-sliding',name:'Brama przesuwna',category:'gate',gateType:'sliding',moduleWidth:4,priceMode:'module',price:4900,clearance:6},
 {...products[0],id:'wicket-basic',name:'Furtka',category:'wicket',moduleWidth:1,priceMode:'module',price:1450},
 {...products[0],id:'automation-swing',name:'Zestaw automatyki rozwiernej',category:'automation',compatibleWith:'swing',moduleWidth:1,priceMode:'module',price:1800},
 {...products[0],id:'automation-sliding',name:'Zestaw automatyki przesuwnej',category:'automation',compatibleWith:'sliding',moduleWidth:1,priceMode:'module',price:1600},
];
export const category=(p:Product)=>p.category??'fence';
export const initialProject: Project = { version: 1, name: 'Nowy projekt', productId: 'modern', height: 1.5, color: '#454b50', segments: [] };
export const length = (s: Segment) => Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
export const money = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);
export function estimate(project: Project, product: Product, catalog:Product[] = []) {
 const fence = project.segments.filter(s => s.kind === 'fence');
 const meters = fence.reduce((n, s) => n + length(s), 0);
 const modules = fence.reduce((n, s) => n + Math.ceil(length(s) / product.moduleWidth), 0);
 const nodes = new Set(project.segments.flatMap(s => [s.a, s.b]).map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)},${(p.z??0).toFixed(4)}`));
 const posts = nodes.size + fence.reduce((n, s) => n + Math.max(0, Math.ceil(length(s) / product.moduleWidth) - 1), 0);
 const gates = project.segments.filter(s => s.kind === 'gate').length;
 const wickets = project.segments.filter(s => s.kind === 'wicket').length;
 const rows = [{ name: product.priceMode === 'module' ? 'Przęsła (pełne moduły)' : 'Przęsła (cena za metr)', quantity: product.priceMode === 'module' ? modules : meters, unit: product.priceMode === 'module' ? 'szt.' : 'm', total: (product.priceMode === 'module' ? modules : meters) * product.price }, { name: 'Słupki', quantity: posts, unit: 'szt.', total: posts * product.postPrice }, { name: 'Bramy', quantity: gates, unit: 'szt.', total: gates * product.gatePrice }, { name: 'Furtki', quantity: wickets, unit: 'szt.', total: wickets * product.wicketPrice }];
 for(const kind of ['gate','wicket'] as const){const row=rows[kind==='gate'?2:3];row.total=project.segments.filter(s=>s.kind===kind).reduce((sum,s)=>{const p=catalog.find(p=>p.id===s.openingProductId&&category(p)===kind);return sum+(p?.price??(kind==='gate'?product.gatePrice:product.wicketPrice));},0);}
 const automatic=project.segments.filter(s=>s.kind==='gate'&&s.automationId).map(s=>catalog.find(p=>p.id===s.automationId&&category(p)==='automation')).filter((p):p is Product=>!!p);
 if(automatic.length)rows.push({name:'Automatyka',quantity:automatic.length,unit:'kpl.',total:automatic.reduce((n,p)=>n+p.price,0)});
 return { meters, modules, posts, totalLength: project.segments.reduce((n, s) => n + length(s), 0), rows, total: rows.reduce((n, r) => n + r.total, 0) };
}
export function isProject(value: unknown): value is Project {
 if (!value || typeof value !== 'object') return false;
 const p = value as Project;
 const point = (v: Point) => v && Number.isFinite(v.x) && Number.isFinite(v.y) && Math.abs(v.x) <= 500 && Math.abs(v.y) <= 500 && (v.z === undefined || (Number.isFinite(v.z) && Math.abs(v.z) <= 20));
 return p.version === 1 && typeof p.name === 'string' && p.name.length <= 80 && typeof p.productId === 'string' && /^[a-z0-9-]{1,80}$/i.test(p.productId) && Number.isFinite(p.height) && p.height >= .5 && p.height <= 3 && /^#[0-9a-f]{6}$/i.test(p.color) && Array.isArray(p.segments) && p.segments.length <= 500 && new Set(p.segments.map(s=>s?.id)).size === p.segments.length && p.segments.every(s => s && typeof s.id === 'string' && point(s.a) && point(s.b) && ['fence', 'gate', 'wicket'].includes(s.kind) && [s.openingProductId,s.automationId].every(id=>id===undefined||(typeof id==='string'&&/^[a-z0-9-]{1,80}$/i.test(id))) && length(s) >= .25 && length(s) <= 200);
}

