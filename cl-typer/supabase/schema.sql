-- Typer ESA — schemat bazy danych.
-- Wklej całość w Supabase Dashboard → SQL Editor → Run.
-- Bezpiecznie uruchomić wielokrotnie (create if not exists / on conflict do nothing).

create extension if not exists pgcrypto;

-- Zaproszone osoby (dostęp na podstawie imienia + kodu; e-mail opcjonalny,
-- nieużywany do logowania — zostawiony na wypadek, gdyby kiedyś przydał się
-- do np. automatycznych powiadomień).
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  access_code text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Typy na wynik pojedynczego meczu: tylko zwycięzca/remis (bez dokładnego
-- wyniku bramkowego) — jeden typ na osobę na mecz. 'H' = wygrana gospodarzy,
-- 'D' = remis, 'A' = wygrana gości.
create table if not exists predictions (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  fixture_id text not null,
  outcome text not null check (outcome in ('H', 'D', 'A')),
  saved_at timestamptz not null default now(),
  unique (user_id, fixture_id)
);

-- Migracja z wcześniejszej wersji (typowanie dokładnego wyniku bramkowego):
-- usuwa stare kolumny, jeśli tabela już istniała z nimi. Bezpieczne do
-- wielokrotnego uruchomienia i na świeżej instalacji (bez tych kolumn).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'predictions' and column_name = 'home_goals'
  ) then
    delete from predictions where home_goals is not null and away_goals is not null;
    alter table predictions drop column home_goals;
    alter table predictions drop column away_goals;
  end if;
end $$;
alter table predictions add column if not exists outcome text;
alter table predictions alter column outcome set not null;
alter table predictions drop constraint if exists predictions_outcome_check;
alter table predictions add constraint predictions_outcome_check check (outcome in ('H', 'D', 'A'));

-- Oficjalne wyniki meczów wpisywane przez admina.
create table if not exists results (
  fixture_id text primary key,
  home_goals int not null,
  away_goals int not null,
  updated_at timestamptz not null default now()
);

-- Jednorazowe typy specjalne na cały sezon (mistrz ligi, król strzelców).
create table if not exists special_predictions (
  user_id uuid primary key references users(id) on delete cascade,
  champion_team_id text,
  top_scorer text,
  saved_at timestamptz not null default now()
);

-- Jeden wiersz (singleton): faktyczny wynik sezonu, ustawiany przez admina.
create table if not exists special_result (
  id smallint primary key default 1 check (id = 1),
  champion_team_id text,
  top_scorer text
);
insert into special_result (id) values (1) on conflict (id) do nothing;

-- Startowe konta (dopasowane do dotychczasowych kont demo).
-- Zmień kody dostępu / e-maile na docelowe przed zaproszeniem prawdziwych osób.
insert into users (name, email, access_code, role) values
  ('Tomek', 'tomekprusko@gmail.com', 'ADMIN2026', 'admin'),
  ('Kuba', 'kuba@example.com', 'KUBA123', 'user'),
  ('Ola', 'ola@example.com', 'OLA123', 'user')
on conflict (email) do nothing;

-- RLS włączone, bez żadnych policy — to celowe: jedyny klucz, który może
-- czytać/zapisywać te tabele, to service_role (używany wyłącznie po stronie
-- serwera Next.js, nigdy w przeglądarce). Przeglądarka nie łączy się z
-- Supabase bezpośrednio, więc nie potrzebujemy policy dla anon/authenticated.
alter table users enable row level security;
alter table predictions enable row level security;
alter table results enable row level security;
alter table special_predictions enable row level security;
alter table special_result enable row level security;
