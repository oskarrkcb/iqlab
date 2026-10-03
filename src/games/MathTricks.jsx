import { useState, useRef } from 'react';
import { GameStats, Feedback, GameEnd, HighScoreBanner, NumPad, applyNumKey } from './GameShell';
import { R, pick } from './utils';
import { useLang } from '../i18n/LanguageContext';
const GAME_ID = 'tricks';

// Mental math tricks: learn a shortcut, then practise it.
// Each trick: text in German and English, and gen(difficulty) → { q, ans, steps }.
// Steps show the shortcut applied to that exact problem.

const big = (d) => d === 'hard' || d === 'really-hard';

export const TRICKS = [
  {
    id: 'x11',
    name: { de: '× 11', en: '× 11' },
    rule: {
      de: 'Zweistellige Zahl mal 11: Schreib die beiden Ziffern auseinander und setz ihre Summe in die Mitte. Ist die Summe 10 oder mehr, wandert die 1 zur vorderen Ziffer.',
      en: 'Two-digit number times 11: split the two digits and put their sum in the middle. If the sum is 10 or more, carry the 1 to the first digit.',
    },
    example: '43 × 11 → 4 | 4+3 | 3 = 473   ·   68 × 11 → 6 | 14 | 8 → 748',
    gen: (d) => {
      const a = d === 'easy' ? R(1, 4) : R(1, 9);
      const b = d === 'easy' ? R(0, 9 - a) : R(0, 9);
      const n = a * 10 + b, s = a + b;
      return {
        q: `${n} × 11`, ans: n * 11,
        steps: s < 10
          ? [`${a} | ${a}+${b} | ${b}`, `${a} | ${s} | ${b} = ${n * 11}`]
          : [`${a} | ${a}+${b} | ${b} = ${a} | ${s} | ${b}`, `${a}+1 | ${s - 10} | ${b} = ${n * 11}`],
      };
    },
  },
  {
    id: 'sq5',
    name: { de: 'Quadrat mit 5 am Ende', en: 'Squares ending in 5' },
    rule: {
      de: 'Endet eine Zahl auf 5: Nimm die vorderen Ziffern, multipliziere sie mit der nächsthöheren Zahl und häng 25 an.',
      en: 'For a number ending in 5: multiply the leading part by the next number up, then append 25.',
    },
    example: '65² → 6 × 7 = 42 → 4225',
    gen: (d) => {
      const a = big(d) ? R(10, 19) : R(1, 9);
      const n = a * 10 + 5;
      return { q: `${n}²`, ans: n * n, steps: [`${a} × ${a + 1} = ${a * (a + 1)}`, `${a * (a + 1)} | 25 → ${n * n}`] };
    },
  },
  {
    id: 'x5',
    name: { de: '× 5', en: '× 5' },
    rule: {
      de: 'Mal 5 ist dasselbe wie mal 10 und dann halbieren.',
      en: 'Times 5 is the same as times 10, then halve it.',
    },
    example: '86 × 5 → 860 ÷ 2 = 430',
    gen: (d) => {
      const n = big(d) ? R(101, 999) : R(12, 99);
      return { q: `${n} × 5`, ans: n * 5, steps: [`${n} × 10 = ${n * 10}`, `${n * 10} ÷ 2 = ${n * 5}`] };
    },
  },
  {
    id: 'x9',
    name: { de: '× 9', en: '× 9' },
    rule: {
      de: 'Mal 9 ist mal 10 minus die Zahl selbst.',
      en: 'Times 9 is times 10 minus the number itself.',
    },
    example: '47 × 9 → 470 − 47 = 423',
    gen: (d) => {
      const n = big(d) ? R(101, 999) : R(12, 99);
      return { q: `${n} × 9`, ans: n * 9, steps: [`${n} × 10 = ${n * 10}`, `${n * 10} − ${n} = ${n * 9}`] };
    },
  },
  {
    id: 'x25',
    name: { de: '× 25', en: '× 25' },
    rule: {
      de: 'Mal 25 ist mal 100 und dann durch 4 (zweimal halbieren).',
      en: 'Times 25 is times 100, then divide by 4 (halve twice).',
    },
    example: '36 × 25 → 3600 ÷ 4 = 900',
    gen: (d) => {
      const n = big(d) ? R(13, 99) * 4 + pick([0, 0, 2]) : R(3, 30) * 4;
      return { q: `${n} × 25`, ans: n * 25, steps: [`${n} × 100 = ${n * 100}`, `÷ 2 = ${n * 50}`, `÷ 2 = ${n * 25}`] };
    },
  },
  {
    id: 'near100',
    name: { de: 'Zahlen knapp unter 100', en: 'Numbers just below 100' },
    rule: {
      de: 'Beide Zahlen knapp unter 100: Bestimme die Abstände zu 100. Vorne steht 100 minus beide Abstände, hinten das Produkt der Abstände (zweistellig).',
      en: 'Both numbers just below 100: find their distances to 100. The front is 100 minus both distances, the back is the product of the distances (two digits).',
    },
    example: '97 × 94 → 100−3−6 = 91 | 3×6 = 18 → 9118',
    gen: (d) => {
      const max = big(d) ? 9 : 6; // product of the distances must stay two-digit
      const a = R(1, max), b = R(1, max);
      const front = 100 - a - b, back = a * b;
      return {
        q: `${100 - a} × ${100 - b}`, ans: (100 - a) * (100 - b),
        steps: [`100 − ${100 - a} = ${a},  100 − ${100 - b} = ${b}`, `100 − ${a} − ${b} = ${front}`, `${a} × ${b} = ${String(back).padStart(2, '0')}`, `${front} | ${String(back).padStart(2, '0')} → ${(100 - a) * (100 - b)}`],
      };
    },
  },
  {
    id: 'sq50',
    name: { de: 'Quadrate um 50', en: 'Squares around 50' },
    rule: {
      de: '(50 + d)² = 2500 + 100·d + d². Für Zahlen knapp unter 50 ist d negativ.',
      en: '(50 + d)² = 2500 + 100·d + d². For numbers below 50, d is negative.',
    },
    example: '53² → 2500 + 300 + 9 = 2809   ·   48² → 2500 − 200 + 4 = 2304',
    gen: (d) => {
      const k = big(d) ? R(1, 9) : R(1, 5);
      const dd = pick([k, -k]), n = 50 + dd;
      return {
        q: `${n}²`, ans: n * n,
        steps: [`d = ${dd}`, `2500 ${dd > 0 ? '+' : '−'} ${Math.abs(100 * dd)} + ${dd * dd} = ${n * n}`],
      };
    },
  },
  {
    id: 'diffsq',
    name: { de: 'Gleich weit von einer runden Zahl', en: 'Equally far from a round number' },
    rule: {
      de: 'Liegen beide Zahlen gleich weit über und unter einer runden Zahl m: (m + d)(m − d) = m² − d².',
      en: 'If both numbers are equally far above and below a round number m: (m + d)(m − d) = m² − d².',
    },
    example: '47 × 53 → 50² − 3² = 2500 − 9 = 2491',
    gen: (d) => {
      const m = big(d) ? pick([30, 40, 50, 60, 70, 80, 90]) : pick([20, 30, 40, 50]);
      const k = R(1, big(d) ? 9 : 5);
      return {
        q: `${m - k} × ${m + k}`, ans: m * m - k * k,
        steps: [`(${m} − ${k}) × (${m} + ${k})`, `${m}² − ${k}² = ${m * m} − ${k * k} = ${m * m - k * k}`],
      };
    },
  },
  {
    id: 'pct',
    name: { de: 'Prozent tauschen', en: 'Swap percentages' },
    rule: {
      de: 'x % von y ist dasselbe wie y % von x — nimm die Richtung, die leichter ist.',
      en: 'x % of y is the same as y % of x — use whichever is easier.',
    },
    example: { de: '8 % von 25 = 25 % von 8 = 2', en: '8 % of 25 = 25 % of 8 = 2' },
    gen: (d, lang) => {
      // `other` is a multiple that keeps the answer a whole number
      const STEP = { 10: 10, 20: 5, 25: 4, 50: 2, 75: 4 };
      const easyPct = pick(big(d) ? [10, 20, 25, 50, 75] : [10, 25, 50]);
      const other = STEP[easyPct] * R(1, 12);
      const ans = (easyPct * other) / 100;
      const of = lang === 'de' ? 'von' : 'of';
      return {
        q: `${other} % ${of} ${easyPct}`, ans,
        steps: [`${other} % ${of} ${easyPct} = ${easyPct} % ${of} ${other}`, `${easyPct} % ${of} ${other} = ${ans}`],
      };
    },
  },
];

