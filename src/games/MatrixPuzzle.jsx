import { useState, useEffect, useCallback } from 'react';
import { GameStats, Feedback, Explanation, GameEnd, HighScoreBanner } from './GameShell';
import { R, pick, shuf, matGens } from './utils';
const GAME_ID = 'mat';

export default function MatrixPuzzle({ onBack, difficulty = 'medium' }) {
  const [state, setState] = useState({ sc: 0, rn: 0, sr: 0 });
  const [grid, setGrid] = useState(null);
  const [hidden, setHidden] = useState({ r: 0, c: 0 });
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [rule, setRule] = useState('');
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [fb, setFb] = useState(null);
  const [expl, setExpl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const MX = 10;

  const nextRound = useCallback(() => {
    const rn = state.rn + 1;
    if (rn > MX) { setEnded(true); return; }
    setState(s => ({ ...s, rn }));
    setAnswered(false); setSelected(-1); setFb(null); setExpl(null); setWaiting(false);
    const p = pick(matGens)();
    const hr = R(0, 2), hc = R(0, 2);
    const ans = p.g[hr][hc];
    const variance = difficulty === 'easy' ? 20 : difficulty === 'hard' ? 3 : difficulty === 'really-hard' ? 2 : 7;
    let opts = new Set([ans]);
    while (opts.size < 4) { const o = ans + (Math.random() > 0.5 ? 1 : -1) * R(1, variance); if (o > 0) opts.add(o); }
    const shuffled = shuf([...opts]);
    setGrid(p.g); setHidden({ r: hr, c: hc }); setAnswer(ans);
    setOptions(shuffled); setCorrectIdx(shuffled.indexOf(ans)); setRule(p.rule);
  }, [state.rn]);

  useEffect(() => { nextRound(); }, []); // eslint-disable-line

  const pickOpt = (i) => {
    if (answered) return;
    setAnswered(true); setSelected(i);
    const ok = i === correctIdx;
    if (ok) {
      setState(s => ({ ...s, sc: s.sc + 15, sr: s.sr + 1 }));
      setFb({ type: 'ok', msg: 'Correct! +15' });
      setTimeout(nextRound, 1500);
    } else {
      setState(s => ({ ...s, sr: 0 }));
      setFb({ type: 'err', msg: `Answer: <b>${answer}</b>` });
      setExpl({ steps: [rule, `Missing: <span class="hl">${answer}</span>`] });
      setWaiting(true);
    }
  };

  if (ended) {
    return <GameEnd gameId={GAME_ID} score={state.sc} label={`${state.sc} points`} onReplay={() => { setState({ sc: 0, rn: 0, sr: 0 }); setEnded(false); }} onBack={onBack} />;
  }

  return (
    <div className="game-frame">
      <HighScoreBanner gameId={GAME_ID} />
      <GameStats stats={[
        { label: 'Points', value: state.sc, color: 'var(--accent)' },
        { label: 'Round', value: `${state.rn}/${MX}`, color: 'var(--orange)' },
        { label: 'Streak', value: state.sr, color: 'var(--green)' },
      ]} />
      <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>Find the missing piece that completes the pattern matrix.</p>
      {grid && (
        <>
          <div className="g-matg">
            {grid.flatMap((row, r) => row.map((val, c) => (
              <div key={`${r}-${c}`} className={`g-matc${r === hidden.r && c === hidden.c ? ' mis' : ''}`}>
                {r === hidden.r && c === hidden.c ? (answered ? answer : '?') : val}
              </div>
            )))}
          </div>
          <div className="g-mato">
            {options.map((v, i) => (
              <div
                key={i}
                className={`g-matop${selected === i ? (i === correctIdx ? ' ok' : ' no') : ''}${answered && i === correctIdx && selected !== i ? ' ok' : ''}`}
                onClick={() => pickOpt(i)}
              >
                {v}
              </div>
            ))}
          </div>
        </>
      )}
      {fb && <Feedback type={fb.type} message={fb.msg} />}
      {expl && <Explanation steps={expl.steps} />}
      {waiting && (
        <button className="btn btn-green btn-w" style={{ marginTop: 12 }} onClick={nextRound}>Continue →</button>
      )}
    </div>
  );
}
