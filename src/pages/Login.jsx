import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import './Login.css';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('reset') === '1';

  const [view, setView] = useState(isReset ? 'newPassword' : 'signIn');
  // views: signIn, signUp, forgot, resetSent, confirmEmail, newPassword, passwordDone

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, signIn, signUp, signInWithGoogle, resetPassword, updatePassword } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  // Auto-redirect to dashboard if already logged in (e.g. after Google OAuth)
  useEffect(() => {
    if (user && !isReset) navigate('/dashboard', { replace: true });
  }, [user, isReset, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (view === 'signUp') {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) { setError(error.message); }
      else { setView('confirmEmail'); }
    } else {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) { setError(error.message); }
      else { navigate('/dashboard'); }
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) { setError(error.message); }
    else { setView('resetSent'); }
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    const { error } = await updatePassword(newPw);
    setSubmitting(false);
    if (error) { setError(error.message); }
    else { setView('passwordDone'); }
  };

  return (
    <div className="page-enter auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          IQLab
        </Link>

        <div className="auth-card glass">

          {/* ── Email confirmation after sign up ── */}
          {view === 'confirmEmail' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <h2 style={{ marginBottom: 8 }}>Check your email</h2>
              <p style={{ color: 'var(--gray2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                We sent a confirmation link to<br/>
                <strong style={{ color: 'var(--white)' }}>{email}</strong><br/>
                Click the link to activate your account.
              </p>
              <button className="btn btn-primary btn-w" onClick={() => setView('signIn')}>
                {t.login.backToSignIn}
              </button>
            </div>
          )}

          {/* ── Reset link sent ── */}
          {view === 'resetSent' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <h2 style={{ marginBottom: 8 }}>{t.login.resetSent}</h2>
              <p style={{ color: 'var(--gray2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                {t.login.resetSentDesc}<br/>
                <strong style={{ color: 'var(--white)' }}>{email}</strong>
              </p>
              <button className="btn btn-primary btn-w" onClick={() => setView('signIn')}>
                {t.login.backToSignIn}
              </button>
            </div>
          )}

          {/* ── Set new password (after clicking reset link) ── */}
          {view === 'newPassword' && (
            <>
              <h2>{t.login.resetTitle}</h2>
              <p className="auth-subtitle">{t.login.newPassword}</p>
              <form onSubmit={handleNewPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="newPw">{t.login.newPassword}</label>
                  <input type="password" id="newPw" className="form-input" placeholder="••••••••"
                    value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPw">{t.login.confirmNewPassword}</label>
                  <input type="password" id="confirmPw" className="form-input" placeholder="••••••••"
                    value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-w btn-lg" disabled={submitting}>
                  {submitting ? '...' : t.login.updatePassword}
                </button>
                {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
              </form>
            </>
          )}

          {/* ── Password updated success ── */}
          {view === 'passwordDone' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green, #22c55e)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 style={{ marginBottom: 8 }}>{t.login.passwordUpdated}</h2>
              <button className="btn btn-primary btn-w" style={{ marginTop: 16 }} onClick={() => setView('signIn')}>
                {t.login.signIn}
              </button>
            </div>
          )}

          {/* ── Forgot password form ── */}
          {view === 'forgot' && (
            <>
              <h2>{t.login.resetTitle}</h2>
              <p className="auth-subtitle">{t.login.resetDesc}</p>
              <form onSubmit={handleForgot} className="auth-form">
                <div className="form-group">
                  <label htmlFor="resetEmail">{t.login.email}</label>
                  <input type="email" id="resetEmail" className="form-input" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-w btn-lg" disabled={submitting}>
                  {submitting ? '...' : t.login.sendReset}
                </button>
                {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
              </form>
              <p className="auth-toggle">
                <button onClick={() => setView('signIn')}>{t.login.backToSignIn}</button>
              </p>
            </>
          )}

          {/* ── Sign In / Sign Up form ── */}
          {(view === 'signIn' || view === 'signUp') && (
          <>
          <h2>{view === 'signUp' ? t.login.createAccount : t.login.welcomeBack}</h2>
          <p className="auth-subtitle">
            {view === 'signUp' ? t.login.signUpDesc : t.login.signInDesc}
          </p>

          <button
            type="button"
            className="btn btn-w auth-google"
            onClick={() => { setError(''); signInWithGoogle(); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t.login.google}
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{t.login.email}</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t.login.password}</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {view === 'signUp' && (
              <div className="form-group">
                <label htmlFor="confirm">{t.login.confirmPassword}</label>
                <input
                  type="password"
                  id="confirm"
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-w btn-lg"
              disabled={submitting}
            >
              {submitting
                ? view === 'signUp' ? 'Creating account...' : 'Signing in...'
                : view === 'signUp' ? t.login.signUp : t.login.signIn}
            </button>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
          </form>

          {view === 'signIn' && (
            <p className="auth-toggle" style={{ marginTop: 12 }}>
              <button onClick={() => { setError(''); setView('forgot'); }}>{t.login.forgotPassword}</button>
            </p>
          )}

          <p className="auth-toggle">
            {view === 'signUp' ? t.login.hasAccount : t.login.noAccount}{' '}
            <button onClick={() => { setError(''); setView(view === 'signUp' ? 'signIn' : 'signUp'); }}>
              {view === 'signUp' ? t.login.signIn : t.login.signUp}
            </button>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
