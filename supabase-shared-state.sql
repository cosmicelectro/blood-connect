create table if not exists public.blood_connect_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.blood_connect_state enable row level security;

drop policy if exists "BloodConnect shared state public read" on public.blood_connect_state;
drop policy if exists "BloodConnect shared state public insert" on public.blood_connect_state;
drop policy if exists "BloodConnect shared state public update" on public.blood_connect_state;

create policy "BloodConnect shared state public read"
on public.blood_connect_state
for select
to anon
using (true);

create policy "BloodConnect shared state public insert"
on public.blood_connect_state
for insert
to anon
with check (true);

create policy "BloodConnect shared state public update"
on public.blood_connect_state
for update
to anon
using (true)
with check (true);
