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

  const { signIn, signUp } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      navigate(isSignUp ? '/onboarding' : '/dashboard');
    }
  };

  return (
    <div className="page-enter auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          IQLab
        </Link>

        <div className="auth-card glass">
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
        </div>
      </div>
    </div>
  );
}
