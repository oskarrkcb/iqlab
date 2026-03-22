import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R } from './utils';
const GAME_ID = 'dual-nback';

const GRID = 3; // 3x3 grid
const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

const N_LEVEL = { easy: 1, medium: 2, hard: 3, 'really-hard': 4 };

export default function DualNBack({ onBack, difficulty = 'medium' }) {
  const [nLevel, setNLevel] = useState(N_LEVEL[difficulty] || 2);
  const [phase, setPhase] = useState('intro'); // intro, playing, feedback, ended
  const [sequence, setSequence] = useState([]);
  const [step, setStep] = useState(-1);
  const [currentPos, setCurrentPos] = useState(-1);
  const [currentLetter, setCurrentLetter] = useState('');
  const [posMatch, setPosMatch] = useState(false);
  const [letterMatch, setLetterMatch] = useState(false);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [total, setTotal] = useState(0);
  const [fb, setFb] = useState(null);
  const [round, setRound] = useState(0);
  const timerRef = useRef(null);
  const ROUNDS = 20;

  const generateSequence = useCallback((n) => {
    const seq = [];
    for (let i = 0; i < ROUNDS + n; i++) {
      let pos = R(0, GRID * GRID - 1);
      let letter = LETTERS[R(0, LETTERS.length - 1)];
      // Force some matches (~30% of the time)
      if (i >= n && Math.random() < 0.3) {
        if (Math.random() < 0.5) pos = seq[i - n].pos;
        else letter = seq[i - n].letter;
      }
      seq.push({ pos, letter });
    }
    return seq;
  }, []);

  const startGame = useCallback(() => {
    const seq = generateSequence(nLevel);
    setSequence(seq);
    setStep(-1);
    setScore(0); setHits(0); setMisses(0); setTotal(0);
    setPosMatch(false); setLetterMatch(false);
    setFb(null); setRound(0);
    setPhase('playing');
  }, [nLevel, generateSequence]);

  // Advance steps
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setStep(prev => prev + 1);
    }, 2500);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Process each step
  useEffect(() => {
    if (step < 0 || phase !== 'playing') return;
    if (step >= sequence.length) {
      clearInterval(timerRef.current);
      setPhase('ended');
      return;
    }

    // Check previous step answers
    if (step >= nLevel + 1) {
      const prevIdx = step - 1;
      const matchIdx = prevIdx - nLevel;
      const wasPosMatch = sequence[prevIdx].pos === sequence[matchIdx].pos;
      const wasLetterMatch = sequence[prevIdx].letter === sequence[matchIdx].letter;
      let h = 0, m = 0, t = 0;
      if (wasPosMatch || wasLetterMatch) t++;
      if (wasPosMatch && posMatch) h++;
      else if (wasPosMatch && !posMatch) m++;
      if (wasLetterMatch && letterMatch) h++;
      else if (wasLetterMatch && !letterMatch) m++;
      if (!wasPosMatch && posMatch) m++;
      if (!wasLetterMatch && letterMatch) m++;
      setHits(prev => prev + h);
      setMisses(prev => prev + m);
      setTotal(prev => prev + t);
      setScore(prev => prev + h * 10 - m * 5);
    }

    setCurrentPos(sequence[step].pos);
    setCurrentLetter(sequence[step].letter);
    setPosMatch(false);
    setLetterMatch(false);
    setRound(step + 1);
  }, [step]); // eslint-disable-line

  if (phase === 'intro') {
    return (
      <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>Dual N-Back</h3>
          <p style={{ color: 'var(--gray2)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            A square will light up and a letter will appear. Press <b>Position</b> if the square matches
            the one from <b>{nLevel} steps ago</b>. Press <b>Letter</b> if the letter matches.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {[1, 2, 3, 4].map(n => (
              <button key={n} className={`toggle-btn${nLevel === n ? ' active' : ''}`} onClick={() => setNLevel(n)}
                style={{ fontFamily: 'var(--font)', padding: '10px 20px', fontSize: 14 }}>
                {n}-Back
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
        </div>
      </div>
    );
  }

  if (phase === 'ended') {
    return <GameEnd gameId={GAME_ID} score={score} label={`${hits} hits · ${misses} misses`} onReplay={startGame} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <GameStats stats={[
        { label: 'Score', value: score, color: 'var(--accent)' },
        { label: 'Step', value: `${round}/${sequence.length}`, color: 'var(--orange)' },
        { label: 'N-Level', value: nLevel, color: 'var(--blue)' },
      ]} />

      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: 6, width: 200 }}>
          {Array.from({ length: GRID * GRID }).map((_, i) => (
            <div key={i} style={{
              aspectRatio: 1, borderRadius: 10,
              background: i === currentPos ? 'var(--accent2)' : 'var(--bg5)',
              border: `2px solid ${i === currentPos ? 'var(--accent)' : 'var(--gray5)'}`,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i === currentPos && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  {currentLetter}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button
          className={`btn ${posMatch ? 'btn-primary' : 'btn-secondary'} btn-lg`}
          onClick={() => setPosMatch(!posMatch)}
          style={{ minWidth: 140 }}
        >
          Position Match
        </button>
        <button
          className={`btn ${letterMatch ? 'btn-primary' : 'btn-secondary'} btn-lg`}
          onClick={() => setLetterMatch(!letterMatch)}
          style={{ minWidth: 140 }}
        >
          Letter Match
        </button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 11, marginTop: 12 }}>
        Does the current position/letter match the one from {nLevel} steps ago?
      </p>
    </div>
  );
}
