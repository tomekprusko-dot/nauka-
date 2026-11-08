-- Tabela na treningi: jeden wiersz = jeden trening jednej osoby (np. "3-A").
-- Wklej całość w Supabase: SQL Editor -> New query -> Run.

create table if not exists public.workout_logs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, session_key)
);

-- RLS (Row Level Security): każdy widzi i zmienia WYŁĄCZNIE swoje wiersze.
-- Dzięki temu publiczny klucz "anon" w kodzie appki jest bezpieczny.
alter table public.workout_logs enable row level security;

drop policy if exists "Własne treningi: odczyt" on public.workout_logs;
create policy "Własne treningi: odczyt" on public.workout_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Własne treningi: dodawanie" on public.workout_logs;
create policy "Własne treningi: dodawanie" on public.workout_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Własne treningi: zmiana" on public.workout_logs;
create policy "Własne treningi: zmiana" on public.workout_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Własne treningi: usuwanie" on public.workout_logs;
create policy "Własne treningi: usuwanie" on public.workout_logs
  for delete using (auth.uid() = user_id);

-- Zmiany na żywo między urządzeniami (Realtime).
do $$
begin
  alter publication supabase_realtime add table public.workout_logs;
exception when duplicate_object then null;
end $$;
