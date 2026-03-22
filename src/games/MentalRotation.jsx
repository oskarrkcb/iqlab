import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R, shuf } from './utils';
const GAME_ID = 'rotation';

// Generate L/T/Z-like shapes as arrays of [x,y] blocks
function generateShape() {
  // Only use asymmetric (chiral) shapes — avoids the edge-case where mirror = rotation
  const templates = [
    [[0,0],[1,0],[2,0],[2,1]],         // L
    [[0,0],[1,0],[2,0],[0,1],[0,2]],   // big L
    [[0,0],[1,0],[1,1],[2,1]],         // Z / skew
    [[0,0],[1,0],[0,1],[0,2]],         // J
    [[0,0],[0,1],[1,1],[1,2]],         // S / reverse-skew
    [[0,0],[1,0],[2,0],[1,1],[1,2]],   // T-with-tail (asymmetric)
    [[0,0],[1,0],[2,0],[2,1],[2,2]],   // L-corner
    [[0,0],[0,1],[0,2],[1,2],[2,2]],   // J-corner
    [[0,0],[1,0],[1,1],[1,2],[2,2]],   // Z-stair
    [[0,0],[0,1],[1,1],[2,1],[2,2]],   // S-stair
    [[0,0],[1,0],[2,0],[0,1],[1,2]],   // irregular
    [[0,0],[1,0],[0,1],[0,2],[1,2]],   // U-like
  ];
  return templates[R(0, templates.length - 1)];
}

function rotateShape(shape, times) {
  let s = shape.map(p => [...p]);
  for (let t = 0; t < times; t++) {
    s = s.map(([x, y]) => [-y, x]);
  }
  const minX = Math.min(...s.map(p => p[0]));
  const minY = Math.min(...s.map(p => p[1]));
  return s.map(([x, y]) => [x - minX, y - minY]);
}

function mirrorShape(shape) {
  const maxX = Math.max(...shape.map(p => p[0]));
  const mirrored = shape.map(([x, y]) => [maxX - x, y]);
  const minX = Math.min(...mirrored.map(p => p[0]));
  const minY = Math.min(...mirrored.map(p => p[1]));
  return mirrored.map(([x, y]) => [x - minX, y - minY]);
}

function shapesEqual(a, b) {
  const normalize = s => s.map(p => `${p[0]},${p[1]}`).sort().join('|');
  return normalize(a) === normalize(b);
}

/** Check shape is chiral — none of its rotations equal the mirrored version */
function isChiral(shape) {
  const mirrored = mirrorShape(shape);
  return ![0, 1, 2, 3].some(r => shapesEqual(rotateShape(shape, r), mirrored));
}

