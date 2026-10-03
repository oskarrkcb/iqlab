import { useState, useEffect, useRef } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
const GAME_ID = 'hanoi';

// Tower of Hanoi: planning ahead. Move the whole tower to the right peg,
// one disk at a time, never a larger disk on a smaller one.

const DISKS = { easy: 3, medium: 4, hard: 5, 'really-hard': 6 };
const DISK_COLORS = ['var(--accent)', 'var(--green)', 'var(--orange)', 'var(--purple)', 'var(--red)', 'var(--blue)'];

const startPegs = (n) => [Array.from({ length: n }, (_, i) => n - i), [], []];

export default function TowerOfHanoi({ onBack, difficulty = 'medium' }) {
  const n = DISKS[difficulty] || 4;
  const optimal = 2 ** n - 1;
  const [pegs, setPegs] = useState(() => startPegs(n));
  const [selected, setSelected] = useState(-1);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fb, setFb] = useState(null);
  const [solved, setSolved] = useState(false);
  const [ended, setEnded] = useState(false);
  const startRef = useRef(0);
  const tickRef = useRef(null);

  useEffect(() => () => clearInterval(tickRef.current), []);

  const tapPeg = (p) => {
    if (solved) return;
    if (selected < 0) {
      if (pegs[p].length === 0) return;
      setSelected(p); setFb(null);
      return;
    }
    if (selected === p) { setSelected(-1); return; }
    const from = pegs[selected], to = pegs[p];
    const disk = from[from.length - 1];
    if (to.length && to[to.length - 1] < disk) {
      setFb({ type: 'err', msg: 'A larger disk can\'t go on a smaller one' });
      setSelected(-1);
      return;
    }
    if (moves === 0) {
      startRef.current = performance.now();
      tickRef.current = setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 200);
    }
    const next = pegs.map(peg => [...peg]);
    next[p].push(next[selected].pop());
    setPegs(next);
    setSelected(-1);
    setMoves(m => m + 1);
    if (next[2].length === n) {
      clearInterval(tickRef.current);
      setElapsed((performance.now() - startRef.current) / 1000);
      setSolved(true);
      const total = moves + 1;
      setFb({ type: 'ok', msg: total === optimal ? `Perfect — the minimum ${optimal} moves!` : `Solved in ${total} moves (minimum: ${optimal})` });
      setTimeout(() => setEnded(true), 1800);
    }
  };

  const restart = () => {
    clearInterval(tickRef.current);
    setPegs(startPegs(n)); setSelected(-1); setMoves(0); setElapsed(0);
    setFb(null); setSolved(false); setEnded(false);
  };

  if (ended) {
    // Efficiency (minimum moves ÷ your moves) × difficulty; a little extra for speed
    const efficiency = optimal / moves;
    const score = Math.round(n * 100 * efficiency + Math.max(0, optimal * 3 - elapsed));
    return (
      <GameEnd
        gameId={GAME_ID}
        score={score}
        correct={optimal}
        total={moves}
        label={`${n} disks · ${moves} moves (minimum ${optimal}) · ${elapsed.toFixed(0)}s`}
        onReplay={restart}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Moves', value: moves, color: 'var(--accent)' },
        { label: 'Minimum', value: optimal, color: 'var(--green)' },
        { label: 'Time', value: `${elapsed.toFixed(0)}s`, color: 'var(--orange)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Move the tower to the right peg. Tap a peg to pick up its top disk, then tap where it goes. Never put a larger disk on a smaller one.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 440, margin: '0 auto' }}>
        {pegs.map((peg, p) => (
          <button
            key={p}
            type="button"
            onClick={() => tapPeg(p)}
            aria-label={`Peg ${p + 1}`}
            style={{
              position: 'relative', height: 40 + n * 24, padding: '0 4px 8px',
              display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 3,
              background: selected === p ? 'var(--glow)' : 'var(--bg3)',
              border: `2px solid ${selected === p ? 'var(--accent)' : p === 2 ? 'var(--green-g)' : 'var(--gray5)'}`,
              borderRadius: 12, cursor: solved ? 'default' : 'pointer',
            }}
          >
            <span style={{ position: 'absolute', bottom: 8, top: 14, left: '50%', width: 4, marginLeft: -2, background: 'var(--gray5)', borderRadius: 2 }} />
            {peg.map((d, k) => (
              <span key={d} style={{
                position: 'relative', height: 20, borderRadius: 6,
                width: `${30 + (d / n) * 65}%`,
                background: DISK_COLORS[(d - 1) % DISK_COLORS.length],
                outline: selected === p && k === peg.length - 1 ? '2px solid var(--white)' : 'none',
                transform: selected === p && k === peg.length - 1 ? 'translateY(-6px)' : 'none',
                transition: 'transform 0.12s',
              }} />
            ))}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={restart} disabled={moves === 0 || solved}>Reset</button>
      </div>
      {fb && <div style={{ marginTop: 12 }}><Feedback type={fb.type} message={fb.msg} /></div>}
    </div>
  );
}
