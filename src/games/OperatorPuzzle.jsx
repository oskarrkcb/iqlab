import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { R, pick } from './utils';
const GAME_ID = 'op';

function evalOps(nums, ops) {
  try {
    const map = { '+': '+', '−': '-', '×': '*', '÷': '/' };
    let e = '';
    nums.forEach((n, i) => { e += n; if (i < ops.length) e += map[ops[i]]; });
    const r = Function('"use strict";return(' + e + ')')();
    return Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : null;
  } catch { return null; }
}

function generate(difficulty = 'medium') {
  const ops = ['+', '−', '×', '÷'];
  const [minV, maxV, minN, maxN] =
    difficulty === 'easy'        ? [1,  8, 2, 3] :
    difficulty === 'hard'        ? [1, 20, 4, 4] :
    difficulty === 'really-hard' ? [2, 30, 4, 5] :
                                   [1, 12, 3, 4];
  for (let a = 0; a < 200; a++) {
    const n = R(minN, maxN), nums = [], co = [];
    for (let i = 0; i < n; i++) nums.push(R(minV, maxV));
    for (let i = 0; i < n - 1; i++) co.push(pick(ops));
    const r = evalOps(nums, co);
    if (r !== null && Number.isInteger(r) && r > 0 && r < 500) return { nums, ops: co, target: r };
  }
  return { nums: [3, 4, 5], ops: ['+', '×'], target: 23 };
}

export default function OperatorPuzzle({ onBack, difficulty = 'medium' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const timerRef = useRef(null);
  const MX = 10;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const fmtSol = (p) => p.nums.map((n, i) => i < p.ops.length ? `${n} ${p.ops[i]}` : `${n}`).join(' ') + ` = ${p.target}`;

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setFb(null); setExpl(null); setWaiting(false);
    const p = generate(difficulty);
    setPuzzle(p);
    setSlots(new Array(p.ops.length).fill(''));
    setActiveSlot(0);
    setTimeLeft(25);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(timerRef.current); return 0; }
        return prev - 0.1;
      });
    }, 100);
  }, [state.rn]);

  useEffect(() => {
    if (timeLeft <= 0 && puzzle && !waiting) {
      setWaiting(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Time's up! ${fmtSol(puzzle)}` });
    }
  }, [timeLeft, puzzle, waiting]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const placeOp = (op) => {
    if (waiting) return;
    setSlots(prev => {
      const next = [...prev];
      next[activeSlot] = op;
      return next;
    });
    if (activeSlot < slots.length - 1) setActiveSlot(activeSlot + 1);
  };

  const submit = () => {
    if (slots.includes('') || !puzzle) return;
    stopTimer(); setWaiting(true);
    const r = evalOps(puzzle.nums, slots);
    if (r === puzzle.target) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Result: ${r ?? '?'} — not ${puzzle.target}` });
      setExpl({ steps: [fmtSol(puzzle)] });
    }
  };

  const reset = () => { setSlots(new Array(puzzle.ops.length).fill('')); setActiveSlot(0); };
  const skip = () => {
    stopTimer(); setWaiting(true); setState(s => ({ ...s, sr: 0 }));
    setFb({ type: 'err', msg: fmtSol(puzzle) });
  };

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={state.sc} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); }} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      <GameTimer timeLeft={timeLeft} maxTime={25} />
      {puzzle && (
        <>
          <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 8 }}>Insert +, −, × or ÷</p>
          <div className="g-opr">
            {puzzle.nums.map((n, i) => (
              <span key={i}>
                <span className="g-opn">{n}</span>
                {i < slots.length && (
                  <span
                    className={`g-ops${slots[i] ? ' fill' : ''}${i === activeSlot ? ' act' : ''}`}
                    onClick={() => setActiveSlot(i)}
                  >
                    {slots[i] || '?'}
                  </span>
                )}
              </span>
            ))}
            <span className="g-opeq">=</span>
            <span className="g-optgt">{puzzle.target}</span>
          </div>
          <div className="g-opbs">
            {['+', '−', '×', '÷'].map(op => (
              <button key={op} className="g-opb" onClick={() => placeOp(op)} disabled={waiting}>{op}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={submit} disabled={waiting}>Check</button>
            <button className="btn btn-ghost" onClick={reset} disabled={waiting}>Reset</button>
            <button className="btn btn-ghost" onClick={skip} disabled={waiting}>Skip</button>
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {expl && <Explanation steps={expl.steps} />}
      {waiting && !fb?.type?.includes('ok') && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>Continue →</button>
      )}
    </div>
  );
}
