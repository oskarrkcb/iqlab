import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R, shuf } from './utils';
const GAME_ID = 'est';

function generate(difficulty = 'medium') {
  let q, res;
  if (difficulty === 'easy') {
    const t = R(0, 2);
    if (t === 0) { const a = R(2, 9), b = R(2, 9); res = a * b; q = `${a} × ${b}`; }
    else if (t === 1) { const a = R(10, 49), b = R(10, 49); res = a + b; q = `${a} + ${b}`; }
    else { const a = R(20, 49), b = R(5, a - 1); res = a - b; q = `${a} − ${b}`; }
  } else if (difficulty === 'hard') {
    const t = R(0, 3);
    if (t === 0) { const a = R(50, 999), b = R(50, 999); res = a * b; q = `${a} × ${b}`; }
    else if (t === 1) { const a = R(5, 30); res = a * a * a; q = `${a}³`; }
    else if (t === 2) { const a = R(100, 999), b = R(100, 999); res = a * b; q = `${a} × ${b}`; }
    else { const a = R(10, 50), b = R(10, 50), c = R(10, 50); res = a * b + c; q = `${a}×${b}+${c}`; }
  } else if (difficulty === 'really-hard') {
    const t = R(0, 3);
    if (t === 0) { const a = R(100, 999), b = R(100, 999), c = R(100, 999); res = a * b + c; q = `${a}×${b}+${c}`; }
    else if (t === 1) { const a = R(20, 99), b = R(20, 99), c = R(20, 99); res = a * b * c; q = `${a}×${b}×${c}`; }
    else if (t === 2) { const a = R(10, 99); res = a * a * a; q = `${a}³`; }
    else { const a = R(1000, 9999), b = R(1000, 9999); res = a + b; q = `${a} + ${b}`; }
  } else {
    const t = R(0, 4);
    if (t === 0) { const a = R(12, 99), b = R(12, 99); res = a * b; q = `${a} × ${b}`; }
    else if (t === 1) { const a = R(100, 999), b = R(100, 999); res = a + b; q = `${a} + ${b}`; }
    else if (t === 2) { const a = R(200, 999), b = R(10, a - 1); res = a - b; q = `${a} − ${b}`; }
    else if (t === 3) { const a = R(4, 25); res = a * a; q = `${a}²`; }
    else { const a = R(11, 99), b = R(3, 9); res = a * b; q = `${a} × ${b}`; }
  }
  let ch = new Set([res]);
  while (ch.size < 3) {
    const o = Math.max(1, Math.round(Math.abs(res) * R(10, 35) / 100));
    ch.add(res + (Math.random() > 0.5 ? o : -o));
  }
  const choices = shuf([...ch]);
  return { q, res, choices, ci: choices.indexOf(res) };
}

export default function Estimation({ onBack, difficulty = 'medium' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  const MX = 10;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null);
    setPuzzle(generate());
    setTimeLeft(10);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(timerRef.current); return 0; }
        return prev - 0.1;
      });
    }, 100);
  }, [state.rn]);

  useEffect(() => {
    if (timeLeft <= 0 && puzzle && !answered) {
      setAnswered(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Time's up! ${puzzle.res.toLocaleString()}` });
      setTimeout(nextRound, 2200);
    }
  }, [timeLeft, puzzle, answered, nextRound]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const pickChoice = (i) => {
    if (answered) return;
    setAnswered(true); setSelected(i); stopTimer();
    const ok = i === puzzle.ci;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `${puzzle.res.toLocaleString()}` });
    }
    setTimeout(nextRound, 1800);
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
      <GameTimer timeLeft={timeLeft} maxTime={10} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Estimate the quantity shown. The closest guess wins the most points.
      </p>
      {puzzle && (
        <>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, textAlign: 'center', padding: 20 }}>
            {puzzle.q} = ?
          </div>
          <div className="g-estg">
            {puzzle.choices.map((v, i) => (
              <div
                key={i}
                className={`g-estc${selected === i ? (i === puzzle.ci ? ' ok' : ' no') : ''}${answered && i === puzzle.ci && selected !== i ? ' was' : ''}`}
                onClick={() => pickChoice(i)}
              >
                {v.toLocaleString()}
              </div>
            ))}
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
