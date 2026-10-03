import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R } from './utils';
const GAME_ID = 'trail';

// Trail Making Test: tap the circles in order as fast as possible.
// Part A: 1 → 2 → 3 …   Part B (switching): 1 → A → 2 → B → 3 → C …

const SETUP = {
  easy:          { mode: 'A', count: 12 },
  medium:        { mode: 'B', count: 12 },
  hard:          { mode: 'B', count: 16 },
  'really-hard': { mode: 'B', count: 20 },
};
const BOARDS = 3;
const MIN_DIST = 15; // % of the board between circle centres

function labels(mode, count) {
  if (mode === 'A') return Array.from({ length: count }, (_, i) => String(i + 1));
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? String(i / 2 + 1) : String.fromCharCode(65 + (i - 1) / 2)));
}

// Random, non-overlapping positions (retries until the circles fit)
function layout(count) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const pts = [];
    for (let tries = 0; pts.length < count && tries < 2000; tries++) {
      const p = { x: R(8, 92), y: R(8, 92) };
      if (pts.every(q => Math.hypot(q.x - p.x, q.y - p.y) >= MIN_DIST)) pts.push(p);
    }
    if (pts.length === count) return pts;
  }
  return Array.from({ length: count }, (_, i) => ({ x: 10 + (i % 5) * 20, y: 10 + Math.floor(i / 5) * 20 }));
}

export default function TrailMaking({ onBack, difficulty = 'medium' }) {
  const { mode, count } = SETUP[difficulty] || SETUP.medium;
  const [board, setBoard] = useState(0);
  const [circles, setCircles] = useState([]);
  const [next, setNext] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const startRef = useRef(0);
  const tickRef = useRef(null);

  const newBoard = useCallback(() => {
    const ls = labels(mode, count);
    setCircles(layout(count).map((p, i) => ({ ...p, label: ls[i] })));
    setNext(0); setWrong(-1); setErrors(0); setElapsed(0); setFb(null); setRunning(false);
  }, [mode, count]);

  useEffect(() => { newBoard(); return () => clearInterval(tickRef.current); }, [newBoard]);

  const tap = (i) => {
    if (ended || next >= circles.length) return;
    if (i < next) return; // already done
    if (!running) {
      // The clock starts with the first tap
      if (i !== 0) { setWrong(i); setFb({ type: 'warn', msg: `Start with ${circles[0].label}` }); return; }
      startRef.current = performance.now();
      setRunning(true);
      tickRef.current = setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 100);
    }
    if (i !== next) {
      setWrong(i);
      setErrors(e => e + 1);
      setFb({ type: 'err', msg: `Next is ${circles[next].label}` });
      return;
    }
    setWrong(-1); setFb(null);
    const n = next + 1;
    setNext(n);
    if (n === circles.length) {
      clearInterval(tickRef.current);
      setRunning(false);
      const secs = (performance.now() - startRef.current) / 1000;
      setElapsed(secs);
      const res = { secs, errors };
      const all = [...results, res];
      setResults(all);
      setFb({ type: 'ok', msg: `Done in ${secs.toFixed(1)}s${errors ? ` · ${errors} error${errors > 1 ? 's' : ''}` : ''}` });
      if (all.length >= BOARDS) setTimeout(() => setEnded(true), 1400);
      else setTimeout(() => { setBoard(b => b + 1); newBoard(); }, 1400);
    }
  };

  const restart = () => { setResults([]); setBoard(0); setEnded(false); newBoard(); };

  if (ended) {
    // Points per circle, minus time and errors — faster and cleaner = more
    const score = results.reduce((s, r) => s + Math.max(10, Math.round(count * 20 - r.secs * 4 - r.errors * 15)), 0);
    const errs = results.reduce((s, r) => s + r.errors, 0);
    const avg = results.reduce((s, r) => s + r.secs, 0) / results.length;
    return (
      <GameEnd
        gameId={GAME_ID}
        score={score}
        correct={count * BOARDS}
        total={count * BOARDS + errs}
        label={`Ø ${avg.toFixed(1)}s per trail · ${errs} errors · Part ${mode}`}
        onReplay={restart}
        onBack={onBack}
      />
    );
  }

  const done = circles.slice(0, next);

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Trail', value: `${Math.min(board + 1, BOARDS)}/${BOARDS}`, color: 'var(--orange)' },
        { label: 'Time', value: `${elapsed.toFixed(1)}s`, color: 'var(--accent)' },
        { label: 'Errors', value: errors, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        {mode === 'A' ? 'Tap the numbers in order: 1 → 2 → 3 …' : 'Alternate numbers and letters: 1 → A → 2 → B → 3 …'} The clock starts with your first tap.
      </p>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '1', margin: '0 auto',
        background: 'var(--bg3)', border: '1px solid var(--gray5)', borderRadius: 14,
      }}>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {done.slice(1).map((c, i) => (
            <line key={i} x1={done[i].x} y1={done[i].y} x2={c.x} y2={c.y} stroke="var(--accent)" strokeWidth="0.8" strokeLinecap="round" />
          ))}
        </svg>
        {circles.map((c, i) => {
          const isDone = i < next;
          const isWrong = wrong === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              style={{
                position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)',
                width: '11%', aspectRatio: '1', borderRadius: '50%', border: '2px solid',
                borderColor: isWrong ? 'var(--red)' : isDone ? 'var(--accent)' : 'var(--gray4)',
                background: isWrong ? 'var(--red-g)' : isDone ? 'var(--accent)' : 'var(--bg5)',
                color: isDone ? '#fff' : 'var(--white)',
                fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'clamp(11px, 3.4vw, 16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                cursor: isDone ? 'default' : 'pointer',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {fb && <div style={{ marginTop: 12 }}><Feedback type={fb.type} message={fb.msg} /></div>}
    </div>
  );
}
