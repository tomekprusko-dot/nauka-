# Rodzinka

Aplikacja (PWA) dla rodziców: ćwiczenia fizjo i neurologopedyczne, kalendarz
ćwiczeń i kalendarz kupy dla Zofii i Zuzanny. Dane są wspólne dla dwóch kont
i synchronizują się na żywo przez Supabase.

## Etapy

- [x] 0. Baza danych: tabele i zabezpieczenia RLS (`supabase/01_schema.sql`)
- [x] 1. Szkielet: logowanie kodem z maila, przełącznik dziecka, menu, PWA
- [ ] 2. Ćwiczenia: dodawanie, edycja, archiwizacja
- [ ] 3. Kalendarz ćwiczeń i ekran „Dzisiaj”
- [ ] 4. Kalendarz kupy
- [ ] 5. Szlif i instalacja

## Konfiguracja Supabase (jednorazowo)

1. https://supabase.com → **New project**. Nazwa `rodzinka`, region **Central EU (Frankfurt)**.
   Hasło do bazy wygeneruj i zapisz w menedżerze haseł (appka go nie potrzebuje).
2. **SQL Editor → New query** → wklej cały plik `supabase/01_schema.sql` → **Run**.
3. **Authentication → Users → Add user → Create new user**: wpisz swój e-mail,
   dowolne długie hasło (nie będzie używane) i zaznacz **Auto Confirm User**.
   Powtórz dla e-maila żony.
4. **SQL Editor → New query** → wklej `supabase/02_add_members.sql`, podmień
   dwa e-maile i imiona → **Run**. Na dole muszą pojawić się 2 wiersze.
5. **Authentication → Sign In / Providers**: wyłącz **Allow new users to sign up**
   (nikt obcy nie założy konta). Dostawca **Email** ma zostać włączony.
6. **Authentication → Emails → Templates → Magic Link**: zmień treść, żeby mail
   zawierał kod (appka loguje kodem, nie linkiem):
   - Subject: `Kod do aplikacji Rodzinka`
   - Body: `<h2>Twój kod logowania</h2><p style="font-size:28px"><b>{{ .Token }}</b></p><p>Wpisz go w aplikacji.</p>`
7. **Project Settings → API Keys** (lub **Data API**): skopiuj **Project URL**
   i klucz **anon public** (albo **publishable**). Klucza `service_role` / `secret`
   nigdy nie wklejaj do appki.

**Maile z kodem.** Wbudowana poczta Supabase wysyła tylko kilka maili na
godzinę i tylko na adresy członków zespołu w organizacji Supabase. Dlatego
dodaj żonę do zespołu: **Organization → Team → Invite**. Zalogujecie się
rzadko (sesja jest pamiętana), więc ten limit nie przeszkadza. Jeśli kiedyś
przeszkodzi, można podpiąć darmowy serwer pocztowy (np. Resend) w
**Authentication → Emails → SMTP Settings**.

## Uruchomienie na komputerze

```bash
cd rodzinka
cp .env.example .env.local   # i wklej wartości z kroku 7
npm install
npm run dev
```

## Wdrożenie na Vercel

1. https://vercel.com → **Sign up → Continue with GitHub**.
2. **Add New… → Project** → wybierz repozytorium `nauka-` (jeśli go nie widać:
   **Adjust GitHub App Permissions** i daj dostęp do tego repo).
3. **Root Directory**: `rodzinka`. Framework wykryje się sam (Vite).
4. **Environment Variables**: dodaj `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`.
5. **Deploy**. Po minucie dostaniesz adres typu `https://rodzinka-xyz.vercel.app`.

Vercel publikuje jako wersję „produkcyjną” (publiczny adres) główną gałąź repo.
Każde wypchnięcie na nią automatycznie aktualizuje appkę na telefonach.

## Gdzie co jest

- `supabase/01_schema.sql`: tabele, reguły RLS, Realtime, dane startowe.
- `supabase/02_add_members.sql`: przypisanie kont do rodziny.
- `src/App.jsx`: logowanie → rodzina → ekrany i dolne menu.
- `src/components/LoginScreen.jsx`: logowanie kodem z maila.
- `src/lib/supabase.js`: połączenie z bazą.
- `src/lib/useFamily.js`: pobranie rodziny i dzieci.
- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/`: to, co robi z tego appkę (PWA).
