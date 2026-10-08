import {estimate,length,money,type Project,type Product} from './project';
import {elevation} from './geometry';
const enc=new TextEncoder();
const join=(parts:Uint8Array[])=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;};
/** Embedded TrueType font keeps Polish text searchable without a remote font service. */
export function quotePdf(project:Project,product:Product,fontBytes:Uint8Array,catalog:Product[]=[]):Uint8Array{
 const view=new DataView(fontBytes.buffer,fontBytes.byteOffset,fontBytes.byteLength),tables:Record<string,number>={};
 for(let i=0;i<view.getUint16(4);i++){const off=12+i*16;tables[String.fromCharCode(...fontBytes.slice(off,off+4))]=view.getUint32(off+8);}
 const units=view.getUint16(tables.head+18),metrics=view.getUint16(tables.hhea+34),cmap=tables.cmap;
 let mapping=0;
 for(let i=0;i<view.getUint16(cmap+2);i++){const sub=cmap+view.getUint32(cmap+4+i*8+4);if(view.getUint16(sub)===4){mapping=sub;if(view.getUint16(cmap+4+i*8)===3)break;}}
 if(!mapping)throw Error('Font has no Unicode BMP mapping');
 const count=view.getUint16(mapping+6)/2,end=mapping+14,start=end+count*2+2,delta=start+count*2,ranges=delta+count*2;
 const glyph=(code:number)=>{for(let i=0;i<count;i++){if(code>view.getUint16(end+i*2))continue;if(code<view.getUint16(start+i*2))return 0;const d=view.getInt16(delta+i*2),r=view.getUint16(ranges+i*2);if(!r)return(code+d)&65535;const g=view.getUint16(ranges+i*2+r+(code-view.getUint16(start+i*2))*2);return g?(g+d)&65535:0;}return 0;};
 const used=new Map<number,number>();
 const width=(g:number)=>view.getUint16(tables.hmtx+Math.min(g,metrics-1)*4)/units*1000;
 const safe=(s:string)=>Array.from(s).map(c=>glyph(c.charCodeAt(0))?c:'?').join('');
 const hex=(s:string)=>Array.from(safe(s)).map(c=>{const code=c.charCodeAt(0),g=glyph(code);used.set(g,code);return g.toString(16).padStart(4,'0');}).join('');
 const measure=(s:string,size:number)=>Array.from(safe(s)).reduce((n,c)=>n+width(glyph(c.charCodeAt(0)))/1000*size,0);
 const pages:string[]=[];let content='';
 const text=(s:string,x:number,y:number,size=10,color='0.18 0.22 0.25')=>{content+=`${color} rg BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm <${hex(s)}> Tj ET\n`;};
 const rule=(y:number)=>{content+=`0.8 0.83 0.85 RG 0.5 w 42 ${y} m 553 ${y} l S\n`;};
 const clipped=(s:string,max:number,size:number)=>{let value=safe(s);while(measure(value,size)>max)value=value.slice(0,-1);return value===safe(s)?value:value.slice(0,-3)+'...';};
 const right=(s:string,y:number,size=10)=>text(s,553-measure(s,size),y,size);
 const finish=()=>{text(`Ogrodzenia / wycena orientacyjna / strona ${pages.length+1}`,42,28,8,'0.45 0.49 0.52');pages.push(content);content='';};
 const quote=estimate(project,product,catalog);
 text('OGRODZENIA',42,792,11);right('ZAPYTANIE OFERTOWE',792,9);rule(775);
 text('Wycena materiałów',42,738,25);text(clipped(project.name,510,13),42,711,13);
 text(new Date().toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw'}),42,687,10);
 text(clipped(`${product.name} | wysokość ${project.height.toFixed(2)} m | szerokość przęsła ${product.moduleWidth.toFixed(2)} m`,510,10),42,657);
 text(`${quote.totalLength.toFixed(2)} m łącznie | ${quote.modules} przęseł | ${quote.posts} słupków`,42,638);
 text('Element',42,602,10);text('Ilość',350,602,10);right('Wartość brutto',602);rule(592);
 let y=565;for(const row of quote.rows){text(row.name,42,y);text(`${Number(row.quantity.toFixed(2))} ${row.unit}`,350,y);right(money(row.total).replaceAll('\u00a0',' '),y);rule(y-14);y-=32;}
 text('Razem brutto',42,380,13);right(money(quote.total).replaceAll('\u00a0',' '),380,22);
 text('Plan ogrodzenia / rzut z góry',42,340,11);
 if(project.segments.length){const pts=project.segments.flatMap(s=>[s.a,s.b]);const minX=Math.min(...pts.map(p=>p.x)),minY=Math.min(...pts.map(p=>p.y)),maxX=Math.max(...pts.map(p=>p.x)),maxY=Math.max(...pts.map(p=>p.y));const scale=Math.min(480/Math.max(1,maxX-minX),165/Math.max(1,maxY-minY));
  for(const s of project.segments){const ax=52+(s.a.x-minX)*scale,ay=315-(s.a.y-minY)*scale,bx=52+(s.b.x-minX)*scale,by=315-(s.b.y-minY)*scale;content+=`0.24 0.31 0.36 RG 1.8 w ${s.kind==='fence'?'[]':'[5 3]'} 0 d ${ax} ${ay} m ${bx} ${by} l S [] 0 d\n`;}
 }else text('Pusty projekt',42,300);
 text('Szacunek nie stanowi oferty ani zamówienia. Wymaga potwierdzenia przez sprzedawcę.',42,116,9);
 text('Bez montażu, transportu i fundamentów. Wybrana automatyka jest ujęta w tabeli.',42,101,9);
 text('Poziomy gruntu są orientacyjne; model terenu nie zastępuje pomiarów działki.',42,86,9);
 text('Zapytania: tadekkw123@gmail.com',42,62,10);finish();
 for(let begin=0;begin<project.segments.length;begin+=25){text('Geometria i poziomy gruntu',42,785,20);text('Poziomy A i B względem umownego 0,00 m; długości w rzucie poziomym.',42,758,9);rule(743);text('Nr / typ',42,721);text('Długość',228,721);text('Grunt A',338,721);text('Grunt B',437,721);rule(709);let rowY=686;
  project.segments.slice(begin,begin+25).forEach((s,i)=>{text(`${begin+i+1}. ${s.kind==='fence'?'Ogrodzenie':s.kind==='gate'?'Brama':'Furtka'}`,42,rowY);text(`${length(s).toFixed(2)} m`,228,rowY);text(`${elevation(s.a).toFixed(2)} m`,338,rowY);text(`${elevation(s.b).toFixed(2)} m`,437,rowY);rowY-=23;});finish();}
 const objects:Uint8Array[]=[];const add=(s:string|Uint8Array)=>{objects.push(typeof s==='string'?enc.encode(s):s);return objects.length;};
 const stream=(data:Uint8Array,extra='')=>join([enc.encode(`<< /Length ${data.length} ${extra} >>\nstream\n`),data,enc.encode('\nendstream')]);
 add('');add('');const fontData=add(stream(fontBytes,`/Length1 ${fontBytes.length}`));
 const descriptor=add(`<< /Type /FontDescriptor /FontName /LiberationSans /Flags 32 /FontBBox [-600 -400 2200 1200] /ItalicAngle 0 /Ascent 905 /Descent -212 /CapHeight 700 /StemV 80 /FontFile2 ${fontData} 0 R >>`);
 const toUnicode=['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap','/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def','/CMapName /Unicode def','/CMapType 2 def','1 begincodespacerange','<0000> <FFFF>','endcodespacerange'];
 const entries=[...used.entries()];for(let i=0;i<entries.length;i+=90){const chunk=entries.slice(i,i+90);toUnicode.push(`${chunk.length} beginbfchar`,...chunk.map(([g,c])=>`<${g.toString(16).padStart(4,'0')}> <${c.toString(16).padStart(4,'0')}>`),'endbfchar');}toUnicode.push('endcmap','CMapName currentdict /CMap defineresource pop','end','end');
 const unicode=add(stream(enc.encode(toUnicode.join('\n'))));
 const cid=add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /LiberationSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /CIDToGIDMap /Identity /W [${entries.map(([g])=>`${g} [${width(g).toFixed(2)}]`).join(' ')}] >>`);
 const font=add(`<< /Type /Font /Subtype /Type0 /BaseFont /LiberationSans /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${unicode} 0 R >>`);
 const pageIds=pages.map(p=>{const data=add(stream(enc.encode(p)));return add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${data} 0 R >>`);});
 objects[0]=enc.encode('<< /Type /Catalog /Pages 2 0 R >>');objects[1]=enc.encode(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] >>`);
 const parts=[enc.encode('%PDF-1.7\n')],offsets=[0];let size=parts[0].length;
 objects.forEach((obj,i)=>{offsets.push(size);const bytes=join([enc.encode(`${i+1} 0 obj\n`),obj,enc.encode('\nendobj\n')]);parts.push(bytes);size+=bytes.length;});
 parts.push(enc.encode(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${size}\n%%EOF`));return join(parts);
}
