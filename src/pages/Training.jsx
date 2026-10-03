import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../i18n/LanguageContext';
import Footer from '../components/Footer';
import { SessionContext, GameSettingsContext } from '../games/GameShell';
import { nextDifficulty, LEVEL_LABELS } from '../games/adaptive';
import { setSeed, seedFromString } from '../games/utils';
import { todayKey, dailyGame, dailyRecordId, dailySeedText, getMyDaily, getDailyLeaderboard, DAILY_DIFFICULTY } from '../daily';
import NumberSeries from '../games/NumberSeries';
import OperatorPuzzle from '../games/OperatorPuzzle';
import Game24 from '../games/Game24';
import NumberMemory from '../games/NumberMemory';
import SpeedMath from '../games/SpeedMath';
import OddOneOut from '../games/OddOneOut';
import MatrixPuzzle from '../games/MatrixPuzzle';
import Estimation from '../games/Estimation';
import DualNBack from '../games/DualNBack';
import RavensMatrices from '../games/RavensMatrices';
import SchulteTables from '../games/SchulteTables';
import StroopTest from '../games/StroopTest';
import MentalRotation from '../games/MentalRotation';
import Syllogisms from '../games/Syllogisms';
import ChimpTest from '../games/ChimpTest';
import AlgoThinking from '../games/AlgoThinking';
import VsBot from '../games/VsBot';
import MarathonMode from '../games/MarathonMode';
import CorsiBlock from '../games/CorsiBlock';
import TrailMaking from '../games/TrailMaking';
import GoNoGo from '../games/GoNoGo';
import TowerOfHanoi from '../games/TowerOfHanoi';
import MathTricks from '../games/MathTricks';
import { getHighScore, getHistory } from '../stats';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Training.css';

const FREE_GAMES = ['sp', 'seq'];

const GAME_COMPONENTS = {
  seq: NumberSeries,
  ooo: OddOneOut,
  mat: MatrixPuzzle,
  est: Estimation,
  op: OperatorPuzzle,
  g24: Game24,
  sp: SpeedMath,
  mem: NumberMemory,
  'dual-nback': DualNBack,
  ravens: RavensMatrices,
  schulte: SchulteTables,
  stroop: StroopTest,
  rotation: MentalRotation,
  syllogisms: Syllogisms,
  chimp: ChimpTest,
  algo: AlgoThinking,
  'vs-bot': VsBot,
  corsi: CorsiBlock,
  trail: TrailMaking,
  gonogo: GoNoGo,
  hanoi: TowerOfHanoi,
  tricks: MathTricks,
};

