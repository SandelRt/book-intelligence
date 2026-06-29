-- Enable pgvector for embeddings
create extension if not exists vector;

-- ─────────────────────────────────────────────
-- IDENTITY
-- ─────────────────────────────────────────────
create table writer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  genre_prefs text[] default '{}',
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- WRITER DNA
-- ─────────────────────────────────────────────
create table preference_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  suggestion_id uuid,
  action text check (action in ('accept', 'reject', 'modify')) not null,
  original_text text,
  delta_text text,
  context_chapter_id uuid,
  created_at timestamptz default now()
);

create table style_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid not null,
  avg_sentence_len float,
  vocab_richness float,
  rhythm_score float,
  tone_markers jsonb default '{}',
  computed_at timestamptz default now()
);

create table voice_fingerprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  embedding vector(1536),
  computed_at timestamptz default now()
);

create table frustration_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('idle', 'delete_loop', 'rewrite_cycle')) not null,
  chapter_id uuid,
  created_at timestamptz default now()
);

-- Explicit writer annotations ("did not work" / "liked this")
create table explicit_annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id uuid,
  label text check (label in ('liked', 'did_not_work', 'neutral')) not null,
  note text,
  selection_text text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- MANUSCRIPT
-- ─────────────────────────────────────────────
create table manuscripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  genre text,
  status text check (status in ('drafting', 'revising', 'complete')) default 'drafting',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid references manuscripts(id) on delete cascade not null,
  order_idx integer not null default 0,
  title text default '',
  content text default '',
  word_count integer default 0,
  pacing_score float,
  voice_drift_score float,
  last_saved_at timestamptz default now(),
  created_at timestamptz default now()
);

create table plot_threads (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid references manuscripts(id) on delete cascade not null,
  label text not null,
  introduced_chapter_id uuid references chapters(id),
  resolved_chapter_id uuid references chapters(id),
  status text check (status in ('open', 'resolved', 'dropped')) default 'open',
  created_at timestamptz default now()
);

create table story_beats (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade not null,
  beat_type text not null,
  position_pct float,
  spacing_flag boolean default false,
  created_at timestamptz default now()
);

create table consistency_flags (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade not null,
  type text not null,
  description text,
  severity text check (severity in ('low', 'med', 'high')) default 'low',
  resolved boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- REFERENCES (books + films)
-- ─────────────────────────────────────────────
create table media_references (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('book', 'film')) not null,
  title text not null,
  author_director text,
  genre_tags text[] default '{}',
  structure_meta jsonb default '{}',
  created_at timestamptz default now()
);

create table reference_embeddings (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid references media_references(id) on delete cascade not null,
  chunk_text text,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- AI SUGGESTIONS (for DNA tracking)
-- ─────────────────────────────────────────────
create table ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade,
  type text not null, -- 'continuation', 'rewrite', 'direction', 'beat_feedback'
  prompt_context text,
  suggestion_text text not null,
  model text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index on preference_events (user_id, created_at desc);
create index on style_signals (user_id, computed_at desc);
create index on voice_fingerprints using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on reference_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on chapters (manuscript_id, order_idx);
create index on manuscripts (user_id, updated_at desc);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table writer_profiles enable row level security;
alter table preference_events enable row level security;
alter table style_signals enable row level security;
alter table voice_fingerprints enable row level security;
alter table frustration_events enable row level security;
alter table explicit_annotations enable row level security;
alter table manuscripts enable row level security;
alter table chapters enable row level security;
alter table plot_threads enable row level security;
alter table story_beats enable row level security;
alter table consistency_flags enable row level security;
alter table ai_suggestions enable row level security;
alter table media_references enable row level security;
alter table reference_embeddings enable row level security;

-- User-owned tables: full CRUD for own rows
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'writer_profiles','preference_events','style_signals',
    'voice_fingerprints','frustration_events','explicit_annotations',
    'manuscripts','ai_suggestions'
  ] loop
    execute format('
      create policy "%s_own" on %I
        for all using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    ', tbl, tbl);
  end loop;
end $$;

-- Chapters: access via manuscript ownership
create policy "chapters_own" on chapters
  for all using (
    exists (select 1 from manuscripts m where m.id = manuscript_id and m.user_id = auth.uid())
  );

create policy "plot_threads_own" on plot_threads
  for all using (
    exists (select 1 from manuscripts m where m.id = manuscript_id and m.user_id = auth.uid())
  );

create policy "story_beats_own" on story_beats
  for all using (
    exists (select 1 from chapters c join manuscripts m on m.id = c.manuscript_id
            where c.id = chapter_id and m.user_id = auth.uid())
  );

create policy "consistency_flags_own" on consistency_flags
  for all using (
    exists (select 1 from chapters c join manuscripts m on m.id = c.manuscript_id
            where c.id = chapter_id and m.user_id = auth.uid())
  );

-- References: readable by all authenticated users
create policy "references_read" on media_references
  for select using (auth.role() = 'authenticated');

create policy "reference_embeddings_read" on reference_embeddings
  for select using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- AUTO-UPDATE updated_at on manuscripts
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger manuscripts_updated_at
  before update on manuscripts
  for each row execute function update_updated_at();

-- Auto-create writer profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into writer_profiles (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
