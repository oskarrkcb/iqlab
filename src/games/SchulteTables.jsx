import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { shuf } from './utils';
const GAME_ID = 'schulte';

const GRID_SIZE = { easy: 4, medium: 5, hard: 6, 'really-hard': 7 };

export default function SchulteTables({ onBack, difficulty = 'medium' }) {
  const [gridSize, setGridSize] = useState(GRID_SIZE[difficulty] || 5);
  const [phase, setPhase] = useState('intro');
  const [grid, setGrid] = useState([]);
  const [nextNum, setNextNum] = useState(1);
  const [found, setFound] = useState(new Set());
  const [wrong, setWrong] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [ended, setEnded] = useState(false);
  const timerRef = useRef(null);
  const MX = 5;

  const startRound = useCallback(() => {
    const total = gridSize * gridSize;
    const nums = shuf(Array.from({ length: total }, (_, i) => i + 1));
    setGrid(nums);
    setNextNum(1);
    setFound(new Set());
    setWrong(-1);
    setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 0.1), 100);
    setPhase('playing');
  }, [gridSize]);

  const startGame = useCallback(() => {
    setRound(0); setTotalScore(0); setEnded(false); setBestTime(null);
    setRound(1);
    startRound();
  }, [startRound]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const clickCell = (num, idx) => {
    if (num === nextNum) {
      const newFound = new Set(found);
      newFound.add(idx);
      setFound(newFound);
      setWrong(-1);
      const total = gridSize * gridSize;
      if (num === total) {
        clearInterval(timerRef.current);
        const time = Math.round(elapsed * 10) / 10;
        const points = Math.max(10, Math.round(100 - time));
        setTotalScore(prev => prev + points);
        if (!bestTime || time < bestTime) setBestTime(time);
        if (round >= MX) {
          setEnded(true);
        } else {
          setRound(r => r + 1);
          setTimeout(startRound, 1500);
        }
      }
      setNextNum(num + 1);
    } else {
      setWrong(idx);
      setTimeout(() => setWrong(-1), 400);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>Schulte Tables</h3>
          <p style={{ color: 'var(--gray2)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Click the numbers in order from <b>1</b> to <b>{gridSize * gridSize}</b> as fast as possible.
            Trains peripheral vision and attention speed.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {[4, 5, 6].map(n => (
              <button key={n} className={`toggle-btn${gridSize === n ? ' active' : ''}`}
                onClick={() => setGridSize(n)} style={{ fontFamily: 'var(--font)', padding: '10px 20px' }}>
                {n}×{n}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
        </div>
      </div>
    );
  }

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={totalScore} label={`Best: ${bestTime}s · ${MX} rounds`} onReplay={startGame} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <GameStats stats={[
        { label: 'Time', value: `${Math.round(elapsed * 10) / 10}s`, color: 'var(--orange)' },
        { label: 'Next', value: nextNum, color: 'var(--accent)' },
        { label: 'Round', value: `${round}/${MX}`, color: 'var(--green)' },
      ]} />
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: 4,
        maxWidth: gridSize * 64, margin: '16px auto',
      }}>
        {grid.map((num, i) => (
          <button key={i} onClick={() => clickCell(num, i)} style={{
            aspectRatio: 1, borderRadius: 10, border: 'none',
            background: found.has(i) ? 'var(--green-g)' : wrong === i ? 'var(--red-g)' : 'var(--bg4)',
            borderWidth: 2, borderStyle: 'solid',
            borderColor: found.has(i) ? 'var(--green)' : wrong === i ? 'var(--red)' : 'var(--gray5)',
            color: found.has(i) ? 'var(--green)' : 'var(--white)',
            fontFamily: 'var(--mono)', fontSize: gridSize <= 5 ? 20 : 16, fontWeight: 700,
            cursor: found.has(i) ? 'default' : 'pointer', transition: 'all 0.15s',
            opacity: found.has(i) ? 0.4 : 1,
          }}>
            {num}
          </button>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 11 }}>
        Find <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--mono)' }}>{nextNum}</span>
      </p>
    </div>
  );
}
