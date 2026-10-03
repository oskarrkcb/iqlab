import { useState, useEffect, useRef } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R, shuf } from './utils';
const GAME_ID = 'gonogo';

// Go/No-Go: tap as fast as you can for "Go", hold back for "No-Go" (impulse control).

const SETUP = {
  easy:          { window: 1100, noGo: 0.25, look: 'color' },
  medium:        { window: 850,  noGo: 0.3,  look: 'color' },
  hard:          { window: 650,  noGo: 0.3,  look: 'shape' },
  'really-hard': { window: 520,  noGo: 0.35, look: 'shape' },
};
const TRIALS = 40;

const STIMULI = {
  color: { go: { shape: 'circle', color: 'var(--green)' }, nogo: { shape: 'circle', color: 'var(--red)' } },
  shape: { go: { shape: 'circle', color: 'var(--blue)' }, nogo: { shape: 'square', color: 'var(--blue)' } },
};

function makeTrials(noGo) {
  const n = Math.round(TRIALS * noGo);
  return shuf([...Array(n).fill('nogo'), ...Array(TRIALS - n).fill('go')]);
}

export default function GoNoGo({ onBack, difficulty = 'medium' }) {
  const setup = SETUP[difficulty] || SETUP.medium;
  const look = STIMULI[setup.look];
  const [phase, setPhase] = useState('ready'); // ready, run
  const [stim, setStim] = useState(null);      // null | 'go' | 'nogo'
  const [trial, setTrial] = useState(0);
  const [counts, setCounts] = useState({ hits: 0, misses: 0, fa: 0, cr: 0, bonus: 0 });
  const [rts, setRts] = useState([]);
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const trialsRef = useRef([]);
  const timerRef = useRef(null);
  const live = useRef({ index: -1, shownAt: 0, open: false });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const record = (key, extra = {}) => setCounts(c => ({ ...c, [key]: c[key] + 1, bonus: c.bonus + (extra.bonus || 0) }));

  const runTrial = (i) => {
    if (i >= TRIALS) { setStim(null); setEnded(true); return; }
    setStim(null);
    setTrial(i + 1);
    timerRef.current = setTimeout(() => {
      const kind = trialsRef.current[i];
      live.current = { index: i, shownAt: performance.now(), open: true };
      setStim(kind);
      // No reaction within the window
      timerRef.current = setTimeout(() => {
        if (!live.current.open) return;
        live.current.open = false;
        if (kind === 'go') { record('misses'); setFb({ type: 'err', msg: 'Too slow!' }); }
        else { record('cr'); setFb({ type: 'ok', msg: 'Well held back' }); }
        runTrial(i + 1);
      }, setup.window);
    }, R(400, 900));
  };

  const start = () => {
    trialsRef.current = makeTrials(setup.noGo);
    setCounts({ hits: 0, misses: 0, fa: 0, cr: 0, bonus: 0 });
    setRts([]); setFb(null); setEnded(false);
    setPhase('run');
    runTrial(0);
  };

  const respond = () => {
    if (phase !== 'run' || !live.current.open) return;
    live.current.open = false;
    clearTimeout(timerRef.current);
    const kind = trialsRef.current[live.current.index];
    if (kind === 'go') {
      const rt = Math.round(performance.now() - live.current.shownAt);
      setRts(r => [...r, rt]);
      // Faster than the window = up to 10 bonus points
      record('hits', { bonus: Math.max(0, Math.round(10 * (1 - rt / setup.window))) });
      setFb({ type: 'ok', msg: `${rt} ms` });
    } else {
      record('fa');
      setFb({ type: 'err', msg: "Don't tap on that one!" });
    }
    runTrial(live.current.index + 1);
  };

  // Space bar works too
  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); respond(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const restart = () => { setPhase('ready'); setEnded(false); setTrial(0); setStim(null); };

  if (ended) {
    const { hits, misses, fa, cr, bonus } = counts;
    const score = Math.max(0, hits * 10 + cr * 10 + bonus - fa * 15 - misses * 5);
    const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
    return (
      <GameEnd
        gameId={GAME_ID}
        score={score}
        correct={hits + cr}
        total={TRIALS}
        label={`${hits} hits · ${fa} false taps · ${misses} too slow · Ø ${avgRt} ms`}
        onReplay={restart}
        onBack={onBack}
      />
    );
  }

  const shown = stim ? look[stim] : null;

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Trial', value: `${trial}/${TRIALS}`, color: 'var(--orange)' },
        { label: 'Hits', value: counts.hits, color: 'var(--green)' },
        { label: 'False taps', value: counts.fa, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Tap as fast as you can on
        <span style={{ display: 'inline-block', width: 12, height: 12, margin: '0 6px', verticalAlign: 'middle', background: look.go.color, borderRadius: look.go.shape === 'circle' ? '50%' : 2 }} />
        — but never on
        <span style={{ display: 'inline-block', width: 12, height: 12, margin: '0 6px', verticalAlign: 'middle', background: look.nogo.color, borderRadius: look.nogo.shape === 'circle' ? '50%' : 2 }} />.
        Space bar works too.
      </p>
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); respond(); }}
        aria-label="Tap"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', maxWidth: 360, aspectRatio: '1', margin: '0 auto',
          background: 'var(--bg3)', border: '1px solid var(--gray5)', borderRadius: 14,
          cursor: phase === 'run' ? 'pointer' : 'default', touchAction: 'manipulation', userSelect: 'none',
        }}
      >
        {shown && (
          <span style={{
            width: '45%', aspectRatio: '1', background: shown.color,
            borderRadius: shown.shape === 'circle' ? '50%' : 12,
          }} />
        )}
        {!shown && phase === 'run' && <span style={{ color: 'var(--gray4)', fontSize: 28 }}>+</span>}
      </button>
      {phase === 'ready' && (
        <button className="btn btn-primary btn-w" style={{ marginTop: 16 }} onClick={start}>Start</button>
      )}
      {fb && phase === 'run' && <div style={{ marginTop: 12 }}><Feedback type={fb.type} message={fb.msg} /></div>}
    </div>
  );
}
