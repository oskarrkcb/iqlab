import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { getAllStats, getHighScore, getLeaderboard, getUserRank } from '../stats';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import './Dashboard.css';

// ── Rank system ──
const RANKS = [
  { name: 'Bronze',      min: 0,     color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' },
  { name: 'Silver',      min: 500,   color: '#a8a8a8', bg: 'rgba(168,168,168,0.12)' },
  { name: 'Gold',        min: 2000,  color: '#ffd700', bg: 'rgba(255,215,0,0.12)' },
  { name: 'Platinum',    min: 5000,  color: '#48d1cc', bg: 'rgba(72,209,204,0.12)' },
  { name: 'Diamond',     min: 15000, color: '#b9f2ff', bg: 'rgba(185,242,255,0.15)' },
  { name: 'Grandmaster', min: 50000, color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
];

function getRank(points) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].min) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function RankBadge({ points, size = 'normal' }) {
  const rank = getRank(points);
  const next = RANKS[rank.index + 1];
  const isSmall = size === 'small';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: isSmall ? 4 : 6,
      background: rank.bg, border: `1px solid ${rank.color}33`,
      borderRadius: 999, padding: isSmall ? '1px 8px' : '3px 12px',
      fontSize: isSmall ? 10 : 11, fontWeight: 700, color: rank.color,
      letterSpacing: 0.5, whiteSpace: 'nowrap',
    }}
      title={next ? `Next: ${next.name} (${next.min.toLocaleString()} pts)` : 'Max rank!'}
    >
      {rank.name}
    </span>
  );
}

const GAME_LABELS = {
  seq: 'Series',    ooo: 'Odd One',  mat: 'Matrix',   est: 'Estimate',
  op: 'Operator',   g24: 'Game 24',  sp: 'Speed',     mem: 'Memory',
  'dual-nback': 'N-Back', ravens: 'Ravens', schulte: 'Schulte',
  stroop: 'Stroop', rotation: 'Rotation', syllogisms: 'Logic',
  chimp: 'Chimp',   algo: 'Algo',    'vs-bot': 'vs Bot',
};

// ── Neuro Score Gauge SVG ──
const NEURO_GAUGE = ({ score }) => {
  const pct = Math.min(1, score / 100);
  const cx = 100, cy = 95, r = 72;
  const fillAngleDeg = 135 + 270 * pct;
  const fillAngle = fillAngleDeg * Math.PI / 180;
  const fx = cx + r * Math.cos(fillAngle);
  const fy = cy + r * Math.sin(fillAngle);
  const largeArc = 270 * pct > 180 ? 1 : 0;
  return (
    <svg viewBox="0 0 200 160" width="180" height="144">
      <path d="M 49.1,145.9 A 72,72 0 1 1 150.9,145.9"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" strokeLinecap="round"/>
      <path d={`M 49.1,145.9 A 72,72 0 ${largeArc} 1 ${fx.toFixed(1)},${fy.toFixed(1)}`}
        fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round"/>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--white)"
        fontSize="34" fontWeight="900" fontFamily="var(--mono)">{score}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--gray3)"
        fontSize="9" letterSpacing="2.5" fontFamily="var(--font)">NEURO SCORE</text>
    </svg>
  );
};

