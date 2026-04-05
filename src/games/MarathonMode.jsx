import { useState, useCallback } from 'react';
import SpeedMath from './SpeedMath';
import NumberSeries from './NumberSeries';
import NumberMemory from './NumberMemory';
import OddOneOut from './OddOneOut';
import MatrixPuzzle from './MatrixPuzzle';
import Estimation from './Estimation';
import DualNBack from './DualNBack';
import RavensMatrices from './RavensMatrices';
import SchulteTables from './SchulteTables';
import StroopTest from './StroopTest';
import MentalRotation from './MentalRotation';
import Syllogisms from './Syllogisms';
import ChimpTest from './ChimpTest';
import AlgoThinking from './AlgoThinking';
import OperatorPuzzle from './OperatorPuzzle';
import Game24 from './Game24';
import { recordGame, getHistory } from '../stats';
import { SessionContext } from './GameShell';

/**
 * MarathonMode — plays through all 16 training games in sequence.
 * Uses SessionContext so GameEnd shows "Next Game →" instead of "Play Again / Back".
 */

const MARATHON_GAMES = [
  { id: 'sp',        label: 'Speed Math',      Component: SpeedMath,      discipline: 'Math'   },
  { id: 'seq',       label: 'Number Series',   Component: NumberSeries,   discipline: 'Logic'  },
  { id: 'mem',       label: 'Number Memory',   Component: NumberMemory,   discipline: 'Memory' },
  { id: 'ooo',       label: 'Odd One Out',     Component: OddOneOut,      discipline: 'Logic'  },
  { id: 'mat',       label: 'Matrix Puzzle',   Component: MatrixPuzzle,   discipline: 'IQ'     },
  { id: 'est',       label: 'Estimation',      Component: Estimation,     discipline: 'Math'   },
  { id: 'stroop',    label: 'Stroop Test',     Component: StroopTest,     discipline: 'Focus'  },
  { id: 'op',        label: 'Operator Puzzle', Component: OperatorPuzzle, discipline: 'Math'   },
  { id: 'schulte',   label: 'Schulte Tables',  Component: SchulteTables,  discipline: 'Focus'  },
  { id: 'ravens',    label: 'Ravens Matrices', Component: RavensMatrices, discipline: 'IQ'     },
  { id: 'rotation',  label: 'Mental Rotation', Component: MentalRotation, discipline: 'IQ'     },
  { id: 'chimp',     label: 'Chimp Test',      Component: ChimpTest,      discipline: 'Memory' },
  { id: 'dual-nback',label: 'Dual N-Back',     Component: DualNBack,      discipline: 'Memory' },
  { id: 'g24',       label: 'Game 24',         Component: Game24,         discipline: 'Math'   },
  { id: 'syllogisms',label: 'Syllogisms',      Component: Syllogisms,     discipline: 'Logic'  },
  { id: 'algo',      label: 'Algo Thinking',   Component: AlgoThinking,   discipline: 'Logic'  },
];

const DISCIPLINE_COLOR = {
  Math:   'var(--accent)',
  Logic:  '#22d3ee',
  Memory: 'var(--orange)',
  IQ:     '#a78bfa',
  Focus:  '#f472b6',
};

