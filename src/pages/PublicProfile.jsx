import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../stats';
import Footer from '../components/Footer';

const RANKS = [
  { name: 'Bronze',      min: 0,     color: '#cd7f32' },
  { name: 'Silver',      min: 500,   color: '#a8a8a8' },
  { name: 'Gold',        min: 2000,  color: '#ffd700' },
  { name: 'Platinum',    min: 5000,  color: '#48d1cc' },
  { name: 'Diamond',     min: 15000, color: '#b9f2ff' },
  { name: 'Grandmaster', min: 50000, color: '#ff6b6b' },
];
function getRank(points) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPublicProfile(userId);
        if (!alive) return;
        if (!data) { setNotFound(true); return; }
        setProfile(data);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--gray3)' }}>
        Lade Profil …
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--gray3)' }}>
        Profil nicht gefunden.{' '}
        <Link to="/leaderboard" style={{ color: 'var(--accent)' }}>← Rangliste</Link>
      </div>
    );
  }

  const rank = getRank(profile.totalPoints);
  const initials = profile.displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px 80px' }} className="page-enter">
        <Link to="/leaderboard" style={backLink}>← Rangliste</Link>

        <div style={cardStyle}>
          <div style={avatarWrap}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" style={avatarImg} />
            ) : (
              <div style={avatarFallback}>{initials}</div>
            )}
            <div>
              <h1 style={nameStyle}>{profile.displayName}</h1>
              <span style={{ ...badgeStyle, color: rank.color, borderColor: rank.color + '44', background: rank.color + '18' }}>
                {rank.name}
              </span>
            </div>
          </div>

          {profile.bio && (
            <p style={bioStyle}>{profile.bio}</p>
          )}

          <div style={statsRow}>
            <div style={statBox}>
              <span style={statLabel}>Punkte</span>
              <span style={statValue}>{Number(profile.totalPoints).toLocaleString()}</span>
            </div>
            {profile.rank && (
              <div style={statBox}>
                <span style={statLabel}>Rang</span>
                <span style={statValue}>#{profile.rank}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const backLink = { fontSize: 12, color: 'var(--gray3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 };
const cardStyle = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', marginTop: 28 };
const avatarWrap = { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 };
const avatarImg = { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' };
const avatarFallback = { width: 72, height: 72, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 800, fontSize: 22, fontFamily: 'var(--mono)' };
const nameStyle = { fontSize: 22, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', margin: '0 0 6px' };
const badgeStyle = { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 10px', borderRadius: 999, border: '1px solid' };
const bioStyle = { fontSize: 14, color: 'var(--gray3)', lineHeight: 1.6, marginBottom: 20, padding: '12px 0', borderTop: '1px solid var(--border)' };
const statsRow = { display: 'flex', gap: 12, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 };
const statBox = { flex: 1, background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 };
const statLabel = { fontSize: 11, color: 'var(--gray3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' };
const statValue = { fontSize: 22, fontWeight: 800, color: 'var(--white)', fontFamily: 'var(--mono)' };
