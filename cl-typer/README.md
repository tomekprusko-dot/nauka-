# Typer Ligi Mistrzów 2026/27

Aplikacja (PWA) do typowania wyników meczy fazy ligowej Ligi Mistrzów UEFA
2026/27 w gronie zaproszonych osób. Działa w przeglądarce na iOS i Androidzie
i można ją dodać do ekranu głównego jak natywną aplikację.

## Status projektu

**Etap 2: prawdziwy backend.** Logowanie, terminarz, typy, typy specjalne
(mistrz ligi + król strzelców) i ranking działają na współdzielonej bazie
danych (Supabase Postgres) — dane są wspólne dla wszystkich urządzeń, nie
lokalne w przeglądarce. Sesja logowania to podpisane, bezpieczne ciasteczko;
wszystkie zapisy przechodzą przez Server Actions z autoryzacją po stronie
serwera (`src/app/*/actions.ts`, `src/lib/auth.ts`, `src/lib/db.ts`).

Logowanie odbywa się przez imię + kod dostępu (bez adresu e-mail — pole
`email` w bazie jest opcjonalne i nieużywane w UI).

Terminarz w `src/data/fixtures.ts` i lista drużyn w `src/data/teams.ts` to
**dane przykładowe** — prawdziwe pary meczów fazy ligowej LM 2026/27 poznamy
po losowaniu 27 sierpnia 2026. Po losowaniu wystarczy podmienić te dwa pliki
i wypchnąć zmianę — Vercel zbuduje nową wersję automatycznie.

## Uruchomienie lokalnie

Skopiuj `.env.local.example` do `.env.local` i uzupełnij danymi swojego
projektu Supabase (zobacz `supabase/schema.sql` po schemat bazy).

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

### Konta demo (z seeda w `supabase/schema.sql`)

| Osoba | Kod dostępu | Rola |
| --- | --- | --- |
| Tomek | ADMIN2026 | admin |
| Kuba | KUBA123 | użytkownik |
| Ola | OLA123 | użytkownik |

Admin (`/admin`) dodaje/usuwa zaproszone osoby (samo imię + kod dostępu,
działa od razu na dowolnym urządzeniu) oraz wpisuje wyniki meczów i wyniki
specjalne na koniec sezonu, na podstawie których liczony jest ranking
(3 pkt za dokładny wynik, 1 pkt za trafiony typ zwycięzcy/remisu, +10 pkt za
trafionego mistrza ligi, +10 pkt za trafionego króla strzelców).

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
