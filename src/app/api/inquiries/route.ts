import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {isInquiry,inquiryText,SELLER_EMAIL} from '@/lib/inquiry';
import {quotePdf} from '@/lib/quote-pdf';
export const runtime='nodejs';
const recent=new Map<string,number[]>();
const enabled=()=>!!process.env.RESEND_API_KEY&&!!process.env.QUOTE_FROM;
export function GET(){return Response.json({enabled:enabled(),recipient:SELLER_EMAIL});}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'Niedozwolone źródło zapytania.'},{status:403});
 if(!enabled())return Response.json({error:'Wysyłka pocztowa nie jest jeszcze podłączona. Użyj opcji Przygotuj e-mail.'},{status:503});
 const text=await request.text();if(text.length>100000)return Response.json({error:'Projekt jest zbyt duży.'},{status:413});
 let body:unknown;try{body=JSON.parse(text);}catch{return Response.json({error:'Nieprawidłowe dane.'},{status:400});}
 if(!isInquiry(body))return Response.json({error:'Sprawdź dane kontaktowe i projekt (maksymalnie 100 odcinków).'}, {status:400});
 const now=Date.now();for(const [k,v]of recent)if(v.every(t=>now-t>600000))recent.delete(k);
 const rateKey=body.email.toLowerCase(),attempts=(recent.get(rateKey)??[]).filter(t=>now-t<600000);
 if(attempts.length>=3||recent.size>=1000)return Response.json({error:'Spróbuj ponownie za kilka minut.'},{status:429});recent.set(rateKey,[...attempts,now]);
 try{const product=body.catalog.find(p=>p.id===body.project.productId)!;const font=new Uint8Array(await readFile(path.join(process.cwd(),'public/fonts/LiberationSans-Regular.ttf')));const pdf=quotePdf(body.project,product,font);
 const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':body.requestId},body:JSON.stringify({from:process.env.QUOTE_FROM,to:[SELLER_EMAIL],reply_to:body.email,subject:'Zapytanie o ogrodzenie z konfiguratora',text:inquiryText(body),attachments:[{filename:'wycena-ogrodzenia.pdf',content:Buffer.from(pdf).toString('base64')},{filename:'projekt-ogrodzenia.json',content:Buffer.from(JSON.stringify(body.project)).toString('base64')}] }),signal:AbortSignal.timeout(15000)});
 const data=await result.json();if(!result.ok||!data.id)return Response.json({error:'Serwer pocztowy nie przyjął wiadomości. Możesz przygotować e-mail ręcznie.'},{status:502});
 return Response.json({id:data.id,message:'Serwer pocztowy przyjął zapytanie do wysłania. Sprzedawca odpowie na podany adres.'});
 }catch{return Response.json({error:'Nie udało się wysłać zapytania. Spróbuj ponownie lub przygotuj e-mail ręcznie.'},{status:502});}
}
