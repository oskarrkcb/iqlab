import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-enter" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '16px',
      textAlign: 'center', padding: '40px 20px',
    }}>
      <div style={{ fontSize: '72px', fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>404</div>
      <p style={{ color: 'var(--gray2)', fontSize: '16px', maxWidth: '400px' }}>
        This page doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-fill" style={{ marginTop: '8px' }}>
        Back to Home
      </Link>
    </div>
  );
}
