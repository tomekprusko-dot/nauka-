-- =====================================================================
-- Rodzinka: struktura bazy danych + zabezpieczenia (Row Level Security)
--
-- Jak użyć: Supabase -> SQL Editor -> New query -> wklej CAŁY plik -> Run.
-- Skrypt uruchamiasz raz, na pustym projekcie.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABELE
-- ---------------------------------------------------------------------

-- Rodzina. U nas jedna, ale struktura pozwala na więcej.
create table public.families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- Kto należy do rodziny. user_id to konto z wbudowanej tabeli logowania (auth.users).
create table public.family_members (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  family_id    uuid not null references public.families(id) on delete cascade,
  display_name text not null
);

-- Dzieci. has_poop_tracker włącza "Kalendarz kupy" dla danego dziecka.
create table public.children (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  name             text not null,
  color            text not null default 'sky',
  has_poop_tracker boolean not null default false,
  sort_order       int not null default 0,
  unique (id, family_id)  -- potrzebne do "podwójnych" powiązań niżej
);

-- Kategorie ćwiczeń (fizjo, neurologopeda, ...). Wspólne dla wszystkich.
-- Nowa kategoria = nowy wiersz w tej tabeli, bez zmian w kodzie appki.
create table public.exercise_categories (
  id         serial primary key,
  key        text not null unique,
  label      text not null,
  icon       text not null default '⭐',
  sort_order int not null default 0
);

-- Ćwiczenia. Jeden wspólny moduł dla wszystkich kategorii.
-- archived = true: ćwiczenie "usunięte" z list, ale historia odhaczeń zostaje.
create table public.exercises (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  child_id         uuid not null,
  category_id      int  not null references public.exercise_categories(id),
  name             text not null check (length(trim(name)) > 0),
  description      text,
  reps             int  check (reps > 0),
  duration_seconds int  check (duration_seconds > 0),
  video_url        text,
  archived         boolean not null default false,
  created_by       uuid default auth.uid() references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  unique (id, family_id),
  -- dziecko musi należeć do tej samej rodziny co ćwiczenie
  foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

-- Plan: kiedy robić ćwiczenie.
--   type = 'weekly': w wybrane dni tygodnia (weekdays: 1=pon ... 7=niedz), od start_date,
--                    bez końca albo do end_date
--   type = 'once':   jednorazowo w dniu "date"
create table public.exercise_schedules (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null,
  exercise_id uuid not null,
  type        text not null check (type in ('weekly', 'once')),
  weekdays    int[],
  start_date  date,
  end_date    date,
  date        date,
  created_at  timestamptz not null default now(),
  foreign key (exercise_id, family_id) references public.exercises(id, family_id) on delete cascade,
  check (
    (type = 'weekly' and weekdays is not null and cardinality(weekdays) > 0
       and weekdays <@ array[1,2,3,4,5,6,7] and start_date is not null
       and (end_date is null or end_date >= start_date))
    or
    (type = 'once' and date is not null)
  )
);

-- Odhaczenia: ćwiczenie zrobione danego dnia (i przez kogo).
-- Na razie 1 raz dziennie, więc para (ćwiczenie, dzień) jest unikalna.
create table public.exercise_completions (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null,
  exercise_id  uuid not null,
  date         date not null,
  completed_by uuid default auth.uid() references auth.users(id) on delete set null,
  completed_at timestamptz not null default now(),
  unique (exercise_id, date),
  foreign key (exercise_id, family_id) references public.exercises(id, family_id) on delete cascade
);

-- Kalendarz kupy. Jeden wpis na dziecko na dzień.
-- "date" to dzień (czas polski), "occurred_at" to dokładna godzina.
create table public.poop_logs (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null,
  child_id    uuid not null,
  date        date not null,
  occurred_at timestamptz not null default now(),
  note        text,
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (child_id, date),
  foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

-- Indeksy przyspieszają typowe zapytania (np. "wszystkie odhaczenia z listopada").
create index on public.exercises (child_id);
create index on public.exercise_schedules (exercise_id);
create index on public.exercise_completions (date);
create index on public.poop_logs (child_id, date);


-- ---------------------------------------------------------------------
-- 2. ZABEZPIECZENIA (Row Level Security)
--
-- Po włączeniu RLS baza domyślnie NIE pokazuje nikomu żadnego wiersza.
-- Potem dopisujemy reguły ("policies"), kiedy wolno: tu zawsze ta sama
-- zasada: wiersz należy do rodziny, do której należy zalogowana osoba.
-- ---------------------------------------------------------------------

-- Pomocnicza funkcja: id rodzin zalogowanej osoby.
-- "security definer" = funkcja może zajrzeć do family_members bez
-- zapętlenia reguł (reguła family_members sama używa tej funkcji).
create or replace function public.my_family_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select family_id from public.family_members where user_id = auth.uid()
$$;

alter table public.families             enable row level security;
alter table public.family_members       enable row level security;
alter table public.children             enable row level security;
alter table public.exercise_categories  enable row level security;
alter table public.exercises            enable row level security;
alter table public.exercise_schedules   enable row level security;
alter table public.exercise_completions enable row level security;
alter table public.poop_logs            enable row level security;

-- Rodzina, członkowie, dzieci: tylko odczyt z appki.
-- (Zmieniamy je rzadko, ręcznie w panelu Supabase.)
create policy "rodzina: odczyt" on public.families
  for select to authenticated using (id in (select public.my_family_ids()));

create policy "członkowie: odczyt" on public.family_members
  for select to authenticated using (family_id in (select public.my_family_ids()));

create policy "dzieci: odczyt" on public.children
  for select to authenticated using (family_id in (select public.my_family_ids()));

-- Kategorie: każdy zalogowany może czytać.
create policy "kategorie: odczyt" on public.exercise_categories
  for select to authenticated using (true);

-- Ćwiczenia, plany, odhaczenia, kupa: pełny dostęp, ale tylko w swojej rodzinie.
create policy "ćwiczenia: rodzina" on public.exercises
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));

create policy "plany: rodzina" on public.exercise_schedules
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));

create policy "odhaczenia: rodzina" on public.exercise_completions
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));

create policy "kupa: rodzina" on public.poop_logs
  for all to authenticated
  using (family_id in (select public.my_family_ids()))
  with check (family_id in (select public.my_family_ids()));


-- ---------------------------------------------------------------------
-- 3. SYNCHRONIZACJA NA ŻYWO (Realtime)
-- Dopisujemy tabele do "nadajnika" zmian. Realtime też przestrzega RLS:
-- dostajesz powiadomienia tylko o wierszach swojej rodziny.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table
  public.exercises,
  public.exercise_schedules,
  public.exercise_completions,
  public.poop_logs;


-- ---------------------------------------------------------------------
-- 4. DANE STARTOWE
-- ---------------------------------------------------------------------
insert into public.exercise_categories (key, label, icon, sort_order) values
  ('fizjo',         'Fizjoterapia',  '🤸', 1),
  ('neurologopeda', 'Neurologopeda', '👄', 2);

with f as (
  insert into public.families (name) values ('Nasza rodzina') returning id
)
insert into public.children (family_id, name, color, has_poop_tracker, sort_order)
select f.id, c.name, c.color, c.poop, c.ord
from f, (values
  ('Zofia',   'rose',   true,  1),
  ('Zuzanna', 'violet', false, 2)
) as c(name, color, poop, ord);
