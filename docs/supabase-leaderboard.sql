-- ═══════════════════════════════════════════════════════
-- IQLab Leaderboard — run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1) Profiles table (stores display name + avatar)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Profiles are publicly readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 2) Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, avatar_url)
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
  for each row execute function handle_new_user();

-- 3) Backfill profiles for existing users
insert into profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;

-- 4) Leaderboard RPC function
create or replace function get_leaderboard(lim int default 50)
returns table(
  user_id uuid,
  display_name text,
  avatar_url text,
  total_points bigint,
  total_games bigint,
  avg_score numeric
) as $$
  select
    gr.user_id,
    p.display_name,
    p.avatar_url,
    sum(gr.score)::bigint as total_points,
    count(*)::bigint as total_games,
    round(avg(gr.score), 1) as avg_score
  from game_results gr
  join profiles p on p.id = gr.user_id
  group by gr.user_id, p.display_name, p.avatar_url
  order by total_points desc
  limit lim;
$$ language sql security definer;
