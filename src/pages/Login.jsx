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

  const { signIn, signUp } = useAuth();
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
