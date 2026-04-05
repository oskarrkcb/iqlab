import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { useKeySelect } from './useKeySelect';
import { R, pick, shuf } from './utils';
const GAME_ID = 'stroop';

const ALL_COLORS = [
  { name: 'Red', css: '#ef4444' },
  { name: 'Blue', css: '#3b82f6' },
  { name: 'Green', css: '#22c55e' },
  { name: 'Yellow', css: '#eab308' },
  { name: 'Purple', css: '#a78bfa' },
  { name: 'Orange', css: '#f59e0b' },
  { name: 'Pink', css: '#ec4899' },
  { name: 'Cyan', css: '#06b6d4' },
];
const COLOR_COUNT = { easy: 4, medium: 6, hard: 6, 'really-hard': 8 };
const SESSION_TIME = { easy: 45, medium: 45, hard: 40, 'really-hard': 30 };
const CONGRUENT_RATE = { easy: 0, medium: 0, hard: 0.25, 'really-hard': 0.30 };

export default function StroopTest({ onBack, difficulty = 'medium' }) {
  const COLOR_MAP = ALL_COLORS.slice(0, COLOR_COUNT[difficulty] || 6);
  const sessionTime = SESSION_TIME[difficulty] || 45;
  const congruentRate = CONGRUENT_RATE[difficulty] || 0;
  const canSwitchMode = difficulty === 'really-hard';

  const [sc, setSc] = useState(0);
  const [sr, setSr] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [word, setWord] = useState('');
  const [displayColor, setDisplayColor] = useState('');
  const [options, setOptions] = useState([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [fb, setFb] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [ended, setEnded] = useState(false);
  const [mode, setMode] = useState('intro'); // intro, playing
  const [questionMode, setQuestionMode] = useState('ink'); // 'ink' or 'word'
  const timerRef = useRef(null);
  const timeRef = useRef(45);
  const scRef = useRef(0);
  const srRef = useRef(0);

  const genQ = useCallback(() => {
    const isCongruent = Math.random() < congruentRate;
    // Pick word and ink color
    const wordColor = pick(COLOR_MAP);
    let inkColor;
    if (isCongruent) {
      inkColor = wordColor; // word matches ink
    } else {
      do { inkColor = pick(COLOR_MAP); } while (inkColor.name === wordColor.name);
    }

    // For really-hard: randomly switch between 'ink' and 'word' mode
    const qMode = canSwitchMode && Math.random() < 0.4 ? 'word' : 'ink';
    setQuestionMode(qMode);

    setWord(wordColor.name);
    setDisplayColor(inkColor.css);
    setAnswered(false); setFb(null);

    // The correct answer depends on the question mode
    const correctColor = qMode === 'word' ? wordColor : inkColor;

    // Options: always include the correct answer + distractors
    const others = COLOR_MAP.filter(c => c.name !== correctColor.name);
    const distractors = shuf(others).slice(0, 3);
    const opts = shuf([correctColor, ...distractors]);
    setOptions(opts);
    setCorrectIdx(opts.indexOf(correctColor));
  }, [congruentRate, canSwitchMode]); // eslint-disable-line

  const startGame = useCallback(() => {
    setSc(0); setSr(0); setEnded(false);
    scRef.current = 0; srRef.current = 0; timeRef.current = sessionTime;
    setTimeLeft(sessionTime);
    setMode('playing');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        setEnded(true);
      }
    }, 100);
    genQ();
  }, [genQ, sessionTime]);

  useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => { scRef.current = sc; }, [sc]);

  const answer = useCallback((i) => {
    if (answered) return;
    setAnswered(true);
    if (i === correctIdx) {
      srRef.current++;
      const pts = 5 + Math.min(srRef.current, 10);
      scRef.current += pts;
      timeRef.current = Math.min(sessionTime, timeRef.current + 0.8);
      setSr(srRef.current); setSc(scRef.current);
      setFb({ type: 'ok', msg: `+${pts}` });
    } else {
      srRef.current = 0;
      timeRef.current = Math.max(0, timeRef.current - 3);
      setSr(0);
      setFb({ type: 'err', msg: `${options[correctIdx].name} · −3s` });
    }
    setTimeout(genQ, 600);
  }, [answered, correctIdx, options, genQ, sessionTime]);

  useKeySelect(answer, options.length || 4, answered);

  if (mode === 'intro') {
    return (
      <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>Stroop Test</h3>
          <p style={{ color: 'var(--gray2)', fontSize: 14, marginBottom: 8, maxWidth: 420, margin: '0 auto 8px' }}>
            A color name will be displayed in a <b>different ink color</b>.
          </p>
          <p style={{ color: 'var(--gray2)', fontSize: 14, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
            Your job: identify the <b>ink color</b>, not the word.{canSwitchMode ? ' Sometimes you\'ll be asked what the WORD says instead!' : ''} This trains cognitive interference control.
          </p>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 900, color: '#3b82f6' }}>Red</span>
            <p style={{ color: 'var(--gray3)', fontSize: 12, marginTop: 8 }}>↑ Answer: Blue (the ink color, not the word)</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startGame}>Start</button>
        </div>
      </div>
    );
  }

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={scRef.current} label={`${scRef.current} points in ${sessionTime}s`} onReplay={startGame} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <GameStats stats={[
        { label: 'Points', value: sc, color: 'var(--accent)' },
        { label: 'Time', value: Math.ceil(Math.max(0, timeLeft)), color: 'var(--red)' },
        { label: 'Streak', value: sr, color: 'var(--green)' },
      ]} />
      <GameTimer timeLeft={timeLeft} maxTime={sessionTime} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        {questionMode === 'word' ? 'Name what the WORD says, ignore the color!' : 'Name the COLOR of the text, not the word itself.'}
      </p>

      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{
          color: questionMode === 'word' ? 'var(--orange)' : 'var(--gray3)',
          fontSize: questionMode === 'word' ? 13 : 11,
          marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
          fontWeight: questionMode === 'word' ? 700 : 400,
        }}>
          {questionMode === 'word' ? '⚡ What does the WORD say?' : 'What color is the INK?'}
        </p>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 56, fontWeight: 900, color: displayColor, marginBottom: 24 }}>
          {word}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 340, margin: '0 auto' }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)} disabled={answered} style={{
              padding: '14px 20px', borderRadius: 12, border: '2px solid var(--gray5)',
              background: 'var(--bg4)', color: opt.css, fontFamily: 'var(--mono)',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {opt.name}
            </button>
          ))}
        </div>
      </div>
      {fb && <Feedback type={fb.type} message={fb.msg} />}
    </div>
  );
}
