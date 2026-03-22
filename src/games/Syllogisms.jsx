import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { R, pick, shuf } from './utils';
const GAME_ID = 'syllogisms';

const PUZZLES = [
  {
    premises: ['All dogs are animals.', 'All animals are living things.'],
    q: 'Therefore:',
    opts: ['All dogs are living things.', 'All living things are dogs.', 'Some animals are not dogs.', 'No conclusion possible.'],
    correct: 0, ex: 'Transitive: Dogs ⊂ Animals ⊂ Living things → Dogs ⊂ Living things.',
  },
  {
    premises: ['All roses are flowers.', 'Some flowers are red.'],
    q: 'Therefore:',
    opts: ['All roses are red.', 'Some roses might be red.', 'No roses are red.', 'All flowers are roses.'],
    correct: 1, ex: 'Only "some flowers" are red, roses are flowers, so some roses MIGHT be red.',
  },
  {
    premises: ['No fish can fly.', 'All salmon are fish.'],
    q: 'Therefore:',
    opts: ['Some salmon can fly.', 'All fish are salmon.', 'No salmon can fly.', 'Some fish are not salmon.'],
    correct: 2, ex: 'Salmon ⊂ Fish, and no fish can fly → no salmon can fly.',
  },
  {
    premises: ['All programmers use logic.', 'Maria is a programmer.'],
    q: 'Therefore:',
    opts: ['Maria does not use logic.', 'Maria uses logic.', 'All who use logic are programmers.', 'No conclusion possible.'],
    correct: 1, ex: 'Maria ∈ Programmers, all programmers use logic → Maria uses logic.',
  },
  {
    premises: ['Some students are athletes.', 'All athletes are healthy.'],
    q: 'Therefore:',
    opts: ['All students are healthy.', 'Some students are healthy.', 'No students are athletes.', 'All healthy people are students.'],
    correct: 1, ex: 'Some students are athletes, athletes are healthy → some students are healthy.',
  },
  {
    premises: ['If it rains, the ground is wet.', 'The ground is wet.'],
    q: 'Therefore:',
    opts: ['It rained.', 'It might have rained.', 'It did not rain.', 'The ground is always wet.'],
    correct: 1, ex: 'Affirming the consequent is a fallacy. Wet ground could have other causes.',
  },
  {
    premises: ['All metals conduct electricity.', 'Copper is a metal.'],
    q: 'Therefore:',
    opts: ['Copper does not conduct.', 'Copper conducts electricity.', 'All conductors are copper.', 'Some metals are not copper.'],
    correct: 1, ex: 'Copper ∈ Metals, metals conduct → copper conducts.',
  },
  {
    premises: ['No reptiles have fur.', 'Some pets have fur.'],
    q: 'Therefore:',
    opts: ['Some pets are reptiles.', 'No pets are reptiles.', 'Some pets are not reptiles.', 'All reptiles are pets.'],
    correct: 2, ex: 'Pets with fur cannot be reptiles (no reptiles have fur) → some pets are not reptiles.',
  },
  {
    premises: ['If A > B and B > C, then A > C.', 'X > Y and Y > Z.'],
    q: 'Therefore:',
    opts: ['Z > X', 'X = Z', 'X > Z', 'Y > X'],
    correct: 2, ex: 'By transitivity: X > Y > Z → X > Z.',
  },
  {
    premises: ['All squares are rectangles.', 'All rectangles have 4 right angles.'],
    q: 'Therefore:',
    opts: ['All rectangles are squares.', 'Squares have 4 right angles.', 'Some rectangles have no right angles.', 'Squares are not rectangles.'],
    correct: 1, ex: 'Squares ⊂ Rectangles ⊂ Shapes with 4 right angles.',
  },
  {
    premises: ['Either it is day or it is night.', 'It is not day.'],
    q: 'Therefore:',
    opts: ['It is neither.', 'It is night.', 'It could be either.', 'No conclusion.'],
    correct: 1, ex: 'Disjunctive syllogism: A or B, not A → B.',
  },
  {
    premises: ['If you study hard, you pass the exam.', 'You did not pass the exam.'],
    q: 'Therefore:',
    opts: ['You studied hard.', 'You did not study hard.', 'The exam was too hard.', 'No conclusion.'],
    correct: 1, ex: 'Modus tollens: If P→Q and ¬Q, then ¬P. You did not study hard.',
  },
];

const SYL_TIME = { hard: 30, 'really-hard': 20 };

export default function Syllogisms({ onBack, difficulty = 'medium' }) {
  const timeLimit = SYL_TIME[difficulty] ?? null;
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [pool, setPool] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(null);
  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);
  const MX = 10;

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null); setExpl(null); setWaiting(false);
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

    // Pick from pool without repeats
    setPool(prev => {
      let p = prev.length > 0 ? prev : shuf([...PUZZLES]);
      const chosen = p[0];
      setPuzzle(chosen);
      return p.slice(1);
    });
  }, [state.rn]);

  useEffect(() => {
    if (timeLimit && timeLeft <= 0 && puzzle && !answered) {
      setAnswered(true); setWaiting(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setExpl({ steps: [puzzle.ex] });
    }
  }, [timeLeft, puzzle, answered, timeLimit]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const answer = (i) => {
    if (answered) return;
    stopTimer();
    setAnswered(true); setSelected(i);
    const ok = i === puzzle.correct;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: 'Wrong!' });
      setExpl({ steps: [puzzle.ex] });
      setWaiting(true);
    }
  };

  if (ended) return <GameEnd gameId={GAME_ID} score={state.sc} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setPool([]); setEnded(false); }} onBack={onBack} />;

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      {timeLimit && <GameTimer timeLeft={timeLeft} maxTime={timeLimit} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Determine if the conclusion logically follows from the two premises.
      </p>
      {puzzle && (
        <>
          <div style={{ background: 'var(--bg4)', borderRadius: 'var(--r)', padding: '20px 24px', marginBottom: 16 }}>
            {puzzle.premises.map((p, i) => (
              <p key={i} style={{ fontSize: 15, fontWeight: 600, marginBottom: i < puzzle.premises.length - 1 ? 8 : 0, color: 'var(--gray1)' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', marginRight: 8 }}>P{i + 1}.</span>
                {p}
              </p>
            ))}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{puzzle.q}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {puzzle.opts.map((opt, i) => (
              <button key={i} onClick={() => answer(i)} disabled={answered} style={{
                padding: '14px 20px', borderRadius: 12, textAlign: 'left',
                background: selected === i ? (i === puzzle.correct ? 'var(--green-g)' : 'var(--red-g)') : answered && i === puzzle.correct ? 'var(--green-g)' : 'var(--bg4)',
                border: `2px solid ${selected === i ? (i === puzzle.correct ? 'var(--green)' : 'var(--red)') : answered && i === puzzle.correct ? 'var(--green)' : 'var(--gray5)'}`,
                color: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: answered ? 'default' : 'pointer',
                fontFamily: 'var(--font)', transition: 'all 0.2s',
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
