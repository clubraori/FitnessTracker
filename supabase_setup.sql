create table if not exists public.tracker_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  app_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.tracker_snapshots enable row level security;

drop policy if exists "Users can read their own tracker snapshot" on public.tracker_snapshots;
create policy "Users can read their own tracker snapshot"
on public.tracker_snapshots
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own tracker snapshot" on public.tracker_snapshots;
create policy "Users can insert their own tracker snapshot"
on public.tracker_snapshots
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tracker snapshot" on public.tracker_snapshots;
create policy "Users can update their own tracker snapshot"
on public.tracker_snapshots
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on table public.tracker_snapshots to authenticated;
