import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, bio')
        .eq('id', user.id)
        .single();
      if (!alive) return;
      if (!error && data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
        setBio(data.bio || '');
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    const trimmed = displayName.trim();
    if (trimmed.length < 3) { setErr('Username muss mindestens 3 Zeichen haben.'); return; }
    if (trimmed.length > 24) { setErr('Username darf maximal 24 Zeichen haben.'); return; }
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) { setErr('Nur Buchstaben, Zahlen, _ und - erlaubt.'); return; }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: trimmed, avatar_url: avatarUrl || null, bio: bio || null });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setMsg('Profil gespeichert.');
    setTimeout(() => setMsg(null), 2200);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErr('Bild max. 2 MB.'); return; }
    setUploading(true); setErr(null);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { setErr(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl + `?t=${Date.now()}`;
    setAvatarUrl(url);
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setUploading(false);
    setMsg('Avatar gespeichert.');
    setTimeout(() => setMsg(null), 2200);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) setErr(error.message);
    else setMsg('Passwort-Reset-Mail gesendet.');
  };

  const handleDelete = async () => {
    setSaving(true);
    // Delete profile row (RLS allows owner). Game data cascades via FK if set up.
    await supabase.from('profiles').delete().eq('id', user.id);
    // Note: full auth user deletion requires service role on the server.
    // We sign out and let user contact support for full erasure (Privacy §9).
    await signOut();
    setSaving(false);
    nav('/');
  };

  if (!user) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--gray2)' }}>
        Bitte zuerst <Link to="/login" style={{ color: 'var(--accent)' }}>einloggen</Link>.
      </div>
    );
  }

  const initials = (displayName || user.email || '?').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="page-enter" style={{ maxWidth: 640, margin: '0 auto', padding: '120px 24px 80px' }}>
        <Link to="/dashboard" style={backLink}>← Dashboard</Link>

        <h1 style={titleStyle}>Profil</h1>
        <p style={subtitleStyle}>Verwalte deinen Benutzernamen, Avatar und Account-Einstellungen.</p>

        {loading ? (
          <p style={{ color: 'var(--gray3)', marginTop: 40 }}>Lade Profil …</p>
        ) : (
          <>
            <div style={avatarWrap}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={avatarImg} />
              ) : (
                <div style={avatarFallback}>{initials}</div>
              )}
              <div>
                <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 18 }}>{displayName || 'Unbenannt'}</div>
                <div style={{ color: 'var(--gray3)', fontSize: 12, marginTop: 2 }}>{user.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} style={formStyle}>
              <label style={labelStyle}>
                <span>Benutzername</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Anzeigename"
                  maxLength={24}
                  style={inputStyle}
                  autoComplete="off"
                />
                <small style={hintStyle}>3–24 Zeichen, sichtbar im Leaderboard.</small>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Avatar</span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <span style={{ ...secondaryBtn, padding: '8px 14px', fontSize: 12 }}>
                    {uploading ? 'Lädt hoch …' : 'Bild auswählen'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <small style={hintStyle}>Max. 2 MB. JPG, PNG oder WebP.</small>
              </div>

              <label style={labelStyle}>
                <span>Bio (optional)</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kurz über dich …"
                  maxLength={160}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </label>

              {err && <div style={errStyle}>{err}</div>}
              {msg && <div style={okStyle}>{msg}</div>}

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 8 }}>
                {saving ? 'Speichere …' : 'Speichern'}
              </button>
            </form>

            <hr style={hrStyle} />

            <h2 style={h2Style}>Account</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={handlePasswordReset} style={secondaryBtn}>
                Passwort-Reset-Mail anfordern
              </button>
              <button type="button" onClick={signOut} style={secondaryBtn}>
                Abmelden
              </button>
            </div>

            <hr style={hrStyle} />

            <h2 style={{ ...h2Style, color: 'var(--red, #ef4444)' }}>Gefahrenzone</h2>
            <p style={{ color: 'var(--gray3)', fontSize: 13, marginBottom: 12 }}>
              Beim Löschen wird dein Profil entfernt. Für vollständige Account-Löschung
              (inkl. Auth-Datensatz) kontaktiere uns unter{' '}
              <a href="mailto:iqlab.app@gmail.com" style={{ color: 'var(--accent)' }}>iqlab.app@gmail.com</a>.
            </p>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} style={dangerBtn}>
                Profil löschen
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleDelete} disabled={saving} style={dangerBtn}>
                  Wirklich löschen
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} style={secondaryBtn}>
                  Abbrechen
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

const backLink = { fontSize: 12, color: 'var(--gray3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 };
const titleStyle = { fontSize: 32, fontWeight: 800, color: 'var(--white)', margin: '24px 0 8px', letterSpacing: '-0.02em' };
const subtitleStyle = { fontSize: 14, color: 'var(--gray3)', marginBottom: 36 };
const h2Style = { fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: '0 0 16px', letterSpacing: '-0.01em' };
const avatarWrap = { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 };
const avatarImg = { width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', border: '2px solid var(--border)', flexShrink: 0 };
const avatarFallback = { width: 96, height: 96, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 800, fontSize: 28, fontFamily: 'var(--mono)', flexShrink: 0 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: 22 };
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--gray2)', letterSpacing: '0.05em', textTransform: 'uppercase' };
const inputStyle = { padding: '12px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white)', fontSize: 14, outline: 'none' };
const hintStyle = { color: 'var(--gray4)', fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };
const hrStyle = { border: 0, borderTop: '1px solid var(--border)', margin: '40px 0 28px' };
const errStyle = { color: '#ef4444', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 6 };
const okStyle = { color: '#10b981', fontSize: 13, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 6 };
const secondaryBtn = { padding: '10px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' };
const dangerBtn = { padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
