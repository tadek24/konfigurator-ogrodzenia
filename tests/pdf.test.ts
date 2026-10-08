import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {quotePdf} from '../src/lib/quote-pdf';
import {initialProject,products} from '../src/lib/project';
test('PDF contains embedded font, unicode mapping and correct page count',()=>{const font=new Uint8Array(readFileSync('public/fonts/LiberationSans-Regular.ttf'));const pdf=quotePdf({...initialProject,name:'Żółć i Łódź',segments:[{id:'f',kind:'fence',a:{x:0,y:0,z:0},b:{x:12,y:0,z:.7}}]},products[0],font);const text=new TextDecoder().decode(pdf);assert.ok(text.startsWith('%PDF-1.7'));assert.ok(text.endsWith('%%EOF'));assert.ok(text.includes('/Count 2'));assert.ok(text.includes('/ToUnicode'));assert.ok(text.includes('<0141>'));assert.ok(pdf.length>130000);});
test('large geometry paginates instead of overflowing the PDF',()=>{const font=new Uint8Array(readFileSync('public/fonts/LiberationSans-Regular.ttf'));const pdf=quotePdf({...initialProject,segments:Array.from({length:51},(_,i)=>({id:String(i),kind:'fence' as const,a:{x:i,y:0},b:{x:i+1,y:0}}))},products[0],font);assert.ok(new TextDecoder().decode(pdf).includes('/Count 4'));});
