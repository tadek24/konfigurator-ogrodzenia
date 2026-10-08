import {segmentModel} from './segment-model';
import {PDFDocument,rgb,type PDFImage} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {direction,cornerAngles,endpoint} from './geometry';
import {length,money} from './project';
import type {OfferSnapshot} from './offer';
/** Assets are injected: the generator is deterministic and works in browser and tests. */
export async function salesOfferPdf(snapshot:OfferSnapshot,fontBytes:Uint8Array,assets:Record<string,Uint8Array>={},preview3d?:Uint8Array){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);const font=await doc.embedFont(fontBytes,{subset:true});
 const {settings,quote,project}=snapshot;const ink=rgb(.12,.2,.24),muted=rgb(.4,.46,.5);let page=doc.addPage([595,842]),y=780;
 const pages=[page];
 const image=async(bytes:Uint8Array|undefined):Promise<PDFImage|undefined>=>{if(!bytes)return;try{return await doc.embedPng(bytes);}catch{try{return await doc.embedJpg(bytes);}catch{return;}}};
 const images:Record<string,PDFImage>={};for(const [key,bytes] of Object.entries(assets)){const img=await image(bytes);if(img)images[key]=img;}
 const nextPage=(title:string)=>{page=doc.addPage([595,842]);pages.push(page);y=780;text(title,18);};
 function line(){page.drawLine({start:{x:42,y:y+15},end:{x:553,y:y+15},thickness:.6,color:rgb(.8,.83,.85)});}
 function text(value:string,size=10,x=42,max=510){
  const words=value.replace(/[\u0000-\u0008\u000b-\u001f]/g,'').split(/\s+/).map(word=>fitText(word,size,max));let current='';
  for(const word of words){const candidate=current?current+' '+word:word;if(font.widthOfTextAtSize(candidate,size)>max&&current){if(y<65)nextPage('Oferta / ciąg dalszy');page.drawText(current,{x,y,size,font,color:ink});y-=size*1.5;current=word;}else current=candidate;}
  if(y<65)nextPage('Oferta / ciąg dalszy');page.drawText(current,{x,y,size,font,color:ink});y-=size*1.5;
 }
 function fitText(value:string,size:number,max:number){let result=value;while(result&&font.widthOfTextAtSize(result,size)>max)result=result.slice(0,-1);return result===value?result:result.slice(0,-3)+'...';}
 function cell(value:string,x:number,width:number,size=9){page.drawText(fitText(value,size,width),{x,y,size,font,color:ink});}
 function drawImage(img:PDFImage,x:number,bottom:number,w:number,h:number){const scale=Math.min(w/img.width,h/img.height);page.drawImage(img,{x,y:bottom,width:img.width*scale,height:img.height*scale});}
 const logo=images[settings.company.logo];if(logo){drawImage(logo,400,735,150,55);}
 text(settings.company.name,22,42,logo?340:510);if(settings.company.address)text(settings.company.address);text([settings.company.taxId?`NIP: ${settings.company.taxId}`:'',settings.company.email,settings.company.phone].filter(Boolean).join(' | '),9);y-=12;line();y-=12;
 text('OFERTA OGRODZENIA',22);text(project.name,13);text(`Data: ${new Date(snapshot.createdAt).toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw'})}`,9);y-=10;
 text('Klient',13);text([settings.customer,settings.customerAddress,settings.customerEmail].filter(Boolean).join(' | '));y-=10;
 text(`Termin realizacji: ${settings.leadTime}`);text(`Ważność oferty: ${settings.validity}`);text(`Warunki płatności: ${settings.payment}`);y-=18;
 const header=()=>{line();cell('Materiały i usługi / netto',42,250);cell('Ilość',302,70);cell('Cena netto',380,75);cell('Wartość netto',468,85);y-=22;};header();
 for(const row of quote.rows){const photo=row.image?images[row.image]:undefined;const rowHeight=photo?65:35;if(y-rowHeight<80){nextPage('Zestawienie / ciąg dalszy');header();}if(photo)drawImage(photo,42,y-45,55,40);cell(row.name,photo?104:42,photo?188:248);cell(`${row.quantity.toFixed(2)} ${row.unit}`,302,70);cell(money(row.price),380,78);cell(money(row.total),468,85);y-=rowHeight;line();}
 if(y<245)nextPage('Podsumowanie oferty');y-=12;text(`Przed rabatem: ${money(quote.subtotal)}`,11);text(`Rabat ${settings.discountPercent}% + ${money(settings.discountAmount)}: -${money(quote.discount)}`,11);text(`Netto: ${money(quote.net)}`,12);text(`VAT ${settings.vat}%: ${money(quote.tax)}`,11);text(`Brutto: ${money(quote.gross)}`,18);y-=10;text('Uwagi handlowca',13);for(const paragraph of settings.notes.split('\n'))text(paragraph);text('Ceny i produkty stanowią snapshot oferty. Późniejsze zmiany katalogu nie zmieniają dokumentu.',8);
 nextPage('Plan 2D / geometria techniczna');text('Metry; kierunki od osi X zgodnie z ruchem wskazówek zegara. Łuki: mniejsze kąty między odcinkami.',9);y-=20;
 const points=project.segments.flatMap(s=>[s.a,s.b]);if(points.length){const minX=Math.min(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxX=Math.max(...points.map(p=>p.x)),maxY=Math.max(...points.map(p=>p.y));const scale=Math.min(455/Math.max(1,maxX-minX),560/Math.max(1,maxY-minY));const originY=y-25;
  const map=(p:{x:number;y:number})=>({x:65+(p.x-minX)*scale,y:originY-(p.y-minY)*scale});
  const planLabel=(value:string,x:number,y:number)=>{const width=font.widthOfTextAtSize(value,8);page.drawText(value,{x:Math.max(42,x+width>553?x-width-32:x),y:Math.max(65,Math.min(750,y)),size:8,font,color:ink});};
  project.segments.forEach((s,i)=>{const a=map(s.a),b=map(s.b);page.drawLine({start:a,end:b,color:ink,thickness:2,dashArray:s.kind==='fence'?undefined:[5,3]});planLabel(`${i+1}: ${length(s).toFixed(2)} m / ${direction(s).toFixed(1)}°`,(a.x+b.x)/2+5,(a.y+b.y)/2+8);});
  for(const angle of cornerAngles(project.segments)){const center=map(angle.point),r=19;let prev=endpoint(center,r,-angle.from);for(let step=1;step<=16;step++){const p=endpoint(center,r,-angle.from-angle.angle*step/16);page.drawLine({start:prev,end:p,color:muted,thickness:.6});prev=p;}planLabel(`${angle.angle.toFixed(1)}°`,center.x+22,center.y-25);}
 }else text('Projekt nie zawiera odcinków.');
 const preview=await image(preview3d);if(preview){nextPage('Wizualizacja 3D');drawImage(preview,42,150,510,570);text('Model uproszczony. Szczegóły techniczne wymagają pomiaru i potwierdzenia.',9);}
 for(let start=0;start<project.segments.length;start+=22){nextPage('Geometria / szczegółowe wymiary');project.segments.slice(start,start+22).forEach((s,i)=>text(`${start+i+1}. ${s.kind==='fence'?'Ogrodzenie':s.kind==='gate'?'Brama':'Furtka'} | ${length(s).toFixed(2)} m | kierunek ${direction(s).toFixed(1)}° | wysokość ${segmentModel(s,project,snapshot.catalog).height.toFixed(2)} m | grunt ${(s.a.z??0).toFixed(2)} / ${(s.b.z??0).toFixed(2)} m`,9));}
 pages.forEach((p,i)=>p.drawText(`${settings.company.name} | Oferta | ${i+1} / ${pages.length}`,{x:42,y:28,size:8,font,color:muted}));
 return doc.save();
}
