# Typer Ligi Mistrzów 2026/27

Aplikacja (PWA) do typowania wyników meczy fazy ligowej Ligi Mistrzów UEFA
2026/27 w gronie zaproszonych osób. Działa w przeglądarce na iOS i Androidzie
i można ją dodać do ekranu głównego jak natywną aplikację.

## Status projektu

To jest **etap 1: sam frontend**. Logowanie, terminarz, typy i ranking
działają, ale dane (osoby, typy, wyniki) są trzymane w `localStorage`
przeglądarki (`src/lib/store.ts`) — to tymczasowa "baza" zastępująca prawdziwy
backend, więc na razie działa lokalnie w jednej przeglądarce, a nie współdzielone
między urządzeniami. **Etap 2** to podpięcie prawdziwego backendu (Supabase:
autoryzacja + baza Postgres współdzielona między wszystkimi uczestnikami).

Terminarz w `src/data/fixtures.ts` i lista drużyn w `src/data/teams.ts` to
**dane przykładowe** — prawdziwe pary meczów fazy ligowej LM 2026/27 poznamy
po losowaniu 27 sierpnia 2026. Po losowaniu wystarczy podmienić te dwa pliki.

## Uruchomienie lokalnie

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

### Konta demo

| Osoba | Kod dostępu | Rola |
| --- | --- | --- |
| Tomek | ADMIN2026 | admin |
| Kuba | KUBA123 | użytkownik |
| Ola | OLA123 | użytkownik |

Admin (`/admin`) może dodawać/usuwać zaproszone osoby oraz wpisywać wyniki
meczów, na podstawie których liczony jest ranking (3 pkt za dokładny wynik,
1 pkt za trafiony typ zwycięzcy/remisu).

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- Docelowo: [Supabase](https://supabase.com) (autoryzacja + baza danych)
