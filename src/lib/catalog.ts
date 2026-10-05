import { products, openingProducts, category, type Product } from './project';
export const CATALOG_KEY='fence-catalog-v3';
export const defaultCatalog=[...products,...openingProducts];
export function isCatalog(value:unknown): value is Product[]{
 if(!Array.isArray(value)||!value.length||value.length>100||new Set(value.map(p=>p?.id)).size!==value.length)return false;
 return value.some(p=>p&&category(p)==='fence')&&value.every(p=>p&&typeof p.id==='string'&&/^[a-z0-9-]{1,80}$/i.test(p.id)&&['fence','gate','wicket','automation'].includes(category(p))&&['horizontal','vertical','mesh'].includes(p.style)&&['price','gatePrice','wicketPrice','postPrice'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1000000)&&Number.isFinite(p.moduleWidth)&&p.moduleWidth>=.25&&p.moduleWidth<=(category(p)==='gate'?12:6)&&['meter','module'].includes(p.priceMode)&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=80&&(p.gateType===undefined||['swing','sliding'].includes(p.gateType))&&(p.compatibleWith===undefined||['swing','sliding','both'].includes(p.compatibleWith))&&(p.mounting===undefined||['slope','steps'].includes(p.mounting))&&(p.clearance===undefined||(Number.isFinite(p.clearance)&&p.clearance>=0&&p.clearance<=30))&&(p.usePhoto===undefined||typeof p.usePhoto==='boolean')&&(p.image===undefined||(typeof p.image==='string'&&p.image.length<600000&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(p.image)))&&(p.instructionsUrl===undefined||(typeof p.instructionsUrl==='string'&&p.instructionsUrl.length<=500&&/^https:\/\//.test(p.instructionsUrl))));
}
export function readCatalog():Product[]{
 try{const v:unknown=JSON.parse(localStorage.getItem(CATALOG_KEY)??'null');if(isCatalog(v))return v;const old:unknown=JSON.parse(localStorage.getItem('fence-catalog-v2')??'null');if(isCatalog(old))return [...old,...openingProducts];}catch{}
 return defaultCatalog.map(p=>({...p}));
}
export function compatibleAutomation(gate:Product,automation:Product){return category(gate)==='gate'&&category(automation)==='automation'&&(automation.compatibleWith==='both'||automation.compatibleWith===(gate.gateType??'swing'));}

