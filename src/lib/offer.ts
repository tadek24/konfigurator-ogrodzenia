import {estimate,length,type Product,type Project} from './project';
export type OfferRow={id:string;name:string;quantity:number;unit:string;price:number;category:'material'|'installation'|'transport'|'foundation'|'accessory'|'custom';image?:string};
export type Company={id:string;name:string;address:string;taxId:string;email:string;phone:string;logo:string};
export type OfferSettings={company:Company;customer:string;customerAddress:string;customerEmail:string;leadTime:string;validity:string;payment:string;notes:string;discountPercent:number;discountAmount:number;vat:number;overrides:Record<string,Partial<OfferRow>>;extra:OfferRow[]};
export const defaultOffer:OfferSettings={company:{id:'demo',name:'Twoja firma',address:'',taxId:'',email:'',phone:'',logo:''},customer:'',customerAddress:'',customerEmail:'',leadTime:'Do uzgodnienia',validity:'14 dni',payment:'Do uzgodnienia',notes:'',discountPercent:0,discountAmount:0,vat:23,overrides:{},extra:[]};
export function systemRows(project:Project,catalog:Product[]):OfferRow[] {
 const fallback=catalog.find(p=>p.id===project.productId)??catalog[0];const result:OfferRow[]=[];
 const add=(row:OfferRow)=>{const previous=result.find(r=>r.id===row.id);if(previous)previous.quantity+=row.quantity;else result.push(row);};
 for(const s of project.segments){const p=catalog.find(p=>p.id===s.productId)??fallback;const variant=p.variants?.find(v=>v.id===s.variantId);const kindPrice=s.kind==='gate'?(p.type==='gate'?p.price:p.gatePrice):s.kind==='wicket'?(p.type==='wicket'?p.price:p.wicketPrice):p.price;
  add({id:`material:${p.id}:${variant?.id??'base'}:${s.kind}`,name:`${p.name} / ${s.kind==='fence'?'przęsła':s.kind==='gate'?'brama':'furtka'}${variant?` / ${variant.name}`:''}`,quantity:s.kind==='fence'?length(s):1,unit:s.kind==='fence'?'m':'szt.',price:variant?.price??kindPrice,category:'material',image:p.image});
  for(const field of ['foundationId','automationId','accessoryId'] as const){const item=catalog.find(p=>p.id===s[field]);if(item)add({id:`${field}:${item.id}`,name:item.name,quantity:field==='foundationId'?length(s):1,unit:field==='foundationId'?'m':'szt.',price:item.price,category:field==='foundationId'?'foundation':'accessory',image:item.image});}
 }
 const post=catalog.find(p=>p.type==='post'&&p.enabled!==false);const q=estimate(project,fallback);
 if(q.posts)add({id:'posts',name:post?.name??'Słupki',quantity:q.posts,unit:'szt.',price:post?.price??fallback.postPrice,category:'material',image:post?.image});
 return result;
}
const round=(v:number)=>Math.round((v+Number.EPSILON)*100)/100;
export function calculateOffer(project:Project,catalog:Product[],settings:OfferSettings) {
 if(!Number.isFinite(settings.discountPercent)||settings.discountPercent<0||settings.discountPercent>100||!Number.isFinite(settings.discountAmount)||settings.discountAmount<0||!Number.isFinite(settings.vat)||settings.vat<0||settings.vat>100)throw Error('Nieprawidłowy rabat lub VAT');
 const rows=[...systemRows(project,catalog).map(r=>({...r,...settings.overrides[r.id],id:r.id})),...settings.extra].map(r=>{if(!Number.isFinite(r.quantity)||r.quantity<0||!Number.isFinite(r.price)||r.price<0)throw Error('Nieprawidłowa pozycja oferty');return {...r,total:round(r.quantity*r.price)};});
 const subtotal=round(rows.reduce((n,r)=>n+r.total,0)),discount=round(Math.min(subtotal,subtotal*settings.discountPercent/100+settings.discountAmount)),net=round(subtotal-discount),tax=round(net*settings.vat/100);
 return {rows,subtotal,discount,net,tax,gross:round(net+tax)};
}
export function offerSnapshot(project:Project,catalog:Product[],settings:OfferSettings) {return structuredClone({version:1,createdAt:new Date().toISOString(),project,catalog,settings,quote:calculateOffer(project,catalog,settings)});}
export type OfferSnapshot=ReturnType<typeof offerSnapshot>;
