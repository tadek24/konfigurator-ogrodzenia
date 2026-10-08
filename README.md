# Ogrodzenia / edytor CAD i oferta handlowca

Next.js 16, TypeScript i React Three Fiber. Zmiany połączono z wersją 0.4: zachowano teren, przeciąganie otworów, modele bram, zdjęcia i trasy pomocnicze.

## Uruchomienie

Node.js 20.9+. `npm ci`, następnie `npm run dev -- --port 3101`. Otwórz http://127.0.0.1:3101. Produkcja: `npm run build`, potem `npm start -- --port 3101`.

## Rysowanie i wymiary

- Odcinek (L), brama (G), furtka (F): kliknij początek i koniec. Możesz też podać dokładną długość i kierunek oraz wybrać „Wstaw według wymiarów”. Typowe pola obsługują 30 m; model importu i rysowanie odręczne zachowują zakres do 200 m.
- ORTO / F8 wymusza osie. Wyłącz ORTO, aby rysować dowolne kąty. Przyciąganie do siatki 0,5 m działa niezależnie.
- Przy rysowaniu widać długość, kierunek i łuk. Kliknięcie wartości kąta albo przycisku „Zablokuj kąt” uruchamia blokadę. Kółko zmienia wtedy kierunek o 1°, Shift + kółko o 5°, Ctrl + kółko o 0,1°. Bez aktywnej blokady kółko przybliża plan.
- Kierunki na planie: 0° w prawo, 90° w dół, zgodnie z ruchem wskazówek zegara. Narożniki pokazują mniejszy rzeczywisty kąt między wychodzącymi odcinkami; proste połączenie ma 180°.
- Przełączniki „Długości” i „Kąty” ograniczają liczbę opisów. PDF zawsze zawiera informacje techniczne.
- Zmiana długości/kąta przesuwa wspólny węzeł sąsiadów, zachowując poziomy terenu. Operacja jest odrzucana, jeśli spowodowałaby odcinek krótszy niż 0,25 m lub przekroczenie zakresu modelu.
- V: wybór, Esc: zakończenie. Ctrl+Z / Ctrl+Shift+Z: cofnij / ponów. Delete: usuń. Alt lub środkowy przycisk + przeciągnięcie: przesunięcie planu.
- Poziomy gruntu A/B: -20 do 20 m. Teren 3D jest interpolacją, nie pomiarem geodezyjnym.
- Bramy i furtki można wstawiać w istniejące przęsła albo przeciągać z biblioteki. Zachowano modele przesuwne/rozwierne i sprawdzanie zgodności automatyki.

## Katalog i modele

Zakładka „Produkty” i `/admin` udostępniają ten sam katalog lokalny. Karty rozwija się do edycji. Kategorie: przęsła, słupy, podmurówki/fundamenty, bramy, furtki, automatyka, dodatki. Można zmieniać ceny netto, sposób rozliczenia, wygląd, parametry, zdjęcia, dostępność i warianty szerokości/wysokości/koloru/ceny.

Produkty wyłączone pozostają w istniejących projektach, ale nie są proponowane w wyborze nowych produktów. Musi pozostać co najmniej jeden aktywny system ogrodzenia. Zdjęcia z pliku: PNG/JPEG/WebP do 400 KB; adresy zdalne HTTPS. Katalog i oferta zapisują się lokalnie. Geometrię zapisuje się przyciskiem „Zapisz” i wznawia świadomie przy ponownym otwarciu.

`segment-model.ts` rozstrzyga wspólne parametry dla 2D, 3D i PDF. Zmiana wariantu ustawia długość, a wysokość i kolor są pobierane z aktualnego katalogu; ręczne parametry odcinka mają pierwszeństwo. Podmurówki i dodatki mają uproszczone modele 3D i oznaczenia 2D. Automatyka jest widoczna na modelu bramy. Modele są poglądowe.

## Oferta handlowca i PDF

Handlowiec edytuje nazwy, ilości, jednostki i ceny pozycji. „Reset / usuń” przywraca kalkulację pozycji systemowej lub usuwa pozycję dodatkową. Pozycję systemową można wyłączyć ilością 0. Można dodać montaż, transport, fundamenty, dodatki i własne pozycje. Rabat procentowy nalicza się od całej wartości netto, następnie odejmuje rabat kwotowy; rabat nie przekracza wartości oferty. VAT nalicza się od netto po rabacie, z zaokrągleniem do groszy.

„Pobierz ofertę PDF” tworzy PDF bezpośrednio, z polską czcionką, danymi firmy/logo, klientem, warunkami, materiałami/usługami, zdjęciami, rabatami, netto/VAT/brutto, uwagami, planem 2D z kierunkami/łukami i tabelą wymiarów/poziomów. Podgląd 3D jest dołączany, jeśli wcześniej otwarto model i uzyskano aktualny obraz. Po zmianie projektu/katalogu stary obraz jest unieważniany. Zdjęcia HTTPS wymagają CORS; niedostępne zdjęcia są pomijane z komunikatem. Widok drukowania jest opcją dodatkową.

Snapshot JSON i PDF utrwalają aktualny katalog, geometrię, korekty i ceny. Późniejsze zmiany katalogu nie zmieniają pobranej oferty. Ceny demonstracyjne są traktowane jako **netto**; starszy lokalny cennik opisany jako brutto trzeba zweryfikować przed przygotowaniem rzeczywistej oferty.

## Integracje i ograniczenia

- `CatalogSource` / `LocalCatalogSource`: adapter danych z identyfikatorem firmy i kluczami zapisu per firma. Docelowy adapter HTTP może być wspólny dla WordPressa i konfiguratora. UI demo korzysta z firmy `demo`.
- `PricingEngine`: wymienna kalkulacja bazowych pozycji. Reguły z Excela mogą dostarczyć pozycje bez zmiany korekt, rabatów, VAT i eksportu.
- Widok roli administrator/handlowiec/cennik jest miejscem pod przyszłe uprawnienia; nie realizuje uwierzytelniania ani zabezpieczeń. Izolacja firm i autoryzacja wymagają backendu.
- Zachowano trasę `/api/inquiries` i wcześniejszy generator zapytań materiałowych. Nie wysyłają automatycznie nowych finalnych ofert. WordPress, baza i reguły konkretnej firmy nie są jeszcze podłączone.
- Istniejący film i instrukcja PDF opisują wersję 0.4; aktualna obsługa jest opisana tutaj.

## Sprawdzanie

`npm test`, `npm run typecheck`, `npm run build`.

Testy obejmują geometrię, otwory/teren, 30 m, kąty i kółko, warianty, walidację katalogu/oferty, usługi/własne pozycje, korekty, rabaty, snapshoty, silnik cen i oba generatory PDF (polskie znaki, strony, obrazy i ponowne otwarcie).
