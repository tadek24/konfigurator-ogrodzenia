import {estimate,length,category,type Product,type Project} from './project';
export type OfferRow={id:string;name:string;quantity:number;unit:string;price:number;category:'material'|'installation'|'transport'|'foundation'|'accessory'|'custom';image?:string};
export type Company={id:string;name:string;address:string;taxId:string;email:string;phone:string;logo:string};
export type OfferSettings={company:Company;customer:string;customerAddress:string;customerEmail:string;leadTime:string;validity:string;payment:string;notes:string;discountPercent:number;discountAmount:number;vat:number;overrides:Record<string,Partial<OfferRow>>;extra:OfferRow[]};
export const defaultOffer:OfferSettings={company:{id:'demo',name:'Twoja firma',address:'',taxId:'',email:'',phone:'',logo:''},customer:'',customerAddress:'',customerEmail:'',leadTime:'Do uzgodnienia',validity:'14 dni',payment:'Do uzgodnienia',notes:'',discountPercent:0,discountAmount:0,vat:23,overrides:{},extra:[]};
export function systemRows(project:Project,catalog:Product[]):OfferRow[] {
 const fallback=catalog.find(p=>p.id===project.productId)??catalog[0];const result:OfferRow[]=[];
 const add=(row:OfferRow)=>{const previous=result.find(r=>r.id===row.id);if(previous)previous.quantity+=row.quantity;else result.push(row);};
 for(const s of project.segments){const p=catalog.find(p=>p.id===(s.productId??s.openingProductId))??fallback;const variant=p.variants?.find(v=>v.id===s.variantId);const kindPrice=s.kind==='gate'?(category(p)==='gate'?p.price:p.gatePrice):s.kind==='wicket'?(category(p)==='wicket'?p.price:p.wicketPrice):p.price;const perMeter=s.kind==='fence'&&p.priceMode==='meter';
  add({id:`material:${p.id}:${variant?.id??'base'}:${s.kind}`,name:`${p.name} / ${s.kind==='fence'?'przęsła':s.kind==='gate'?'brama':'furtka'}${variant?` / ${variant.name}`:''}`,quantity:perMeter?length(s):s.kind==='fence'?Math.ceil(length(s)/(variant?.width??p.moduleWidth)):1,unit:perMeter?'m':'szt.',price:variant?.price??kindPrice,category:'material',image:p.image});
  for(const field of ['foundationId','automationId','accessoryId'] as const){const item=catalog.find(p=>p.id===s[field]);if(item)add({id:`${field}:${item.id}`,name:item.name,quantity:field==='foundationId'?length(s):1,unit:field==='foundationId'?'m':'szt.',price:item.price,category:field==='foundationId'?'foundation':'accessory',image:item.image});}
 }
 const post=catalog.find(p=>category(p)==='post'&&p.enabled!==false);
 const nodes=new Set(project.segments.flatMap(s=>[s.a,s.b]).map(p=>`${p.x.toFixed(4)},${p.y.toFixed(4)},${(p.z??0).toFixed(4)}`));
 const posts=nodes.size+project.segments.filter(s=>s.kind==='fence').reduce((n,s)=>{const p=catalog.find(p=>p.id===s.productId)??fallback,v=p.variants?.find(v=>v.id===s.variantId);return n+Math.max(0,Math.ceil(length(s)/(v?.width??p.moduleWidth))-1);},0);
 if(posts)add({id:'posts',name:post?.name??'Słupki',quantity:posts,unit:'szt.',price:post?.price??fallback.postPrice,category:'material',image:post?.image});
 return result;
}
const round=(v:number)=>Math.round((v+Number.EPSILON)*100)/100;
export interface PricingEngine { rows(project:Project,catalog:Product[]):OfferRow[] }
export const demoPricingEngine:PricingEngine={rows:systemRows};
export function isOfferSettings(value:unknown):value is OfferSettings {
 if(!value||typeof value!=='object')return false;const s=value as OfferSettings;
 if(!s.company||['id','name','address','taxId','email','phone','logo'].some(k=>typeof s.company[k as keyof Company]!=='string')||['customer','customerAddress','customerEmail','leadTime','validity','payment','notes'].some(k=>typeof s[k as keyof OfferSettings]!=='string')||!s.overrides||typeof s.overrides!=='object'||!Array.isArray(s.extra)||s.extra.length>500)return false;
 try{calculateOffer({version:1,name:'',segments:[],productId:'',height:1.5,color:'#454b50'},[{id:'test',name:'Test',style:'horizontal',price:0,priceMode:'meter',moduleWidth:2,postPrice:0,gatePrice:0,wicketPrice:0}],s);return s.extra.every(r=>typeof r.id==='string'&&typeof r.name==='string'&&typeof r.unit==='string')&&Object.values(s.overrides).every(r=>(r.price===undefined||Number.isFinite(r.price)&&r.price>=0)&&(r.quantity===undefined||Number.isFinite(r.quantity)&&r.quantity>=0));}catch{return false;}
}
export function calculateOffer(project:Project,catalog:Product[],settings:OfferSettings,engine:PricingEngine=demoPricingEngine) {
 if(!Number.isFinite(settings.discountPercent)||settings.discountPercent<0||settings.discountPercent>100||!Number.isFinite(settings.discountAmount)||settings.discountAmount<0||!Number.isFinite(settings.vat)||settings.vat<0||settings.vat>100)throw Error('Nieprawidłowy rabat lub VAT');
 const rows=[...engine.rows(project,catalog).map(r=>({...r,...settings.overrides[r.id],id:r.id})),...settings.extra].map(r=>{if(!Number.isFinite(r.quantity)||r.quantity<0||!Number.isFinite(r.price)||r.price<0)throw Error('Nieprawidłowa pozycja oferty');return {...r,total:round(r.quantity*r.price)};});
 const subtotal=round(rows.reduce((n,r)=>n+r.total,0)),discount=round(Math.min(subtotal,subtotal*settings.discountPercent/100+settings.discountAmount)),net=round(subtotal-discount),tax=round(net*settings.vat/100);
 return {rows,subtotal,discount,net,tax,gross:round(net+tax)};
}
export function offerSnapshot(project:Project,catalog:Product[],settings:OfferSettings) {return structuredClone({version:1,createdAt:new Date().toISOString(),project,catalog,settings,quote:calculateOffer(project,catalog,settings)});}
export type OfferSnapshot=ReturnType<typeof offerSnapshot>;
