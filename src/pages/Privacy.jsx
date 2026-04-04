import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <>
      <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 80px' }}>
        <Link to="/" style={{ fontSize: 12, color: 'var(--gray3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--white)', margin: '24px 0 12px', letterSpacing: '-0.02em' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 48 }}>
          Last updated: April 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, fontSize: 14, color: 'var(--gray2)', lineHeight: 1.8 }}>
          <section>
            <h2 style={h2Style}>1. Overview</h2>
            <p>
              IQLab is a free, non-commercial cognitive training web application. We take your privacy seriously and collect only the minimum data necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>2. What data we collect</h2>
            <ul style={ulStyle}>
              <li><strong style={strongStyle}>Account data:</strong> Email address and a hashed password when you create an account. We never store your password in plain text.</li>
              <li><strong style={strongStyle}>Game data:</strong> Your game scores, accuracy, difficulty level, and time spent per session — stored so you can track your progress on the Dashboard.</li>
              <li><strong style={strongStyle}>Neuro Score:</strong> Your cognitive performance score, calculated from your training results across all domains.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>3. How we store your data</h2>
            <p>
              All data is stored securely in a <strong style={strongStyle}>Supabase</strong> database (PostgreSQL) hosted in Frankfurt, Germany (EU). Row Level Security ensures that each user can only access their own data.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>4. What we do NOT do</h2>
            <ul style={ulStyle}>
              <li>We do not sell or share your data with third parties</li>
              <li>We do not use tracking cookies or analytics pixels</li>
              <li>We do not serve advertisements</li>
              <li>We do not use your data for profiling or marketing</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>5. Third-party services</h2>
            <ul style={ulStyle}>
              <li><strong style={strongStyle}>Supabase</strong> (supabase.com) — Authentication and database hosting. Their privacy policy applies to infrastructure-level processing.</li>
              <li><strong style={strongStyle}>Google Fonts</strong> — Fonts are loaded from Google servers. Google may collect your IP address as part of this process.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>6. Your rights</h2>
            <p>You can at any time:</p>
            <ul style={ulStyle}>
              <li>Request a copy of all data we store about you</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Contact us with any privacy-related questions</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>7. Contact</h2>
            <p>
              For any questions or requests regarding your data, reach out to us at:{' '}
              <a href="mailto:iqlab.app@gmail.com" style={{ color: 'var(--accent)' }}>iqlab.app@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

const h2Style = { fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 8, letterSpacing: '-0.01em' };
const ulStyle = { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 };
const strongStyle = { color: 'var(--white)', fontWeight: 600 };
