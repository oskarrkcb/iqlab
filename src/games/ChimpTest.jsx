import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { shuf } from './utils';
const GAME_ID = 'chimp';

const START_LV = { easy: 3, medium: 4, hard: 6, 'really-hard': 8 };

export default function ChimpTest({ onBack, difficulty = 'medium' }) {
  const startLv = START_LV[difficulty] || 4;
  const [level, setLevel] = useState(startLv);
  const [best, setBest] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState('show'); // show, hide, result
  const [cells, setCells] = useState([]);
  const [nextClick, setNextClick] = useState(1);
  const [clicked, setClicked] = useState(new Set());
  const [wrongCell, setWrongCell] = useState(-1);
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const GRID = 8;
  const TOTAL = GRID * GRID;
  const MAX_STRIKES = 3;

  const generateRound = useCallback((lvl) => {
    const positions = shuf(Array.from({ length: TOTAL }, (_, i) => i)).slice(0, lvl);
    const numbered = positions.map((pos, i) => ({ pos, num: i + 1 }));
    setCells(numbered);
    setNextClick(1);
    setClicked(new Set());
    setWrongCell(-1);
    setFb(null);
    setPhase('show');
  }, [TOTAL]);

  useEffect(() => { generateRound(level); }, [level, generateRound]); // eslint-disable-line

  const clickCell = (pos, num) => {
    if (phase === 'show') {
      // First click hides all numbers
      setPhase('hide');
    }

    if (num === nextClick) {
      const newClicked = new Set(clicked);
      newClicked.add(pos);
      setClicked(newClicked);

      if (num === level) {
        // Level cleared
        const newLvl = level + 1;
        if (newLvl > best) setBest(newLvl);
        setFb({ type: 'ok', msg: `Level ${level} cleared!` });
        setTimeout(() => setLevel(newLvl), 1200);
      }
      setNextClick(num + 1);
    } else {
      // Wrong
      setWrongCell(pos);
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);

      if (newStrikes >= MAX_STRIKES) {
        setFb({ type: 'err', msg: `3 strikes! Best: ${Math.max(best, level)} numbers` });
        setTimeout(() => setEnded(true), 1500);
      } else {
        const newLvl = Math.max(4, level - 1);
        setFb({ type: 'err', msg: `Strike ${newStrikes}/${MAX_STRIKES}` });
        setTimeout(() => setLevel(newLvl), 1500);
      }
    }
  };

  if (ended) {
    return <GameEnd
      gameId={GAME_ID}
      score={Math.max(best, level)}
      label={`Best: ${Math.max(best, level)} numbers remembered`}
      onReplay={() => { setBest(0); setStrikes(0); setEnded(false); setLevel(startLv); }}
      onBack={onBack}
    />;
  }

  const cellMap = new Map(cells.map(c => [c.pos, c.num]));

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Level', value: level, color: 'var(--accent)' },
        { label: 'Best', value: best || level, color: 'var(--orange)' },
        { label: 'Strikes', value: `${strikes}/${MAX_STRIKES}`, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        {phase === 'show' ? 'Memorize the positions of the numbers, then click them in ascending order.' : `Click number ${nextClick}`}
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: 3,
        maxWidth: 400, margin: '0 auto',
      }}>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const num = cellMap.get(i);
          const isNumber = num !== undefined;
          const isClicked = clicked.has(i);
          const isWrong = wrongCell === i;

          return (
            <button key={i} onClick={() => isNumber && !isClicked ? clickCell(i, num) : null} style={{
              aspectRatio: 1, borderRadius: 6, border: 'none',
              background: isClicked ? 'var(--green-g)' :
                isWrong ? 'var(--red-g)' :
                isNumber ? 'var(--bg4)' : 'var(--bg3)',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: isClicked ? 'var(--green)' :
                isWrong ? 'var(--red)' :
                isNumber ? 'var(--gray5)' : 'var(--bg3)',
              cursor: isNumber && !isClicked ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700,
              color: isClicked ? 'var(--green)' :
                phase === 'show' && isNumber ? 'var(--accent)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {isNumber ? num : ''}
            </button>
          );
        })}
      </div>
      {fb && <div style={{ marginTop: 12 }}><Feedback type={fb.type} message={fb.msg} /></div>}
    </div>
  );
}
