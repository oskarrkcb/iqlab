import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { useKeySelect } from './useKeySelect';
import { R, pick, shuf } from './utils';
const GAME_ID = 'syllogisms';

const STATIC_PUZZLES = [
  {
    premises: ['All dogs are animals.', 'All animals are living things.'],
    q: 'Therefore:', opts: ['All dogs are living things.', 'All living things are dogs.', 'Some animals are not dogs.', 'No conclusion possible.'],
    correct: 0, ex: 'Transitive: Dogs ⊂ Animals ⊂ Living things → Dogs ⊂ Living things.', diff: 'easy',
  },
  {
    premises: ['All roses are flowers.', 'Some flowers are red.'],
    q: 'Therefore:', opts: ['All roses are red.', 'Some roses might be red.', 'No roses are red.', 'All flowers are roses.'],
    correct: 1, ex: 'Only "some flowers" are red, roses are flowers, so some roses MIGHT be red.', diff: 'medium',
  },
  {
    premises: ['No fish can fly.', 'All salmon are fish.'],
    q: 'Therefore:', opts: ['Some salmon can fly.', 'All fish are salmon.', 'No salmon can fly.', 'Some fish are not salmon.'],
    correct: 2, ex: 'Salmon ⊂ Fish, no fish can fly → no salmon can fly.', diff: 'easy',
  },
  {
    premises: ['All programmers use logic.', 'Maria is a programmer.'],
    q: 'Therefore:', opts: ['Maria does not use logic.', 'Maria uses logic.', 'All who use logic are programmers.', 'No conclusion possible.'],
    correct: 1, ex: 'Maria ∈ Programmers, all programmers use logic → Maria uses logic.', diff: 'easy',
  },
  {
    premises: ['Some students are athletes.', 'All athletes are healthy.'],
    q: 'Therefore:', opts: ['All students are healthy.', 'Some students are healthy.', 'No students are athletes.', 'All healthy people are students.'],
    correct: 1, ex: 'Some students are athletes, athletes are healthy → some students are healthy.', diff: 'medium',
  },
  {
    premises: ['If it rains, the ground is wet.', 'The ground is wet.'],
    q: 'Therefore:', opts: ['It rained.', 'It might have rained.', 'It did not rain.', 'The ground is always wet.'],
    correct: 1, ex: 'Affirming the consequent is a fallacy. Wet ground could have other causes.', diff: 'hard',
  },
  {
    premises: ['All metals conduct electricity.', 'Copper is a metal.'],
    q: 'Therefore:', opts: ['Copper does not conduct.', 'Copper conducts electricity.', 'All conductors are copper.', 'Some metals are not copper.'],
    correct: 1, ex: 'Copper ∈ Metals, metals conduct → copper conducts.', diff: 'easy',
  },
  {
    premises: ['No reptiles have fur.', 'Some pets have fur.'],
    q: 'Therefore:', opts: ['Some pets are reptiles.', 'No pets are reptiles.', 'Some pets are not reptiles.', 'All reptiles are pets.'],
    correct: 2, ex: 'Pets with fur cannot be reptiles → some pets are not reptiles.', diff: 'hard',
  },
  {
    premises: ['If A > B and B > C, then A > C.', 'X > Y and Y > Z.'],
    q: 'Therefore:', opts: ['Z > X', 'X = Z', 'X > Z', 'Y > X'],
    correct: 2, ex: 'By transitivity: X > Y > Z → X > Z.', diff: 'medium',
  },
  {
    premises: ['All squares are rectangles.', 'All rectangles have 4 right angles.'],
    q: 'Therefore:', opts: ['All rectangles are squares.', 'Squares have 4 right angles.', 'Some rectangles have no right angles.', 'Squares are not rectangles.'],
    correct: 1, ex: 'Squares ⊂ Rectangles ⊂ Shapes with 4 right angles.', diff: 'easy',
  },
  {
    premises: ['Either it is day or it is night.', 'It is not day.'],
    q: 'Therefore:', opts: ['It is neither.', 'It is night.', 'It could be either.', 'No conclusion.'],
    correct: 1, ex: 'Disjunctive syllogism: A or B, not A → B.', diff: 'medium',
  },
  {
    premises: ['If you study hard, you pass the exam.', 'You did not pass the exam.'],
    q: 'Therefore:', opts: ['You studied hard.', 'You did not study hard.', 'The exam was too hard.', 'No conclusion.'],
    correct: 1, ex: 'Modus tollens: If P→Q and ¬Q, then ¬P.', diff: 'hard',
  },
];

