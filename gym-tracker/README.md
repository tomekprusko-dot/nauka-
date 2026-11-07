# Trening: wyciskanie 120 kg

Appka do prowadzenia 8-tygodniowego planu "wyciskanie 120 kg + klatka".

- **Trening**: tygodnie 1–8, dni A (sobota), B (niedziela) i pompki w domu.
  Ciężary wyciskania są wpisane z planu, a przy ćwiczeniach dodatkowych appka
  pamięta ostatni ciężar i podpowiada, kiedy dołożyć. Po odhaczeniu serii
  startuje minutnik przerwy.
- **Tydzień 8**: test maksa z rozgrzewką i kolejnymi próbami.
- **Postęp**: plan a wykonanie, szacowany maks, historia ćwiczeń.
- **Więcej**: wskazówki z planu i kopia zapasowa danych (eksport/import JSON).

Gdy appka działa w Claude, wpisy zapisują się na koncie (baza `db` artifactu,
kolekcja `logs`, jeden dokument na trening, np. `3-A`). Poza Claude, np. przy
`npm run dev`, zapis idzie tylko do `localStorage` przeglądarki.

Opublikowana wersja: https://claude.ai/artifact/9DfieVzkLaKuFaNyCdatZv

## Uruchomienie

```bash
npm install
npm run dev
```

## Wersja do Claude

```bash
npm run build:artifact
```

Powstaje jeden plik `dist-artifact/gym-tracker.html`. React ładuje się w nim
z CDN (cdnjs), a cały kod appki i style są wklejone do środka.

## Gdzie co jest

- `src/data/plan.js`: cały plan (ćwiczenia, serie, progresja). Tu zmieniasz plan.
- `src/utils/training.js`: logika (podpowiedzi ciężarów, postęp, test maksa).
- `src/utils/storage.js`: lokalna kopia danych (localStorage).
- `src/utils/cloud.js`: zapis na koncie Claude (kolejka zapisów, łączenie zmian).
- `src/components/`: widoki i elementy interfejsu.
