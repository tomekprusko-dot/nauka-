# Typer ESA 2026/27

Aplikacja (PWA) do typowania wyników meczy PKO BP Ekstraklasy 2026/27 w
gronie zaproszonych osób. Działa w przeglądarce na iOS i Androidzie i można
ją dodać do ekranu głównego jak natywną aplikację.

## Status projektu

**Etap 2: prawdziwy backend.** Logowanie, terminarz, typy, typy specjalne
(mistrz Polski + król strzelców) i ranking działają na współdzielonej bazie
danych (Supabase Postgres) — dane są wspólne dla wszystkich urządzeń, nie
lokalne w przeglądarce. Sesja logowania to podpisane, bezpieczne ciasteczko;
wszystkie zapisy przechodzą przez Server Actions z autoryzacją po stronie
serwera (`src/app/*/actions.ts`, `src/lib/auth.ts`, `src/lib/db.ts`).

Logowanie odbywa się przez imię + kod dostępu (bez adresu e-mail — pole
`email` w bazie jest opcjonalne i nieużywane w UI).

Lista drużyn w `src/data/teams.ts` to prawdziwa stawka 18 klubów sezonu
2026/27. Terminarz w `src/data/fixtures.ts` (34 kolejki, 306 meczów) ma
prawdziwe pary dla kolejek 1-7 (sezon ruszył 24 lipca 2026, dane zebrane
z publicznych źródeł) — kolejki 1-5 mają już wyniki w bazie, 6-7 czekają
na rozegranie. Kolejka 8 i dalsze są nadal wygenerowane algorytmem systemu
kołowego jako przykładowe. Podmień je na pełny oficjalny terminarz
PZPN/Ekstraklasa.org i wypchnij zmianę — Vercel zbuduje nową wersję
automatycznie.

## Uruchomienie lokalnie

Skopiuj `.env.local.example` do `.env.local` i uzupełnij danymi swojego
projektu Supabase (zobacz `supabase/schema.sql` po schemat bazy).

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

`supabase/schema.sql` zakłada jedno konto administratora (Tomek). Pozostałych
graczy dodaje się przez panel `/admin` (samo imię + kod dostępu).

Typerzy wybierają tylko zwycięzcę albo remis (1/X/2), bez dokładnego wyniku
bramkowego. Admin (`/admin`) dodaje/usuwa zaproszone osoby (samo imię + kod
dostępu, działa od razu na dowolnym urządzeniu) oraz wpisuje dokładne wyniki
meczów (na ich podstawie apka sama wylicza, czy typ 1/X/2 był trafiony) i
wyniki specjalne na koniec sezonu, na podstawie których liczony jest ranking
(3 pkt za trafiony typ zwycięzcy/remisu, +10 pkt za trafionego mistrza
Polski, +10 pkt za trafionego króla strzelców).

## Wdrożenie

Aplikacja jest wdrożona na [Vercel](https://vercel.com). Root Directory
projektu w ustawieniach Vercel musi być ustawiony na `cl-typer` (bo repo
zawiera też inne, niepowiązane projekty). Wymagane zmienne środowiskowe
(Project Settings → Environment Variables):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS,
  Server Actions)
- [Supabase](https://supabase.com) (Postgres, przez `service_role` klucz —
  bez Supabase Auth, logowanie własne oparte o imię + kod dostępu)