export default function Dashboard() {
  const { t } = useLang();
  const [sleep, setSleep]   = useState(7);
  const [stress, setStress] = useState(3);
  const { user } = useAuth();
  const [allStats, setAllStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stats, lb, rank] = await Promise.all([
          getAllStats(), getLeaderboard(20), getUserRank(),
        ]);
        setAllStats(stats);
        setLeaderboard(lb);
        setMyRank(rank);
      } catch (e) {
        console.error('Dashboard load error:', e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const globalStats = allStats?.global ?? { totalGames: 0, totalPoints: 0 };
  const realTotalEx  = globalStats.totalGames;
  const realTotalPts = globalStats.totalPoints;

  const exerciseIds = Object.keys(GAME_LABELS);
  const exerciseScores = useMemo(() => {
    return exerciseIds.map(id => ({
      id, label: GAME_LABELS[id],
      highScore: allStats?.games?.[id]?.highScore ?? 0,
      history:   allStats?.games?.[id]?.history ?? [],
    }));
  }, [allStats]);

  const maxExScore = Math.max(...exerciseScores.map(e => e.highScore), 1);

  const realAccuracy = useMemo(() => {
    if (!allStats?.games) return 0;
    let correct = 0, total = 0;
    Object.values(allStats.games).forEach(g =>
      g.history.forEach(h => { if (h.total > 0) { correct += h.correct; total += h.total; } })
    );
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [allStats]);

  const realStreak = useMemo(() => {
    if (!allStats?.games) return 0;
    const timestamps = [];
    Object.values(allStats.games).forEach(g => g.history.forEach(h => timestamps.push(h.ts)));
    if (timestamps.length === 0) return 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let streak = 0, checkDate = new Date(today.getTime());
    for (let d = 0; d < 365; d++) {
      const start = checkDate.getTime(), end = start + 86400000;
      if (timestamps.some(ts => ts >= start && ts < end)) { streak++; checkDate = new Date(start - 86400000); }
      else break;
    }
    return streak;
  }, [allStats]);

  const realPotential = useMemo(() => {
    if (!allStats?.games) return { logic: 0, math: 0, mem: 0 };
    const mathIds  = ['est', 'op', 'g24', 'sp'];
    const logicIds = ['seq', 'ooo', 'syllogisms', 'algo', 'mat'];
    const memIds   = ['mem', 'dual-nback', 'chimp'];
    const categoryScore = (ids) => {
      const played = ids.filter(id => (allStats.games[id]?.history?.length ?? 0) > 0);
      if (played.length === 0) return 0;
      const totalCorrect = ids.reduce((s, id) => {
        const hist = allStats.games[id]?.history ?? [];
        return s + hist.reduce((a, h) => a + (h.total > 0 ? h.correct / h.total : 0), 0);
      }, 0);
      const totalRounds = ids.reduce((s, id) => s + (allStats.games[id]?.history?.filter(h => h.total > 0).length ?? 0), 0);
      return totalRounds > 0 ? Math.min(100, Math.round((totalCorrect / totalRounds) * 100)) : 0;
    };
    return {
      math:  categoryScore(mathIds),
      logic: categoryScore(logicIds),
      mem:   categoryScore(memIds),
    };
  }, [allStats]);

  const realElo = useMemo(() => {
    if (realTotalPts <= 0) return 0;
    return Math.min(2200, Math.max(800, 1000 + Math.round(realTotalPts / 12)));
  }, [realTotalPts]);

  const realProgressData = useMemo(() => {
    const empty = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (!allStats?.games) return empty;
    const entries = [];
    Object.values(allStats.games).forEach(g => g.history.forEach(h => entries.push({ ts: h.ts, score: h.score })));
    if (entries.length < 3) return empty;
    const now = Date.now(), weekMs = 7 * 24 * 60 * 60 * 1000;
    let lastVal = empty[0];
    return Array.from({ length: 12 }, (_, i) => {
      const start = now - (11 - i) * weekMs, end = start + weekMs;
      const week  = entries.filter(e => e.ts >= start && e.ts < end);
      if (week.length === 0) return lastVal;
      const avg = week.reduce((s, e) => s + e.score, 0) / week.length;
      lastVal = Math.min(110, Math.round(avg / 5));
      return lastVal;
    });
  }, [allStats]);

  const realHeatmap = useMemo(() => {
    const empty = Array.from({ length: 24 }, (_, i) => ({ hour: i, performance: 0 }));
    if (!allStats?.games) return empty;
    const counts = new Array(24).fill(0), totals = new Array(24).fill(0);
    Object.values(allStats.games).forEach(g =>
      g.history.forEach(h => { const hr = new Date(h.ts).getHours(); counts[hr]++; totals[hr] += h.score; })
    );
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      performance: counts[i] > 0
        ? Math.min(100, Math.round((totals[i] / counts[i]) / 3))
        : 0,
    }));
  }, [allStats]);

  // Radar helpers
  const radarPoints = (values, max = 100, radius = 80) => {
    const cx = 100, cy = 100;
    const angles = values.map((_, i) => (Math.PI * 2 * i) / values.length - Math.PI / 2);
    return values.map((v, i) => {
      const r = (v / max) * radius;
      return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
    }).join(' ');
  };

  const categories = [
    { name: t.dashboard.logic,  value: realPotential.logic },
    { name: t.dashboard.math,   value: realPotential.math  },
    { name: t.dashboard.memory, value: realPotential.mem   },
  ];

  const avgPotential = Math.round((realPotential.logic + realPotential.math + realPotential.mem) / 3);

  // Today's date for the header subtitle
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Scores with data only
  const playedScores = exerciseScores.filter(e => e.highScore > 0);

  // Streak calendar: last 35 days activity dots
  const streakDays = useMemo(() => {
    const result = [];
    const now = Date.now();
    const dayMs = 86400000;
    const timestamps = [];
    if (allStats?.games) {
      Object.values(allStats.games).forEach(g => g.history.forEach(h => timestamps.push(h.ts)));
    }
    for (let i = 34; i >= 0; i--) {
      const dayStart = now - i * dayMs;
      const dayEnd = dayStart + dayMs;
      result.push(timestamps.some(ts => ts >= dayStart && ts < dayEnd));
    }
    return result;
  }, [allStats]);

  // Brain stamina (simple derived metric based on total exercises and streak)
  const brainStamina = Math.min(100, Math.round((realStreak * 6) + (realTotalEx * 0.8)));

  // Condition summary text
  const conditionText = useMemo(() => {
    const score = sleep - stress * 0.6;
    if (score >= 7) return 'Optimal — your brain is primed for deep work';
    if (score >= 5) return 'Good — moderate performance expected';
    if (score >= 3) return 'Fair — stick to shorter sessions today';
    return 'Low — rest may help more than training';
  }, [sleep, stress]);

  if (loading) {
    return (
      <div className="page-enter db-page">
        <div className="db-inner" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray3)' }}>
          Loading your data...
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter db-page">
      <div className="db-inner">

        {/* ══ HEADER ══ */}
        <header className="db-header">
          <div className="db-header-left">
            <h1>{t.nav.dashboard}</h1>
            <p className="db-header-sub">{todayLabel}</p>
          </div>
          <Link to="/training" className="db-header-cta">
            {t.dashboard.startTraining}
          </Link>
        </header>

        {/* ══ ROW 1 — KPI Strip ══ */}
        <div className="db-kpi-grid">
          <div className="db-kpi">
            <div className="db-kpi-label">{t.dashboard.eloRating}</div>
            <div className="db-kpi-value accent">{realElo.toLocaleString()}</div>
            <div className="db-kpi-sub"><RankBadge points={realTotalPts} size="small" /></div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">{t.dashboard.accuracy}</div>
            <div className="db-kpi-value accent">{realAccuracy}%</div>
            <div className="db-kpi-sub">{t.dashboard.exercises}: {realTotalEx}</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">{t.dashboard.activity}</div>
            <div className="db-kpi-value">{realStreak}</div>
            <div className="db-kpi-sub">{t.dashboard.currentStreak}</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">{t.dashboard.points}</div>
            <div className="db-kpi-value">{realTotalPts.toLocaleString()}</div>
            <div className="db-kpi-sub">{t.dashboard.total}</div>
          </div>
        </div>

        {/* ══ ROW 2 — IQ + Streak + Check-in (asymmetric 3-col) ══ */}
        <div className="db-row2">

          {/* Left (2fr): IQ Gauge + Potential Bars */}
          <div className="db-card db-row2-iq">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Neuro Score
            </div>
            <div className="db-iq-gauge-row">
              {realTotalEx > 0 ? (
                <>
                  <NEURO_GAUGE score={avgPotential} />
                  <div className="db-iq-label-block">
                    <div className="db-iq-label-text">Neuro Score</div>
                    <div className="db-iq-big">{avgPotential}</div>
                  </div>
                </>
              ) : (
                <div className="db-iq-label-block" style={{ textAlign: 'center', width: '100%', padding: '20px 0' }}>
                  <div className="db-iq-label-text" style={{ marginBottom: '12px' }}>Play some games to unlock your Neuro Score</div>
                  <Link to="/training" className="btn-fill" style={{ fontSize: '13px' }}>Start Training</Link>
                </div>
              )}
            </div>
            <div className="db-potential-bars">
              {[
                { key: 'logic', label: t.dashboard.logic,  val: realPotential.logic },
                { key: 'math',  label: t.dashboard.math,   val: realPotential.math  },
                { key: 'mem',   label: t.dashboard.memory, val: realPotential.mem   },
              ].map(({ key, label, val }) => (
                <div key={key} className="db-potential-row">
                  <span className="db-potential-label">{label}</span>
                  <div className="db-potential-track">
                    <div className="db-potential-fill" style={{ width: `${val}%` }} />
                  </div>
                  <span className="db-potential-pct">{val}%</span>
                </div>
              ))}
              <div className="db-potential-summary">
                {avgPotential}% of potential unlocked
              </div>
            </div>
          </div>

          {/* Middle (1.2fr): Streak Calendar */}
          <div className="db-card db-row2-streak">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>
              Activity Streak
            </div>
            <div className="db-streak-big-row">
              <span className="db-streak-big">{realStreak}</span>
              <span className="db-streak-label">day streak</span>
            </div>
            <div className="db-streak-cal">
              {streakDays.map((active, i) => (
                <div
                  key={i}
                  className={`db-streak-dot${active ? ' db-streak-dot--active' : ''}`}
                  title={`Day ${35 - i} ago`}
                />
              ))}
            </div>
            <div className="db-streak-total">
              {realTotalEx} total exercises completed
            </div>
          </div>

          {/* Right (1fr): Pre-Training Check-in */}
          <div className="db-card db-row2-checkin">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Today's Condition
            </div>
            <div className="db-checkin-group">
              <div className="db-checkin-row">
                <label className="db-checkin-lbl">Sleep quality</label>
                <span className="db-checkin-val">{sleep}</span>
              </div>
              <input
                type="range" min="1" max="10" value={sleep}
                className="db-slider"
                style={{ '--val': sleep }}
                onChange={e => setSleep(Number(e.target.value))}
              />
            </div>
            <div className="db-checkin-group">
              <div className="db-checkin-row">
                <label className="db-checkin-lbl">Stress level</label>
                <span className="db-checkin-val">{stress}</span>
              </div>
              <input
                type="range" min="1" max="10" value={stress}
                className="db-slider db-slider--stress"
                style={{ '--val': stress }}
                onChange={e => setStress(Number(e.target.value))}
              />
            </div>
            <div className="db-checkin-summary">
              {conditionText}
            </div>
          </div>
        </div>

        {/* ══ ROW 3 — Performance Chart (full width) ══ */}
        <div className="db-row3">
          <div className="db-card db-chart-card">
            <div className="db-chart-header">
              <div>
                <div className="db-card-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Performance Over Time
                </div>
                <div className="db-chart-sub">Last 12 weeks — avg score index</div>
              </div>
              <div className="db-stamina-block">
                <div className="db-stamina-label">Brain Stamina</div>
                <div className="db-stamina-bar-wrap">
                  <div className="db-stamina-bar-track">
                    <div className="db-stamina-bar-fill" style={{ width: `${Math.min(100, brainStamina)}%` }} />
                  </div>
                  <span className="db-stamina-pct">{Math.min(100, brainStamina)}%</span>
                </div>
                <div className="db-stamina-note">Focus drops after ~18 min</div>
              </div>
            </div>
            <div className="db-chart-wrap">
              <svg viewBox="0 0 300 120" width="100%" height="120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="db-lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"    />
                  </linearGradient>
                </defs>
                {[0, 30, 60, 90].map(y => (
                  <line key={y} x1="0" y1={110 - y} x2="300" y2={110 - y}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                ))}
                <path
                  d={`M0,${110 - realProgressData[0]} ${realProgressData.map((v, i) =>
                    `L${(i / (realProgressData.length - 1)) * 300},${110 - v}`
                  ).join(' ')} L300,110 L0,110 Z`}
                  fill="url(#db-lineGrad)"
                />
                <polyline
                  points={realProgressData.map((v, i) =>
                    `${(i / (realProgressData.length - 1)) * 300},${110 - v}`
                  ).join(' ')}
                  fill="none" stroke="var(--accent)" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                {realProgressData.map((v, i) => (
                  <circle key={i}
                    cx={(i / (realProgressData.length - 1)) * 300}
                    cy={110 - v}
                    r={i === realProgressData.length - 1 ? 3.5 : 2}
                    fill={i === realProgressData.length - 1 ? 'var(--accent)' : 'var(--bg)'}
                    stroke="var(--accent)" strokeWidth="1.5"
                  />
                ))}
              </svg>
              <div className="db-chart-labels">
                <span>Wk1</span><span>Wk2</span><span>Wk3</span><span>Wk4</span>
                <span>Wk5</span><span>Wk6</span><span>Wk7</span><span>Wk8</span>
                <span>Wk9</span><span>Wk10</span><span>Wk11</span><span>Wk12</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ ROW 4 — Score Histogram + Heatmap + Radar ══ */}
        <div className="db-row4">

          {/* Left: Score Distribution Histogram */}
          <div className="db-card">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Game High Scores
            </div>
            {playedScores.length === 0 ? (
              <p className="db-scores-empty">Play some games to see your high scores here.</p>
            ) : (
              <div className="db-scores-list">
                {playedScores.map(e => (
                  <div key={e.id} className="db-score-row">
                    <span className="db-score-name">{e.label}</span>
                    <div className="db-score-track">
                      <div className="db-score-fill" style={{ width: `${(e.highScore / maxExScore) * 100}%` }} />
                    </div>
                    <span className="db-score-val">{e.highScore}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Peak Hours Heatmap */}
          <div className="db-card">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              Peak Hours
            </div>
            <div className="db-heatmap-grid">
              {realHeatmap.map((h) => {
                const perf      = Math.round(h.performance);
                const intensity = perf / 100;
                return (
                  <div
                    key={h.hour}
                    className="db-heatmap-cell"
                    title={`${h.hour}:00 — ${perf}%`}
                    style={{
                      background: perf > 85 ? `rgba(34,197,94,${intensity * 0.6})`    :
                                  perf > 70 ? `rgba(37,99,235,${intensity * 0.45})`   :
                                  perf > 55 ? `rgba(245,158,11,${intensity * 0.35})`  :
                                              `rgba(239,68,68,${intensity * 0.22})`,
                    }}
                  >
                    {h.hour % 6 === 0 && <span className="db-heatmap-hour">{h.hour}</span>}
                    <span className="db-heatmap-val">{perf}%</span>
                  </div>
                );
              })}
            </div>
            <div className="db-heatmap-legend">
              <span><span className="db-legend-dot" style={{ background: 'rgba(239,68,68,0.45)' }} />Low</span>
              <span><span className="db-legend-dot" style={{ background: 'rgba(245,158,11,0.45)' }} />Moderate</span>
              <span><span className="db-legend-dot" style={{ background: 'rgba(37,99,235,0.55)' }}  />Good</span>
              <span><span className="db-legend-dot" style={{ background: 'rgba(34,197,94,0.6)' }}   />Peak</span>
            </div>
          </div>

          {/* Right: Cognitive Radar */}
          <div className="db-card">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {t.dashboard.cognitiveProfile}
            </div>
            <div className="db-radar-wrap">
              <svg viewBox="0 0 200 200" width="180" height="180">
                {[20, 40, 60, 80].map((r) => (
                  <polygon key={r} points={radarPoints([r, r, r])}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                ))}
                {categories.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
                  return (
                    <line key={i} x1="100" y1="100"
                      x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)}
                      stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  );
                })}
                <polygon
                  points={radarPoints(categories.map((c) => c.value))}
                  fill="rgba(37,99,235,0.18)" stroke="var(--accent)" strokeWidth="2"
                />
                {categories.map((c, i) => {
                  const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
                  const r     = (c.value / 100) * 80;
                  return (
                    <circle key={i}
                      cx={100 + r * Math.cos(angle)} cy={100 + r * Math.sin(angle)}
                      r="4" fill="var(--accent)" />
                  );
                })}
                {categories.map((c, i) => {
                  const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
                  return (
                    <text key={i}
                      x={100 + 95 * Math.cos(angle)} y={100 + 95 * Math.sin(angle)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="var(--gray2)" fontSize="11" fontWeight="600"
                    >{c.name}</text>
                  );
                })}
              </svg>
            </div>
            <div className="db-radar-stats">
              {categories.map((c) => (
                <div key={c.name} className="db-radar-stat">
                  <div className="db-radar-stat-val">{c.value}%</div>
                  <div className="db-radar-stat-lbl">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ROW 5 — Leaderboard ══ */}
        <div className="db-row5">
          <div className="db-card">
            <div className="db-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              World Rankings
            </div>

            {leaderboard.length === 0 ? (
              <p style={{ color: 'var(--gray3)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>
                No rankings yet — play some games to appear here.
              </p>
            ) : (
              <>
                <div className="db-lb-header">
                  <span>#</span><span>Player</span><span>Points</span>
                </div>
                {leaderboard.map((entry, i) => {
                  const isMe = user?.id === entry.user_id;
                  return (
                    <div key={entry.user_id} className={`db-lb-row ${isMe ? 'db-lb-you' : ''}`}>
                      <span className="db-lb-rank">{i + 1}</span>
                      <span className="db-lb-name">
                        {entry.display_name || 'Anonymous'}
                        {isMe && <span className="db-lb-you-tag">You</span>}
                        <RankBadge points={entry.total_points} size="small" />
                      </span>
                      <span className="db-lb-elo">{entry.total_points.toLocaleString()}</span>
                    </div>
                  );
                })}
                {myRank && myRank.rank > 20 && (
                  <div className="db-lb-row db-lb-you" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="db-lb-rank">{myRank.rank}</span>
                    <span className="db-lb-name">
                      {myRank.display_name || 'Anonymous'}
                      <span className="db-lb-you-tag">You</span>
                      <RankBadge points={myRank.total_points} size="small" />
                    </span>
                    <span className="db-lb-elo">{myRank.total_points.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
