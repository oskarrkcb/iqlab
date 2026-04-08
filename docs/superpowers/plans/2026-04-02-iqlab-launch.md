# IQLab Launch-Vorbereitung

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** IQLab von lokaler Demo zu produktionsreifer Web-App bringen — echte Auth, echte Datenbank, keine Fake-Daten.

**Architecture:** Supabase als Backend (Auth + PostgreSQL). Stats-System wird von localStorage auf Supabase umgebaut. Dashboard liest echte Daten aus der DB. ProtectedRoute wird aktiviert, Google OAuth wird versteckt.

**Tech Stack:** React 19 + Vite 8, Supabase (Auth + DB), vanilla CSS

---

## Datei-Ubersicht

| Datei | Aktion | Zweck |
|---|---|---|
| `src/lib/supabase.js` | Behalten | Supabase-Client (Keys aus .env.local) |
| `src/context/AuthContext.jsx` | Anpassen | Google OAuth entfernen |
| `src/App.jsx` | Anpassen | ProtectedRoute aktivieren, 404-Route |
| `src/stats.js` | Komplett umschreiben | localStorage -> Supabase |
| `src/pages/Dashboard.jsx` | Anpassen | Fake-Daten entfernen, echte Supabase-Daten |
| `src/pages/Login.jsx` | Anpassen | Google-Button entfernen |
| `src/pages/IQTest.jsx` | Anpassen | IQ-Ergebnis in Supabase speichern |
| `src/pages/NotFound.jsx` | Neu erstellen | 404-Seite |
| `src/games/GameShell.jsx` | Anpassen | recordGame auf async umstellen |
| `index.html` | Anpassen | SEO Meta-Tags |
| `src/pages/LandingV2.jsx` + CSS | Loschen | Toter Code |
| `src/pages/DashboardV2.jsx` + CSS | Loschen | Toter Code |
| `src/pages/TrainingV2.jsx` + CSS | Loschen | Toter Code |

---

## Phase 1: Supabase einrichten (DU machst das)

### Task 1: Supabase-Projekt erstellen

**Wer:** Du (im Browser auf supabase.com)

- [ ] **Step 1: Neues Projekt erstellen**

1. Geh auf https://supabase.com und log dich ein
2. Klick "New Project"
3. Name: `iqlab`
4. Database Password: starkes Passwort wahlen und notieren
5. Region: `Frankfurt (eu-central-1)`
6. Warten bis fertig (~2 Min)

- [ ] **Step 2: API-Keys kopieren**

1. Geh zu Settings > API
2. Kopiere **Project URL** (z.B. `https://xxxxx.supabase.co`)
3. Kopiere **anon public key** (langer String)
4. NICHT den service_role key kopieren

- [ ] **Step 3: .env.local aktualisieren**

Offne `C:\Users\oskar_rkcb\brainwave\.env.local` und ersetze die Werte:

```env
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=DEIN_ANON_KEY_HIER
```

### Task 2: Datenbank-Tabellen erstellen

**Wer:** Du (im Supabase SQL Editor)

- [ ] **Step 1: SQL Editor offnen**

Geh in deinem Supabase-Projekt auf "SQL Editor" (linke Sidebar)

- [ ] **Step 2: Dieses SQL-Script ausfuhren**

Kopiere das komplette Script und klick "Run":

