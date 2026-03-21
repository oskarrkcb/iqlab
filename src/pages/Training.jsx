import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../i18n/LanguageContext';
import Footer from '../components/Footer';
import { SessionContext } from '../games/GameShell';
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
import { getHighScore } from '../stats';
import './Training.css';

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
    default: return <svg {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
  }
}

/** Format seconds to M:SS */
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Small inline high-score chip shown on game cards */
function ScoreChip({ gameId }) {
  const hs = getHighScore(gameId);
  if (!hs) return null;
  return (
    <span className="train-hs-chip">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      {hs}
    </span>
  );
}

// Category → game IDs map for filtering
const CATEGORY_MAP = {
  math:   ['est', 'op', 'g24', 'sp', 'seq'],
  logic:  ['ooo', 'mat', 'syllogisms', 'algo', 'seq'],
  memory: ['mem', 'dual-nback', 'chimp'],
  speed:  ['sp', 'schulte', 'stroop', 'rotation'],
  iq:     ['ravens', 'mat', 'syllogisms', 'rotation'],
  focus:  ['schulte', 'dual-nback', 'stroop'],
};

export default function Training() {
  const { t } = useLang();
  const [timerMode, setTimerMode] = useState('timed');
  const [difficulty, setDifficulty] = useState('medium');
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
  ];

  const seriesTypes = [
    { id: 'mixed', label: t.training.mixed },
    { id: 'fibonacci', label: t.training.fibonacci },
    { id: 'exponential', label: t.training.exponential },
    { id: 'primes', label: t.training.primes },
    { id: 'alternating', label: 'Alternating Ops' },
    { id: 'sqrt-exp', label: '√ & Exponents' },
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

  const startGame = (id) => {
    setActiveGame(id);
    setCurrentSet(1);
    setGameKey(k => k + 1);
    if (timerMode === 'timed') {
      startSessionTimer(timeLimit);
    } else {
      setSessionTimeLeft(null);
    }
  };

  const handleNextSet = useCallback(() => {
    setCurrentSet(s => s + 1);
    setGameKey(k => k + 1);
  }, []);

  const handleBack = useCallback(() => {
    stopSessionTimer();
    setActiveGame(null);
    setMarathonActive(false);
    setCurrentSet(1);
  }, [stopSessionTimer]);

  const startMarathon = () => {
    setMarathonActive(true);
    setActiveGame(null);
  };

  const GameComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

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
                </div>
              </div>
              <div className="game-frame-large">
                <MarathonMode
                  onBack={handleBack}
                  difficulty={difficulty}
                  timerMode={timerMode}
                  timeLimit={timeLimit}
                  helpLevel={helpLevel}
                  seriesType={seriesType}
                />
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
                    <button className="tr-sidebar-mode-btn" onClick={startMarathon}>
                      <span className="tr-sidebar-mode-icon"><GameIcon type="marathon" /></span>
                      <span>Marathon</span>
                    </button>
                    <button className="tr-sidebar-mode-btn" onClick={() => startGame('vs-bot')}>
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
                    {['Easy', 'Medium', 'Hard', 'Really Hard'].map(d => {
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
                      {filteredBasicGames.map(game => (
                        <div key={game.id} className="tr-card" onClick={() => startGame(game.id)}>
                          <div className="tr-card-top">
                            <div className="tr-card-icon"><GameIcon type={game.icon} /></div>
                            <ScoreChip gameId={game.id} />
                          </div>
                          <div className="tr-card-cat">{game.category}</div>
                          <div className="tr-card-title">{game.name}</div>
                          <div className="tr-card-desc">{game.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Advanced Modes */}
                {filteredAdvancedGames.length > 0 && (
                  <>
                    <div className="tr-section-label" style={{ marginTop: filteredBasicGames.length > 0 ? 28 : 0 }}>{t.training.advanced}</div>
                    <div className="tr-grid">
                      {filteredAdvancedGames.map(game => (
                        <div key={game.id} className="tr-card" onClick={() => startGame(game.id)}>
                          <div className="tr-card-top">
                            <div className="tr-card-icon"><GameIcon type={game.icon} /></div>
                            <ScoreChip gameId={game.id} />
                          </div>
                          <div className="tr-card-cat">{game.category}</div>
                          <div className="tr-card-title">{game.name}</div>
                          <div className="tr-card-desc">{game.desc}</div>
                        </div>
                      ))}
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
                  {reps > 1 && (
                    <div className="session-sets-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      Set {currentSet}/{reps}
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
                <SessionContext.Provider value={sessionCtx}>
                  {GameComponent && (
                    <GameComponent
                      key={gameKey}
                      onBack={handleBack}
                      difficulty={difficulty}
                      timerMode={timerMode}
                      timeLimit={timeLimit}
                      reps={reps}
                      helpLevel={helpLevel}
                      seriesType={seriesType}
                    />
                  )}
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
