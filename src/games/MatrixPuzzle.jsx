import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { useKeySelect } from './useKeySelect';
import { R, pick, shuf, matGens } from './utils';
const GAME_ID = 'mat';

// ── Hard matrix generators ──
const hardMatGens = [
  // Fibonacci-like per row: c = a + b
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(1, 12), b = R(1, 12);
      g.push([a, b, a + b]);
    }
    return { g, rule: 'Row: Col3 = Col1 + Col2 (Fibonacci-like)' };
  },
  // Each cell = row_index * col_value + offset
  () => {
    const base = R(2, 5);
    const g = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) row.push((r + 1) * (c + 1) * base);
      g.push(row);
    }
    return { g, rule: `Each cell = row × col × ${base}` };
  },
  // Row: a * b - c = constant
  () => {
    const target = R(2, 15);
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(2, 8), b = R(2, 8);
      g.push([a, b, a * b - target]);
    }
    return { g, rule: `Row: Col1 × Col2 − Col3 = ${target}` };
  },
  // Diagonal = constant, rest varies
  () => {
    const d = R(5, 20);
    const g = [[d, R(1, 15), R(1, 15)], [R(1, 15), d, R(1, 15)], [R(1, 15), R(1, 15), d]];
    return { g, rule: `Main diagonal = <b>${d}</b>` };
  },
  // Col product: col1 * col2 = col3
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(2, 6), b = R(2, 6);
      g.push([a, b, a * b]);
    }
    return { g, rule: 'Row: Col1 × Col2 = Col3' };
  },
  // Squared diff: |a² - b²| = c
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(2, 7), b = R(1, a - 1);
      g.push([a, b, a * a - b * b]);
    }
    return { g, rule: 'Row: Col1² − Col2² = Col3' };
  },
];

const VARIANCE = { easy: 20, medium: 7, hard: 3, 'really-hard': 2 };
const MAT_TIME = { hard: 20, 'really-hard': 15 };

function getMatGens(difficulty) {
  if (difficulty === 'easy') return [matGens[0], matGens[1], matGens[4]]; // sum per row/col, addition
  if (difficulty === 'medium') return matGens;
  if (difficulty === 'hard') return [...matGens.slice(2, 4), ...hardMatGens.slice(0, 4)]; // series, multiply + hard
  return hardMatGens; // really-hard: only hard generators
}

export default function MatrixPuzzle({ onBack, difficulty = 'medium' }) {
  const timeLimit = MAT_TIME[difficulty] ?? null;
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [grid, setGrid] = useState(null);
  const [hidden, setHidden] = useState({ r: 0, c: 0 });
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [rule, setRule] = useState('');
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(null);
  const MX = 10;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null); setExpl(null); setWaiting(false);
    const gens = getMatGens(difficulty);
    const p = pick(gens)();
    const hr = R(0, 2), hc = R(0, 2);
    const ans = p.g[hr][hc];
    const variance = VARIANCE[difficulty] || 7;
    let opts = new Set([ans]);
    while (opts.size < 4) { const o = ans + (Math.random() > 0.5 ? 1 : -1) * R(1, variance); if (o > 0) opts.add(o); }
    const shuffled = shuf([...opts]);
    setGrid(p.g); setHidden({ r: hr, c: hc }); setAnswer(ans);
    setOptions(shuffled); setCorrectIdx(shuffled.indexOf(ans)); setRule(p.rule);
    if (timeLimit) {
      setTimeLeft(timeLimit);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) { clearInterval(timerRef.current); return 0; }
          return prev - 0.1;
        });
      }, 100);
    }
  }, [state.rn, difficulty, timeLimit]);

  useEffect(() => {
    if (timeLimit && timeLeft <= 0 && grid && !answered) {
      setAnswered(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setExpl({ steps: [rule, `Missing: <span class="hl">${answer}</span>`] });
      setWaiting(true);
    }
  }, [timeLeft, grid, answered, timeLimit, rule, answer]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const pickOpt = useCallback((i) => {
    if (answered) return;
    stopTimer();
    setAnswered(true); setSelected(i);
    const ok = i === correctIdx;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Answer: <b>${answer}</b>` });
      setExpl({ steps: [rule, `Missing: <span class="hl">${answer}</span>`] });
      setWaiting(true);
    }
  }, [answered, correctIdx, answer, rule, nextRound]);

  useKeySelect(pickOpt, options.length || 4, answered);

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
      {timeLimit && <GameTimer timeLeft={timeLeft} maxTime={timeLimit} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>Find the missing piece that completes the pattern matrix.</p>
      {grid && (
        <>
          <div className="g-matg">
            {grid.flatMap((row, r) => row.map((val, c) => (
              <div key={`${r}-${c}`} className={`g-matc${r === hidden.r && c === hidden.c ? ' mis' : ''}`}>
                {r === hidden.r && c === hidden.c ? (answered ? answer : '?') : val}
              </div>
            )))}
          </div>
          <div className="g-mato">
            {options.map((v, i) => (
              <div
                key={i}
                className={`g-matop${selected === i ? (i === correctIdx ? ' ok' : ' no') : ''}${answered && i === correctIdx && selected !== i ? ' ok' : ''}`}
                onClick={() => pickOpt(i)}
              >
                {v}
              </div>
            ))}
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {expl && <Explanation steps={expl.steps} />}
      {waiting && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>Continue →</button>
      )}
    </div>
  );
}