```sql
-- ══════════════════════════════════════════════════════
--  IQLab Database Schema
-- ══════════════════════════════════════════════════════

-- 1. Game Results — jedes Spiel-Ergebnis wird hier gespeichert
create table game_results (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  game_id    text not null,
  score      int not null default 0,
  correct    int not null default 0,
  total      int not null default 0,
  time_used  real not null default 0,
  difficulty text not null default 'medium',
  created_at timestamptz not null default now()
);

-- 2. IQ Test Results — jedes IQ-Test-Ergebnis
create table iq_results (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  iq_score   int not null,
  correct    int not null,
  total      int not null,
  logic_pct  int not null default 0,
  math_pct   int not null default 0,
  pattern_pct int not null default 0,
  time_secs  int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Indexes fur schnelle Abfragen
create index idx_game_results_user on game_results(user_id);
create index idx_game_results_user_game on game_results(user_id, game_id);
create index idx_game_results_created on game_results(created_at);
create index idx_iq_results_user on iq_results(user_id);

-- ══════════════════════════════════════════════════════
--  Row Level Security (RLS) — KRITISCH
-- ══════════════════════════════════════════════════════

-- Aktiviere RLS auf beiden Tabellen
alter table game_results enable row level security;
alter table iq_results enable row level security;

-- Policy: User kann nur eigene game_results sehen
create policy "Users read own game_results"
  on game_results for select
  using (auth.uid() = user_id);

-- Policy: User kann nur eigene game_results einfugen
create policy "Users insert own game_results"
  on game_results for insert
  with check (auth.uid() = user_id);

-- Policy: User kann nur eigene iq_results sehen
create policy "Users read own iq_results"
  on iq_results for select
  using (auth.uid() = user_id);

-- Policy: User kann nur eigene iq_results einfugen
create policy "Users insert own iq_results"
  on iq_results for insert
  with check (auth.uid() = user_id);
```

- [ ] **Step 3: Pruefen dass es geklappt hat**

Geh auf "Table Editor" in der Sidebar. Du solltest `game_results` und `iq_results` sehen, beide leer.

---

## Phase 2: Auth reparieren (ICH mache das)

### Task 3: ProtectedRoute aktivieren

**Files:**
- Modify: `src/App.jsx:13-16`

- [ ] **Step 1: ProtectedRoute mit echtem Auth-Check ersetzen**

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

- [ ] **Step 2: 404 Catch-All Route hinzufugen**

In der `<Routes>` am Ende hinzufugen:

```jsx
<Route path="*" element={<NotFound />} />
```

Plus Import oben:

```jsx
import NotFound from './pages/NotFound';
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: activate ProtectedRoute, add 404 catch-all"
```

### Task 4: 404-Seite erstellen

**Files:**
- Create: `src/pages/NotFound.jsx`

- [ ] **Step 1: NotFound-Komponente erstellen**

```jsx
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';

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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/NotFound.jsx
git commit -m "feat: add 404 page"
```

### Task 5: Google OAuth aus Login entfernen

**Files:**
- Modify: `src/pages/Login.jsx:53-65`
- Modify: `src/context/AuthContext.jsx:27`

- [ ] **Step 1: Google-Button und Divider aus Login.jsx entfernen**

Entferne den kompletten Block von Zeile 53-65 (Google Button + Divider):

```jsx
          {/* Google OAuth — kommt spater */}

          <form onSubmit={handleSubmit} className="auth-form">
```

(Der `<button className="btn btn-secondary...` Block und der `<div className="auth-divider">` Block werden entfernt)

- [ ] **Step 2: handleGoogle Funktion aus Login.jsx entfernen**

Zeile 33-35 entfernen und aus dem useAuth Destructuring `signInWithGoogle` entfernen.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Login.jsx src/context/AuthContext.jsx
git commit -m "feat: remove Google OAuth button (email-only for now)"
```

---

## Phase 3: Stats-System auf Supabase umbauen (ICH mache das)

### Task 6: stats.js komplett umschreiben

**Files:**
- Rewrite: `src/stats.js`

- [ ] **Step 1: Neues stats.js mit Supabase-Funktionen**

```js
import { supabase } from './lib/supabase';

/** Record a game result to Supabase */
export async function recordGame(gameId, { score, correct, total, timeUsed, difficulty }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('game_results').insert({
    user_id: user.id,
    game_id: gameId,
    score: score ?? 0,
    correct: correct ?? 0,
    total: total ?? 0,
    time_used: timeUsed ?? 0,
    difficulty: difficulty ?? 'medium',
  }).select().single();

  if (error) { console.error('recordGame error:', error); return null; }
  return data;
}

