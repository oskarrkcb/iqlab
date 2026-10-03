// ── Dashboard insights: what to train next, and honest progress ──
// Input: getAllStats().games — { [gameId]: { history: [{ score, correct, total, difficulty, ts }] } },
// history oldest first.

export const GAME_CATEGORY = {
  est: 'math', op: 'math', g24: 'math', sp: 'math', tricks: 'math',
  seq: 'logic', ooo: 'logic', mat: 'logic', syllogisms: 'logic', algo: 'logic', hanoi: 'logic',
  ravens: 'iq', rotation: 'iq',
  mem: 'memory', 'dual-nback': 'memory', chimp: 'memory', corsi: 'memory',
  schulte: 'focus', stroop: 'focus', trail: 'focus', gonogo: 'focus',
};

const DAY = 86400000;
const avg = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const accuracyOf = h => (h.total > 0 ? h.correct / h.total : null);

// Average accuracy of the last few games of each category (only games that have right/wrong answers)
export function categoryAccuracy(games, lastN = 5) {
  const result = {};
  for (const [cat, ids] of Object.entries(groupByCategory())) {
    const accs = ids.flatMap(id => (games[id]?.history ?? []).slice(-lastN).map(accuracyOf).filter(a => a !== null));
    if (accs.length >= 2) result[cat] = avg(accs);
  }
  return result;
}

function groupByCategory() {
  const g = {};
  for (const [id, cat] of Object.entries(GAME_CATEGORY)) (g[cat] = g[cat] || []).push(id);
  return g;
}

const lastPlayed = (games, id) => {
  const h = games[id]?.history ?? [];
  return h.length ? h[h.length - 1].ts : null;
};

// Up to 3 suggestions: { gameId, reason, detail }
// reason: 'weak-category' | 'dropping' | 'not-recently' | 'never'
export function recommendations(games, now = Date.now()) {
  const recs = [];
  const used = new Set();
  const add = (gameId, reason, detail) => {
    if (gameId && !used.has(gameId) && recs.length < 3) { used.add(gameId); recs.push({ gameId, reason, detail }); }
  };

  // 1. Weakest category → the game from it you played least recently
  const acc = categoryAccuracy(games);
  const weakest = Object.entries(acc).sort((a, b) => a[1] - b[1])[0];
  if (weakest && weakest[1] < 0.85) {
    const [cat, value] = weakest;
    const ids = groupByCategory()[cat];
    const pickId = [...ids].sort((a, b) => (lastPlayed(games, a) ?? 0) - (lastPlayed(games, b) ?? 0))[0];
    add(pickId, 'weak-category', { category: cat, accuracy: Math.round(value * 100) });
  }

  // 2. A game where the last result was clearly below your usual
  for (const [id, g] of Object.entries(games)) {
    if (!GAME_CATEGORY[id]) continue;
    const h = g.history;
    if (h.length < 4) continue;
    const last = h[h.length - 1];
    const usual = h.slice(-6, -1).filter(x => x.difficulty === last.difficulty).map(x => x.score);
    if (usual.length >= 3 && last.score < avg(usual) * 0.8) {
      add(id, 'dropping', { last: last.score, usual: Math.round(avg(usual)) });
      break;
    }
  }

  // 3. Played before, but not for a week or more (longest gap first)
  const stale = Object.keys(GAME_CATEGORY)
    .map(id => ({ id, ts: lastPlayed(games, id) }))
    .filter(x => x.ts && now - x.ts >= 7 * DAY)
    .sort((a, b) => a.ts - b.ts);
  if (stale[0]) add(stale[0].id, 'not-recently', { days: Math.floor((now - stale[0].ts) / DAY) });

  // 4. Fill up with games never played
  for (const id of Object.keys(GAME_CATEGORY)) if (!games[id]?.history?.length) add(id, 'never', {});

  return recs;
}

// Honest progress per game: first 3 vs last 3 results at the level you play most.
// Only games with at least 6 results there, sorted by change.
export function progress(games) {
  const rows = [];
  for (const [id, g] of Object.entries(games)) {
    if (!GAME_CATEGORY[id]) continue;
    const byLevel = {};
    for (const h of g.history) (byLevel[h.difficulty] = byLevel[h.difficulty] || []).push(h);
    const [level, h] = Object.entries(byLevel).sort((a, b) => b[1].length - a[1].length)[0] ?? [];
    if (!h || h.length < 6) continue;
    const first = h.slice(0, 3), last = h.slice(-3);
    const before = avg(first.map(x => x.score)), after = avg(last.map(x => x.score));
    const accBefore = first.map(accuracyOf).filter(a => a !== null);
    const accAfter = last.map(accuracyOf).filter(a => a !== null);
    rows.push({
      gameId: id,
      level,
      games: h.length,
      days: Math.max(1, Math.round((h[h.length - 1].ts - h[0].ts) / DAY)),
      before: Math.round(before),
      after: Math.round(after),
      change: before > 0 ? Math.round(((after - before) / before) * 100) : null,
      accBefore: accBefore.length === 3 ? Math.round(avg(accBefore) * 100) : null,
      accAfter: accAfter.length === 3 ? Math.round(avg(accAfter) * 100) : null,
    });
  }
  return rows.sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity));
}
