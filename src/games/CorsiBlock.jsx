import { useState, useEffect, useRef } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R } from './utils';
const GAME_ID = 'corsi';

// Corsi block-tapping test: visual-spatial working memory.
// Blocks light up one after another; tap them in the same order
// (Really Hard: in reverse order, the "backward Corsi").

// Irregular block layout like the original test board (% of the board)
const BLOCKS = [
  { x: 12, y: 18 }, { x: 46, y: 8 }, { x: 78, y: 22 },
  { x: 30, y: 40 }, { x: 62, y: 46 }, { x: 8, y: 66 },
  { x: 44, y: 74 }, { x: 80, y: 68 }, { x: 24, y: 88 },
];
const START_SPAN = { easy: 3, medium: 4, hard: 5, 'really-hard': 4 };
const LIGHT_MS = { easy: 900, medium: 750, hard: 600, 'really-hard': 650 };
const GAP_MS = 250;
const LIVES = 3;

function makeSequence(len) {
  const seq = [];
  while (seq.length < len) {
    const b = R(0, BLOCKS.length - 1);
    if (b !== seq[seq.length - 1]) seq.push(b); // no block twice in a row
  }
  return seq;
}

export default function CorsiBlock({ onBack, difficulty = 'medium' }) {
  const startSpan = START_SPAN[difficulty] || 4;
  const backward = difficulty === 'really-hard';
  const [span, setSpan] = useState(startSpan);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [seq, setSeq] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready, show, input, result
  const [lit, setLit] = useState(-1);
  const [tapped, setTapped] = useState([]);
  const [wrong, setWrong] = useState(-1);
  const [fb, setFb] = useState(null);
  const [stats, setStats] = useState({ ok: 0, tries: 0 });
  const [ended, setEnded] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => clearTimers, []);

  const startRound = (len) => {
    clearTimers();
    const s = makeSequence(len);
    setSeq(s); setTapped([]); setWrong(-1); setFb(null); setLit(-1);
    setPhase('show');
    const step = (LIGHT_MS[difficulty] || 750) + GAP_MS;
    s.forEach((b, i) => {
      later(() => setLit(b), 500 + i * step);
      later(() => setLit(-1), 500 + i * step + (LIGHT_MS[difficulty] || 750));
    });
    later(() => setPhase('input'), 500 + s.length * step);
  };

  const restart = () => {
    setSpan(startSpan); setBest(0); setLives(LIVES); setStats({ ok: 0, tries: 0 });
    setEnded(false); setPhase('ready');
  };

  const tap = (b) => {
    if (phase !== 'input') return;
    const target = backward ? [...seq].reverse() : seq;
    const next = [...tapped, b];
    setTapped(next);
    setLit(b);
    later(() => setLit(-1), 180);

    if (target[next.length - 1] !== b) {
      setWrong(b);
      setPhase('result');
      const left = lives - 1;
      setLives(left);
      setStats(s => ({ ok: s.ok, tries: s.tries + 1 }));
      setFb({ type: 'err', msg: `Wrong block${left > 0 ? ` · ${left} ${left === 1 ? 'life' : 'lives'} left` : ''}` });
      if (left <= 0) later(() => setEnded(true), 1600);
      else later(() => startRound(span), 1600);
      return;
    }
    if (next.length === target.length) {
      setPhase('result');
      setBest(b0 => Math.max(b0, span));
      setStats(s => ({ ok: s.ok + 1, tries: s.tries + 1 }));
      setFb({ type: 'ok', msg: `Span ${span} correct! Next: ${span + 1} blocks` });
      later(() => { setSpan(span + 1); startRound(span + 1); }, 1300);
    }
  };

  if (ended) {
    return (
      <GameEnd
        gameId={GAME_ID}
        score={best}
        correct={stats.ok}
        total={stats.tries}
        label={`Best span: ${best} blocks${backward ? ' (backward)' : ''}`}
        onReplay={restart}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Span', value: span, color: 'var(--accent)' },
        { label: 'Best', value: best, color: 'var(--orange)' },
        { label: 'Lives', value: lives, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        {phase === 'ready' && `Blocks will light up one by one. Tap them in the same order${backward ? ' — but backwards, last one first' : ''}.`}
        {phase === 'show' && 'Watch…'}
        {phase === 'input' && (backward ? 'Your turn — tap them in REVERSE order' : 'Your turn — tap them in the same order')}
        {phase === 'result' && ' '}
      </p>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1', margin: '0 auto',
        background: 'var(--bg3)', border: '1px solid var(--gray5)', borderRadius: 14,
      }}>
        {BLOCKS.map((p, i) => {
          const isLit = lit === i;
          const isWrong = wrong === i;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Block ${i + 1}`}
              onClick={() => tap(i)}
              style={{
                position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)',
                width: '17%', aspectRatio: '1', borderRadius: 10, border: '2px solid',
                borderColor: isWrong ? 'var(--red)' : isLit ? 'var(--accent)' : 'var(--gray5)',
                background: isWrong ? 'var(--red-g)' : isLit ? 'var(--accent)' : 'var(--bg5)',
                boxShadow: isLit ? '0 0 18px var(--glow2)' : 'none',
                cursor: phase === 'input' ? 'pointer' : 'default',
                transition: 'background 0.12s, border-color 0.12s',
              }}
            />
          );
        })}
      </div>
      {phase === 'ready' && (
        <button className="btn btn-primary btn-w" style={{ marginTop: 16 }} onClick={() => startRound(span)}>Start</button>
      )}
      {phase === 'input' && (
        <p style={{ textAlign: 'center', color: 'var(--gray2)', fontSize: 12, marginTop: 10 }}>
          {tapped.length}/{seq.length}
        </p>
      )}
      {fb && <div style={{ marginTop: 12 }}><Feedback type={fb.type} message={fb.msg} /></div>}
    </div>
  );
}
