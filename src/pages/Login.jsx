import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import './Login.css';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        setError(error.message);
      } else {
        setConfirmEmail(true);
      }
    } else {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="page-enter auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          IQLab
        </Link>

        <div className="auth-card glass">
          {confirmEmail ? (
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
              <button
                className="btn btn-primary btn-w"
                onClick={() => { setConfirmEmail(false); setIsSignUp(false); }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
          <>
          <h2>{isSignUp ? t.login.createAccount : t.login.welcomeBack}</h2>
          <p className="auth-subtitle">
            {isSignUp ? t.login.signUpDesc : t.login.signInDesc}
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
            {isSignUp && (
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
                ? isSignUp ? 'Creating account...' : 'Signing in...'
                : isSignUp ? t.login.signUp : t.login.signIn}
            </button>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
          </form>

          <p className="auth-toggle">
            {isSignUp ? t.login.hasAccount : t.login.noAccount}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? t.login.signIn : t.login.signUp}
            </button>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