/** Record an IQ test result to Supabase */
export async function recordIQResult({ iqScore, correct, total, logicPct, mathPct, patternPct, timeSecs }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('iq_results').insert({
    user_id: user.id,
    iq_score: iqScore,
    correct,
    total,
    logic_pct: logicPct,
    math_pct: mathPct,
    pattern_pct: patternPct,
    time_secs: timeSecs,
  }).select().single();

  if (error) { console.error('recordIQResult error:', error); return null; }
  return data;
}

/** Get high score for a game */
export async function getHighScore(gameId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('game_results')
    .select('score')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(1)
    .single();

  return data?.score ?? 0;
}

/** Get last N results for a game */
export async function getHistory(gameId, n = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(n);

  return data ?? [];
}

/** Get all game stats for the current user (for Dashboard) */
export async function getAllStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { games: {}, global: { totalGames: 0, totalPoints: 0 } };

  const { data: rows } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) {
    return { games: {}, global: { totalGames: 0, totalPoints: 0 } };
  }

  const games = {};
  let totalGames = 0, totalPoints = 0;

  for (const r of rows) {
    if (!games[r.game_id]) games[r.game_id] = { history: [], highScore: 0 };
    games[r.game_id].history.push({
      score: r.score, correct: r.correct, total: r.total,
      timeUsed: r.time_used, difficulty: r.difficulty, ts: new Date(r.created_at).getTime(),
    });
    if (r.score > games[r.game_id].highScore) games[r.game_id].highScore = r.score;
    totalGames++;
    totalPoints += r.score;
  }

  return { games, global: { totalGames, totalPoints } };
}

