import { products, type Product } from './project';
export const CATALOG_KEY='fence-catalog-v2';
export function isCatalog(value:unknown): value is Product[]{
 if(!Array.isArray(value)||value.length!==products.length)return false;
 return value.every((p,i)=>p&&p.id===products[i].id&&['price','gatePrice','wicketPrice','postPrice'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1000000)&&Number.isFinite(p.moduleWidth)&&p.moduleWidth>=.25&&p.moduleWidth<=6&&['meter','module'].includes(p.priceMode)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=80);
}
export function readCatalog():Product[]{
 try{const v:unknown=JSON.parse(localStorage.getItem(CATALOG_KEY)??'null');if(isCatalog(v))return products.map((p,i)=>({...p,...v[i],style:p.style}));}catch{}
 return products.map(p=>({...p}));
}