const ROUNDS = 10;

export default function MathTricks({ onBack, difficulty = 'medium' }) {
  const { lang } = useLang();
  const L = (o) => (typeof o === 'string' ? o : o[lang] || o.en);
  const [trick, setTrick] = useState(null);   // null = choose, 'mixed', or a trick
  const [phase, setPhase] = useState('menu');  // menu, lesson, play
  const [problem, setProblem] = useState(null);
  const [input, setInput] = useState('');
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0, ok: 0 });
  const [fb, setFb] = useState(null);
  const [steps, setSteps] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const inputRef = useRef(null);

  const nextProblem = () => {
    const rn = state.rn + 1;
    if (rn > ROUNDS) { setEnded(true); return; }
    const tr = trick === 'mixed' ? pick(TRICKS) : trick;
    setProblem({ ...tr.gen(difficulty, lang), trick: tr });
    setState(s => ({ ...s, rn }));
    setInput(''); setFb(null); setSteps(null); setWaiting(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const begin = () => { setPhase('play'); setState({ sc: 0, rn: 0, sr: 0, ok: 0 }); nextProblemFresh(); };
  // nextProblem reads state.rn, so start from a clean round counter
  const nextProblemFresh = () => {
    const tr = trick === 'mixed' ? pick(TRICKS) : trick;
    setProblem({ ...tr.gen(difficulty, lang), trick: tr });
    setState({ sc: 0, rn: 1, sr: 0, ok: 0 });
    setInput(''); setFb(null); setSteps(null); setWaiting(false);
  };

  const submit = () => {
    if (waiting || !problem) return;
    const v = Number(input.trim().replace(',', '.'));
    if (input.trim() === '' || Number.isNaN(v)) return;
    setWaiting(true);
    if (v === problem.ans) {
      setState(s => ({ ...s, sc: s.sc + 10 + Math.min(s.sr, 5), sr: s.sr + 1, ok: s.ok + 1 }));
      setFb({ type: 'ok', msg: `Correct! ${problem.ans}` });
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Answer: <b>${problem.ans}</b>` });
    }
    setSteps(problem.steps);
  };

  const backToMenu = () => { setPhase('menu'); setTrick(null); setEnded(false); };

  if (ended) {
    return (
      <GameEnd
        gameId={GAME_ID}
        score={state.sc}
        correct={state.ok}
        total={ROUNDS}
        label={`${state.ok}/${ROUNDS} · ${trick === 'mixed' ? 'Mixed' : L(trick.name)}`}
        onReplay={() => { setEnded(false); begin(); }}
        onBack={onBack}
      />
    );
  }

  if (phase === 'menu') {
    return (
      <div className="game-frame">
        <HighScoreBanner gameId={GAME_ID} />
        <p style={{ textAlign: 'center', color: 'var(--gray2)', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
          {lang === 'de' ? 'Wähle einen Trick: erst die Erklärung, dann 10 Übungsaufgaben.' : 'Pick a trick: first the explanation, then 10 practice problems.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {TRICKS.map(t => (
            <button key={t.id} type="button" className="g-numkey" style={{ height: 'auto', padding: '14px 10px', fontSize: 14, fontFamily: 'var(--font)' }}
              onClick={() => { setTrick(t); setPhase('lesson'); }}>
              {L(t.name)}
            </button>
          ))}
          <button type="button" className="g-numkey" style={{ height: 'auto', padding: '14px 10px', fontSize: 14, fontFamily: 'var(--font)', borderColor: 'var(--accent)' }}
            onClick={() => { setTrick('mixed'); setPhase('lesson'); }}>
            {lang === 'de' ? 'Gemischt' : 'Mixed'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'lesson') {
    const list = trick === 'mixed' ? TRICKS : [trick];
    return (
      <div className="game-frame">
        {list.map(t => (
          <div key={t.id} className="g-expl" style={{ marginBottom: 10 }}>
            <h4>{L(t.name)}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>{L(t.rule)}</p>
            <div className="g-expl-formula">{L(t.example)}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={begin}>{lang === 'de' ? 'Üben' : 'Practise'}</button>
          <button className="btn btn-ghost" onClick={backToMenu}>{lang === 'de' ? 'Zurück' : 'Back'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${ROUNDS}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      {problem && (
        <>
          <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, margin: '0 0 4px' }}>{L(problem.trick.name)}</p>
          <div className="g-spq">{problem.q} = ?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="g-input"
              placeholder="?"
              autoComplete="off"
              inputMode="none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { waiting ? nextProblem() : submit(); } }}
              disabled={waiting}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={submit} disabled={waiting}>OK</button>
          </div>
          <NumPad onKey={k => setInput(v => applyNumKey(v, k))} disabled={waiting} />
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {steps && (
        <div className="g-expl" style={{ marginTop: 12 }}>
          <h4>{lang === 'de' ? 'So geht der Trick' : 'With the trick'}</h4>
          <ul>{steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {waiting && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={() => nextProblem()}>
          {state.rn >= ROUNDS ? 'Finish' : 'Next →'}
        </button>
      )}
    </div>
  );
}
