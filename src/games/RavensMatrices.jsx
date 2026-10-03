import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { useKeySelect } from './useKeySelect';
import { R, shuf, pick } from './utils';
const GAME_ID = 'ravens';

// Filled shapes 0–4, their outline versions at +5 (● ○, ■ □, ▲ △, ◆ ◇, ★ ☆)
const SHAPES = ['●', '■', '▲', '◆', '★', '○', '□', '△', '◇', '☆'];
const FILLED = SHAPES.slice(0, 5);
const COLORS = ['var(--accent)', 'var(--green)', 'var(--blue)', 'var(--orange)', 'var(--red)'];
const RAVENS_TIME = { hard: 25, 'really-hard': 18 };
const RAVENS_OPTS = { easy: 4, medium: 4, hard: 5, 'really-hard': 5 };

// Rule types per difficulty (see generatePuzzle)
const TYPES = {
  easy: [0, 1],
  medium: [0, 1, 2, 3, 7],
  hard: [2, 4, 5, 6, 7, 8, 9, 10],
  'really-hard': [6, 8, 9, 10, 11, 12, 13, 14],
};

const cellKey = c => `${c.shape}|${c.size}|${c.color}|${c.count || 0}`;
const uniq = a => [...new Set(a)];
const toggleFill = s => SHAPES[(SHAPES.indexOf(s) + 5) % 10];

// Wrong options: on hard levels each differs from the answer in exactly one
// attribute (taken from values that appear in the grid), so you must apply every rule.
function wrongChoices(answer, grid, n, difficulty) {
  const variants = [];
  if (difficulty === 'hard' || difficulty === 'really-hard') {
    uniq(grid.map(c => c.shape)).forEach(shape => variants.push({ ...answer, shape }));
    uniq(grid.map(c => c.color)).forEach(color => variants.push({ ...answer, color }));
    uniq(grid.map(c => c.size)).forEach(size => variants.push({ ...answer, size }));
    if (answer.count) {
      uniq([...grid.map(c => c.count), answer.count - 1, answer.count + 1])
        .filter(count => count >= 1 && count <= 9)
        .forEach(count => variants.push({ ...answer, count }));
    }
    variants.push({ ...answer, shape: toggleFill(answer.shape) });
  }
  const seen = new Set([cellKey(answer)]);
  const out = [];
  for (const v of shuf(variants)) {
    if (out.length === n) break;
    if (!seen.has(cellKey(v))) { seen.add(cellKey(v)); out.push(v); }
  }
  // Pad with random cells (easy/medium, or grids with little variety)
  while (out.length < n) {
    const v = {
      shape: difficulty === 'easy' ? pick(SHAPES) : pick([answer.shape, ...SHAPES]),
      size: answer.count ? answer.size : pick([16, 22, 24, 30]),
      color: pick(COLORS),
      count: answer.count ? R(1, 9) : undefined,
    };
    if (!seen.has(cellKey(v))) { seen.add(cellKey(v)); out.push(v); }
  }
  return out;
}

