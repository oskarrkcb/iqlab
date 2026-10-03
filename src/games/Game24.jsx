import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R } from './utils';
const GAME_ID = 'g24';

function hasSol(nums) {
  const ops = [(a, b) => a + b, (a, b) => a - b, (a, b) => a * b, (a, b) => b ? a / b : NaN];
  function solve(a) {
    if (a.length === 1) return Math.abs(a[0] - 24) < 0.001;
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < a.length; j++) {
        if (i === j) continue;
        const r = a.filter((_, k) => k !== i && k !== j);
        for (const op of ops) {
          const v = op(a[i], a[j]);
          if (!isNaN(v) && isFinite(v) && solve([...r, v])) return true;
        }
      }
    return false;
  }
  return solve(nums);
}

// Which number tiles are already used in the typed expression
function usedTiles(input, nums) {
  const used = new Set();
  (input.match(/\d+/g) || []).map(Number).forEach(v => {
    const i = nums.findIndex((n, k) => n === v && !used.has(k));
    if (i >= 0) used.add(i);
  });
  return used;
}

const KEYS = ['(', ')', '+', '−', '×', '÷'];

export default function Game24({ onBack, difficulty = 'medium' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sk: 0 });
  const [nums, setNums] = useState([]);
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const inputRef = useRef(null);
  const MX = 10;

  const nextRound = useCallback(() => {
    if (inputRef.current) inputRef.current.disabled = false;
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setInput(''); setFb(null);
    let n;
    if (difficulty === 'easy') {
      do { n = [R(1, 6), R(1, 6), R(1, 6), R(1, 6)]; } while (!hasSol(n));
    } else if (difficulty === 'hard') {
      do { n = [R(1, 13), R(1, 13), R(1, 13), R(1, 13)]; } while (!hasSol(n));
    } else if (difficulty === 'really-hard') {
      do { n = [R(2, 13), R(2, 13), R(2, 13), R(2, 13), R(2, 13)]; } while (!hasSol(n));
    } else {
      do { n = [R(1, 9), R(1, 9), R(1, 9), R(1, 9)]; } while (!hasSol(n));
    }
    setNums(n);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [state.rn]);

  useEffect(() => { nextRound(); }, []); // eslint-disable-line

  const submit = () => {
    let expr = input.trim();
    if (!expr) return;
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    const san = expr.replace(/[^0-9+\-*/().]/g, '');
    const digs = (san.match(/\d+/g) || []).map(Number);
    if (digs.length !== nums.length) { setFb({ type: 'err', msg: `Use all ${nums.length} numbers exactly once!` }); return; }
    if ([...digs].sort((a, b) => a - b).join() !== [...nums].sort((a, b) => a - b).join()) {
      setFb({ type: 'err', msg: 'Wrong numbers!' }); return;
    }
    try {
      const r = Function('"use strict";return(' + san + ')')(); // eslint-disable-line
      if (Math.abs(r - 24) < 0.001) {
        setState(s => ({ ...s, sc: s.sc + 1 }));
        setFb({ type: 'ok', msg: 'Got 24!' });
        setTimeout(nextRound, 1400);
      } else {
        setFb({ type: 'err', msg: `= ${Math.round(r * 100) / 100}, not 24` });
      }
    } catch {
      setFb({ type: 'err', msg: 'Invalid expression!' });
    }
  };

  // On-screen keypad
  const used = usedTiles(input, nums);
  const endsWithNumber = /[\d)]\s*$/.test(input);
  const press = (s) => { setInput(prev => prev + s); setFb(null); };
  const backspace = () => setInput(prev => prev.trimEnd().replace(/(\d+|.)$/, ''));

  const skip = () => {
    setState(s => ({ ...s, sk: s.sk + 1 }));
    setFb({ type: 'warn', msg: 'Skipped' });
    setTimeout(nextRound, 1000);
  };

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={state.sc} correct={state.sc} total={MX} label={`${state.sc}/${MX} solved`} onReplay={() => { setState({ sc: 0, rn: 0, sk: 0 }); setEnded(false); }} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Solved', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Skips', value: state.sk, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
        Use all {nums.length} numbers with +, −, ×, ÷ and brackets to make 24. Tap the numbers and signs.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        {nums.map((n, i) => (
          <button key={i} type="button" onClick={() => press(String(n))}
            disabled={used.has(i) || endsWithNumber}
            aria-label={`Number ${n}`}
            style={{
              width: 56, height: 56, background: 'var(--bg4)', border: '2px solid var(--gray5)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: 'var(--white)',
              cursor: used.has(i) || endsWithNumber ? 'default' : 'pointer',
              opacity: used.has(i) ? 0.25 : endsWithNumber ? 0.6 : 1, transition: 'opacity 0.15s',
            }}>{n}</button>
        ))}
      </div>
      <input
        ref={inputRef}
        className="g-input"
        placeholder={`e.g. (${nums[0]}+${nums[1]})×(${nums[2]}−${nums[3]})`}
        autoComplete="off"
        inputMode="none"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        style={{ fontSize: 17 }}
      />
      <div className="g-opbs" style={{ flexWrap: 'wrap' }}>
        {KEYS.map(k => (
          <button key={k} type="button" className="g-opb" onClick={() => press(k)}>{k}</button>
        ))}
        <button type="button" className="g-opb" onClick={backspace} aria-label="Delete">⌫</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={submit}>Check</button>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setFb(null); }}>Clear</button>
        <button className="btn btn-ghost" onClick={skip}>Skip</button>
      </div>
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
