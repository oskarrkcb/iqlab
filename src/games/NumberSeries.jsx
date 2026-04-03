import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { pick, getSeqGens, getSeqGensByType, R } from './utils';

const GAME_ID = 'seq';

export default function NumberSeries({ onBack, difficulty = 'medium', seriesType = 'mixed', timerMode = 'timed' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [puzzle, setPuzzle] = useState(null);
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(22);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const MX = 10;

  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setInput(''); setFb(null); setExpl(null); setRevealed(false); setHinted(false); setWaiting(false);
    const byDifficulty = getSeqGens(difficulty);
    const byType = getSeqGensByType(seriesType);
    // Intersect: keep only generators that satisfy both difficulty and type filters.
    // If the intersection is empty (e.g. 'easy' + 'sqrt-exp' with no overlap), fall back to type-only.
    const intersected = byDifficulty.filter(fn => byType.includes(fn));
    const gens = intersected.length > 0 ? intersected : byType;
    const g = pick(gens)();
    // Harder difficulties hide elements earlier in sequence (fewer context clues)
    const hiMin = difficulty === 'grandmaster' ? 1 : difficulty === 'extreme' ? 1 : difficulty === 'really-hard' ? 2 : 2;
    const hiMax = difficulty === 'grandmaster' ? 3 : difficulty === 'extreme' ? 3 : difficulty === 'really-hard' ? 4 : g.seq.length - 1;
    const hi = R(hiMin, Math.min(hiMax, g.seq.length - 1));
    setPuzzle({ ...g, hi, ans: g.seq[hi] });
    setTimeLeft(22);
    clearInterval(timerRef.current);
    if (timerMode !== 'zen') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [state.rn, difficulty, seriesType]);

  // Handle timeout
  useEffect(() => {
    if (timerMode === 'zen') return;
    if (timeLeft <= 0 && puzzle && !revealed) {
      setRevealed(true);
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Time's up! Answer: <b>${puzzle.ans}</b>` });
      const data = puzzle.ex(puzzle.seq);
      setExpl(data);
      setWaiting(true);
    }
  }, [timeLeft, puzzle, revealed]);

  useEffect(() => { nextRound(); return stopTimer; }, []); // eslint-disable-line

  const submit = () => {
    if (revealed || !puzzle) return;
    const v = parseInt(input.trim());
    if (isNaN(v)) return;
    stopTimer(); setRevealed(true);
    if (v === puzzle.ans) {
      const pts = 10 + (hinted ? 0 : 10);
      setState(s => ({ ...s, sc: s.sc + pts, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: `Correct! +${pts} · ${puzzle.rule}` });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Wrong! Answer: <b>${puzzle.ans}</b>` });
      const data = puzzle.ex(puzzle.seq);
      setExpl(data);
      setWaiting(true);
    }
  };

  const hint = () => {
    if (puzzle && !revealed) { setHinted(true); setFb({ type: 'warn', msg: puzzle.rule }); }
  };

  const skip = () => {
    if (revealed) return;
    stopTimer(); setRevealed(true);
    setState(s => ({ ...s, sr: 0 }));
    setFb({ type: 'err', msg: `Skipped: <b>${puzzle.ans}</b>` });
    const data = puzzle.ex(puzzle.seq);
    setExpl(data);
    setWaiting(true);
  };

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={state.sc} correct={state.sc > 0 ? Math.round(state.sc / 20) : 0} total={MX} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); setTimeout(() => nextRound(), 0); }} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      {timerMode !== 'zen' && <GameTimer timeLeft={timeLeft} maxTime={22} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Find the missing number in the sequence. Select the correct answer from the options.
      </p>
      {puzzle && (
        <>
          <div className="g-seq">
            {puzzle.seq.map((n, i) => (
              <span key={i}>
                {i > 0 && <span className="g-arrow">→</span>}
                {i === puzzle.hi ? (
                  <span className={`g-sm${revealed ? ' revealed' : ''}`}>
                    {revealed ? puzzle.ans : '?'}
                  </span>
                ) : (
                  <span className="g-sn">{n}</span>
                )}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="g-input"
              placeholder="?"
              autoComplete="off"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { waiting ? nextRound() : submit(); } }}
              disabled={revealed}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={submit} disabled={revealed}>Check</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={hint} disabled={revealed} style={{ flex: 1 }}>Hint</button>
            <button className="btn btn-ghost btn-sm" onClick={skip} disabled={revealed} style={{ flex: 1 }}>Skip</button>
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {waiting && puzzle && (
        <div className="g-expl" style={{ marginTop: 14 }}>
          <h4>Lösung — vollständige Reihe</h4>
          <div className="g-seq" style={{ marginTop: 8, marginBottom: 0 }}>
            {puzzle.seq.map((n, i) => (
              <span key={i}>
                {i > 0 && <span className="g-arrow">→</span>}
                {i === puzzle.hi ? (
                  <span className="g-sm revealed">{puzzle.ans}</span>
                ) : (
                  <span className="g-sn">{n}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      {expl && <Explanation steps={expl.steps} formula={expl.f} />}
      {waiting && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>
          Continue →
        </button>
      )}
    </div>
  );
}
