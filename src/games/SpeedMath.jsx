import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, GameEnd, HighScoreBanner, NumPad, applyNumKey } from './GameShell';
import { R, pick } from './utils';

const GAME_ID = 'sp';
const ZEN_QUESTIONS = 30; // Zen: a fixed set of problems at your own pace, no clock

export default function SpeedMath({ onBack, timeLimit = 60, difficulty = 'medium', timerMode = 'timed' }) {
  const zen = timerMode === 'zen';
  const sessionDuration = Math.max(10, timeLimit);
  const [sc, setSc] = useState(0);
  const [sr, setSr] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessionDuration);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const timeRef = useRef(sessionDuration);
  const srRef = useRef(0);
  const scRef = useRef(0);
  const okRef = useRef(0);
  const answeredRef = useRef(0);

  const genQ = useCallback(() => {
    let q = '', ans = 0;
    if (difficulty === 'easy') {
      const op = pick(['+', '−']);
      const a = R(1, 20), b = R(1, 20);
      ans = op === '+' ? a + b : Math.abs(a - b);
      const [hi, lo] = a >= b ? [a, b] : [b, a];
      q = `${hi} <span class="spo">${op}</span> ${lo}`;
    } else if (difficulty === 'hard') {
      const op = pick(['+', '−', '×', '÷']);
      let a, b;
      if (op === '+') { a = R(50, 499); b = R(50, 499); ans = a + b; }
      else if (op === '−') { a = R(100, 999); b = R(10, Math.floor(a / 2)); ans = a - b; }
      else if (op === '×') { a = R(5, 40); b = R(5, 25); ans = a * b; }
      else { b = R(2, 15); a = b * R(3, 20); ans = a / b; }
      q = `${a} <span class="spo">${op}</span> ${b}`;
    } else if (difficulty === 'really-hard') {
      const x = R(5, 25), y = R(5, 25), z = R(2, 12);
      const type = R(0, 3);
      if (type === 0) { ans = x * y + z; q = `${x}×${y}+${z}`; }
      else if (type === 1) { ans = x * y - z; q = `${x}×${y}−${z}`; }
      else if (type === 2) { ans = x + y * z; q = `${x}+${y}×${z}`; }
      else { ans = (x + y) * z; q = `(${x}+${y})×${z}`; }
    } else {
      const op = pick(['+', '−', '×']);
      let a, b;
      if (op === '+') { a = R(5, 99); b = R(5, 99); ans = a + b; }
      else if (op === '−') { a = R(20, 99); b = R(5, a); ans = a - b; }
      else { a = R(2, 12); b = R(2, 12); ans = a * b; }
      q = `${a} <span class="spo">${op}</span> ${b}`;
    }
    setQuestion(q);
    setAnswer(ans);
    setInput('');
    setFb(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setSc(0); setSr(0); setEnded(false);
    scRef.current = 0; srRef.current = 0; okRef.current = 0; answeredRef.current = 0; timeRef.current = sessionDuration;
    setTimeLeft(sessionDuration);
    clearInterval(timerRef.current);
    if (!zen) {
      timerRef.current = setInterval(() => {
        timeRef.current -= 0.1;
        setTimeLeft(timeRef.current);
        if (timeRef.current <= 0) {
          clearInterval(timerRef.current);
          setEnded(true);
        }
      }, 100);
    }
    genQ();
  }, [genQ, sessionDuration, zen]);

  useEffect(() => { startGame(); return () => clearInterval(timerRef.current); }, []); // eslint-disable-line

  const submit = () => {
    const v = parseInt(input.trim());
    if (isNaN(v)) return;
    answeredRef.current++;
    if (v === answer) {
      okRef.current++;
      srRef.current++;
      const pts = 5 + Math.min(srRef.current, 10);
      scRef.current += pts;
      setSr(srRef.current);
      setSc(scRef.current);
      if (zen) {
        setFb({ type: 'ok', msg: `+${pts}` });
      } else {
        timeRef.current = Math.min(sessionDuration, timeRef.current + 1.5);
        setFb({ type: 'ok', msg: `+${pts} · +1.5s` });
      }
    } else {
      srRef.current = 0;
      setSr(0);
      if (zen) {
        setFb({ type: 'err', msg: `${answer}` });
      } else {
        timeRef.current = Math.max(0, timeRef.current - 2);
        setFb({ type: 'err', msg: `${answer} · −2s` });
      }
    }
    if (zen && answeredRef.current >= ZEN_QUESTIONS) {
      setTimeout(() => setEnded(true), 600);
      return;
    }
    setTimeout(genQ, 500);
  };

  if (ended) {
    const label = zen ? `${scRef.current} pts · ${ZEN_QUESTIONS} problems (Zen)` : `${scRef.current} pts · ${sessionDuration}s session`;
    return <GameEnd gameId={GAME_ID} score={scRef.current} correct={okRef.current} total={answeredRef.current} label={label} onReplay={startGame} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: sc, color: 'var(--accent)' },
        zen
          ? { label: 'Problem', value: `${Math.min(answeredRef.current + 1, ZEN_QUESTIONS)}/${ZEN_QUESTIONS}`, color: 'var(--orange)' }
          : { label: 'Time', value: Math.ceil(Math.max(0, timeLeft)), color: 'var(--red)' },
        { label: 'Streak', value: sr, color: 'var(--green)' },
      ]} />
      {!zen && <GameTimer timeLeft={timeLeft} maxTime={sessionDuration} />}
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Solve the math problem as fast as you can. Enter your answer and press OK.
      </p>
      <div className="g-spq" dangerouslySetInnerHTML={{ __html: question }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          className="g-input"
          placeholder="?"
          autoComplete="off"
          inputMode="none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={submit}>OK</button>
      </div>
      <NumPad onKey={k => setInput(v => applyNumKey(v, k))} />
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
