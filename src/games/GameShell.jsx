import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { getHighScore, getHistory, recordGame } from '../stats';
import './GameShell.css';

// ── Session context: injected by Training.jsx when reps > 1 ──
export const SessionContext = createContext(null);
export const useSession = () => useContext(SessionContext);

export function HighScoreBanner({ gameId }) {
  const [hs, setHs] = useState(0);
  useEffect(() => {
    getHighScore(gameId).then(setHs);
  }, [gameId]);
  if (!hs) return null;
  return (
    <div className="g-highscore">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <span>Personal Best: <strong>{hs}</strong></span>
    </div>
  );
}

export function GameStats({ stats }) {
  return (
    <div className="game-stats">
      {stats.map((s, i) => (
        <div className="gs" key={i}>
          <div className="gs-l">{s.label}</div>
          <div className="gs-v" style={{ color: s.color || 'var(--white)' }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

export function GameTimer({ timeLeft, maxTime }) {
  const pct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 100;
  const cls = pct < 20 ? ' danger' : pct < 35 ? ' warn' : '';
  return (
    <div className="g-timer">
      <div className={`g-timer-bar${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function useGameTimer(maxTime, onTimeout) {
  const timeRef = useRef(maxTime);
  const intervalRef = useRef(null);
  const callbackRef = useRef(onTimeout);
  callbackRef.current = onTimeout;

  const start = useCallback((sec) => {
    clearInterval(intervalRef.current);
    timeRef.current = sec || maxTime;
    intervalRef.current = setInterval(() => {
      timeRef.current -= 0.1;
      if (timeRef.current <= 0) {
        timeRef.current = 0;
        clearInterval(intervalRef.current);
        callbackRef.current?.();
      }
    }, 100);
  }, [maxTime]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  const getTime = useCallback(() => timeRef.current, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { start, stop, getTime, timeRef };
}

export function Feedback({ type, message }) {
  if (!message) return null;
  const cls = type === 'ok' ? 'g-fb-ok' : type === 'warn' ? 'g-fb-warn' : 'g-fb-err';
  return (
    <div className={`g-fb ${cls}`} dangerouslySetInnerHTML={{ __html: message }} />
  );
}

export function Explanation({ steps, formula }) {
  if (!steps) return null;
  return (
    <div className="g-expl">
      <h4>Explanation</h4>
      <ul>
        {steps.map((s, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
        ))}
      </ul>
      {formula && (
        <div className="g-expl-formula">{formula}</div>
      )}
    </div>
  );
}

/**
 * Enhanced GameEnd — shows evaluation screen, last-attempt comparison, sparkline, and
 * optional set progression when rendered inside a SessionContext.Provider.
 * Props: gameId, score, correct, total, label, onReplay, onBack
 */
export function GameEnd({ gameId, score, correct, total, label, onReplay, onBack }) {
  const [highScore, setHighScore] = useState(0);
  const [history, setHistory] = useState([]);

  // Record this game and then load stats
  useEffect(() => {
    async function saveAndLoad() {
      if (gameId && score != null) {
        await recordGame(gameId, { score, correct: correct ?? 0, total: total ?? 0 });
      }
      if (gameId) {
        const [hs, hist] = await Promise.all([getHighScore(gameId), getHistory(gameId, 8)]);
        setHighScore(hs);
        setHistory(hist);
      }
    }
    saveAndLoad();
  }, [gameId, score, correct, total]);

  const session = useSession();
  const isInSession = session && session.totalSets > 1;
  const isLastSet = isInSession && session.currentSet >= session.totalSets;

  const isNewRecord = score >= highScore && score > 0 && highScore > 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

  const prevAttempts = history.slice(0, -1).slice(-5);
  const chartData = history.map(h => h.score);
  const chartMax = Math.max(...chartData, 1);

  return (
    <div className="g-end">
      {/* Set header when in a session */}
      {isInSession && (
        <div className="g-set-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          Set {session.currentSet} of {session.totalSets}
          {isLastSet && <span className="g-set-complete-tag">Final Set</span>}
        </div>
      )}

      {isNewRecord && (
        <div className="g-new-record">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          NEW PERSONAL RECORD!
        </div>
      )}
      <h3>{isInSession && isLastSet ? 'Session Complete!' : 'Round Over!'}</h3>
      <div className="g-big">{score}</div>
      <div className="g-det">{label}</div>

      {/* Evaluation stats row */}
      <div className="g-eval-row">
        {accuracy !== null && (
          <div className="g-eval-stat">
            <div className="g-eval-val" style={{ color: accuracy >= 80 ? 'var(--green)' : accuracy >= 50 ? 'var(--orange)' : 'var(--red)' }}>{accuracy}%</div>
            <div className="g-eval-lbl">Accuracy</div>
          </div>
        )}
        {correct != null && (
          <div className="g-eval-stat">
            <div className="g-eval-val" style={{ color: 'var(--accent)' }}>{correct}/{total}</div>
            <div className="g-eval-lbl">Correct</div>
          </div>
        )}
        <div className="g-eval-stat">
          <div className="g-eval-val" style={{ color: 'var(--orange)' }}>{highScore}</div>
          <div className="g-eval-lbl">Best</div>
        </div>
      </div>

      {/* Recent attempts comparison */}
      {prevAttempts.length > 0 && (
        <div className="g-prev-attempts">
          <div className="g-prev-title">Recent Attempts</div>
          <div className="g-prev-list">
            {prevAttempts.map((a, i) => (
              <div key={i} className="g-prev-item">
                <span className="g-prev-score">{a.score}</span>
                <div className="g-prev-bar-track">
                  <div className="g-prev-bar" style={{ width: `${(a.score / chartMax) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="g-prev-item current">
              <span className="g-prev-score">{score}</span>
              <div className="g-prev-bar-track">
                <div className="g-prev-bar current" style={{ width: `${(score / chartMax) * 100}%` }} />
              </div>
              <span className="g-prev-label">Now</span>
            </div>
          </div>
        </div>
      )}

      {/* Mini line chart */}
      {chartData.length >= 2 && (
        <div className="g-mini-chart">
          <div className="g-mini-title">Score Trend</div>
          <svg viewBox="0 0 200 60" width="200" height="60">
            <defs>
              <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,${55 - (chartData[0] / chartMax) * 50} ${chartData.map((v, i) => `L${(i / (chartData.length - 1)) * 200},${55 - (v / chartMax) * 50}`).join(' ')} L200,55 L0,55 Z`}
              fill="url(#miniGrad)"
            />
            <polyline
              points={chartData.map((v, i) => `${(i / (chartData.length - 1)) * 200},${55 - (v / chartMax) * 50}`).join(' ')}
              fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((v, i) => (
              <circle key={i} cx={(i / (chartData.length - 1)) * 200} cy={55 - (v / chartMax) * 50} r={i === chartData.length - 1 ? 4 : 2.5}
                fill={i === chartData.length - 1 ? 'var(--accent)' : 'var(--bg3)'} stroke="var(--accent)" strokeWidth="1.5" />
            ))}
          </svg>
        </div>
      )}

      <div className="g-end-btns">
        {isInSession && !isLastSet ? (
          <>
            <button className="btn btn-primary" onClick={session.onNextSet}>
              Next Set ({session.currentSet + 1}/{session.totalSets}) →
            </button>
            <button className="btn btn-secondary" onClick={onBack}>End Session</button>
          </>
        ) : isInSession && isLastSet ? (
          <>
            <button className="btn btn-primary" onClick={onBack}>Session Summary</button>
            <button className="btn btn-secondary" onClick={onReplay}>Play Again</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onReplay}>Play Again</button>
            <button className="btn btn-secondary" onClick={onBack}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}
