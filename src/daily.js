import { supabase } from './lib/supabase';

// ── Daily challenge ──
// One game per day, same seed for everyone → identical puzzles. Results are stored
// as game_id "daily-YYYY-MM-DD"; only each player's first try counts for the
// daily ranking (see docs/supabase-daily.sql).

export const DAILY_GAMES = ['seq', 'mat', 'ravens', 'est', 'op'];
export const DAILY_DIFFICULTY = 'hard';

// Local calendar date as YYYY-MM-DD
export function todayKey(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dailyGame(key) {
  const [y, m, d] = key.split('-').map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return DAILY_GAMES[day % DAILY_GAMES.length];
}

export const dailyRecordId = key => `daily-${key}`;
export const dailySeedText = key => `iqlab-daily-${key}`;

/** Your first result of the day's challenge, or null */
export async function getMyDaily(key) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('game_results')
    .select('score, correct, total, created_at')
    .eq('user_id', user.id)
    .eq('game_id', dailyRecordId(key))
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Daily ranking (first tries only). error is set when the SQL function isn't installed yet. */
export async function getDailyLeaderboard(key, lim = 10) {
  const { data, error } = await supabase.rpc('get_daily_leaderboard', { day: key, lim });
  if (error) { console.error('getDailyLeaderboard error:', error); return { rows: [], error }; }
  return { rows: data ?? [], error: null };
}
