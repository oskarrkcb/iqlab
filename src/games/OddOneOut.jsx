import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { useKeySelect } from './useKeySelect';
import { R, pick, shuf, oooGens } from './utils';
const GAME_ID = 'ooo';
const TIME_LIMIT = { easy: null, medium: null, hard: 15, 'really-hard': 10 };
const ITEM_COUNT = { easy: 6, medium: 6, hard: 7, 'really-hard': 8 };

// ── Hard/really-hard generators (defined inline, difficulty-specific) ──

/** Perfect squares: all are perfect squares except one */
const genSquares = (count) => {
  const allSquares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
  const squares = shuf(allSquares).slice(0, count - 1);
  const oi = R(0, count - 2);
  // Pick a non-square that's in range
  let odd;
  do { odd = R(2, 99); } while (Math.sqrt(odd) === Math.floor(Math.sqrt(odd)));
  const nums = [...squares];
  nums.splice(oi, 0, odd);
  return { nums, oi, rule: `All perfect squares — <b>${odd}</b> is not a perfect square` };
};

/** Fibonacci: all fibonacci except one */
const genFibonacci = (count) => {
  const fibs = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  const chosen = shuf(fibs).slice(0, count - 1);
  const oi = R(0, count - 2);
  const fibSet = new Set(fibs);
  let odd;
  do { odd = R(4, 140); } while (fibSet.has(odd));
  const nums = [...chosen];
  nums.splice(oi, 0, odd);
  return { nums, oi, rule: `All Fibonacci numbers — <b>${odd}</b> is not Fibonacci` };
};

/** Divisible by N: all divisible by N except one */
const genDivisible = (count) => {
  const base = pick([4, 6, 7, 8, 9, 11]);
  const nums = [];
  const used = new Set();
  while (nums.length < count - 1) {
    const v = base * R(1, 15);
    if (!used.has(v)) { used.add(v); nums.push(v); }
  }
  const oi = R(0, count - 2);
  let odd;
  do { odd = R(base + 1, base * 14); } while (odd % base === 0);
  nums.splice(oi, 0, odd);
  return { nums, oi, rule: `All divisible by ${base} — <b>${odd}</b> is not` };
};

/** Digit sum: all have same digit sum except one */
const digitSum = (n) => String(Math.abs(n)).split('').reduce((a, b) => a + +b, 0);
const genDigitSum = (count) => {
  const target = R(4, 12);
  const pool = [];
  for (let i = 10; i < 200; i++) { if (digitSum(i) === target) pool.push(i); }
  if (pool.length < count - 1) return genDivisible(count); // fallback
  const chosen = shuf(pool).slice(0, count - 1);
  const oi = R(0, count - 2);
  let odd;
  do { odd = R(10, 199); } while (digitSum(odd) === target);
  const nums = [...chosen];
  nums.splice(oi, 0, odd);
  return { nums, oi, rule: `All have digit sum ${target} — <b>${odd}</b> has digit sum ${digitSum(odd)}` };
};

// Generator pools by difficulty
function getGenerators(difficulty, count) {
  if (difficulty === 'easy') {
    // generators 0-2: simple series, even, odd
    return [
      () => { const g = oooGens[0](); return fixCount(g, count); },
      () => { const g = oooGens[1](); return fixCount(g, count); },
      () => { const g = oooGens[2](); return fixCount(g, count); },
    ];
  }
  if (difficulty === 'medium') {
    return oooGens.map(g => () => fixCount(g(), count));
  }
  if (difficulty === 'hard') {
    return [
      () => fixCount(oooGens[3](), count), // primes
      () => fixCount(oooGens[4](), count), // multiples
      () => genSquares(count),
      () => genDigitSum(count),
      () => genDivisible(count),
    ];
  }
  // really-hard
  return [
    () => genSquares(count),
    () => genDigitSum(count),
    () => genDivisible(count),
    () => genFibonacci(count),
  ];
}

/** Adjust item count of a base generator's output */
function fixCount(puzzle, targetCount) {
  const { nums, oi, rule } = puzzle;
  if (nums.length === targetCount) return puzzle;
  if (nums.length > targetCount) {
    // Remove non-odd-one-out items from the end
    const newNums = [];
    let newOi = oi;
    for (let i = 0; i < nums.length && newNums.length < targetCount; i++) {
      if (i === oi || newNums.length < targetCount - 1 || i === oi) {
        newNums.push(nums[i]);
        if (i === oi) newOi = newNums.length - 1;
      } else if (newNums.length < targetCount) {
        newNums.push(nums[i]);
      }
    }
    return { nums: newNums, oi: newOi, rule };
  }
  // Need more items — add extras that fit the pattern (not the odd one)
  const newNums = [...nums];
  const oddVal = nums[oi];
  while (newNums.length < targetCount) {
    // duplicate a non-odd value with slight variation
    const base = nums.filter((_, i) => i !== oi);
    const extra = pick(base) + R(-1, 1);
    if (extra !== oddVal && !newNums.includes(extra) && extra > 0) {
      newNums.push(extra);
    } else {
      newNums.push(pick(base));
    }
  }
  return { nums: newNums, oi, rule };
}

export default function OddOneOut({ onBack, difficulty = 'medium' }) {
  const timeLimit = TIME_LIMIT[difficulty] ?? null;
  const count = ITEM_COUNT[difficulty] || 6;
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
    const gens = getGenerators(difficulty, count);
    setPuzzle(pick(gens)());
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
  }, [state.rn, timeLimit, difficulty, count]);

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

  const pickNum = useCallback((i) => {
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
  }, [answered, puzzle, stopTimer, nextRound]);

  useKeySelect(pickNum, puzzle?.nums?.length ?? 4, answered);

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
