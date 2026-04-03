import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, GameTimer, Feedback, GameEnd, HighScoreBanner } from './GameShell';
import { R, pick } from './utils';

const GAME_ID = 'vs-bot';

const BOT_CONFIG = {
  rookie:  { accuracy: 0.45, delay: 2400 },
  trained: { accuracy: 0.65, delay: 1600 },
  expert:  { accuracy: 0.80, delay:  900 },
  elite:   { accuracy: 0.92, delay:  400 },
};

const LEVELS = [
  { key: 'rookie',  label: 'Rookie' },
  { key: 'trained', label: 'Trained' },
  { key: 'expert',  label: 'Expert' },
  { key: 'elite',   label: 'Elite' },
];

function genQuestion(diff) {
  const ops = ['+', '−', '×'];
  const op = pick(ops);
  let a, b, ans;
  if (op === '+') {
    a = R(5 + diff * 10, 50 + diff * 30);
    b = R(5 + diff * 10, 50 + diff * 30);
    ans = a + b;
  } else if (op === '−') {
    a = R(20 + diff * 15, 99 + diff * 50);
    b = R(5, a);
    ans = a - b;
  } else {
    a = R(2 + diff, 12 + diff * 3);
    b = R(2 + diff, 12 + diff * 3);
    ans = a * b;
  }
  return { q: `${a} ${op} ${b}`, ans };
}

export default function VsBot({ onBack }) {
  const [botLevel, setBotLevel] = useState('trained');
  const [gamePhase, setGamePhase] = useState('lobby');
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null);
  const [botFb, setBotFb] = useState(null);
  const [ended, setEnded] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const timerRef = useRef(null);
  const botTimerRef = useRef(null);
  const inputRef = useRef(null);
  const timeRef = useRef(60);
  const diffRef = useRef(0);
  const botLevelRef = useRef(botLevel);

  // Keep ref in sync so callbacks always read the latest level
  useEffect(() => {
    botLevelRef.current = botLevel;
  }, [botLevel]);

  const nextQ = useCallback(() => {
    const q = genQuestion(diffRef.current);
    setQuestion(q);
    setInput('');
    setFb(null);
    setBotFb(null);
    setRound(r => r + 1);
    setBotThinking(true);

    const { accuracy, delay } = BOT_CONFIG[botLevelRef.current];
    clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => {
      const botCorrect = Math.random() < accuracy;
      if (botCorrect) {
        setBotScore(s => s + 10);
        setBotFb({ type: 'ok', msg: 'Bot: Correct!' });
      } else {
        setBotFb({ type: 'err', msg: 'Bot: Wrong!' });
      }
      setBotThinking(false);
    }, delay);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const startGame = useCallback(() => {
    setPlayerScore(0);
    setBotScore(0);
    setRound(0);
    setEnded(false);
    setGamePhase('playing');
    diffRef.current = 0;
    timeRef.current = 60;
    setTimeLeft(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        clearTimeout(botTimerRef.current);
        setEnded(true);
      }
    }, 100);
    nextQ();
  }, [nextQ]);

  // Cleanup on unmount only — no auto-start
  useEffect(() => {
    return () => { clearInterval(timerRef.current); clearTimeout(botTimerRef.current); };
  }, []);

  const submit = () => {
    if (!question) return;
    const v = parseInt(input.trim());
    if (isNaN(v)) return;
    if (v === question.ans) {
      setPlayerScore(s => s + 10);
      setFb({ type: 'ok', msg: '+10' });
      diffRef.current = Math.min(5, diffRef.current + 0.3);
    } else {
      setFb({ type: 'err', msg: `${question.ans}` });
      diffRef.current = Math.max(0, diffRef.current - 0.2);
    }
    clearTimeout(botTimerRef.current);
    setBotThinking(false);
    setTimeout(nextQ, 600);
  };

  const goToLobby = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(botTimerRef.current);
    setEnded(false);
    setQuestion(null);
    setGamePhase('lobby');
  }, []);

  // --- Lobby screen ---
  if (gamePhase === 'lobby') {
    return (
      <div
        className="game-frame"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          minHeight: 340,
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>
          Choose Bot Difficulty
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {LEVELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBotLevel(key)}
              style={{
                borderRadius: 999,
                padding: '8px 20px',
                border: '2px solid var(--accent)',
                background: botLevel === key ? 'var(--accent)' : 'var(--bg4)',
                color: botLevel === key ? '#fff' : 'var(--text)',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={startGame}
          style={{
            borderRadius: 999,
            padding: '10px 36px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Start Match
        </button>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
            }}
          >
            Back
          </button>
        )}
      </div>
    );
  }

  // --- Game end screen ---
  if (ended) {
    const won = playerScore > botScore;
    const tied = playerScore === botScore;
    const resultLabel = won ? 'You Win!' : tied ? 'Draw!' : 'Bot Wins!';
    return (
      <GameEnd
        gameId={GAME_ID}
        score={playerScore}
        label={`${resultLabel} — You: ${playerScore} vs Bot: ${botScore}`}
        onReplay={goToLobby}
        onBack={onBack}
      />
    );
  }

  // --- Active game screen ---
  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <div className="vs-header">
        <div className="vs-player">
          <div className="vs-name">You</div>
          <div className="vs-score" style={{ color: 'var(--accent)' }}>{playerScore}</div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="vs-player">
          <div className="vs-name">Bot</div>
          <div className="vs-score" style={{ color: 'var(--orange)' }}>{botScore}</div>
        </div>
      </div>
      <GameTimer timeLeft={timeLeft} maxTime={60} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Answer faster and more accurately than the bot to win the round.
      </p>
      {question && (
        <>
          <div className="g-spq">{question.q}</div>
          {botThinking && (
            <div className="vs-bot-thinking">
              <span className="vs-dot" /><span className="vs-dot" /><span className="vs-dot" />
              Bot is thinking...
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="g-input"
              placeholder="?"
              autoComplete="off"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={submit}>GO</button>
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {fb && <div style={{ flex: 1 }}><Feedback type={fb.type} message={fb.msg} /></div>}
        {botFb && <div style={{ flex: 1 }}><Feedback type={botFb.type} message={botFb.msg} /></div>}
      </div>
    </div>
  );
}
