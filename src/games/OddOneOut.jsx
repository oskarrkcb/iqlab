import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { pick, oooGens } from './utils';
const GAME_ID = 'ooo';
const TIME_LIMIT = { easy: null, medium: null, hard: 15, 'really-hard': 10 };

export default function OddOneOut({ onBack, difficulty = 'medium' }) {
  const timeLimit = TIME_LIMIT[difficulty] ?? null;
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
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
    setPuzzle(pick(oooGens)());
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
  }, [state.rn, timeLimit]);

  useEffect(() => {
    if (timeLimit && timeLeft <= 0 && puzzle && !answered) {
      setAnswered(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setExpl({ steps: [puzzle.rule] });
      setWaiting(true);
    }
  }, [timeLeft, puzzle, answered, timeLimit]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const pickNum = (i) => {
    if (answered) return;
    stopTimer();
    setAnswered(true); setSelected(i);
    const ok = i === puzzle.oi;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: 'Wrong!' });
      setExpl({ steps: [puzzle.rule] });
      setWaiting(true);
    }
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
      {timeLimit && <GameTimer timeLeft={timeLeft} maxTime={timeLimit} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>Find the item that doesn't belong in the group.</p>
      {puzzle && (
        <div className="g-oog">
          {puzzle.nums.map((n, i) => (
            <div
              key={i}
              className={`g-ooc${selected === i ? (i === puzzle.oi ? ' ok' : ' no') : ''}${answered && i === puzzle.oi && selected !== i ? ' ok' : ''}`}
              onClick={() => pickNum(i)}
            >
              {n}
            </div>
          ))}
        </div>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {expl && <Explanation steps={expl.steps} />}
      {waiting && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>Continue →</button>
      )}
    </div>
  );
}