/** Get latest IQ result */
export async function getLatestIQ() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('iq_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/stats.js
git commit -m "feat: rewrite stats.js to use Supabase instead of localStorage"
```

### Task 7: GameShell und alle Spiele auf async recordGame umstellen

**Files:**
- Modify: `src/games/GameShell.jsx:2` (import bleibt gleich)
- Modify: Jedes Spiel das `recordGame` aufruft

- [ ] **Step 1: recordGame-Aufrufe in Spielen auf async umstellen**

Da `recordGame` jetzt async ist, mussen alle Aufrufe `await` nutzen oder als fire-and-forget laufen. In den meisten Spielen reicht es, den Aufruf zu andern von:

```js
recordGame('sp', { score, correct, total, timeUsed, difficulty });
```

zu:

```js
recordGame('sp', { score, correct, total, timeUsed, difficulty });
// Kein await notig — fire-and-forget, Ergebnis wird nicht gebraucht
```

Da JavaScript async Funktionen auch ohne `await` ausfuhrt, reicht das. Fehler werden in `recordGame` selbst geloggt.

- [ ] **Step 2: Alle 16 Spieldateien pruefen und anpassen**

Dateien die `recordGame` importieren (grep durchlaufen):

```
src/games/SpeedMath.jsx
src/games/NumberMemory.jsx
src/games/Estimation.jsx
src/games/NumberSeries.jsx
src/games/OddOneOut.jsx
src/games/MatrixPuzzle.jsx
src/games/DualNBack.jsx
src/games/SchulteTables.jsx
src/games/StroopTest.jsx
src/games/MentalRotation.jsx
src/games/Syllogisms.jsx
src/games/ChimpTest.jsx
src/games/AlgoThinking.jsx
src/games/Game24.jsx
src/games/OperatorPuzzle.jsx
src/games/RavensMatrices.jsx
```

Import-Pfad andern von `'../stats'` zu `'../stats'` (bleibt gleich, da stats.js am selben Ort).

`getHighScore` ist jetzt async — in `GameShell.jsx` muss `HighScoreBanner` auf async/useEffect umgestellt werden.

- [ ] **Step 3: Commit**

```bash
git add src/games/*.jsx
git commit -m "feat: update all games to work with async stats API"
```

### Task 8: IQTest.jsx — Ergebnis in Supabase speichern

**Files:**
- Modify: `src/pages/IQTest.jsx:143-162`

- [ ] **Step 1: recordIQResult importieren und in showResult aufrufen**

Import oben anpassen:

```js
import { recordIQResult } from '../stats';
```

In `showResult` nach `setPhase('result')` hinzufugen:

```js
recordIQResult({
  iqScore: iq,
  correct: finalCorrect,
  total: questions.length,
  logicPct,
  mathPct,
  patternPct: patPct,
  timeSecs: elapsed,
});
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/IQTest.jsx
git commit -m "feat: save IQ test results to Supabase"
```

---

## Phase 4: Dashboard mit echten Daten (ICH mache das)

### Task 9: Fake-Daten aus Dashboard entfernen

**Files:**
- Modify: `src/pages/Dashboard.jsx:8-48`

- [ ] **Step 1: USER-Objekt, LEADERBOARD und HEATMAP_HOURS loschen**

Die Konstanten `USER` (Zeile 8-16), `LEADERBOARD` (Zeile 18-39) und `HEATMAP_HOURS` (Zeile 41-48) komplett entfernen.

- [ ] **Step 2: Dashboard auf async Datenladung umstellen**

`getAllStats` und `getLatestIQ` sind jetzt async. Dashboard braucht einen `useEffect` + `useState` Ansatz:

```jsx
import { useState, useEffect, useMemo } from 'react';
import { getAllStats, getLatestIQ } from '../stats';

export default function Dashboard() {
  const [allStats, setAllStats] = useState(null);
  const [latestIQ, setLatestIQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [stats, iq] = await Promise.all([getAllStats(), getLatestIQ()]);
      setAllStats(stats);
      setLatestIQ(iq);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="page-enter db-page"><div className="db-inner">Loading...</div></div>;

  const globalStats = allStats?.global ?? { totalGames: 0, totalPoints: 0 };
  // ... Rest der Berechnungen mit allStats statt USER-Fallbacks
```

- [ ] **Step 3: Alle USER-Fallbacks durch 0 oder null ersetzen**

Uberall wo `USER.totalEx`, `USER.accuracy`, `USER.streak`, `USER.potential`, `USER.elo` steht, durch Default-Werte ersetzen (0, leer, etc.).

- [ ] **Step 4: Leaderboard entfernen oder durch Platzhalter ersetzen**

Bis echte Leaderboard-Daten existieren: den ganzen Leaderboard-Block im JSX entfernen oder durch eine Nachricht ersetzen ("Leaderboard coming soon").

- [ ] **Step 5: IQ-Score aus echten Daten zeigen**

```jsx
const userIQ = latestIQ?.iq_score ?? null;
```

Wenn `userIQ` null ist, zeig "Take the IQ Test" Button statt einer Zahl.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: Dashboard uses real Supabase data, remove all fake data"
```

---

## Phase 5: Aufraumen (ICH mache das)

### Task 10: V2-Dateien loschen

**Files:**
- Delete: `src/pages/LandingV2.jsx`
- Delete: `src/pages/LandingV2.css`
- Delete: `src/pages/DashboardV2.jsx`
- Delete: `src/pages/DashboardV2.css`
- Delete: `src/pages/TrainingV2.jsx`
- Delete: `src/pages/TrainingV2.css`

- [ ] **Step 1: Sicherstellen dass keine Imports existieren**

```bash
grep -r "V2" src/ --include="*.jsx" --include="*.js"
```

Sollte keine Imports zeigen.

- [ ] **Step 2: Dateien loschen**

```bash
rm src/pages/LandingV2.jsx src/pages/LandingV2.css
rm src/pages/DashboardV2.jsx src/pages/DashboardV2.css
rm src/pages/TrainingV2.jsx src/pages/TrainingV2.css
```

- [ ] **Step 3: Commit**

```bash
git add -u
git commit -m "chore: remove unused V2 page files"
```

### Task 11: SEO Meta-Tags in index.html

**Files:**
- Modify: `index.html:5-8`

- [ ] **Step 1: Open Graph und Twitter Tags hinzufugen**

```html
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IQLab — Cognitive Training Lab</title>
    <meta name="description" content="IQLab — Science-based cognitive training. Train memory, focus, logic and reaction time." />

    <!-- Open Graph -->
    <meta property="og:title" content="IQLab — Cognitive Training Lab" />
    <meta property="og:description" content="Science-based cognitive training. Train memory, focus, logic and reaction time." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/og-image.jpg" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="IQLab — Cognitive Training Lab" />
    <meta name="twitter:description" content="Science-based cognitive training. Train memory, focus, logic and reaction time." />
    <meta name="twitter:image" content="/og-image.jpg" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
```

**Hinweis:** Du musst ein `og-image.jpg` (1200x630px) erstellen und in `/public` legen. Das ist das Vorschaubild wenn jemand deine Seite auf Social Media teilt.

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Open Graph and Twitter Card meta tags"
```

### Task 12: localStorage-Key aufraumen

**Files:**
- Info-Task, kein Code

Der alte `apexmind_stats` Key in localStorage bleibt einfach liegen — er wird nicht mehr gelesen. Kein Handlungsbedarf.

---

## Phase 6: Testen (WIR ZUSAMMEN)

### Task 13: Auth-Flow testen

- [ ] **Step 1: Dev-Server starten**

```bash
cd C:\Users\oskar_rkcb\brainwave && npm run dev
```

- [ ] **Step 2: Registrierung testen**

1. Offne http://localhost:5173
2. Klick auf Login
3. "Create Account" wahlen
4. E-Mail + Passwort eingeben
5. Prufe: Bekommst du eine Bestatigungsmail? (Supabase default)

- [ ] **Step 3: Login testen**

1. Nach Bestatigung einloggen
2. Prufe: Wirst du zum Dashboard weitergeleitet?
3. Prufe: Navbar zeigt "Sign Out" Button?

- [ ] **Step 4: ProtectedRoute testen**

1. Ausloggen
2. Versuch direkt /dashboard oder /training aufzurufen
3. Prufe: Wirst du zu /login umgeleitet?

### Task 14: Spiel + Dashboard-Daten testen

- [ ] **Step 1: Ein Spiel spielen**

1. Einloggen
2. Geh zu Training
3. Spiel z.B. Speed Math (1 Runde)
4. Prufe in Supabase Table Editor: Ist eine Zeile in `game_results` erschienen?

- [ ] **Step 2: Dashboard prufen**

1. Geh zum Dashboard
2. Prufe: Zeigt es echte Werte (Total Games: 1, etc.)?
3. Prufe: Kein "IQ 112" oder fake Leaderboard mehr sichtbar?

- [ ] **Step 3: IQ-Test spielen**

1. IQ-Test durchspielen
2. Prufe in Supabase: Zeile in `iq_results`?
3. Prufe Dashboard: IQ-Score wird angezeigt?

---

## Zusammenfassung: Wer macht was

| Phase | Wer | Was |
|---|---|---|
| Phase 1 (Task 1-2) | **DU** | Supabase-Projekt erstellen, SQL ausfuhren, .env.local updaten |
| Phase 2 (Task 3-5) | **ICH** | Auth reparieren, 404-Seite, Google OAuth entfernen |
| Phase 3 (Task 6-8) | **ICH** | Stats auf Supabase, Spiele anpassen, IQ-Test speichern |
| Phase 4 (Task 9) | **ICH** | Dashboard mit echten Daten |
| Phase 5 (Task 10-12) | **ICH** | V2 aufraumen, SEO, Meta-Tags |
| Phase 6 (Task 13-14) | **WIR** | Alles testen |

## Noch offen (DEINE Aufgabe, kein Code)

- Bilder austauschen (lizenzfreie finden)
- OG-Image erstellen (1200x630px)
- Impressum + Datenschutzerklarung schreiben
- Hosting/Domain wahlen
