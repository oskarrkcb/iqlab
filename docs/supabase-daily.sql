-- ═══════════════════════════════════════════════════════
-- IQLab Daily Challenge ranking — run once in the Supabase SQL Editor
-- (IQLab project → SQL Editor → New query → paste → Run)
-- ═══════════════════════════════════════════════════════
-- Daily results are stored in game_results with game_id = 'daily-YYYY-MM-DD'.
-- Only each player's FIRST try of the day counts; later tries are practice.

create or replace function get_daily_leaderboard(day text, lim int default 10)
returns table(
  user_id uuid,
  display_name text,
  avatar_url text,
  score int,
  correct int,
  total int,
  played_at timestamptz
) as $$
  select * from (
    select distinct on (gr.user_id)
      gr.user_id,
      p.display_name,
      p.avatar_url,
      gr.score::int,
      gr.correct::int,
      gr.total::int,
      gr.created_at as played_at
    from game_results gr
    join profiles p on p.id = gr.user_id
    where gr.game_id = 'daily-' || day
    order by gr.user_id, gr.created_at asc
  ) first_tries
  order by score desc, played_at asc
  limit lim;
$$ language sql security definer set search_path = public;

grant execute on function get_daily_leaderboard(text, int) to authenticated;
