import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, t, toggleLang } = useLang();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-text">IQLab</span>
          <span className="logo-dot" />
        </Link>
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>{t.nav.home}</Link>
          {user && <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>{t.nav.dashboard}</Link>}
          <Link to="/training" className={isActive('/training') ? 'active' : ''}>{t.nav.training}</Link>
          {!user && <Link to="/login" className={isActive('/login') ? 'active' : ''}>{t.nav.login}</Link>}
        </div>
        <div className="nav-actions">
          <button onClick={toggleLang} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '4px 10px',
            color: 'var(--white)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
          }}>
            {lang.toUpperCase()}
          </button>
          {user && (
            <button onClick={signOut} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '4px 12px',
              color: 'var(--gray2)',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}>
              Sign Out
            </button>
          )}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
