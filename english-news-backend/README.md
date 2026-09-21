# English News Backend

Pobiera newsy z RSS (BBC, NPR, Al Jazeera + angielskojęzyczne newsy o Polsce
z Notes from Poland i The First News), a następnie generuje przez Claude API:

- 3-punktowe streszczenie ("pigułkę") dopasowane do poziomu CEFR,
- uproszczoną wersję artykułu (100–180 słów) na wybranym poziomie,
- listę 6–10 słówek z tłumaczeniem na polski i angielską definicją.

Wynik jest cache'owany lokalnie w `data/db.json`, więc każdy artykuł jest
podsumowywany przez model tylko raz na dany poziom.

## Konfiguracja

```bash
cp .env.example .env
# wklej swój klucz z https://console.anthropic.com/ do ANTHROPIC_API_KEY
npm install
npm run dev
```

Serwer wystartuje na `http://localhost:3001` i będzie automatycznie
odświeżał kanały RSS zgodnie z `REFRESH_CRON` (domyślnie co 3h). Możesz też
odświeżyć ręcznie: `npm run refresh` albo `POST /api/refresh`.

## Endpointy

- `GET /api/articles?level=B1&limit=10` — stos nieprzeczytanych artykułów
  wraz ze streszczeniem (generowane w locie, jeśli brakuje dla danego poziomu)
- `POST /api/articles/:id/read` — oznacz jako przeczytany
- `POST /api/refresh` — ręczne pobranie nowych newsów z RSS
- `GET /api/vocab` / `GET /api/vocab/due` — zapisane słówka / te do powtórki
- `POST /api/vocab` — zapisz słówko do fiszek
- `POST /api/vocab/:id/review` — `{ "quality": "again"|"good"|"easy" }`,
  aktualizuje harmonogram powtórek (system pudełek Leitnera)
- `DELETE /api/vocab/:id`

## Uwagi

- Baza danych to zwykły plik JSON (`data/db.json`, lowdb) — wystarczający dla
  jednego użytkownika, bez potrzeby stawiania osobnej bazy danych.
- Lista kanałów RSS jest w `src/feeds.js` — dodawaj/usuwaj wg uznania.
- Do wdrożenia produkcyjnego potrzebny jest host uruchamiający Node.js
  z możliwością trzymania sekretu (`ANTHROPIC_API_KEY`) — np. Render, Fly.io,
  Railway. Samego frontu nie da się hostować na czysto statycznym hostingu
  (np. GitHub Pages), bo potrzebuje działającego backendu.
