import {category,length,type Product,type Project,type Segment} from './project';
import {elevation} from './geometry';
export const installationSources=[
 {title:'WIŚNIOWSKI: montaż ogrodzenia panelowego',url:'https://www.wisniowski.pl/articles/porady/jak-zamontowac-ogrodzenie-panelowe-wyjasniamy'},
 {title:'WIŚNIOWSKI: nierówny teren',url:'https://www.wisniowski.pl/articles/porady/jakie-ogrodzenia-najlepiej-sprawdza-sie-na-nierownym-terenie'},
 {title:'WIŚNIOWSKI: karty techniczne systemów',url:'https://www.wisniowski.pl/karty-techniczne'},
 {title:'Nice: dokumentacja instalatorów',url:'https://www.niceforyou.com/uk/professional-area/download'},
];
export const installationChecklist=[
 ['Pomiary i granice','Potwierdź granice, przebieg instalacji podziemnych, lokalne wymagania oraz szerokości przejazdu i przejścia. Wprowadź rzeczywiste poziomy gruntu.'],
 ['Rozstaw i mocowania','Szerokość panelu nie zawsze jest rozstawem osi słupków. Dodaj przekrój słupka, obejmy i luz zgodnie z kartą konkretnego systemu.'],
 ['Fundamenty i grunt','Dobierz fundamenty do gruntu, przemarzania, obciążeń wiatrem oraz dokumentacji systemu. Konfigurator nie wyznacza uniwersalnej głębokości ani klasy betonu.'],
 ['Betonowanie i pion','Sprawdź pion i linię słupków, zabezpiecz je podczas wiązania i odczekaj wymagany czas przed obciążeniem. Zamontuj zamknięcia słupków i przewidziane odwodnienie.'],
 ['Spadki i docinki','Wybierz montaż schodkowy albo dopuszczony przez producenta montaż po spadku. Zachowaj wymagany prześwit. Docinaj tylko elementy, dla których producent na to pozwala.'],
 ['Powłoki i połączenia','Używaj systemowych obejm, śrub i momentów dokręcania. Chroń powłoki i zabezpiecz miejsca cięcia według producenta; unikaj spawania gotowych elementów bez jego zgody.'],
 ['Bramy i furtki','Zapewnij wolną strefę ruchu, prześwit, sztywne słupy i fundament bramy. Sprawdź zawiasy, ograniczniki, rolki, zamki oraz kierunek otwierania względem posesji.'],
 ['Automatyka','Dobierz napęd do typu, masy, długości skrzydła i intensywności pracy. Zaplanuj zasilanie, uziemienie i przewody. Instalator dobiera zabezpieczenia stref zgniatania, fotokomórki i listwy bezpieczeństwa.'],
 ['Odbiór i konserwacja','Sprawdź ruch ręczny, awaryjne odblokowanie, ograniczniki i działanie zabezpieczeń. Zleć odbiór kompetentnemu instalatorowi, zachowaj instrukcje i plan przeglądów.'],
];
const cross=(a:{x:number;y:number},b:{x:number;y:number},c:{x:number;y:number})=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function installationWarnings(project:Project,catalog:Product[]){
 const notes:string[]=[];const product=catalog.find(p=>p.id===project.productId&&category(p)==='fence');if(!product)notes.push('System ogrodzenia nie istnieje w katalogu. Wybierz dostępny produkt.');
 for(const [i,s]of project.segments.entries()){const label=`Odcinek ${i+1}`;const dz=Math.abs(elevation(s.a)-elevation(s.b));
 if(s.kind==='fence'&&product){const remainder=length(s)%product.moduleWidth;if(remainder>.001&&product.moduleWidth-remainder>.001)notes.push(`${label}: końcowe przęsło wymaga docinki lub zmiany rozstawu zgodnie z systemem.`);if(dz>.05)notes.push(`${label}: spadek ${(dz/length(s)*100).toFixed(1)}%; potwierdź ${product.mounting==='steps'?'montaż schodkowy':'dopuszczenie montażu po spadku'}.`);}
 if(s.kind!=='fence'){const item=catalog.find(p=>p.id===s.openingProductId&&category(p)===s.kind);if(s.openingProductId&&!item)notes.push(`${label}: model otworu usunięty z katalogu; wybierz dostępny.`);if(item&&Math.abs(length(s)-item.moduleWidth)>.01)notes.push(`${label}: wymiar różni się od szerokości katalogowej ${item.moduleWidth} m.`);if(dz>.05)notes.push(`${label}: wyrównaj strefę ruchu i sprawdź prześwit na spadku.`);if(s.kind==='gate'&&item)notes.push(`${label}: sprawdź wolną strefę ${item.clearance??0} m (${item.gateType==='sliding'?'przesuw i przeciwwaga':'ruch skrzydeł do wnętrza posesji'}); wymiar ustala producent.`);if(s.automationId){const a=catalog.find(p=>p.id===s.automationId&&category(p)==='automation');if(!a||s.kind!=='gate'||(a.compatibleWith!=='both'&&a.compatibleWith!==(item?.gateType??'swing')))notes.push(`${label}: brak lub niezgodna automatyka. Wybierz zgodny zestaw.`);}}
 }
 let collision=false;for(let i=0;i<project.segments.length;i++)for(let j=i+1;j<project.segments.length;j++){const a=project.segments[i],b=project.segments[j];if(cross(a.a,a.b,b.a)*cross(a.a,a.b,b.b)<-1e-8&&cross(b.a,b.b,a.a)*cross(b.a,b.b,a.b)<-1e-8)collision=true;}if(collision)notes.push('Odcinki przecinają się poza wspólnym końcem. Sprawdź przebieg ogrodzenia.');
 return notes;
}
