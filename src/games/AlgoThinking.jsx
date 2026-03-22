import { useState, useEffect, useCallback } from 'react';
import { GameStats, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { R, pick, shuf } from './utils';
const GAME_ID = 'algo';

function generatePuzzle(difficulty = 'medium') {
  const easyTypes = [1, 2, 3];
  const hardTypes = [0, 3, 5];
  const type = difficulty === 'easy' ? pick(easyTypes)
    : difficulty === 'really-hard' ? pick(hardTypes)
    : R(0, 5);
  const hard = difficulty === 'hard' || difficulty === 'really-hard';

  if (type === 0) {
    // Trace a loop
    let x = hard ? R(5, 20) : R(1, 5);
    const steps = hard ? R(4, 6) : R(3, 5);
    const ops = [];
    let result = x;
    for (let i = 0; i < steps; i++) {
      const op = pick(['+', '-', '*']);
      const val = op === '*' ? (hard ? R(2, 4) : R(2, 3)) : (hard ? R(1, 10) : R(1, 5));
      ops.push({ op, val });
      if (op === '+') result += val;
      else if (op === '-') result -= val;
      else result *= val;
    }
    return {
      q: `x = ${x}`,
      code: ops.map(o => `x = x ${o.op} ${o.val}`).join('\n'),
      ask: 'What is x?',
      answer: result,
      opts: shuf([result, result + R(1, 3), result - R(1, 3), result * 2].map(String)),
      get correct() { return this.opts.indexOf(String(result)); },
      ex: `Step by step: x = ${x} → ${ops.map(o => `${o.op} ${o.val}`).join(' → ')} = ${result}`,
    };
  }

  if (type === 1) {
    // Array operation
    const arr = Array.from({ length: hard ? R(6, 9) : R(4, 6) }, () => hard ? R(1, 50) : R(1, 20));
    const op = pick(['sum', 'max', 'min', 'count even']);
    let result;
    if (op === 'sum') result = arr.reduce((a, b) => a + b, 0);
    else if (op === 'max') result = Math.max(...arr);
    else if (op === 'min') result = Math.min(...arr);
    else result = arr.filter(x => x % 2 === 0).length;
    return {
      q: `arr = [${arr.join(', ')}]`,
      code: `result = ${op === 'count even' ? 'count(x for x in arr if x % 2 == 0)' : `${op}(arr)`}`,
      ask: 'What is result?',
      answer: result,
      opts: shuf([result, result + R(1, 4), result - R(1, 4), result + R(5, 10)].filter(x => x >= 0).map(String)).slice(0, 4),
      get correct() { return this.opts.indexOf(String(result)); },
      ex: `${op} of [${arr.join(', ')}] = ${result}`,
    };
  }

  if (type === 2) {
    // Conditional
    const a = R(1, 20), b = R(1, 20);
    const result = a > b ? a - b : a + b;
    return {
      q: `a = ${a}, b = ${b}`,
      code: `if a > b:\n  result = a - b\nelse:\n  result = a + b`,
      ask: 'What is result?',
      answer: result,
      opts: shuf([result, a + b, a - b, a * b].map(String)),
      get correct() { return this.opts.indexOf(String(result)); },
      ex: `${a} ${a > b ? '>' : '≤'} ${b}, so result = ${a} ${a > b ? '-' : '+'} ${b} = ${result}`,
    };
  }

  if (type === 3) {
    // Loop counter
    const n = hard ? R(10, 30) : R(5, 12);
    const step = pick([1, 2, 3]);
    let count = 0;
    for (let i = 0; i < n; i += step) count++;
    return {
      q: `count = 0`,
      code: `for i in range(0, ${n}, ${step}):\n  count += 1`,
      ask: 'What is count?',
      answer: count,
      opts: shuf([count, count + 1, count - 1, n].map(String)),
      get correct() { return this.opts.indexOf(String(count)); },
      ex: `range(0, ${n}, ${step}) = [${Array.from({ length: count }, (_, i) => i * step).join(', ')}] → ${count} iterations`,
    };
  }

  if (type === 4) {
    // String operation
    const words = ['hello', 'world', 'python', 'code', 'brain', 'logic', 'think', 'smart'];
    const word = pick(words);
    const op = pick(['len', 'reverse', 'upper']);
    let result;
    if (op === 'len') result = String(word.length);
    else if (op === 'reverse') result = word.split('').reverse().join('');
    else result = word.toUpperCase();
    return {
      q: `s = "${word}"`,
      code: `result = ${op === 'len' ? 'len(s)' : op === 'reverse' ? 's[::-1]' : 's.upper()'}`,
      ask: 'What is result?',
      answer: result,
      opts: shuf([result, op === 'len' ? String(word.length + 1) : word, op === 'reverse' ? word : word.split('').reverse().join(''), word.toUpperCase()].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4),
      get correct() { return this.opts.indexOf(result); },
      ex: `${op}("${word}") = ${result}`,
    };
  }

  // Recursion trace
  const n = hard ? R(6, 9) : R(3, 6);
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return {
    q: `def f(n):`,
    code: `  if n <= 1: return 1\n  return n * f(n-1)\n\nresult = f(${n})`,
    ask: 'What is result?',
    answer: result,
    opts: shuf([result, result + n, result / n, result * 2].map(v => String(Math.round(v)))),
    get correct() { return this.opts.indexOf(String(result)); },
    ex: `f(${n}) = ${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${result}`,
  };
}

export default function AlgoThinking({ onBack, difficulty = 'medium' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const MX = 10;

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null); setExpl(null); setWaiting(false);
    setPuzzle(generatePuzzle(difficulty));
  }, [state.rn]);

  useEffect(() => { nextRound(); }, []); // eslint-disable-line

  const answer = (i) => {
    if (answered) return;
    setAnswered(true); setSelected(i);
    const ok = i === puzzle.correct;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Answer: ${puzzle.answer}` });
      setExpl({ steps: [puzzle.ex] });
      setWaiting(true);
    }
  };

  if (ended) return <GameEnd gameId={GAME_ID} score={state.sc} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); }} onBack={onBack} />;

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12 }}>
        Trace the code and find the output
      </p>
      {puzzle && (
        <>
          <div style={{
            background: 'var(--bg5)', borderRadius: 'var(--r)', padding: '16px 20px',
            fontFamily: 'var(--mono)', fontSize: 14, lineHeight: 1.8, marginBottom: 16,
            borderLeft: '3px solid var(--accent)',
          }}>
            <div style={{ color: 'var(--gray2)' }}>{puzzle.q}</div>
            {puzzle.code.split('\n').map((line, i) => (
              <div key={i} style={{ color: 'var(--white)' }}>{line}</div>
            ))}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{puzzle.ask}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {puzzle.opts.map((opt, i) => (
              <button key={i} onClick={() => answer(i)} disabled={answered} style={{
                padding: '14px 20px', borderRadius: 12, textAlign: 'center',
                background: selected === i ? (i === puzzle.correct ? 'var(--green-g)' : 'var(--red-g)') : answered && i === puzzle.correct ? 'var(--green-g)' : 'var(--bg4)',
                border: `2px solid ${selected === i ? (i === puzzle.correct ? 'var(--green)' : 'var(--red)') : answered && i === puzzle.correct ? 'var(--green)' : 'var(--gray5)'}`,
                color: 'var(--white)', fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)',
                cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s',
              }}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {expl && <Explanation steps={expl.steps} />}
      {waiting && <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>Continue →</button>}
    </div>
  );
}