function ShapeGrid({ shape, size = 40, color = 'var(--accent)' }) {
  const maxX = Math.max(...shape.map(p => p[0])) + 1;
  const maxY = Math.max(...shape.map(p => p[1])) + 1;
  const set = new Set(shape.map(p => `${p[0]},${p[1]}`));
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${maxX}, ${size}px)`, gap: 2 }}>
      {Array.from({ length: maxY }).map((_, y) =>
        Array.from({ length: maxX }).map((_, x) => (
          <div key={`${x}-${y}`} style={{
            width: size, height: size, borderRadius: 4,
            background: set.has(`${x},${y}`) ? color : 'transparent',
            border: set.has(`${x},${y}`) ? 'none' : '1px solid rgba(255,255,255,0.05)',
          }} />
        ))
      )}
    </div>
  );
}

const TIME_LIMIT = { easy: 20, medium: 15, hard: 10, 'really-hard': 8 };

export default function MentalRotation({ onBack, difficulty = 'medium' }) {
  const timeLimit = TIME_LIMIT[difficulty] || 15;
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [original, setOriginal] = useState([]);
  const [options, setOptions] = useState([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(null);
  const MX = 12;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setFb(null);

    // Find a chiral shape and generate 3 unique mirrored distractors.
    // Initialize distractors as [] so the while-condition is always safe.
    let shape = generateShape();
    let allRotations = [0, 1, 2, 3].map(r => rotateShape(shape, r));
    let distractors = [];

    // Try up to 15 shapes; if the current one is symmetric or can't produce 3 distractors, retry
    for (let shapeAttempts = 0; shapeAttempts < 15; shapeAttempts++) {
      if (!isChiral(shape)) {
        shape = generateShape();
        allRotations = [0, 1, 2, 3].map(r => rotateShape(shape, r));
        distractors = [];
        continue;
      }
      distractors = [];
      let safety = 0;
      while (distractors.length < 3 && safety < 120) {
        safety++;
        const mirrorBase = rotateShape(mirrorShape(shape), R(0, 3));
        const isValidRot = allRotations.some(r => shapesEqual(r, mirrorBase));
        const isDup = distractors.some(o => shapesEqual(o, mirrorBase));
        if (!isValidRot && !isDup) distractors.push(mirrorBase);
      }
      if (distractors.length >= 3) break;
      // Not enough distractors with this shape — try another
      shape = generateShape();
      allRotations = [0, 1, 2, 3].map(r => rotateShape(shape, r));
    }

    // Hard fallback: pad with distinct mirror rotations (geometry guarantees no overlap for chiral shapes)
    while (distractors.length < 3) {
      const fallback = rotateShape(mirrorShape(shape), distractors.length);
      if (!distractors.some(o => shapesEqual(o, fallback))) distractors.push(fallback);
      else distractors.push(rotateShape(mirrorShape(shape), distractors.length + 1));
    }

    setOriginal(shape);

    // Correct answer: a valid rotation of the original (not the identity rotation to avoid trivial)
    const rotTimes = R(1, 3);
    const correctShape = rotateShape(shape, rotTimes);

    const opts = shuf([correctShape, ...distractors]);
    setOptions(opts);
    // Use shapesEqual for index lookup (array refs may differ after shuf spread)
    setCorrectIdx(opts.findIndex(o => shapesEqual(o, correctShape)));

    setTimeLeft(timeLimit);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(timerRef.current); return 0; }
        return prev - 0.1;
      });
    }, 100);
  }, [state.rn]);

  useEffect(() => {
    if (timeLeft <= 0 && !answered) {
      setAnswered(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setTimeout(nextRound, 2000);
    }
  }, [timeLeft, answered, nextRound]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const answer = (i) => {
    if (answered) return;
    setAnswered(true); stopTimer();
    const ok = i === correctIdx;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 10, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +10' });
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Wrong! Option ${correctIdx + 1} was correct.` });
    }
    setTimeout(nextRound, 1500);
  };

  if (ended) return (
    <GameEnd
      gameId={GAME_ID}
      score={state.sc}
      label={`${state.sc} points · ${MX} shapes`}
      onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); }}
      onBack={onBack}
    />
  );

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      <GameTimer timeLeft={timeLeft} maxTime={timeLimit} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Which option is a rotation of the original? (Not a mirror/reflection)
      </p>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--gray3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Original</p>
        <ShapeGrid shape={original.length ? original : [[0,0]]} size={34} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 520, margin: '0 auto' }}>
        {options.map((opt, i) => (
          <div
            key={i}
            onClick={() => answer(i)}
            style={{
              padding: 12, borderRadius: 12, cursor: answered ? 'default' : 'pointer',
              background: 'var(--bg4)', textAlign: 'center',
              border: `2px solid ${
                answered && i === correctIdx ? 'var(--green)' :
                answered && i !== correctIdx ? 'rgba(255,255,255,0.06)' :
                'rgba(255,255,255,0.08)'
              }`,
              opacity: answered && i !== correctIdx ? 0.55 : 1,
              transition: 'all 0.2s',
              transform: !answered ? 'scale(1)' : undefined,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--gray4)', marginBottom: 6, letterSpacing: 0.5 }}>{i + 1}</div>
            <ShapeGrid shape={opt.length ? opt : [[0,0]]} size={24} color={answered && i === correctIdx ? 'var(--green)' : 'var(--accent)'} />
          </div>
        ))}
      </div>
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
