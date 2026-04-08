import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <>
      <div className="page-enter" style={{ maxWidth: 760, margin: '0 auto', padding: '120px 24px 80px' }}>
        <Link to="/" style={{ fontSize: 12, color: 'var(--gray3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          ← Zurück
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--white)', margin: '24px 0 12px', letterSpacing: '-0.02em' }}>
          Datenschutzerklärung
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 48 }}>
          Stand: April 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, fontSize: 14, color: 'var(--gray2)', lineHeight: 1.8 }}>
          <section>
            <h2 style={h2Style}>1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist der Betreiber von IQLab.
              Die vollständigen Kontaktdaten finden Sie im <Link to="/imprint" style={linkStyle}>Impressum</Link>.
              Bei Fragen zum Datenschutz erreichen Sie uns unter{' '}
              <a href="mailto:iqlab.app@gmail.com" style={linkStyle}>iqlab.app@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>2. Überblick</h2>
            <p>
              IQLab ist eine kostenlose, nicht-kommerzielle Webanwendung für kognitives Training.
              Wir erheben nur die Daten, die für den Betrieb des Dienstes zwingend notwendig sind,
              und folgen den Grundsätzen der Datenminimierung (Art. 5 DSGVO).
            </p>
          </section>

          <section>
            <h2 style={h2Style}>3. Welche Daten wir verarbeiten</h2>
            <ul style={ulStyle}>
              <li><strong style={strongStyle}>Account-Daten:</strong> E-Mail-Adresse und ein gehashtes Passwort bei der Registrierung. Passwörter werden niemals im Klartext gespeichert.</li>
              <li><strong style={strongStyle}>Spieldaten:</strong> Punktzahlen, Genauigkeit, Schwierigkeit und Trainingszeiten — gespeichert, damit Sie Ihren Fortschritt im Dashboard sehen können.</li>
              <li><strong style={strongStyle}>Neuro Score:</strong> Ein berechneter Wert basierend auf Ihren Trainingsergebnissen.</li>
              <li><strong style={strongStyle}>Technische Daten:</strong> Beim Aufruf der Seite werden HTTP-Standarddaten (IP-Adresse, User-Agent, Zeitstempel) durch unseren Hosting-Anbieter Vercel verarbeitet (siehe §6).</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>4. Rechtsgrundlagen</h2>
            <ul style={ulStyle}>
              <li><strong style={strongStyle}>Art. 6 Abs. 1 lit. b DSGVO</strong> — Verarbeitung zur Vertragserfüllung (Account, Spielfortschritt, Login).</li>
              <li><strong style={strongStyle}>Art. 6 Abs. 1 lit. f DSGVO</strong> — Berechtigtes Interesse an einem stabilen, sicheren Betrieb (Hosting-Logs, Anti-Missbrauch).</li>
              <li><strong style={strongStyle}>Art. 6 Abs. 1 lit. a DSGVO</strong> — Einwilligung bei Login via Google OAuth.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>5. Speicherort &amp; Sicherheit</h2>
            <p>
              Alle Account- und Spieldaten werden in einer{' '}
              <strong style={strongStyle}>Supabase</strong>-Datenbank (PostgreSQL, gehostet in Frankfurt, EU)
              gespeichert. Zugriffe sind durch <em>Row Level Security</em> abgesichert — jeder Nutzer kann
              ausschließlich seine eigenen Daten sehen. Die Übertragung erfolgt verschlüsselt (HTTPS/TLS).
            </p>
          </section>

          <section>
            <h2 style={h2Style}>6. Dienstleister (Auftragsverarbeiter)</h2>
            <ul style={ulStyle}>
              <li>
                <strong style={strongStyle}>Supabase Inc.</strong> (USA, EU-Hosting) — Authentifizierung und
                Datenbank. Datenstandort: Frankfurt, Deutschland.{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Datenschutzerklärung</a>
              </li>
              <li>
                <strong style={strongStyle}>Vercel Inc.</strong> (USA) — Hosting der Webanwendung &amp;
                Vercel Analytics (cookie-frei, anonymisiert, keine personenbezogenen Profile).{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Datenschutzerklärung</a>
              </li>
              <li>
                <strong style={strongStyle}>Google LLC</strong> (USA) — Optionale Anmeldung via Google OAuth
                und Bereitstellung von Google Fonts. Beim Login mit Google werden Ihre E-Mail-Adresse und
                Ihr Profilbild an uns übermittelt.{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Datenschutzerklärung</a>
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Übermittlungen in die USA erfolgen auf Grundlage des EU-US Data Privacy Framework
              bzw. EU-Standardvertragsklauseln.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>7. Cookies &amp; lokale Speicherung</h2>
            <p>
              IQLab verwendet keine Marketing- oder Tracking-Cookies. Für die Anmeldung wird ein
              technisch notwendiger Session-Token im Browser (LocalStorage) gespeichert. Diese Speicherung
              erfolgt ausschließlich auf Basis von Art. 25 Abs. 2 TTDSG (technisch erforderlich, keine Einwilligung nötig).
            </p>
          </section>

          <section>
            <h2 style={h2Style}>8. Speicherdauer</h2>
            <p>
              Account- und Spieldaten werden gespeichert, solange Ihr Account besteht. Nach Löschung Ihres
              Accounts werden alle personenbezogenen Daten innerhalb von 30 Tagen aus der Datenbank entfernt.
              Hosting-Logs werden nach maximal 30 Tagen gelöscht.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>9. Ihre Rechte (Art. 15–22 DSGVO)</h2>
            <ul style={ulStyle}>
              <li>Auskunft über die zu Ihrer Person gespeicherten Daten (Art. 15)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16)</li>
              <li>Löschung Ihres Accounts und aller verknüpften Daten (Art. 17)</li>
              <li>Einschränkung der Verarbeitung (Art. 18)</li>
              <li>Datenübertragbarkeit (Art. 20)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21)</li>
              <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77)</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              Anfragen richten Sie bitte an{' '}
              <a href="mailto:iqlab.app@gmail.com" style={linkStyle}>iqlab.app@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>10. Was wir nicht tun</h2>
            <ul style={ulStyle}>
              <li>Wir verkaufen oder vermieten Ihre Daten nicht an Dritte.</li>
              <li>Wir setzen keine Werbe-, Marketing- oder Drittanbieter-Tracking-Cookies.</li>
              <li>Wir schalten keine Werbung.</li>
              <li>Wir erstellen keine Profile zu Werbezwecken.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>11. Änderungen dieser Erklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich die Rechtslage oder
              unsere Datenverarbeitung ändert. Die jeweils aktuelle Version ist immer auf dieser Seite verfügbar.
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
const linkStyle = { color: 'var(--accent)', textDecoration: 'none' };
