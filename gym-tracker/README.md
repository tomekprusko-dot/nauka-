# Ławka 120

Appka (PWA) do 8-tygodniowego planu "wyciskanie 120 kg + klatka".
Instaluje się na telefonie jak zwykła appka, działa bez internetu,
a treningi synchronizują się przez Supabase.

- **Trening**: tygodnie 1–8, dni A (sobota), B (niedziela) i pompki w domu.
  Ciężary wyciskania są wpisane z planu; przy ćwiczeniach dodatkowych appka
  pamięta ostatni ciężar i podpowiada, kiedy dołożyć. Po odhaczeniu serii
  startuje minutnik przerwy z sygnałem dźwiękowym.
- **Tydzień 8**: test maksa z rozgrzewką i kolejnymi próbami.
- **Postęp**: plan a wykonanie, szacowany maks, historia ćwiczeń.
- **Więcej**: konto, wskazówki z planu i kopia zapasowa (eksport/import JSON).
- **Własne nazwy ćwiczeń**: ołówek przy nazwie. Historia i podpowiedzi ciężarów
  zostają, a nazwa synchronizuje się jak treningi (wiersz `settings` w bazie).

Adres po wdrożeniu: https://tomekprusko-dot.github.io/nauka-/lawka/

## Konfiguracja Supabase (jednorazowo)

1. Załóż darmowe konto na https://supabase.com i utwórz projekt (region np. Frankfurt).
2. **SQL Editor → New query**: wklej `supabase/schema.sql` i kliknij **Run**.
   Powstanie tabela `workout_logs` z regułami RLS (każdy widzi tylko swoje treningi).
3. **Authentication → URL Configuration → Site URL**: wpisz adres appki
   (`https://tomekprusko-dot.github.io/nauka-/lawka/`), żeby link
   potwierdzający z maila prowadził do appki.
4. **Project Settings → API**: skopiuj *Project URL* i klucz *anon public*
   do `src/config.js`. Klucza `service_role` nigdy nie wklejaj do appki.

Bez tej konfiguracji appka działa w trybie lokalnym (dane tylko na telefonie).

## Instalacja na iPhonie

Otwórz adres appki w **Safari** → **Udostępnij** → **Do ekranu początkowego**.

## Uruchomienie lokalnie

```bash
npm install
npm run dev
```

## Wdrożenie

Workflow `.github/workflows/deploy-pages.yml` buduje appkę i publikuje ją na
GitHub Pages po każdym wypchnięciu na główną gałąź repozytorium.
W ustawieniach repo: **Settings → Pages → Source: GitHub Actions**.

## Gdzie co jest

- `src/data/plan.js`: cały plan (ćwiczenia, serie, progresja). Tu zmieniasz plan.
- `src/utils/training.js`: logika (podpowiedzi ciężarów, postęp, test maksa).
- `src/sync/supabase.js`: logowanie i rozmowa z bazą.
- `src/sync/syncQueue.js`: kolejka zapisów (łączenie zmian, praca offline).
- `src/utils/storage.js`: lokalna kopia danych (localStorage).
- `public/sw.js`, `public/manifest.webmanifest`: to, co robi z tego appkę (PWA).
- `public/icons/logo.svg`: logo; z niego powstały ikony PNG.
- `supabase/schema.sql`: tabela i reguły bezpieczeństwa w bazie.
