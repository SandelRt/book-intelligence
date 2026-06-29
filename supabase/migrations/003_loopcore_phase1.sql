-- ─────────────────────────────────────────────
-- Phase 1: Core Session Loop (LoopCore)
-- ─────────────────────────────────────────────

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  room_type text not null,
  host_user_id uuid references auth.users(id) on delete cascade not null,
  visibility text check (visibility in ('public', 'private')) default 'public',
  ai_host_enabled boolean default false,
  created_at timestamptz default now()
);

create table room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('owner', 'host', 'member', 'guest')) default 'member',
  joined_at timestamptz default now(),
  unique (room_id, user_id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  host_user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  session_type text not null,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  status text check (status in ('scheduled', 'live', 'completed', 'cancelled')) default 'scheduled',
  ai_summary text,
  created_at timestamptz default now()
);

create table session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  left_at timestamptz,
  completed_session boolean default false,
  focus_rating integer check (focus_rating >= 1 and focus_rating <= 5),
  reflection text,
  unique (session_id, user_id)
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_type text not null,
  target_amount integer not null,
  target_unit text not null,
  actual_amount integer,
  completed boolean default false,
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  event_type text not null,
  event_payload jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table sessions enable row level security;
alter table session_participants enable row level security;
alter table goals enable row level security;
alter table events enable row level security;

-- Rooms: Anyone can read, only authenticated can create
create policy "rooms_read_all" on rooms for select using (true);
create policy "rooms_insert_auth" on rooms for insert with check (auth.uid() = host_user_id);
create policy "rooms_update_host" on rooms for update using (auth.uid() = host_user_id);

-- Room Members: Read all, join if authenticated
create policy "room_members_read_all" on room_members for select using (true);
create policy "room_members_insert_auth" on room_members for insert with check (auth.uid() = user_id);
create policy "room_members_update_auth" on room_members for update using (auth.uid() = user_id);
create policy "room_members_delete_auth" on room_members for delete using (auth.uid() = user_id);

-- Sessions: Read all, host creates
create policy "sessions_read_all" on sessions for select using (true);
create policy "sessions_insert_host" on sessions for insert with check (auth.uid() = host_user_id);
create policy "sessions_update_host" on sessions for update using (auth.uid() = host_user_id);

-- Session Participants
create policy "session_participants_read_all" on session_participants for select using (true);
create policy "session_participants_insert_auth" on session_participants for insert with check (auth.uid() = user_id);
create policy "session_participants_update_auth" on session_participants for update using (auth.uid() = user_id);

-- Goals
create policy "goals_read_all" on goals for select using (true);
create policy "goals_insert_auth" on goals for insert with check (auth.uid() = user_id);
create policy "goals_update_auth" on goals for update using (auth.uid() = user_id);

-- Events: own events only (except for system roles if any)
create policy "events_read_own" on events for select using (auth.uid() = user_id);
create policy "events_insert_own" on events for insert with check (auth.uid() = user_id);