function GameIcon({ type }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'series': return <svg {...props}><line x1="6" y1="6" x2="6" y2="18"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="18" y1="3" x2="18" y2="18"/></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'target': return <svg {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'plus': return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'bullseye': return <svg {...props}><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8a4 4 0 1 0 4 4"/><line x1="21" y1="3" x2="14" y2="10"/></svg>;
    case 'zap': return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'brain': return <svg {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>;
    case 'nback': return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01"/><path d="M15 15h.01"/></svg>;
    case 'schulte': return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
    case 'stroop': return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
    case 'rotate': return <svg {...props}><path d="M21 12a9 9 0 1 1-6.2-8.6"/><path d="M21 3v9h-9"/></svg>;
    case 'logic': return <svg {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'code': return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    case 'swords': return <svg {...props}><path d="m14.5 17.5 3 3 4-4-3-3"/><path d="m3 6.5 3-3"/><path d="m2 5 7 7"/><path d="m14.5 6.5-8 8"/><path d="m6 14.5-3 3 4 4 3-3"/><path d="m21 3.5-3 3"/><path d="m22 5-7 7"/></svg>;
    case 'marathon': return <svg {...props}><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H17"/></svg>;
    case 'blocks': return <svg {...props}><rect x="3" y="4" width="5" height="5" rx="1"/><rect x="14" y="3" width="5" height="5" rx="1"/><rect x="9" y="11" width="5" height="5" rx="1"/><rect x="4" y="16" width="5" height="5" rx="1"/><rect x="16" y="15" width="5" height="5" rx="1"/></svg>;
    case 'trail': return <svg {...props}><circle cx="5" cy="6" r="2.5"/><circle cx="18" cy="9" r="2.5"/><circle cx="8" cy="18" r="2.5"/><path d="M7.4 6.6 15.6 8.4"/><path d="M16.3 11 9.7 16.2"/></svg>;
    case 'stop': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>;
    case 'tower': return <svg {...props}><line x1="12" y1="4" x2="12" y2="20"/><rect x="8" y="12" width="8" height="3" rx="1"/><rect x="6" y="16" width="12" height="3" rx="1"/><line x1="3" y1="20" x2="21" y2="20"/></svg>;
    case 'bulb': return <svg {...props}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/></svg>;
    default: return <svg {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
  }
}

/** Format seconds to M:SS */
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Format seconds to short label, e.g. 60 → "1m", 90 → "1m30s", 30 → "30s" */
function fmtLimit(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0 && sec > 0) return `${m}m${sec}s`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

/** Small inline high-score chip shown on game cards (for the selected difficulty) */
function ScoreChip({ gameId, difficulty }) {
  const [hs, setHs] = useState(0);
  useEffect(() => {
    getHighScore(gameId, difficulty).then(setHs);
  }, [gameId, difficulty]);
  if (!hs) return null;
  return (
    <span className="train-hs-chip">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      {hs}
    </span>
  );
}

const DAILY_TEXT = {
  de: {
    title: 'Tages-Challenge',
    sub: g => `Heute: ${g} · Hard · alle bekommen dieselben Rätsel`,
    play: 'Jetzt spielen',
    practice: 'Nochmal üben',
    login: 'Anmelden zum Mitspielen',
    mine: (s, rank) => `Dein Ergebnis: ${s} Punkte${rank ? ` · Platz ${rank}` : ''}`,
    firstOnly: 'Nur dein erster Versuch zählt für die Rangliste.',
    noOne: 'Heute hat noch niemand gespielt – sei die oder der Erste!',
    missing: 'Die Tages-Rangliste ist noch nicht eingerichtet.',
  },
  en: {
    title: 'Daily Challenge',
    sub: g => `Today: ${g} · Hard · everyone gets the same puzzles`,
    play: 'Play now',
    practice: 'Practise again',
    login: 'Sign in to take part',
    mine: (s, rank) => `Your result: ${s} points${rank ? ` · rank ${rank}` : ''}`,
    firstOnly: 'Only your first try counts for the ranking.',
    noOne: 'Nobody has played today yet – be the first!',
    missing: 'The daily ranking is not set up yet.',
  },
};

function DailyCard({ user, lang, gameName, onPlay, onLogin }) {
  const tx = DAILY_TEXT[lang] || DAILY_TEXT.en;
  const key = todayKey();
  const [mine, setMine] = useState(null);
  const [board, setBoard] = useState({ rows: [], error: null });

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyDaily(key), getDailyLeaderboard(key, 5)]).then(([m, b]) => { setMine(m); setBoard(b); });
  }, [user, key]);

  const rank = board.rows.findIndex(r => r.user_id === user?.id) + 1;

  return (
    <div className="tr-daily">
      <div className="tr-daily-head">
        <div>
          <div className="tr-daily-title">{tx.title} · {key.split('-').reverse().join('.')}</div>
          <div className="tr-daily-sub">{tx.sub(gameName)}</div>
        </div>
        {user ? (
          <button className={`btn ${mine ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={onPlay}>{mine ? tx.practice : tx.play}</button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onLogin}>{tx.login}</button>
        )}
      </div>
      {user && mine && <div className="tr-daily-mine">{tx.mine(mine.score, rank)} <span>{tx.firstOnly}</span></div>}
      {user && (
        board.error ? (
          <div className="tr-daily-note">{tx.missing}</div>
        ) : board.rows.length === 0 ? (
          <div className="tr-daily-note">{tx.noOne}</div>
        ) : (
          <ol className="tr-daily-board">
            {board.rows.map((r, i) => (
              <li key={r.user_id} className={r.user_id === user.id ? 'me' : ''}>
                <span className="tr-daily-pos">{i + 1}</span>
                <span className="tr-daily-name">{r.display_name || 'Anonymous'}</span>
                <span className="tr-daily-score">{r.score}</span>
              </li>
            ))}
          </ol>
        )
      )}
    </div>
  );
}

// Category → game IDs map for filtering
const CATEGORY_MAP = {
  math:   ['est', 'op', 'g24', 'sp', 'seq', 'tricks'],
  logic:  ['ooo', 'mat', 'syllogisms', 'algo', 'seq', 'hanoi'],
  memory: ['mem', 'dual-nback', 'chimp', 'corsi'],
  speed:  ['sp', 'schulte', 'stroop', 'rotation', 'trail', 'gonogo'],
  iq:     ['ravens', 'mat', 'syllogisms', 'rotation'],
  focus:  ['schulte', 'dual-nback', 'stroop', 'trail', 'gonogo'],
};

export default function Training() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timerMode, setTimerMode] = useState('timed');
  const [difficulty, setDifficulty] = useState('medium');
  // The level actually played — differs from `difficulty` in Auto mode
  const [playDifficulty, setPlayDifficulty] = useState('medium');
  // { key: 'YYYY-MM-DD' } while the daily challenge is being played
  const [daily, setDaily] = useState(null);
  const [seriesType, setSeriesType] = useState('mixed');
  const [helpLevel, setHelpLevel] = useState('none');
  const [category, setCategory] = useState('all');
  const [reps, setReps] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60);
  const [activeGame, setActiveGame] = useState(null);
  const [marathonActive, setMarathonActive] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Session state for multi-set training
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const sessionTimerRef = useRef(null);

  const EXISTING_GAMES = [
    { id: 'seq', name: t.games.numberSeries.name, desc: t.games.numberSeries.desc, category: 'Logic', icon: 'series' },
    { id: 'ooo', name: t.games.oddOneOut.name, desc: t.games.oddOneOut.desc, category: 'Logic', icon: 'search' },
    { id: 'mat', name: t.games.matrixPuzzle.name, desc: t.games.matrixPuzzle.desc, category: 'IQ', icon: 'grid' },
    { id: 'est', name: t.games.estimation.name, desc: t.games.estimation.desc, category: 'Math', icon: 'target' },
    { id: 'op', name: t.games.operatorPuzzle.name, desc: t.games.operatorPuzzle.desc, category: 'Math', icon: 'plus' },
    { id: 'g24', name: t.games.game24.name, desc: t.games.game24.desc, category: 'Math', icon: 'bullseye' },
    { id: 'sp', name: t.games.speedMath.name, desc: t.games.speedMath.desc, category: 'Math', icon: 'zap' },
    { id: 'mem', name: t.games.numberMemory.name, desc: t.games.numberMemory.desc, category: 'Memory', icon: 'brain' },
    { id: 'tricks', name: t.games.mathTricks.name, desc: t.games.mathTricks.desc, category: 'Math', icon: 'bulb' },
  ];

  const ADVANCED_MODES = [
    { id: 'dual-nback', name: t.games.dualNBack.name, desc: t.games.dualNBack.desc, category: 'Memory', icon: 'nback' },
    { id: 'ravens', name: t.games.ravens.name, desc: t.games.ravens.desc, category: 'IQ', icon: 'grid' },
    { id: 'schulte', name: t.games.schulte.name, desc: t.games.schulte.desc, category: 'Focus', icon: 'schulte' },
    { id: 'stroop', name: t.games.stroop.name, desc: t.games.stroop.desc, category: 'Focus', icon: 'stroop' },
    { id: 'rotation', name: t.games.rotation.name, desc: t.games.rotation.desc, category: 'IQ', icon: 'rotate' },
    { id: 'syllogisms', name: t.games.syllogisms.name, desc: t.games.syllogisms.desc, category: 'Logic', icon: 'logic' },
    { id: 'chimp', name: t.games.chimp.name, desc: t.games.chimp.desc, category: 'Memory', icon: 'brain' },
    { id: 'algo', name: t.games.algo.name, desc: t.games.algo.desc, category: 'Logic', icon: 'code' },
    { id: 'corsi', name: t.games.corsi.name, desc: t.games.corsi.desc, category: 'Memory', icon: 'blocks' },
    { id: 'trail', name: t.games.trail.name, desc: t.games.trail.desc, category: 'Focus', icon: 'trail' },
    { id: 'gonogo', name: t.games.goNoGo.name, desc: t.games.goNoGo.desc, category: 'Focus', icon: 'stop' },
    { id: 'hanoi', name: t.games.hanoi.name, desc: t.games.hanoi.desc, category: 'Logic', icon: 'tower' },
  ];

  const seriesTypes = [
    { id: 'mixed', label: t.training.mixed },
    { id: 'fibonacci', label: t.training.fibonacci },
    { id: 'exponential', label: t.training.exponential },
    { id: 'primes', label: t.training.primes },
    { id: 'alternating', label: 'Alternating Ops' },
    { id: 'sqrt-exp', label: '√ & Exponents' },
    { id: 'digits', label: 'Digit Tricks' },
    { id: 'hidden', label: 'Hidden Sequences' },
  ];

  const filterGames = (games) => {
    if (category === 'all') return games;
    const allowed = CATEGORY_MAP[category] || [];
    return games.filter(g => allowed.includes(g.id));
  };

  const filteredBasicGames = filterGames(EXISTING_GAMES);
  const filteredAdvancedGames = filterGames(ADVANCED_MODES);

  // Start session timer
  const startSessionTimer = useCallback((secs) => {
    clearInterval(sessionTimerRef.current);
    setSessionTimeLeft(secs);
    sessionTimerRef.current = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(sessionTimerRef.current);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, []);

  const stopSessionTimer = useCallback(() => {
    clearInterval(sessionTimerRef.current);
    setSessionTimeLeft(null);
  }, []);

  useEffect(() => {
    if (sessionTimeLeft !== null && sessionTimeLeft <= 0) {
      stopSessionTimer();
    }
  }, [sessionTimeLeft, stopSessionTimer]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(sessionTimerRef.current), []);

  const startGame = async (id) => {
    if (!user && !FREE_GAMES.includes(id)) {
      navigate('/login');
      return;
    }
    setSeed(null);
    setDaily(null);
    // Auto: pick the level from how your last game of this kind went
    const level = difficulty === 'auto'
      ? nextDifficulty(user ? await getHistory(id, 10) : [])
      : difficulty;
    setPlayDifficulty(level);
    setActiveGame(id);
    setCurrentSet(1);
    setGameKey(k => k + 1);
    if (timerMode === 'timed') {
      startSessionTimer(timeLimit);
    } else {
      setSessionTimeLeft(null);
    }
  };

  // Started from elsewhere (e.g. a dashboard recommendation): navigate('/training', { state: { start: id } })
  useEffect(() => {
    const id = location.state?.start;
    if (id && GAME_COMPONENTS[id]) {
      navigate(location.pathname, { replace: true, state: null }); // don't restart on reload
      startGame(id);
    }
  }, []); // eslint-disable-line

  const handleNextSet = useCallback(() => {
    setCurrentSet(s => s + 1);
    setGameKey(k => k + 1);
  }, []);

  // Daily challenge: same seed for everyone, fixed settings, no session timer
  const startDaily = () => {
    if (!user) { navigate('/login'); return; }
    const key = todayKey();
    stopSessionTimer();
    setSeed(seedFromString(dailySeedText(key)));
    setDaily({ key });
    setPlayDifficulty(DAILY_DIFFICULTY);
    setActiveGame(dailyGame(key));
    setCurrentSet(1);
    setGameKey(k => k + 1);
  };

  const handleBack = useCallback(() => {
    stopSessionTimer();
    setSeed(null);
    setDaily(null);
    setActiveGame(null);
    setMarathonActive(false);
    setCurrentSet(1);
  }, [stopSessionTimer]);

  const startMarathon = () => {
    setMarathonActive(true);
    setActiveGame(null);
  };

  const GameComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;
  const isAuto = difficulty === 'auto';
  const marathonDifficulty = isAuto ? 'medium' : difficulty;

  // Records are kept per level; in Auto mode "Play again" re-picks the level.
  // The daily challenge stores results as "daily-YYYY-MM-DD" and replays the same puzzles.
  const gameSettings = daily
    ? { difficulty: DAILY_DIFFICULTY, recordAs: dailyRecordId(daily.key), restart: startDaily }
    : { difficulty: playDifficulty, restart: isAuto && activeGame ? () => startGame(activeGame) : null };
  const allGames = [...EXISTING_GAMES, ...ADVANCED_MODES];
  const nameOf = id => allGames.find(g => g.id === id)?.name ?? id;

  // Session context value — consumed by GameEnd in GameShell.jsx
  const sessionCtx = reps > 1 ? {
    currentSet,
    totalSets: reps,
    onNextSet: handleNextSet,
  } : null;

  return (
    <div className="page-enter">
      <div className="training-page">

        {marathonActive ? (
          <div className="tr-inner">
            <div className="game-immersive">
              <div className="session-bar">
                <button className="btn btn-ghost btn-sm" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  {t.game.back}
                </button>
                <div className="session-bar-info">
                  <div className="session-sets-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H17"/></svg>
                    Marathon
                  </div>
                  {timerMode === 'timed' && (
                    <div className="session-limit-pill">{fmtLimit(timeLimit)}</div>
                  )}
                </div>
              </div>
              <div className="game-frame-large">
                <GameSettingsContext.Provider value={{ difficulty: marathonDifficulty, restart: null }}>
                  <MarathonMode
                    onBack={handleBack}
                    difficulty={marathonDifficulty}
                    timerMode={timerMode}
                    timeLimit={timeLimit}
                    helpLevel={helpLevel}
                    seriesType={seriesType}
                  />
                </GameSettingsContext.Provider>
              </div>
            </div>
          </div>
        ) : !activeGame ? (
          <div className="tr-inner">

            {/* Header */}
            <header className="tr-header">
              <div>
                <h2>{t.training.title}</h2>
                <p className="tr-header-sub">{t.training.subtitle}</p>
              </div>
            </header>

            {/* Two-column layout */}
            <div className="tr-layout">

              {/* LEFT SIDEBAR */}
              <aside className="tr-sidebar">

                {/* Quick Play */}
                <div className="tr-sidebar-section">
                  <div className="tr-sidebar-label">Quick Play</div>
                  <div className="tr-sidebar-modes">
                    <button className={`tr-sidebar-mode-btn${!user ? ' tr-sidebar-mode-btn--locked' : ''}`} onClick={() => user ? startMarathon() : navigate('/login')}>
                      <span className="tr-sidebar-mode-icon"><GameIcon type="marathon" /></span>
                      <span>Marathon</span>
                      {!user && <svg className="tr-sidebar-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </button>
                    <button className={`tr-sidebar-mode-btn${!user ? ' tr-sidebar-mode-btn--locked' : ''}`} onClick={() => user ? startGame('vs-bot') : navigate('/login')}>
                      <span className="tr-sidebar-mode-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                      </span>
                      <span>vs Bot</span>
                    </button>
                    <button className="tr-sidebar-mode-btn tr-sidebar-mode-btn--soon" disabled>
                      <span className="tr-sidebar-mode-icon"><GameIcon type="swords" /></span>
                      <span>1v1 Match</span>
                      <span className="tr-soon-tag">Soon</span>
                    </button>
                  </div>
                </div>

                <div className="tr-sidebar-divider" />

                {/* Session Settings */}
                <div className="tr-sidebar-section">
                  <div className="tr-sidebar-label">Session</div>

                  <div className="tr-sidebar-row">
                    <span className="tr-sidebar-field-label">Sets</span>
                    <select
                      className="tr-sidebar-select"
                      value={reps}
                      onChange={e => setReps(Number(e.target.value))}
                    >
                      {[1, 3, 5, 10].map(r => (
                        <option key={r} value={r}>{r}x</option>
                      ))}
                    </select>
                  </div>

                  <div className="tr-sidebar-row">
                    <span className="tr-sidebar-field-label">Time limit</span>
                    <select
                      className="tr-sidebar-select"
                      value={timeLimit}
                      onChange={e => setTimeLimit(Number(e.target.value))}
                    >
                      {[30, 60, 90, 120, 300, 600, 900].map(tl => (
                        <option key={tl} value={tl}>{tl < 60 ? `${tl}s` : `${tl / 60}m`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tr-sidebar-toggle-row">
                    <button
                      className={`tr-sidebar-toggle${timerMode === 'timed' ? ' active' : ''}`}
                      onClick={() => setTimerMode('timed')}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Timed
                    </button>
                    <button
                      className={`tr-sidebar-toggle${timerMode === 'zen' ? ' active' : ''}`}
                      onClick={() => setTimerMode('zen')}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      Zen
                    </button>
                  </div>
                </div>

                <div className="tr-sidebar-divider" />

                {/* Difficulty */}
                <div className="tr-sidebar-section">
                  <div className="tr-sidebar-label">Difficulty</div>
                  <div className="diff-pills">
                    {['Easy', 'Medium', 'Hard', 'Really Hard', 'Auto'].map(d => {
                      const val = d.toLowerCase().replace(' ', '-');
                      const active = difficulty === val;
                      return (
                        <button
                          key={d}
                          onClick={() => setDifficulty(val)}
                          className={active ? 'active' : ''}
                        >{d}</button>
                      );
                    })}
                  </div>
                  {isAuto && (
                    <p className="tr-sidebar-hint">
                      Each game starts at the level your last result earned: ≥85% correct → one level up, under 50% → one level down.
                    </p>
                  )}
                </div>

                <div className="tr-sidebar-divider" />

                {/* Series Type */}
                <div className="tr-sidebar-section">
                  <div className="tr-sidebar-label">Series Type</div>
                  <select
                    className="tr-sidebar-select tr-sidebar-select--full"
                    value={seriesType}
                    onChange={e => setSeriesType(e.target.value)}
                  >
                    {seriesTypes.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>

                <div className="tr-sidebar-divider" />

                {/* Help Level */}
                <div className="tr-sidebar-section">
                  <div className="tr-sidebar-label">Help</div>
                  <select
                    className="tr-sidebar-select tr-sidebar-select--full"
                    value={helpLevel}
                    onChange={e => setHelpLevel(e.target.value)}
                  >
                    <option value="none">{t.training.noHelp}</option>
                    <option value="hint">{t.training.showHint}</option>
                    <option value="steps">{t.training.stepByStep}</option>
                    <option value="answer">{t.training.showAnswer}</option>
                  </select>
                </div>

              </aside>

              {/* RIGHT — GAME GRID */}
              <main className="tr-main">

                <DailyCard
                  user={user}
                  lang={lang}
                  gameName={nameOf(dailyGame(todayKey()))}
                  onPlay={startDaily}
                  onLogin={() => navigate('/login')}
                />

                {/* Category tabs */}
                <div className="tr-cat-tabs">
                  {['All', 'Math', 'Logic', 'Memory', 'Speed', 'IQ', 'Focus'].map(cat => (
                    <button
                      key={cat}
                      className={`tr-cat-tab${category === cat.toLowerCase() ? ' active' : ''}`}
                      onClick={() => setCategory(cat.toLowerCase())}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Basic Games */}
                {filteredBasicGames.length > 0 && (
                  <>
                    <div className="tr-section-label">{t.training.available}</div>
                    <div className="tr-grid">
                      {filteredBasicGames.map(game => {
                        const isFree = FREE_GAMES.includes(game.id);
                        const locked = !user && !isFree;
                        return (
                          <div key={game.id} className={`tr-card${locked ? ' tr-card--locked' : ''}`} onClick={() => startGame(game.id)}>
                            <div className="tr-card-top">
                              <div className="tr-card-icon"><GameIcon type={game.icon} /></div>
                              {!locked && <ScoreChip gameId={game.id} difficulty={isAuto ? undefined : difficulty} />}
                              {isFree && !user && <span className="tr-free-tag">Free</span>}
                            </div>
                            <div className="tr-card-cat">{game.category}</div>
                            <div className="tr-card-title">{game.name}</div>
                            <div className="tr-card-desc">{game.desc}</div>
                            {locked && (
                              <div className="tr-lock-overlay">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <span>Sign up to play</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Advanced Modes */}
                {filteredAdvancedGames.length > 0 && (
                  <>
                    <div className="tr-section-label" style={{ marginTop: filteredBasicGames.length > 0 ? 28 : 0 }}>{t.training.advanced}</div>
                    <div className="tr-grid">
                      {filteredAdvancedGames.map(game => {
                        const locked = !user;
                        return (
                          <div key={game.id} className={`tr-card${locked ? ' tr-card--locked' : ''}`} onClick={() => startGame(game.id)}>
                            <div className="tr-card-top">
                              <div className="tr-card-icon"><GameIcon type={game.icon} /></div>
                              {!locked && <ScoreChip gameId={game.id} difficulty={isAuto ? undefined : difficulty} />}
                            </div>
                            <div className="tr-card-cat">{game.category}</div>
                            <div className="tr-card-title">{game.name}</div>
                            <div className="tr-card-desc">{game.desc}</div>
                            {locked && (
                              <div className="tr-lock-overlay">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <span>Sign up to play</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {filteredBasicGames.length === 0 && filteredAdvancedGames.length === 0 && (
                  <div className="tr-empty">No games match this category.</div>
                )}

              </main>
            </div>
          </div>
        ) : (
          <div className="tr-inner">
            <div className="game-immersive">
              {/* Session header bar */}
              <div className="session-bar">
                <button className="btn btn-ghost btn-sm" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  {t.game.back}
                </button>
                <div className="session-bar-info">
                  {daily && (
                    <div className="session-limit-pill">{(DAILY_TEXT[lang] || DAILY_TEXT.en).title} · Hard</div>
                  )}
                  {isAuto && !daily && (
                    <div className="session-limit-pill" title="Auto difficulty">
                      Auto · {LEVEL_LABELS[playDifficulty]}
                    </div>
                  )}
                  {reps > 1 && !daily && (
                    <div className="session-sets-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      Set {currentSet}/{reps}
                    </div>
                  )}
                  {timerMode === 'timed' && !daily && (
                    <div className="session-limit-pill">
                      {fmtLimit(timeLimit)}
                    </div>
                  )}
                  {timerMode === 'timed' && sessionTimeLeft !== null && (
                    <div className={`session-timer-pill${sessionTimeLeft < 30 ? ' danger' : sessionTimeLeft < 60 ? ' warn' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {fmtTime(sessionTimeLeft)}
                    </div>
                  )}
                </div>
              </div>

              <div className="game-frame-large">
                <SessionContext.Provider value={daily ? null : sessionCtx}>
                  <GameSettingsContext.Provider value={gameSettings}>
                    {GameComponent && (
                      <GameComponent
                        key={gameKey}
                        onBack={handleBack}
                        difficulty={playDifficulty}
                        timerMode={daily ? 'timed' : timerMode}
                        timeLimit={daily ? 60 : timeLimit}
                        reps={daily ? 1 : reps}
                        helpLevel={daily ? 'none' : helpLevel}
                        seriesType={daily ? 'mixed' : seriesType}
                      />
                    )}
                  </GameSettingsContext.Provider>
                </SessionContext.Provider>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