// ── Procedural syllogism generators ──
const GROUPS = [
  ['dogs', 'cats', 'birds', 'horses', 'eagles', 'dolphins', 'wolves', 'tigers'],
  ['doctors', 'engineers', 'teachers', 'scientists', 'athletes', 'artists', 'musicians', 'pilots'],
  ['metals', 'liquids', 'vehicles', 'crystals', 'gases', 'minerals', 'polymers', 'alloys'],
  ['roses', 'tulips', 'oaks', 'ferns', 'cacti', 'pines', 'palms', 'orchids'],
];
const PROPS = ['strong', 'fast', 'intelligent', 'dangerous', 'flexible', 'heavy', 'valuable', 'rare', 'colorful', 'ancient'];
const NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Eva', 'Felix', 'Gina', 'Hugo', 'Iris', 'Jan'];

function genSyllogism(difficulty) {
  const group = pick(GROUPS);
  const [A, B, C] = shuf(group).slice(0, 3);
  const [p1, p2] = shuf(PROPS).slice(0, 2);
  const name = pick(NAMES);
  const type = difficulty === 'easy' ? R(0, 2) : difficulty === 'medium' ? R(0, 4) : difficulty === 'hard' ? R(3, 7) : R(5, 9);

  switch (type) {
    case 0: // All A are B. All B are C. → All A are C.
      return { premises: [`All ${A} are ${p1}.`, `All ${p1} things are ${p2}.`], q: 'Therefore:',
        opts: [`All ${A} are ${p2}.`, `All ${p2} things are ${A}.`, `Some ${A} are not ${p2}.`, 'No conclusion possible.'],
        correct: 0, ex: `Transitive: ${A} ⊂ ${p1} ⊂ ${p2} → ${A} ⊂ ${p2}.` };
    case 1: // All A are B. X is A. → X is B.
      return { premises: [`All ${A} are ${p1}.`, `${name} is a ${A.slice(0, -1)}.`], q: 'Therefore:',
        opts: [`${name} is ${p1}.`, `${name} is not ${p1}.`, `All ${p1} things are ${A}.`, 'No conclusion possible.'],
        correct: 0, ex: `${name} ∈ ${A}, all ${A} are ${p1} → ${name} is ${p1}.` };
    case 2: // No A are B. All C are A. → No C are B.
      return { premises: [`No ${A} are ${p1}.`, `All ${B} are ${A}.`], q: 'Therefore:',
        opts: [`Some ${B} are ${p1}.`, `All ${A} are ${B}.`, `No ${B} are ${p1}.`, `Some ${A} are ${p1}.`],
        correct: 2, ex: `${B} ⊂ ${A}, no ${A} are ${p1} → no ${B} are ${p1}.` };
    case 3: // Some A are B. All B are C. → Some A are C.
      return { premises: [`Some ${A} are ${p1}.`, `All ${p1} things are ${p2}.`], q: 'Therefore:',
        opts: [`All ${A} are ${p2}.`, `Some ${A} are ${p2}.`, `No ${A} are ${p2}.`, `All ${p2} things are ${A}.`],
        correct: 1, ex: `Some ${A} are ${p1}, ${p1} → ${p2}, so some ${A} are ${p2}.` };
    case 4: // Either A or B. Not A. → B. (disjunctive)
      return { premises: [`Either ${name} is a ${A.slice(0, -1)} or a ${B.slice(0, -1)}.`, `${name} is not a ${A.slice(0, -1)}.`], q: 'Therefore:',
        opts: [`${name} is neither.`, `${name} is a ${B.slice(0, -1)}.`, 'It could be either.', 'No conclusion.'],
        correct: 1, ex: `Disjunctive syllogism: A or B, not A → B.` };
    case 5: // If P then Q. Not Q. → Not P. (modus tollens)
      return { premises: [`If ${name} is a ${A.slice(0, -1)}, then ${name} is ${p1}.`, `${name} is not ${p1}.`], q: 'Therefore:',
        opts: [`${name} is a ${A.slice(0, -1)}.`, `${name} is not a ${A.slice(0, -1)}.`, `${name} might be a ${A.slice(0, -1)}.`, 'No conclusion.'],
        correct: 1, ex: `Modus tollens: If P→Q and ¬Q, then ¬P.` };
    case 6: // Affirming consequent fallacy: If P→Q, Q → P? No!
      return { premises: [`If something is a ${A.slice(0, -1)}, it is ${p1}.`, `${name} is ${p1}.`], q: 'Therefore:',
        opts: [`${name} is a ${A.slice(0, -1)}.`, `${name} might be a ${A.slice(0, -1)}.`, `${name} is not a ${A.slice(0, -1)}.`, 'No conclusion.'],
        correct: 1, ex: `Affirming the consequent is a fallacy. Being ${p1} doesn't mean being a ${A.slice(0, -1)}.` };
    case 7: // No A are B. Some C are B. → Some C are not A.
      return { premises: [`No ${A} are ${p1}.`, `Some ${B} are ${p1}.`], q: 'Therefore:',
        opts: [`Some ${B} are ${A}.`, `No ${B} are ${A}.`, `Some ${B} are not ${A}.`, `All ${A} are ${B}.`],
        correct: 2, ex: `${B} that are ${p1} cannot be ${A} (no ${A} are ${p1}) → some ${B} are not ${A}.` };
    case 8: { // 3-premise chain: A→B, B→C, C→D. Is A→D?
      const [q1, q2, q3] = shuf(PROPS).slice(0, 3);
      return { premises: [`All ${q1} things are ${q2}.`, `All ${q2} things are ${q3}.`, `${name} is ${q1}.`], q: 'Therefore:',
        opts: [`${name} is ${q3}.`, `${name} is not ${q3}.`, `All ${q3} things are ${q1}.`, 'No conclusion.'],
        correct: 0, ex: `Chain: ${q1} → ${q2} → ${q3}. ${name} is ${q1} → ${name} is ${q3}.` };
    }
    default: { // Denying antecedent fallacy: If P→Q, Not P → Not Q? No!
      return { premises: [`If ${name} is a ${A.slice(0, -1)}, then ${name} is ${p1}.`, `${name} is not a ${A.slice(0, -1)}.`], q: 'Therefore:',
        opts: [`${name} is not ${p1}.`, `${name} might still be ${p1}.`, `${name} is ${p1}.`, 'No conclusion.'],
        correct: 1, ex: `Denying the antecedent is a fallacy. Not being a ${A.slice(0, -1)} doesn't mean not being ${p1}.` };
    }
  }
}

function getPuzzle(difficulty) {
  // Mix: 40% generated, 60% from static pool (filtered by diff)
  if (Math.random() < 0.4) {
    const pool = STATIC_PUZZLES.filter(p => {
      if (difficulty === 'easy') return p.diff === 'easy';
      if (difficulty === 'medium') return p.diff === 'easy' || p.diff === 'medium';
      return true;
    });
    if (pool.length > 0) return pick(pool);
  }
  return genSyllogism(difficulty);
}

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

    setPuzzle(getPuzzle(difficulty));
  }, [state.rn, difficulty]);

  useEffect(() => {
    if (timeLimit && timeLeft <= 0 && puzzle && !answered) {
      setAnswered(true); setWaiting(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setExpl({ steps: [puzzle.ex] });
    }
  }, [timeLeft, puzzle, answered, timeLimit]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const answer = useCallback((i) => {
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
  }, [answered, puzzle, stopTimer, nextRound]);

  useKeySelect(answer, puzzle?.opts?.length ?? 4, answered);

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
