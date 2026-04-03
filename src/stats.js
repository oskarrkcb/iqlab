import { supabase } from './lib/supabase';

/** Record a game result to Supabase */
export async function recordGame(gameId, { score, correct, total, timeUsed, difficulty }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('game_results').insert({
    user_id: user.id,
    game_id: gameId,
    score: score ?? 0,
    correct: correct ?? 0,
    total: total ?? 0,
    time_used: timeUsed ?? 0,
    difficulty: difficulty ?? 'medium',
  }).select().single();

  if (error) { console.error('recordGame error:', error); return null; }
  return data;
}

/** Record an IQ test result to Supabase */
export async function recordIQResult({ iqScore, correct, total, logicPct, mathPct, patternPct, timeSecs }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('iq_results').insert({
    user_id: user.id,
    iq_score: iqScore,
    correct,
    total,
    logic_pct: logicPct,
    math_pct: mathPct,
    pattern_pct: patternPct,
    time_secs: timeSecs,
  }).select().single();

  if (error) { console.error('recordIQResult error:', error); return null; }
  return data;
}

/** Get high score for a game */
export async function getHighScore(gameId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('game_results')
    .select('score')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.score ?? 0;
}

/** Get last N results for a game */
export async function getHistory(gameId, n = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(n);

  return (data ?? []).map(r => ({
    score: r.score,
    correct: r.correct,
    total: r.total,
    timeUsed: r.time_used,
    difficulty: r.difficulty,
    ts: new Date(r.created_at).getTime(),
  }));
}

/** Get all game stats for the current user (for Dashboard) */
export async function getAllStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { games: {}, global: { totalGames: 0, totalPoints: 0 } };

  const { data: rows } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) {
    return { games: {}, global: { totalGames: 0, totalPoints: 0 } };
  }

  const games = {};
  let totalGames = 0, totalPoints = 0;

  for (const r of rows) {
    if (!games[r.game_id]) games[r.game_id] = { history: [], highScore: 0 };
    games[r.game_id].history.push({
      score: r.score, correct: r.correct, total: r.total,
      timeUsed: r.time_used, difficulty: r.difficulty, ts: new Date(r.created_at).getTime(),
    });
    if (r.score > games[r.game_id].highScore) games[r.game_id].highScore = r.score;
    totalGames++;
    totalPoints += r.score;
  }

  return { games, global: { totalGames, totalPoints } };
}

/** Get latest IQ result */
export async function getLatestIQ() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('iq_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
