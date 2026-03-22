import { useState, useEffect, useCallback } from 'react';
import { GameStats, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { R, shuf } from './utils';
const GAME_ID = 'ravens';

// Generate pattern-based 3x3 grids with symbols
const SHAPES = ['●', '■', '▲', '◆', '★', '○', '□', '△', '◇', '☆'];
const COLORS = ['var(--accent)', 'var(--green)', 'var(--blue)', 'var(--orange)', 'var(--red)'];

function generatePuzzle(difficulty = 'medium') {
  const type = R(0, 3);
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
  } else {
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
  }

  // Generate wrong choices — harder = more similar to answer
  const wrongChoices = [];
  for (let i = 0; i < 3; i++) {
    if (difficulty === 'really-hard') {
      // Same shape + same color, only size/count differs
      wrongChoices.push({
        shape: answer.shape,
        size: [16, 22, 24, 30].filter(s => s !== answer.size)[R(0, 2)],
        color: answer.color,
        count: answer.count ? R(1, 9) : undefined,
      });
    } else if (difficulty === 'hard') {
      // Same shape, different size and color
      wrongChoices.push({
        shape: answer.shape,
        size: [16, 22, 24, 30][R(0, 3)],
        color: COLORS[R(0, COLORS.length - 1)],
        count: answer.count ? R(1, 9) : undefined,
      });
    } else {
      wrongChoices.push({
        shape: SHAPES[R(0, SHAPES.length - 1)],
        size: [16, 22, 24, 30][R(0, 3)],
        color: COLORS[R(0, COLORS.length - 1)],
        count: answer.count ? R(1, 9) : undefined,
      });
    }
  }

  choices = shuf([answer, ...wrongChoices]);
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

  const pickOpt = (i) => {
    if (answered) return;
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 320, margin: '0 auto' }}>
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
