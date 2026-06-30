-- ─────────────────────────────────────────────
-- Phase 2: LoopReads Modes (Video & Geocaching)
-- ─────────────────────────────────────────────

-- 1. Extend `sessions` with mode, video, location, capacity, and host confirmation
ALTER TABLE sessions
ADD COLUMN mode text check (mode in ('online_text', 'online_video', 'in_person')) default 'online_text',
ADD COLUMN video_enabled boolean default false,
ADD COLUMN location jsonb, -- { area_public, venue_name, lat, lng, reveal:"on_confirm" }
ADD COLUMN host_confirmed boolean default false,
ADD COLUMN capacity integer,
ADD COLUMN min_to_run integer;

-- 2. Create `rsvps` table for in-person geocaching reveal flow
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('going', 'maybe', 'declined')) default 'going',
  confirmed_at timestamptz default now(),
  unique (session_id, user_id)
);

-- 3. Extend `session_participants` for real-world attendance check-in
ALTER TABLE session_participants
ADD COLUMN arrival_check_in_at timestamptz,
ADD COLUMN geo_verified boolean default false;

-- 4. RLS for rsvps
alter table rsvps enable row level security;
create policy "rsvps_read_all" on rsvps for select using (true);
create policy "rsvps_insert_auth" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update_auth" on rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete_auth" on rsvps for delete using (auth.uid() = user_id);
