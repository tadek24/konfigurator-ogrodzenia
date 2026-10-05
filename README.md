# Ogrodzenia / edytor CAD - wersja 0.2

Next.js 16, TypeScript i React Three Fiber. Rysunek 2D i scena 3D korzystają z tych samych odcinków.

## Uruchomienie

Node.js 20.9+.

```sh
npm ci
npm run dev -- --port 3101
```

Adres: http://127.0.0.1:3101. Wersja produkcyjna: `npm run build`, potem `npm start -- --port 3101`.

## Edytor

- Start zawsze od pustego rysunku. Zapisany projekt wznawia się świadomie przyciskiem; stary przykład z wersji 0.1 nie otwiera się automatycznie.
- Odcinek (L), brama (G), furtka (F): kliknij początek i koniec lub kierunek. Otwory mają długość z pola szerokości.
- Otwór w istniejącym ogrodzeniu: zaznacz odcinek, podaj szerokość i odległość od A, wybierz Wstaw bramę lub Wstaw furtkę. Fragment ogrodzenia zostaje zastąpiony otworem.
- V: wybór, Esc: zakończ rysowanie. Ctrl+Z / Ctrl+Shift+Z: cofnij / ponów. Delete: usuń.
- ORTO / F8: kierunki poziome i pionowe. Przyciąganie: siatka 0,5 m oraz istniejące końce. Alt + przeciągnij albo środkowy przycisk: przesuń plan. Kółko: zoom.
- Współrzędne w metrach. Poziomy gruntu A/B od -20 do 20 m względem umownego 0,00 m. Zmiana poziomu aktualizuje wszystkie końce w tej samej pozycji.
- Podgląd 3D: jasne niebo, światło, cienie, interpolowana powierzchnia terenu. Przęsła pokazują spadek, bramy i furtki pozostają poziome i wskazują potrzebę sprawdzenia prześwitu. Teren jest przybliżeniem z poziomów odcinków, nie mapą geodezyjną. Model panelowy jest uproszczony.
- Wycena pobiera rzeczywisty PDF z polskimi znakami, planem, materiałami i poziomami gruntu. JSON służy do zapisu i importu geometrii.

## Panel sprzedawcy /admin

W osobnym panelu: nazwa systemu, szerokość przęsła (0,25-6 m), rozliczenie za metr lub pełny moduł, cena przęsła, słupka, bramy i furtki. Przy naliczaniu za moduł końcowe przycięte przęsło jest liczone jako pełne. Słupki i 3D uwzględniają rzeczywistą szerokość modułów, nie równy podział całego odcinka.

Panel jest nadal lokalny, bez logowania: ustawienia zapisują się w localStorage tej przeglądarki i tego adresu. Otwiera się w osobnej karcie, żeby nie gubić rysunku. Po powrocie do konfiguratora ceny odświeżają się. Publikacja wielofirmowa wymaga uwierzytelniania, autoryzacji oraz zaufanego katalogu na serwerze. Zdjęcia i modele produktów pozostają następnym etapem.

## Zapytania e-mail

Odbiorca jest ustalony po stronie serwera: **tadekkw123@gmail.com**. Klient podaje kontakt i uwagi, a serwer dołącza PDF oraz geometrię JSON. Projekt jest zapytaniem, nie zamówieniem ani płatnością. Nie ma koszyka.

Automatyczna wysyłka jest przygotowana przez Resend REST API bez dodatkowych zależności. Aby ją uruchomić, skopiuj `.env.example` do `.env.local` i ustaw `RESEND_API_KEY` oraz `QUOTE_FROM` (nadawca dopuszczony w koncie Resend). W Vercel ustaw te same zmienne po stronie serwera. Klucza nie dodawaj do repozytorium ani do zmiennych NEXT_PUBLIC. Dokumentacja: https://resend.com/docs/api-reference/emails/send-email

Przed konfiguracją przycisk wysyłania jest nieaktywny, a Przygotuj e-mail otwiera klienta pocztowego z adresatem i treścią. PDF trzeba wtedy dołączyć ręcznie. API zwraca sukces dopiero po otrzymaniu identyfikatora wiadomości od usługi; oznacza przyjęcie do wysyłki, nie gwarancję dotarcia do skrzynki. Integracja nie została przetestowana z prawdziwą skrzynką, ponieważ nie dostarczono klucza usługi.

Endpoint waliduje kontakt, geometrię i katalog, nie pozwala zmienić odbiorcy, ma honeypot, sprawdzenie Origin, limit rozmiaru oraz podstawowy limit 3 prób / e-mail / 10 minut w pamięci procesu. Ten limit nie jest rozproszony - przed publicznym wdrożeniem należy dodać trwałą kontrolę nadużyć. Ceny z lokalnego katalogu są informacją od klienta, nie zaufaną ofertą; sprzedawca musi je potwierdzić. Docelowy backend powinien wyliczać je z własnej bazy.

## Sprawdzenie

`npm run build`, `npm run typecheck`, `npm test`. Testy obejmują zastępowanie odcinka otworem, wspólne poziomy gruntu, rozliczenie modułów, walidację katalogu i zapytania oraz strukturę i paginację PDF. PDF ma osadzoną czcionkę Liberation Sans (licencja w public/fonts/LICENSE_LIBERATION).

## Następny etap

Konta i katalog w bazie; trwale zapisywane zapytania ze statusem; wysyłka z potwierdzeniem doręczenia; przeciąganie wspólnych węzłów i walidacja kolizji; pomiary i bardziej szczegółowe modele. Zamówienia oraz płatności można dodać jako osobny etap po zaakceptowaniu wyceny.
