-- =========================================================
-- V RESEARCH DATABASE
-- =========================================================

create extension if not exists "uuid-ossp";

-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- =========================================================
-- NOTES
-- =========================================================

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'Untitled Note',
  content text default '',
  tags text[] default '{}',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- DATASETS
-- =========================================================

create table if not exists public.datasets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  source text default '',
  source_url text default '',
  category text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- DATASET RECORDS
-- =========================================================

create table if not exists public.dataset_records (
  id uuid primary key default uuid_generate_v4(),
  dataset_id uuid references public.datasets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- =========================================================
-- FOLDERS
-- =========================================================

create table if not exists public.folders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- FILES
-- =========================================================

create table if not exists public.files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  name text not null,
  storage_path text not null,
  mime_type text default '',
  size_bytes bigint default 0,
  created_at timestamptz default now()
);

-- =========================================================
-- RESEARCH ARTICLES
-- =========================================================

create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  abstract text default '',
  authors text[] default '{}',
  source text default '',
  source_url text default '',
  published_at timestamptz,
  saved boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- ACTIVITY SESSIONS
-- =========================================================

create table if not exists public.activity_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds integer default 0
);

-- =========================================================
-- ACTIVITY EVENTS
-- =========================================================

create table if not exists public.activity_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.activity_sessions(id) on delete cascade,
  event_type text not null,
  page text default '',
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- =========================================================
-- AI ASSISTANTS
-- =========================================================

create table if not exists public.ai_assistants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  system_instructions text default '',
  model text default '',
  temperature numeric default 0.7,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- AI MESSAGES
-- =========================================================

create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  assistant_id uuid references public.ai_assistants(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- SETTINGS
-- =========================================================

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'dark',
  accent_color text default '',
  font_family text default '',
  font_size integer default 16,
  reduced_motion boolean default false,
  compact_mode boolean default false,
  updated_at timestamptz default now()
);

-- =========================================================
-- SEARCH HISTORY
-- =========================================================

create table if not exists public.search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  provider text default 'all',
  searched_at timestamptz default now()
);

-- =========================================================
-- SAVED RESEARCH
-- =========================================================

create table if not exists public.saved_research (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  url text default '',
  source text default '',
  created_at timestamptz default now()
);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.datasets enable row level security;
alter table public.dataset_records enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.articles enable row level security;
alter table public.activity_sessions enable row level security;
alter table public.activity_events enable row level security;
alter table public.ai_assistants enable row level security;
alter table public.ai_messages enable row level security;
alter table public.settings enable row level security;
alter table public.search_history enable row level security;
alter table public.saved_research enable row level security;

-- =========================================================
-- PROFILE POLICIES
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- =========================================================
-- NOTES POLICIES
-- =========================================================

create policy "Users can manage own notes"
on public.notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- DATASET POLICIES
-- =========================================================

create policy "Users can manage own datasets"
on public.datasets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own dataset records"
on public.dataset_records
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- FOLDER POLICIES
-- =========================================================

create policy "Users can manage own folders"
on public.folders
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- FILE POLICIES
-- =========================================================

create policy "Users can manage own files"
on public.files
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- ARTICLE POLICIES
-- =========================================================

create policy "Users can manage own articles"
on public.articles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- ACTIVITY POLICIES
-- =========================================================

create policy "Users can manage own activity sessions"
on public.activity_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own activity events"
on public.activity_events
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- AI POLICIES
-- =========================================================

create policy "Users can manage own AI assistants"
on public.ai_assistants
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own AI messages"
on public.ai_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- SETTINGS POLICIES
-- =========================================================

create policy "Users can manage own settings"
on public.settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- SEARCH HISTORY POLICIES
-- =========================================================

create policy "Users can manage own search history"
on public.search_history
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- SAVED RESEARCH POLICIES
-- =========================================================

create policy "Users can manage own saved research"
on public.saved_research
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists notes_user_id_idx
on public.notes(user_id);

create index if not exists datasets_user_id_idx
on public.datasets(user_id);

create index if not exists files_user_id_idx
on public.files(user_id);

create index if not exists folders_user_id_idx
on public.folders(user_id);

create index if not exists articles_user_id_idx
on public.articles(user_id);

create index if not exists activity_events_user_id_idx
on public.activity_events(user_id);

create index if not exists search_history_user_id_idx
on public.search_history(user_id);

-- =========================================================
-- DONE
-- =========================================================