function generatePuzzle(difficulty = 'medium', type = 0) {
  let grid, answer, rule, choices;

  if (type === 0) {
    // Row pattern: each row has same shape, size increases
    const shapes = shuf(SHAPES).slice(0, 3);
    const sizes = [16, 22, 30];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[r], size: sizes[c], color: COLORS[r % COLORS.length] });
      }
    }
    answer = { shape: shapes[2], size: sizes[2], color: COLORS[2 % COLORS.length] };
    rule = 'Each row has the same shape, size increases left to right';
  } else if (type === 1) {
    // Column pattern: same shape per column, different color per row
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[c], size: 24, color: colors[r] });
      }
    }
    answer = { shape: shapes[2], size: 24, color: colors[2] };
    rule = 'Each column has the same shape, each row has the same color';
  } else if (type === 2) {
    // Rotation: number of shapes increases
    const shape = SHAPES[R(0, 5)];
    const color = COLORS[R(0, COLORS.length - 1)];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const count = r * 3 + c + 1;
        grid.push({ shape, size: 18, color, count });
      }
    }
    answer = { shape, size: 18, color, count: 9 };
    rule = 'Number of shapes increases by 1 in reading order (1→9)';
  } else if (type === 3) {
    // Alternating pattern
    const s1 = SHAPES[R(0, 4)], s2 = SHAPES[R(5, 9)];
    const c1 = COLORS[0], c2 = COLORS[1];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const alt = (r + c) % 2 === 0;
        grid.push({ shape: alt ? s1 : s2, size: 24, color: alt ? c1 : c2 });
      }
    }
    answer = { shape: s1, size: 24, color: c1 };
    rule = 'Alternating pattern: shapes alternate in a checkerboard';
  } else if (type === 4) {
    // Double rule: rows determine shape, columns determine color
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[r], size: 24, color: colors[c] });
      }
    }
    answer = { shape: shapes[2], size: 24, color: colors[2] };
    rule = 'Each row has the same shape AND each column has the same color';
  } else if (type === 5) {
    // Progressive count: row 1 has 1 each, row 2 has 2 each, row 3 has 3 each
    const shapes = shuf(SHAPES).slice(0, 3);
    const color = COLORS[R(0, COLORS.length - 1)];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[c], size: 18, color, count: r + 1 });
      }
    }
    answer = { shape: shapes[2], size: 18, color, count: 3 };
    rule = 'Each row adds one more of each shape (1→2→3)';
  } else if (type === 6) {
    // XOR / set completion: each row uses all 3 shapes, each col uses all 3 colors
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    // Latin square arrangement
    const offsets = [[0,1,2],[1,2,0],[2,0,1]];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[offsets[r][c]], size: 24, color: colors[c] });
      }
    }
    answer = { shape: shapes[offsets[2][2]], size: 24, color: colors[2] };
    rule = 'Each row and column contains all 3 shapes exactly once (Latin square)';
  } else if (type === 7) {
    // Rows: one shape each; columns: 1, 2, 3 of it
    const shapes = shuf(SHAPES).slice(0, 3);
    const color = pick(COLORS);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) grid.push({ shape: shapes[r], size: 18, color, count: c + 1 });
    }
    rule = 'Each row keeps its shape; the count goes 1 → 2 → 3 from left to right';
  } else if (type === 8) {
    // Addition: count in column 3 = column 1 + column 2
    const shapes = shuf(FILLED).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      const a = R(1, 4), b = R(1, 4);
      [a, b, a + b].forEach(count => grid.push({ shape: shapes[r], size: 18, color: colors[r], count }));
    }
    rule = 'In every row: count in column 3 = column 1 + column 2';
  } else if (type === 9) {
    // Two independent Latin squares: shapes shift right, colors shift left
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[(c + r) % 3], size: 24, color: colors[(c - r + 3) % 3] });
      }
    }
    rule = 'Shapes shift one step right per row, colors shift one step left — every row and column has each shape and color once';
  } else if (type === 10) {
    // Diagonals: shape constant along ↙ diagonals, color constant along ↘ diagonals
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[(r + c) % 3], size: 24, color: colors[(c - r + 3) % 3] });
      }
    }
    rule = 'Shapes repeat along the ↙ diagonals, colors repeat along the ↘ diagonals';
  } else if (type === 11) {
    // Fill XOR: column 3 is filled when exactly one of column 1 and 2 is filled
    const shapes = shuf(FILLED).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    const pairs = shuf([[true, true], [true, false], [false, true], [false, false]]).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      const [f1, f2] = pairs[r];
      [f1, f2, f1 !== f2].forEach((filled, c) =>
        grid.push({ shape: filled ? shapes[r] : toggleFill(shapes[r]), size: 26, color: colors[c] }));
    }
    rule = 'Each column has its own color. Column 3 is filled only if exactly one of columns 1 and 2 is filled (XOR)';
  } else if (type === 12) {
    // Three Latin squares at once: shape, color and count
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    const counts = shuf([1, 2, 3]);
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({
          shape: shapes[(c + r) % 3],
          size: 18,
          color: colors[(c + 2 * r + 1) % 3],
          count: counts[(c - r + 3) % 3],
        });
      }
    }
    rule = 'Shape, color and count each appear exactly once in every row and column — three rules at once';
  } else if (type === 13) {
    // Subtraction: count in column 3 = column 1 − column 2, colors rotate per row
    const shapes = shuf(SHAPES).slice(0, 3);
    const colors = shuf(COLORS).slice(0, 3);
    grid = [];
    for (let r = 0; r < 3; r++) {
      const b = R(1, 4), d = R(1, 4);
      [b + d, b, d].forEach((count, c) =>
        grid.push({ shape: shapes[c], size: 18, color: colors[(c + r) % 3], count }));
    }
    rule = 'Each column keeps its shape; count in column 3 = column 1 − column 2; colors rotate one step per row';
  } else {
    // Size grows per column, count grows per row, shapes form a Latin square
    const shapes = shuf(SHAPES).slice(0, 3);
    const color = pick(COLORS);
    const sizes = [16, 22, 28];
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: shapes[(r + 2 * c) % 3], size: sizes[c], color, count: r + 1 });
      }
    }
    rule = 'Size grows to the right, count grows downwards, and every row and column has each shape once';
  }

  // The missing piece is always the bottom-right cell
  answer = grid[8];
  const numWrong = (RAVENS_OPTS[difficulty] || 4) - 1;
  choices = shuf([answer, ...wrongChoices(answer, grid, numWrong, difficulty)]);
  const ci = choices.indexOf(answer);

  return { grid, answer, choices, ci, rule };
}

