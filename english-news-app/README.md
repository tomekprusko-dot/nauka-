# English News Stack

Aplikacja do nauki angielskiego: stos wiadomości ze świata i o Polsce
(napisanych po angielsku, dopasowanych do Twojego poziomu CEFR) + fiszki ze
słówkami zapisywanymi bezpośrednio z artykułów.

Jeden projekt = frontend (React/Vite) i backend (funkcje serverless w
`api/`) razem, gotowy do wdrożenia na Vercelu.

## Jak to jest zbudowane

- `src/` — interfejs (React). W przeglądarce woła po prostu `/api/...`.
- `api/` — małe funkcje backendowe, każda w osobnym pliku. Vercel uruchamia
  każdą z nich osobno, na żądanie (tzw. *serverless functions*):
  - `api/articles` — stos artykułów + generowanie streszczeń przez Claude
  - `api/refresh` — pobranie nowych newsów z RSS (wywoływane też
    automatycznie raz dziennie, patrz `vercel.json`)
  - `api/vocab` — zapisane słówka i powtórki (pudełka Leitnera)
- `api/_lib/` — wspólna logika (lista kanałów RSS, prompt do Claude, zapis
  do bazy) używana przez powyższe funkcje.

## Dlaczego to nie jest "tylko statyczna strona"

W przeciwieństwie do prostszych apek w tym repo, ta aplikacja sama pobiera
dane z internetu i woła płatne API (Claude), więc potrzebuje: (1) miejsca
do uruchomienia kodu backendu i (2) miejsca do zapamiętania pobranych
artykułów i słówek między odwiedzinami. Oba są darmowe na Vercelu (w
granicach hojnego darmowego planu) — jedyny realny koszt to pojedyncze
grosze za wywołania Claude.

## Wdrożenie na Vercel (za darmo)

1. **Załóż konto** na [vercel.com](https://vercel.com) (może być przez GitHub).
2. **Zaimportuj to repozytorium** jako nowy projekt (Vercel sam wykryje, że
   to Vite + funkcje w `api/`).
3. **Dodaj bazę danych**: w projekcie → zakładka *Storage* → *Create
   Database* → wybierz dostawcę Redis (np. Upstash) → połącz z projektem.
   Vercel sam doda potrzebne zmienne środowiskowe (`KV_REST_API_URL`,
   `KV_REST_API_TOKEN`) — nie musisz nic kopiować ręcznie.
4. **Dodaj zmienną środowiskową** `ANTHROPIC_API_KEY` (Project Settings →
   Environment Variables) — klucz weź z
   [console.anthropic.com](https://console.anthropic.com/).
5. **Deploy**. Gotowe — Vercel będzie też sam odświeżał newsy raz dziennie
   (harmonogram w `vercel.json`, sekcja `crons`).

Bez kroku 3 (baza danych) aplikacja też zadziała, ale zapamiętane
artykuły/słówka mogą znikać między wizytami — backend używa wtedy
tymczasowej pamięci zamiast trwałego zapisu.

## Development lokalnie

```bash
npm install
npm i -g vercel        # jeśli nie masz
vercel link             # połącz folder z projektem na Vercel (raz)
vercel env pull .env.local   # ściągnij klucze (ANTHROPIC_API_KEY, KV_*)
npm run dev              # uruchamia frontend + funkcje api/ razem
```

Jeśli chcesz tylko grzebać w samym interfejsie (bez backendu), `npm run
dev:vite-only` odpali sam frontend, ale wywołania do `/api/...` nie będą
działać.

## Limity darmowego planu Vercel, o których warto wiedzieć

- Zaplanowane odświeżanie newsów (*cron*) na darmowym planie może się
  uruchamiać maksymalnie raz dziennie — stąd `"0 6 * * *"` w
  `vercel.json` (6:00 UTC). Możesz to zmienić na inną godzinę.
  Odświeżyć ręcznie zawsze możesz przyciskiem w interfejsie.
- Pojedyncze wywołanie funkcji ma domyślnie limit czasu — stąd
  `SUMMARIZE_BATCH_SIZE=4` (tyle artykułów podsumowujemy na raz) i
  `maxDuration: 60` ustawione dla dwóch najcięższych funkcji w
  `vercel.json`.
