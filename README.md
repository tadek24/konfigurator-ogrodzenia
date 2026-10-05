# LINE / konfigurator ogrodzeń

Pierwszy działający fundament w Next.js App Router, TypeScript, React i React Three Fiber.

## Uruchomienie

Node.js 20.9 lub nowszy.

```sh
npm install
npm run dev
```

Otwórz http://127.0.0.1:3000. `npm run build` buduje wersję produkcyjną, `npm start` ją uruchamia. `npm run typecheck` sprawdza typy, `npm test` sprawdza kalkulację i walidację importu.

## Obsługa

- Ołówek (L): klikaj punkty kolejnych odcinków. Esc kończy rysowanie.
- Wybór (V): kliknij odcinek na planie albo na liście.
- Panel właściwości: typ elementu, długość, produkt, wysokość i kolor.
- Ctrl+Z / Ctrl+Shift+Z: cofnij / ponów. Delete: usuń zaznaczenie.
- Przyciąganie: siatka 0,5 m i wyrównanie do osi poprzedniego punktu.
- 3D: obrót przez przeciąganie i zoom kółkiem myszy. Wymaga WebGL.
- Zapis automatyczny w localStorage, eksport i import JSON; nowy projekt nie usuwa pobranych plików.
- Produkty: lokalna edycja cen przykładowych. Wycena: zestawienie i eksport projektu z kalkulacją.

## Model i granice pierwszej wersji

`src/lib/project.ts` definiuje wersjonowany projekt, katalog, walidację i czystą funkcję kalkulacji. `workspace.tsx` zarządza stanem edytora, `scene.tsx` generuje model 3D ze wspólnych odcinków. Domyślny przykład to otwarte ogrodzenie o długości 44 m. Ceny są demonstracyjne brutto: przęsła za metr, brama i furtka za sztukę, słupki z podziału na moduły. Wysokość i kolor nie wpływają jeszcze na cenę. Kalkulacja nie uwzględnia montażu, fundamentów, transportu, przycięć i automatyki. Model panelowy 3D jest uproszczony. Końce odcinków są niezależne: zmiana długości nie przesuwa sąsiadów. Odcinki rysowane niezależnie mogą na siebie nachodzić; walidacja kolizji jest kolejnym etapem.

To aplikacja lokalna bez uwierzytelniania i serwera danych. Nie ma jeszcze wysyłki e-mail ani zdjęć produktów. Nie należy publikować panelu jako produkcyjnego panelu sprzedawcy przed dodaniem logowania i autoryzacji. Zapis zależy od przeglądarki i adresu strony; eksport JSON jest przenośną kopią. Czcionki z Google Fonts mają systemowe zamienniki.

## Kolejne integracje

1. Baza: firmy, użytkownicy, produkty, cenniki, projekty i wyceny; izolacja danych firm.
2. Panel sprzedawcy: uwierzytelnianie, zdjęcia/tekstury/model GLB i cenniki wymiarowe.
3. Endpoint wyceny: serwer ponownie oblicza cenę z zaufanego katalogu; e-mail, walidacja kontaktu i ograniczanie nadużyć.
4. Rozbudowa CAD: wspólne węzły, przeciąganie, kąty, przesuwanie planu, otwory w odcinku i kontrola kolizji.
5. Vercel: import repozytorium jako Next.js, standardowe ustawienia build. Domena własna nie jest wymagana; wdrożenie nie jest częścią tej wersji.