function CellContent({ cell }) {
  if (cell.count) {
    const items = [];
    const cols = cell.count <= 3 ? cell.count : Math.ceil(Math.sqrt(cell.count));
    for (let i = 0; i < cell.count; i++) {
      items.push(
        <span key={i} style={{ fontSize: cell.size - 4, color: cell.color, lineHeight: 1 }}>{cell.shape}</span>
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, placeItems: 'center' }}>
        {items}
      </div>
    );
  }
  return <span style={{ fontSize: cell.size, color: cell.color }}>{cell.shape}</span>;
}

export default function RavensMatrices({ onBack, difficulty = 'medium' }) {
  const timeLimit = RAVENS_TIME[difficulty] ?? null;
  const optionCount = RAVENS_OPTS[difficulty] || 4;
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
  const bagRef = useRef([]);
  const MX = 10;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null); setExpl(null); setWaiting(false);
    // Every rule type once before any repeats
    if (bagRef.current.length === 0) bagRef.current = shuf(TYPES[difficulty] || TYPES.medium);
    setPuzzle(generatePuzzle(difficulty, bagRef.current.pop()));
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
    if (timeLimit && timeLeft <= 0 && puzzle && !answered) {
      setAnswered(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: "Time's up!" });
      setExpl({ steps: [puzzle.rule] });
      setWaiting(true);
    }
  }, [timeLeft, puzzle, answered, timeLimit]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const pickOpt = useCallback((i) => {
    if (answered) return;
    stopTimer();
    setAnswered(true); setSelected(i);
    const ok = i === puzzle.ci;
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
  }, [answered, puzzle, nextRound]);

  useKeySelect(pickOpt, optionCount, answered);

  if (ended) return <GameEnd gameId={GAME_ID} score={state.sc} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); }} onBack={onBack} />;

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      {timeLimit && <GameTimer timeLeft={timeLeft} maxTime={timeLimit} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>Find the missing piece that completes the pattern matrix.</p>
      {puzzle && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxWidth: 280, margin: '0 auto 20px' }}>
            {puzzle.grid.map((cell, i) => (
              <div key={i} style={{
                aspectRatio: 1, background: i === 8 ? 'transparent' : 'var(--bg4)',
                border: i === 8 ? '2px dashed var(--accent)' : '2px solid var(--gray5)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: i === 8 ? 'pulse 2s infinite' : 'none',
              }}>
                {i === 8 ? <span style={{ color: 'var(--accent)', fontSize: 24 }}>?</span> : <CellContent cell={cell} />}
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 11, marginBottom: 10 }}>Choose the answer:</p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(optionCount, 5)}, 1fr)`, gap: 8, maxWidth: optionCount > 4 ? 400 : 320, margin: '0 auto' }}>
            {puzzle.choices.map((cell, i) => (
              <div key={i} onClick={() => pickOpt(i)} style={{
                aspectRatio: 1, background: 'var(--bg4)',
                border: `2px solid ${selected === i ? (i === puzzle.ci ? 'var(--green)' : 'var(--red)') : answered && i === puzzle.ci ? 'var(--green)' : 'var(--gray5)'}`,
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s',
              }}>
                <CellContent cell={cell} />
              </div>
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
