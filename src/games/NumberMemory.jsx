import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner, NumPad, applyNumKey } from './GameShell';
import { R } from './utils';
const GAME_ID = 'mem';

const START_LEVEL = { easy: 3, medium: 4, hard: 6, 'really-hard': 8 };
const LIVES = 3;

export default function NumberMemory({ onBack, difficulty = 'medium' }) {
  const startLv = START_LEVEL[difficulty] || 4;
  const [lv, setLv] = useState(startLv);
  const [best, setBest] = useState(0);
  const [sr, setSr] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [seq, setSeq] = useState('');
  const [phase, setPhase] = useState('idle'); // show, input, done
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const nextRound = useCallback((currentLv) => {
    const lvl = currentLv || lv;
    let s = '';
    for (let i = 0; i < lvl; i++) s += R(0, 9);
    setSeq(s);
    setPhase('show');
    setInput('');
    setFb(null);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase('input');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 900 + lvl * 350);
  }, [lv]);

  useEffect(() => { nextRound(startLv); return () => clearTimeout(timeoutRef.current); }, []); // eslint-disable-line

  const submit = () => {
    if (phase !== 'input') return;
    setPhase('done');
    const v = input.trim();
    if (v === seq) {
      const newLv = lv + 1;
      setSr(s => s + 1);
      setLv(newLv);
      if (lv > best) setBest(lv);
      setFb({ type: 'ok', msg: `Correct! Next: ${newLv} digits` });
      setTimeout(() => nextRound(newLv), 1500);
    } else {
      setSr(0);
      const left = lives - 1;
      setLives(left);
      setFb({ type: 'err', msg: `Wrong! It was: <b>${seq}</b>${left > 0 ? ` · ${left} ${left === 1 ? 'life' : 'lives'} left` : ''}` });
      if (left <= 0) {
        // Game over: GameEnd saves the best length as the score
        setTimeout(() => setEnded(true), 2500);
        return;
      }
      const newLv = Math.max(startLv, lv - 1);
      setLv(newLv);
      setTimeout(() => nextRound(newLv), 2500);
    }
  };

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={best} label={`Best: ${best} digits`} onReplay={() => { setLv(startLv); setBest(0); setSr(0); setLives(LIVES); setEnded(false); nextRound(startLv); }} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Digits', value: lv, color: 'var(--accent)' },
        { label: 'Record', value: best, color: 'var(--orange)' },
        { label: 'Streak', value: sr, color: 'var(--green)' },
        { label: 'Lives', value: lives, color: 'var(--red)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12 }}>
        {phase === 'show' ? `Memorize ${lv} digits!` : phase === 'input' ? 'Now enter them!' : 'Result:'}
      </p>
      <div className={`g-memd${phase === 'input' ? ' hid' : ''}`}>
        {phase === 'show' ? seq : phase === 'input' ? '•'.repeat(lv) : seq}
      </div>
      {(phase === 'input' || phase === 'done') && (
        <>
          <input
            ref={inputRef}
            className="g-input"
            placeholder="Enter the number..."
            autoComplete="off"
            inputMode="none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            disabled={phase === 'done'}
            style={{ marginTop: 12 }}
          />
          <NumPad onKey={k => setInput(v => applyNumKey(v, k))} disabled={phase !== 'input'} />
          {phase === 'input' && (
            <button className="btn btn-primary btn-w" onClick={submit} style={{ marginTop: 12 }}>Check</button>
          )}
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