export default function MarathonMode({ onBack, difficulty = 'medium', timerMode = 'timed', timeLimit = 60, helpLevel = 'none', seriesType = 'mixed' }) {
  // phase: 'intro' | 'playing' | 'summary'
  const [phase, setPhase] = useState('intro');
  const [gameIndex, setGameIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [scores, setScores] = useState([]);

  const currentGame = MARATHON_GAMES[gameIndex];
  const totalGames = MARATHON_GAMES.length;

  /** Called when GameEnd "Next Game →" is clicked (via SessionContext.onNextSet) */
  const handleNextGame = useCallback(async () => {
    // Score is already saved to Supabase by GameEnd's useEffect — read it back
    const hist = await getHistory(currentGame.id, 1);
    const lastScore = hist.length ? hist[hist.length - 1].score : 0;
    const entry = { id: currentGame.id, label: currentGame.label, discipline: currentGame.discipline, score: lastScore };

    setScores(prev => {
      const newScores = [...prev, entry];
      if (gameIndex + 1 >= totalGames) {
        // Record marathon total
        const total = newScores.reduce((s, e) => s + e.score, 0);
        recordGame('marathon', { score: total, correct: 0, total: 0 });
      }
      return newScores;
    });

    if (gameIndex + 1 >= totalGames) {
      setPhase('summary');
    } else {
      setGameIndex(i => i + 1);
      setGameKey(k => k + 1);
    }
  }, [currentGame, gameIndex, totalGames]);

  const restart = () => {
    setPhase('intro');
    setGameIndex(0);
    setGameKey(k => k + 1);
    setScores([]);
  };

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="g-end" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h3 style={{ margin: '0 0 8px' }}>Marathon Mode</h3>
        <p style={{ color: 'var(--gray2)', margin: '0 0 24px', lineHeight: 1.6 }}>
          Six disciplines. One continuous circuit. Complete each game back-to-back
          and earn a combined score.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, width: '100%' }}>
          {MARATHON_GAMES.map((g, i) => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg3)', border: '1px solid var(--border)', padding: '10px 16px',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--gray2)', flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ flex: 1, color: 'var(--white)', fontWeight: 500, fontSize: 14 }}>{g.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: DISCIPLINE_COLOR[g.discipline] ?? 'var(--accent)',
                background: 'var(--bg2)', padding: '2px 8px', borderRadius: 999,
              }}>{g.discipline}</span>
            </div>
          ))}
        </div>

        <div className="g-end-btns">
          <button className="btn btn-primary" onClick={() => setPhase('playing')}>
            Start Marathon →
          </button>
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }

  // ── SUMMARY SCREEN ────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const total = scores.reduce((s, e) => s + e.score, 0);
    return (
      <div className="g-end" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h3 style={{ margin: '0 0 4px' }}>Marathon Complete!</h3>
        <div className="g-big">{total}</div>
        <div className="g-det">Total Score</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '24px 0', width: '100%' }}>
          {scores.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg3)', border: '1px solid var(--border)', padding: '10px 16px',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--gray2)', flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ flex: 1, color: 'var(--white)', fontSize: 14 }}>{entry.label}</span>
              <span style={{
                fontWeight: 700, fontSize: 15,
                color: DISCIPLINE_COLOR[entry.discipline] ?? 'var(--accent)',
              }}>{entry.score}</span>
            </div>
          ))}
        </div>

        <div className="g-end-btns">
          <button className="btn btn-primary" onClick={restart}>Run Again</button>
          <button className="btn btn-secondary" onClick={onBack}>Back to Training</button>
        </div>
      </div>
    );
  }

  // ── ACTIVE GAME ───────────────────────────────────────────────────────────
  const { Component } = currentGame;

  // Provide SessionContext so GameEnd shows "Next Game (2/6) →" instead of "Play Again / Back"
  const sessionCtx = {
    currentSet: gameIndex + 1,
    totalSets: totalGames,
    onNextSet: handleNextGame,
  };

  return (
    <div>
      {/* Progress bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, padding: '10px 16px',
        background: 'var(--bg3)', border: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--gray2)', whiteSpace: 'nowrap' }}>
          Game {gameIndex + 1} / {totalGames}
        </span>
        <div style={{ flex: 1, height: 3, background: 'var(--bg4)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--accent)',
            width: `${(gameIndex / totalGames) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: DISCIPLINE_COLOR[currentGame.discipline] ?? 'var(--accent)',
          background: 'var(--bg4)', padding: '2px 10px', borderRadius: 999,
        }}>{currentGame.label}</span>
      </div>

      <SessionContext.Provider value={sessionCtx}>
        <Component
          key={gameKey}
          onBack={onBack}
          difficulty={difficulty}
          timerMode={timerMode}
          timeLimit={timeLimit}
          helpLevel={helpLevel}
          seriesType={seriesType}
          reps={1}
        />
      </SessionContext.Provider>
    </div>
  );
}
