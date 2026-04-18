import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { getLeaderboard } from '../stats';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function shareLeaderboard() {
  const url = `${window.location.origin}/leaderboard`;
  if (navigator.share) {
    navigator.share({ title: 'IQLab World Rankings', url });
  } else {
    navigator.clipboard.writeText(url);
  }
}

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

function RankBadge({ points }) {
  const rank = getRank(points);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: rank.bg, border: `1px solid ${rank.color}33`,
      borderRadius: 999, padding: '1px 8px',
      fontSize: 10, fontWeight: 700, color: rank.color,
      letterSpacing: 0.5, whiteSpace: 'nowrap',
    }}>
      {rank.name}
    </span>
  );
}

const shareBtn = { padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white)', fontSize: 12, fontWeight: 600, cursor: 'pointer' };

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const lb = await getLeaderboard(100);
        if (alive) setRows(lb || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ paddingTop: 66, minHeight: 'calc(100vh - 73px)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px,2.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--white)', marginBottom: 4 }}>World Rankings</h1>
            <p style={{ fontSize: 12, color: 'var(--gray2)', fontWeight: 300 }}>Top Spieler auf IQLab — basierend auf Gesamtpunkten.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={shareLeaderboard} style={shareBtn} title="Rangliste teilen">
              ↗ Teilen
            </button>
            {!user && (
              <Link to="/login" className="btn btn-primary">Jetzt mitspielen</Link>
            )}
          </div>
        </div>

        <div className="db-card" style={{ marginTop: 24 }}>
          {loading ? (
            <p style={{ color: 'var(--gray3)', fontSize: 14, padding: '24px 0', textAlign: 'center' }}>
              Lade Rangliste …
            </p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--gray3)', fontSize: 14, padding: '24px 0', textAlign: 'center' }}>
              Noch keine Einträge — sei der Erste!
            </p>
          ) : (
            <>
              <div className="db-lb-header">
                <span>#</span><span>Player</span><span>Points</span>
              </div>
              {rows.map((entry, i) => {
                const isMe = user?.id === entry.user_id;
                return (
                  <Link
                    key={entry.user_id}
                    to={`/player/${entry.user_id}`}
                    className={`db-lb-row ${isMe ? 'db-lb-you' : ''}`}
                    style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '40px 1fr 80px', color: 'inherit' }}
                  >
                    <span className="db-lb-rank">{i + 1}</span>
                    <span className="db-lb-name">
                      {entry.display_name || 'Anonymous'}
                      {isMe && <span className="db-lb-you-tag">You</span>}
                      <RankBadge points={entry.total_points} />
                    </span>
                    <span className="db-lb-elo">{Number(entry.total_points).toLocaleString()}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
