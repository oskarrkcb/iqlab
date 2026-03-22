import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { iqQuestions } from '../games/iqQuestions';
import { shuf, R } from '../games/utils';
import Footer from '../components/Footer';
import { useLang } from '../i18n/LanguageContext';
import './IQTest.css';

// ── SVG Matrix Cell renderer ──────────────────────────────────────────────

function cellShape(shape, cx, cy, r) {
  switch (shape) {
    case 'circle':   return <circle cx={cx} cy={cy} r={r} />;
    case 'square':   return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} />;
    case 'triangle': return <polygon points={`${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`} />;
    case 'diamond':  return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} />;
    default:         return <circle cx={cx} cy={cy} r={r} />;
  }
}

const CELL_CFG = {
  1: { positions: [{ x: 22, y: 22 }], r: 10 },
  2: { positions: [{ x: 14, y: 22 }, { x: 30, y: 22 }], r: 7 },
  3: { positions: [{ x: 10, y: 22 }, { x: 22, y: 22 }, { x: 34, y: 22 }], r: 6 },
};

function MatrixCell({ cell, uid, px = 52 }) {
  if (!cell) {
    return (
      <svg width={px} height={px} viewBox="0 0 44 44">
        <text x="22" y="29" textAnchor="middle" fontSize="22"
          fill="rgba(255,255,255,0.18)" fontWeight="700">?</text>
      </svg>
    );
  }
  const { shape = 'circle', fill = 2, n = 1 } = cell;
  const cfg = CELL_CFG[n] || CELL_CFG[1];
  const white = 'rgba(255,255,255,0.88)';
  const sw = 1.8;
  const clipId = `mc-${uid}`;

  return (
    <svg width={px} height={px} viewBox="0 0 44 44">
      {fill === 1 && (
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="22" height="44" />
          </clipPath>
        </defs>
      )}
      {cfg.positions.map((pos, i) => (
        <g key={i}>
          {fill === 2 && <g fill={white}>{cellShape(shape, pos.x, pos.y, cfg.r)}</g>}
          {fill === 0 && <g fill="none" stroke={white} strokeWidth={sw}>{cellShape(shape, pos.x, pos.y, cfg.r)}</g>}
          {fill === 1 && <>
            <g fill={white} clipPath={`url(#${clipId})`}>{cellShape(shape, pos.x, pos.y, cfg.r)}</g>
            <g fill="none" stroke={white} strokeWidth={sw}>{cellShape(shape, pos.x, pos.y, cfg.r)}</g>
          </>}
        </g>
      ))}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function IQTest() {
  const { t } = useLang();
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [cats, setCats] = useState({ logic: 0, math: 0, pat: 0, logicT: 0, mathT: 0, patT: 0 });
  const [selected, setSelected] = useState(-1);
  const [locked, setLocked] = useState(false);
  const [showExpl, setShowExpl] = useState(false);
  const [result, setResult] = useState(null);

  const startTimeRef = useRef(null);
  const iqNumRef = useRef(null);
  const [barWidths, setBarWidths] = useState([0, 0, 0]);

  useEffect(() => {
    if (phase !== 'result' || !result) return;
    const tid = setTimeout(() => {
      setBarWidths([result.logicPct, result.mathPct, result.patPct]);
    }, 200);
    return () => clearTimeout(tid);
  }, [phase, result]);

  useEffect(() => {
    if (phase !== 'result' || !result) return;
    const el = iqNumRef.current;
    if (!el) return;
    const target = result.iq;
    const duration = 1600;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [phase, result]);

  const startTest = useCallback(() => {
    startTimeRef.current = Date.now();
    setBarWidths([0, 0, 0]);
    setQuestions(shuf([...iqQuestions]).slice(0, 15));
    setQi(0); setCorrect(0); setSelected(-1); setLocked(false); setShowExpl(false);
    setCats({ logic: 0, math: 0, pat: 0, logicT: 0, mathT: 0, patT: 0 });
    setPhase('test');
  }, []);

  const answer = (idx) => {
    if (locked) return;
    setLocked(true); setSelected(idx);
    const q = questions[qi];
    const ok = idx === q.correct;

    setCats(prev => ({
      ...prev,
      [q.cat]: prev[q.cat] + (ok ? 1 : 0),
      [q.cat + 'T']: prev[q.cat + 'T'] + 1,
    }));

    if (ok) {
      setCorrect(c => c + 1);
      setTimeout(() => {
        if (qi + 1 >= questions.length) showResult(correct + 1);
        else { setQi(qi + 1); setSelected(-1); setLocked(false); setShowExpl(false); }
      }, 1200);
    } else {
      setShowExpl(true);
      setTimeout(() => {
        if (qi + 1 >= questions.length) showResult(correct);
        else { setQi(qi + 1); setSelected(-1); setLocked(false); setShowExpl(false); }
      }, 3000);
    }
  };

  const showResult = (finalCorrect) => {
    const pct = finalCorrect / questions.length;
    const iq = Math.round(70 + pct * 65 + R(-3, 3));
    const logicPct = cats.logicT ? Math.round(cats.logic / cats.logicT * 100) : 0;
    const mathPct  = cats.mathT  ? Math.round(cats.math  / cats.mathT  * 100) : 0;
    const patPct   = cats.patT   ? Math.round(cats.pat   / cats.patT   * 100) : 0;

    let desc = '';
    if (iq >= 130) desc = t.iqTest.exceptional;
    else if (iq >= 115) desc = t.iqTest.aboveAvg;
    else if (iq >= 100) desc = t.iqTest.goodAvg;
    else desc = t.iqTest.roomForImprovement;

    const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    const elapsedMin = Math.floor(elapsed / 60);
    const elapsedSec = elapsed % 60;
    const elapsedLabel = elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s` : `${elapsedSec}s`;

    setResult({ iq, desc, logicPct, mathPct, patPct, correct: finalCorrect, total: questions.length, elapsedLabel });
    setPhase('result');
  };

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="page-enter">
        <div className="iq-intro">
          <div className="iq-intro-glow" />
          <div className="iq-intro-inner">
            <div className="iq-intro-eye">IQ Assessment</div>
            <h2 className="iq-intro-title">{t.iqTest.title}<span className="dim">How sharp are you?</span></h2>
            <div className="iq-intro-meta">
              <div><div className="iq-intro-stat-v">15</div><div className="iq-intro-stat-l">Questions</div></div>
              <div><div className="iq-intro-stat-v">~6</div><div className="iq-intro-stat-l">Minutes</div></div>
              <div><div className="iq-intro-stat-v">3</div><div className="iq-intro-stat-l">Categories</div></div>
            </div>
            <div className="iq-intro-btns">
              <button className="btn-fill" onClick={startTest}>{t.iqTest.startTest}</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="page-enter">
        <div className="iq-result-wrap">
          <div className="iq-result-glow" />
          <div className="iq-result-inner">
            <div className="iq-result-header">
              <h2>{t.iqTest.yourResult}</h2>
              <div className="iq-result-num" ref={iqNumRef}>0</div>
              <div className="iq-result-num-lbl">{t.iqTest.estimatedIQ}</div>
              <div className="iq-result-desc">{result.desc}</div>
            </div>
            <div className="iq-result-bars">
              {[
                { lbl: t.iqTest.logic,   val: result.logicPct, cls: 'blue',   w: barWidths[0] },
                { lbl: t.iqTest.math,    val: result.mathPct,  cls: 'green',  w: barWidths[1] },
                { lbl: t.iqTest.pattern, val: result.patPct,   cls: 'purple', w: barWidths[2] },
              ].map(({ lbl, val, cls, w }) => (
                <div key={lbl} className="iq-result-bar-row">
                  <div className="iq-result-bar-lbl">{lbl}</div>
                  <div className="iq-result-bar-track">
                    <div className={`iq-result-bar-fill ${cls}`} style={{ width: `${w}%` }} />
                  </div>
                  <div className="iq-result-bar-val">{val}%</div>
                </div>
              ))}
            </div>
            <div className="iq-range-panel">
              <div className="iq-range-panel-lbl">IQ Reference Range</div>
              <div className="iq-range-rows">
                {[
                  { range: '130+',    label: 'Very Superior' },
                  { range: '120–129', label: 'Superior' },
                  { range: '110–119', label: 'High Average' },
                  { range: '90–109',  label: 'Average' },
                  { range: '80–89',   label: 'Low Average' },
                  { range: '<80',     label: 'Below Average' },
                ].map(tier => {
                  const n = result.iq;
                  const isCurrent =
                    (tier.range === '130+'    && n >= 130) ||
                    (tier.range === '120–129' && n >= 120 && n < 130) ||
                    (tier.range === '110–119' && n >= 110 && n < 120) ||
                    (tier.range === '90–109'  && n >= 90  && n < 110) ||
                    (tier.range === '80–89'   && n >= 80  && n < 90)  ||
                    (tier.range === '<80'     && n < 80);
                  return (
                    <div key={tier.range} className={`iq-range-row${isCurrent ? ' current' : ''}`}>
                      <span className="iq-range-score">{tier.range}</span>
                      <span className="iq-range-label">{tier.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p style={{ color: 'var(--gray3)', fontSize: 12, marginBottom: 8 }}>
              {result.correct} {t.iqTest.of} {result.total} {t.iqTest.questionsCorrect}
            </p>
            {result.elapsedLabel && (
              <p style={{ color: 'var(--gray4)', fontSize: 11, fontFamily: 'var(--mono)', marginBottom: 24 }}>
                {result.elapsedLabel}
              </p>
            )}
            <div className="iq-result-actions">
              <Link to="/dashboard" className="btn btn-primary btn-lg">{t.iqTest.dashboard}</Link>
              <button className="btn btn-secondary btn-lg" onClick={startTest}>{t.iqTest.testAgain}</button>
              <Link to="/training" className="btn btn-ghost btn-lg">{t.iqTest.startTraining}</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── QUESTION ───────────────────────────────────────────────────────────
  const q = questions[qi];
  const isMatrix = q?.type === 'matrix';

  return (
    <div className="page-enter">
      <div className="iq-test-wrap">
        <div className="iq-test-inner">

          <div className="iq-progress">
            <div className="iq-progress-top">
              <span className="iq-progress-label">{t.iqTest.question} {qi + 1}</span>
              <span className="iq-progress-num">{qi + 1} / {questions.length}</span>
            </div>
            <div className="iq-progress-track">
              <div className="iq-progress-fill" style={{ width: `${((qi + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="iq-q-card">
            <div className="iq-q-cat">{isMatrix ? 'pattern recognition' : q.cat}</div>
            <div className="iq-q-text">{q.q}</div>
            {isMatrix && (
              <div className="iq-matrix-grid">
                {q.grid.map((row, ri) =>
                  row.map((cell, ci) => (
                    <div
                      key={`${ri}-${ci}`}
                      className={`iq-matrix-cell${cell === null ? ' iq-matrix-cell--q' : ''}`}
                    >
                      <MatrixCell cell={cell} uid={`q${qi}-r${ri}c${ci}`} px={54} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {isMatrix ? (
            <div className="iq-matrix-opts">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  className={`iq-matrix-opt-btn${selected === i ? (i === q.correct ? ' correct' : ' wrong') : ''}${locked && i === q.correct && selected !== i ? ' correct' : ''}`}
                  onClick={() => answer(i)}
                  disabled={locked}
                >
                  <span className="iq-ans-letter">{String.fromCharCode(65 + i)}</span>
                  <MatrixCell cell={opt} uid={`opt${qi}-${i}`} px={54} />
                </button>
              ))}
            </div>
          ) : (
            <div className="iq-answers">
              {q.opts.map((o, i) => (
                <button
                  key={i}
                  className={`iq-ans-btn${selected === i ? (i === q.correct ? ' correct' : ' wrong') : ''}${locked && i === q.correct && selected !== i ? ' correct' : ''}`}
                  onClick={() => answer(i)}
                  disabled={locked}
                >
                  <span className="iq-ans-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="iq-ans-text">{o}</span>
                </button>
              ))}
            </div>
          )}

          {showExpl && (
            <div className="iq-explanation">
              <div className="iq-expl-label">Explanation</div>
              <div className="iq-expl-text">{q.ex}</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
