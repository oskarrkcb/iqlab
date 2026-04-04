import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">IQLab</span>
          <span className="footer-copy">© 2026</span>
        </div>
        <nav className="footer-nav">
          <Link to="/">{t.nav.home}</Link>
          <Link to="/training">{t.nav.training}</Link>
          <Link to="/dashboard">{t.nav.dashboard}</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
