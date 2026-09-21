# English News Stack — frontend

Aplikacja do nauki angielskiego: stos wiadomości ze świata i o Polsce (w
języku angielskim, dopasowany do poziomu CEFR) + fiszki ze słówkami
zapisywanymi bezpośrednio z artykułów.

Wymaga uruchomionego backendu z `../english-news-backend` (patrz jego
README po konfigurację klucza Anthropic API).

## Uruchomienie

```bash
cp .env.example .env.local   # ustaw VITE_API_URL, jeśli backend nie jest na :3001
npm install
npm run dev
```

## Funkcje

- **Stos wiadomości** — lista nieprzeczytanych artykułów z wybranego
  poziomu (A2–C1): 3-punktowe streszczenie, rozwijany uproszczony tekst,
  klikalne słówka z tłumaczeniem, przycisk „Przeczytane”.
- **Słówka** — fiszki z powtórkami metodą pudełek Leitnera (Again / Good /
  Easy), lista wszystkich zapisanych słówek.
- Wybrany poziom jest zapamiętywany w `localStorage`.
