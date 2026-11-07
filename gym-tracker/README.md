# Trening: wyciskanie 120 kg

Appka do prowadzenia 8-tygodniowego planu "wyciskanie 120 kg + klatka".

- **Trening**: tygodnie 1–8, dni A (sobota), B (niedziela) i pompki w domu.
  Ciężary wyciskania są wpisane z planu, a przy ćwiczeniach dodatkowych appka
  pamięta ostatni ciężar i podpowiada, kiedy dołożyć. Po odhaczeniu serii
  startuje minutnik przerwy.
- **Tydzień 8**: test maksa z rozgrzewką i kolejnymi próbami.
- **Postęp**: plan a wykonanie, szacowany maks, historia ćwiczeń.
- **Więcej**: wskazówki z planu i kopia zapasowa danych (eksport/import JSON).

Dane zapisują się w `localStorage` przeglądarki.

## Uruchomienie

```bash
npm install
npm run dev
```

## Gdzie co jest

- `src/data/plan.js`: cały plan (ćwiczenia, serie, progresja). Tu zmieniasz plan.
- `src/utils/training.js`: logika (podpowiedzi ciężarów, postęp, test maksa).
- `src/utils/storage.js`: zapis i odczyt danych.
- `src/components/`: widoki i elementy interfejsu.
