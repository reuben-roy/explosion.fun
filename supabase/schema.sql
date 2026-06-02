-- Greatness Platform Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  is_public boolean default false,
  composite_score real default 0,
  total_days_tracked integer default 0,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goals table (user-defined Self-Actualization categories)
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  category text not null,
  label text not null,
  domains text[] default '{}',
  keywords text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Browsing sessions (parsed from Google Takeout)
create table public.browsing_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  url text,
  domain text,
  title text,
  visited_at timestamptz not null,
  duration_seconds real default 0,
  is_goal_aligned boolean default false,
  matched_goal_id uuid references public.goals on delete set null,
  created_at timestamptz default now()
);

-- Daily scores (pre-computed aggregates)
create table public.daily_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date date not null,
  self_actualization_ratio real default 0,
  deep_work_density real default 0,
  drift_friction real default 0,
  composite_score real default 0,
  goal_time_seconds real default 0,
  distraction_time_seconds real default 0,
  total_sessions integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.browsing_sessions enable row level security;
alter table public.daily_scores enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (is_public = true);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Goals policies
create policy "Users can view own goals" on public.goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own goals" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own goals" on public.goals
  for update using (auth.uid() = user_id);

create policy "Users can delete own goals" on public.goals
  for delete using (auth.uid() = user_id);

-- Browsing sessions policies
create policy "Users can manage own sessions" on public.browsing_sessions
  for all using (auth.uid() = user_id);

-- Daily scores policies
create policy "Users can manage own scores" on public.daily_scores
  for all using (auth.uid() = user_id);

create policy "Public scores are viewable" on public.daily_scores
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = daily_scores.user_id
      and profiles.is_public = true
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_profiles_leaderboard on public.profiles (composite_score desc) where is_public = true;
create index idx_browsing_sessions_user on public.browsing_sessions (user_id, visited_at);
create index idx_daily_scores_user on public.daily_scores (user_id, date);
create index idx_goals_user on public.goals (user_id);
