-- WRECK production schema for Supabase / Postgres.
-- Apply in the Supabase SQL editor (or via the CLI) before deploying with the
-- SupabaseStore adapter. The app authenticates users itself (email + bcrypt +
-- JWT cookie) and stores each user's fitness data as a single JSONB document,
-- which mirrors the UserData domain type. Row Level Security is enabled so the
-- tables cannot be read with the anon key; all access goes through server code
-- using the service-role key.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  display_name  text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists public.user_data (
  user_id    uuid primary key references public.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_data_updated_idx on public.user_data (updated_at);

-- Keep updated_at fresh on write.
create or replace function public.touch_user_data() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch
  before update on public.user_data
  for each row execute function public.touch_user_data();

-- Lock the tables down. The service-role key bypasses RLS (used only by the
-- server); the anon/authenticated roles get no direct access.
alter table public.users enable row level security;
alter table public.user_data enable row level security;

-- No permissive policies are created on purpose: direct client access is denied
-- and every read/write goes through trusted server code.

-- ---------------------------------------------------------------------------
-- Meal photos (photo food logging)
-- ---------------------------------------------------------------------------
-- Photos are PRIVATE and owned per user. They are served only through the
-- authenticated route GET /api/food-photos/[id]; there are no public URLs.
-- Create a private Storage bucket named "food-photos" (objects at
-- <userId>/<id>.jpg|webp|png). The server uses the service-role key, so no RLS
-- policy is required for access; keep the bucket private so nothing is public.
--
-- Create it once, either in the Supabase dashboard (Storage -> New bucket,
-- "food-photos", Public = off) or via SQL:
--
--   insert into storage.buckets (id, name, public)
--   values ('food-photos', 'food-photos', false)
--   on conflict (id) do nothing;
