// ── "Auto" difficulty ──
// Picks the level for the next game from how the last one went, like the
// staircase procedures used in training studies: clearly good → one level up,
// clearly bad → one level down, otherwise stay.

export const LEVELS = ['easy', 'medium', 'hard', 'really-hard'];
export const LEVEL_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', 'really-hard': 'Really Hard' };

const UP_ACCURACY = 0.85;
const DOWN_ACCURACY = 0.5;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// 'up' | 'down' | 'stay' for one result, compared with earlier ones at the same level
export function judge(result, earlier) {
  if (result.total > 0) {
    const acc = result.correct / result.total;
    if (acc >= UP_ACCURACY) return 'up';
    if (acc < DOWN_ACCURACY) return 'down';
    return 'stay';
  }
  // Games without right/wrong answers: compare the score with your own usual score
  const prev = earlier.filter(h => h.difficulty === result.difficulty).map(h => h.score);
  if (prev.length < 2) return 'stay';
  const usual = median(prev);
  if (result.score >= usual * 1.15) return 'up';
  if (result.score < usual * 0.7) return 'down';
  return 'stay';
}

// history: newest first, as returned by getHistory()
export function nextDifficulty(history) {
  const idx = history.findIndex(h => LEVELS.includes(h.difficulty));
  if (idx < 0) return 'medium';
  const last = history[idx];
  const level = LEVELS.indexOf(last.difficulty);
  const verdict = judge(last, history.slice(idx + 1));
  if (verdict === 'up') return LEVELS[Math.min(level + 1, LEVELS.length - 1)];
  if (verdict === 'down') return LEVELS[Math.max(level - 1, 0)];
  return last.difficulty;
}
