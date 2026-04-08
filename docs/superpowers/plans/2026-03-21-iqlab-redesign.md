# IQLab Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current light-grey/rose design system with a dark/black theme and blue accent across all 4 pages (Landing, Dashboard, Training, IQ Test), matching the approved HTML mockups.

**Architecture:** CSS-only redesign — all game logic, routing, auth, and i18n stay untouched. Each page has its own CSS file that is fully rewritten. The global `variables.css` is rewritten first so all token changes cascade automatically. JSX files are modified only where visual structure changed (Landing hero layout, Dashboard IQ gauge, IQ Test phase rendering).

**Tech Stack:** React 18, Vite, vanilla CSS (no framework), React Router v6, JetBrains Mono + Inter (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-03-21-iqlab-redesign-design.md`
**Mockups:** `.superpowers/brainstorm/3302-1774109716/` (homepage-v4a.html, dashboard-v1.html, training-v1.html, iqtest-v1.html)

---

## File Map

| File | Action | Notes |
|------|--------|-------|
| `public/picture 5.jpg` | Rename → `public/pic5.jpg` | Hero image |
| `public/picture 6.jpg` | Rename → `public/pic6.jpg` | Why IQLab split |
| `public/neuro picture.jpg` | Rename → `public/neuro-picture.jpg` | Every Domain split |
| `public/picture 2.jpg` | Rename → `public/pic2.jpg` | IQ Test section |
| `index.html` | **Modify** | Add Inter font link, remove Outfit import |
| `src/styles/variables.css` | **Full rewrite** | Dark token set, Inter font |
| `src/styles/global.css` | **Rewrite** | Dark base, Inter import |
| `src/components/Navbar.css` | **Full rewrite** | Full-width fixed dark bar + `.page-landing` variant |
| `src/pages/Landing.jsx` | **Rewrite** | New hero structure + scroll animations + body class |
| `src/pages/Landing.css` | **Full rewrite** | All landing sections |
| `src/pages/Dashboard.jsx` | **Modify** | Fix IQ gauge SVG, remove emoji, fix colors |
| `src/pages/Dashboard.css` | **Full rewrite** | Dark bento layout |
| `src/pages/Training.jsx` | **Modify (cosmetic only)** | Replace inline-style diff-pills div with className |
| `src/pages/Training.css` | **Full rewrite** | Dark sidebar + game grid |
| `src/pages/IQTest.jsx` | **Modify** | Update class names for result phase, add count-up animation |
| `src/pages/IQTest.css` | **Full rewrite** | Dark phases + IQ range panel |

**Do NOT touch:** `src/App.jsx`, `src/games/`, `src/context/`, `src/lib/`, `src/i18n/`, `src/stats.js`, `src/components/Navbar.jsx` (logic only), `src/pages/*V2*`, `src/pages/Onboarding*`, `src/pages/Login*`, `src/pages/Training.jsx` (logic only), `src/pages/IQTest.jsx` (logic only — except phase render structure)

---

## How to verify each task

Run the dev server: `npm run dev` (in `brainwave/`). Open `http://localhost:5173`. After each task, visually compare the changed page to its mockup file at `http://localhost:50573`.

---

## Task 1: Rename image assets

**Files:**
- Rename: `public/picture 5.jpg` → `public/pic5.jpg`
- Rename: `public/picture 6.jpg` → `public/pic6.jpg`
- Rename: `public/neuro picture.jpg` → `public/neuro-picture.jpg`
- Rename: `public/picture 2.jpg` → `public/pic2.jpg`

- [ ] **Step 1: Rename the four image files**

```bash
cd brainwave/public
mv "picture 5.jpg" pic5.jpg
mv "picture 6.jpg" pic6.jpg
mv "neuro picture.jpg" neuro-picture.jpg
mv "picture 2.jpg" pic2.jpg
```

- [ ] **Step 2: Verify files exist with new names**

```bash
ls brainwave/public/*.jpg
```
Expected: `pic2.jpg  pic5.jpg  pic6.jpg  neuro-picture.jpg` all present (plus any others).

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "chore: rename public images to remove spaces"
```

---

## Task 2: Rewrite design tokens (variables.css)

**Files:**
- Modify: `src/styles/variables.css` (full rewrite)

This is the foundation. All subsequent CSS files depend on these tokens.

- [ ] **Step 1: Start the dev server in the background**

```bash
npm run dev
```

Keep it running throughout all tasks.

- [ ] **Step 2: Rewrite `src/styles/variables.css`**

Replace the entire file content with:

```css
/* ═══════════════════════════════════════════════════════════════════════
   IQLab Design System — v5 Dark Edition
   Palette: Black + Dark Greys + Blue Accent
   Typography: Inter (display/body) + JetBrains Mono (stats/code)
   ═══════════════════════════════════════════════════════════════════════ */
:root {
  /* Backgrounds */
  --bg:    #060606;
  --bg2:   #0e0e0e;
  --bg3:   #141414;
  --bg4:   #1c1c1c;
  --bg5:   #222222;

  /* Borders */
  --border: rgba(255,255,255,0.07);

  /* Text */
  --white:  #ffffff;
  --gray1:  #cccccc;
  --gray2:  #888888;
  --gray3:  #3a3a3a;
  --gray4:  #555555;
  --gray5:  #2a2a2a;

  /* Accent — Blue */
  --accent:  #3b82f6;
  --accent2: #2563eb;
  --accent3: #1d4ed8;
  --glow:    rgba(59,130,246,0.12);
  --glow2:   rgba(59,130,246,0.20);

  /* Semantic */
  --green:    #22c55e;
  --green-g:  rgba(34,197,94,0.12);
  --red:      #ef4444;
  --red-g:    rgba(239,68,68,0.12);
  --orange:   #f97316;
  --orange-g: rgba(249,115,22,0.12);
  --blue:     #3b82f6;
  --blue-g:   rgba(59,130,246,0.12);
  --purple:   #a78bfa;

  /* Layout */
  --r:  4px;
  --r2: 4px;
  --r3: 4px;
  --font: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 3: Verify dev server still compiles**

Check browser console — no CSS errors. The page will look broken (wrong colors) but should not crash.

- [ ] **Step 4: Commit**

```bash
git add src/styles/variables.css
git commit -m "style: rewrite design tokens — dark palette, blue accent, Inter font"
```

---

## Task 3: Rewrite global.css and add Inter font

**Files:**
- Modify: `src/styles/global.css` (full rewrite)
- Modify: `index.html` (add Inter Google Fonts link)

- [ ] **Step 1: Add Inter font to `index.html`**

Open `index.html` in the project root. In the `<head>`, replace or add after the existing font link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Remove any existing `Outfit` font import.

- [ ] **Step 2: Rewrite `src/styles/global.css`**

```css
@import './variables.css';

/* ═══════════════════ RESET & BASE ═══════════════════ */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  background: var(--bg);
  color: var(--white);
  font-family: var(--font);
  line-height: 1.5;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font-family: var(--font); cursor: pointer; border: none; }
img { max-width: 100%; }

/* ═══════════════════ UTILITY ═══════════════════ */
.container { max-width: 1200px; margin: 0 auto; padding: 0 56px; }
.hide { display: none !important; }

/* ═══════════════════ ANIMATIONS ═══════════════════ */
@keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 var(--glow2)} 50%{box-shadow:0 0 20px 4px var(--glow2)} }
@keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
@keyframes scrollLine { 0%,100%{opacity:0.3} 50%{opacity:1} }

/* ═══════════════════ FADE-UP ON SCROLL ═══════════════════ */
.fade-up { opacity:0; transform:translateY(32px); transition:opacity 0.7s ease,transform 0.7s ease; }
.fade-up.visible { opacity:1; transform:none; }

/* ═══════════════════ BUTTONS ═══════════════════ */
.btn-fill {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
  padding: 14px 30px; border-radius: 100px; border: none; cursor: pointer;
  background: var(--white); color: var(--bg);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn-fill:hover { background: #f0f0f0; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,255,255,0.1); }
.btn-fill:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-glass {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
  padding: 13px 28px; border-radius: 100px; cursor: pointer;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(8px);
  transition: all 0.2s;
}
.btn-glass:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); color: var(--white); transform: translateY(-1px); }
.btn-glass:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Keep legacy .btn class working for games */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 20px; border-radius:6px; font-size:13px; font-weight:600; transition:all 0.2s; }
.btn:disabled { opacity:0.4; cursor:not-allowed; }
.btn-primary { background:var(--accent); color:#fff; }
.btn-primary:hover:not(:disabled) { background:var(--accent2); }
.btn-secondary { background:var(--bg3); color:var(--white); border:1px solid var(--border); }
.btn-secondary:hover:not(:disabled) { border-color:rgba(255,255,255,0.18); }
.btn-ghost { background:transparent; color:var(--gray2); border:1px solid var(--border); }
.btn-ghost:hover:not(:disabled) { color:var(--white); border-color:rgba(255,255,255,0.2); }
.btn-lg { padding:14px 32px; font-size:15px; }
.btn-sm { padding:7px 14px; font-size:12px; border-radius:4px; }
.btn-w { width:100%; }
.btn-green { background:var(--green); color:#fff; }
.btn-green:hover { filter:brightness(1.1); }

/* ═══════════════════ PAGE TRANSITION ═══════════════════ */
.page-enter { animation: fadeUp 0.4s ease; }

/* ═══════════════════ FOOTER ═══════════════════ */
.footer { border-top:1px solid var(--border); padding:28px 56px; display:flex; justify-content:space-between; align-items:center; background:var(--bg2); }
.footer a { color:var(--gray3); transition:color 0.2s; }
.footer a:hover { color:var(--white); }
```

- [ ] **Step 3: Verify font loads**

Open `http://localhost:5173`. Open DevTools → Network → filter "fonts". Confirm Inter woff2 files are loading.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css index.html
git commit -m "style: rewrite global.css — dark base, Inter font, shared button/animation tokens"
```

---

## Task 4: Rewrite Navbar.css

**Files:**
- Modify: `src/components/Navbar.css` (full rewrite)
- Note: `Navbar.jsx` JSX is NOT changed — only the CSS.

The new nav is a full-width fixed bar, not the current floating pill.

- [ ] **Step 1: Rewrite `src/components/Navbar.css`**

```css
/* ═══════════════════ NAVBAR — Full Width Dark Bar ═══════════════════ */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 999;
  height: 66px;
  display: flex;
  align-items: center;
  background: rgba(6,6,6,0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  /* Reset pill shape */
  border-radius: 0;
  padding: 0;
  width: 100%;
  max-width: 100%;
  transform: none;
  box-shadow: none;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 56px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0;
}

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 0;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--white);
  text-decoration: none;
  padding: 0;
  margin-right: 0;
}
.logo-dot { display: none; } /* hide rose dot */
.logo-text { color: var(--white); }

/* ── Nav Links ── */
.nav-links {
  display: flex;
  gap: 36px;
  align-items: center;
  margin-left: 52px;
  flex: 1;
}

.nav-links a {
  font-family: var(--font);
  font-size: 13px;
  font-weight: 400;
  color: var(--gray2);
  text-decoration: none;
  padding: 0;
  border-radius: 0;
  background: none;
  transition: color 0.2s;
  white-space: nowrap;
}
.nav-links a:hover { color: var(--white); background: none; }
.nav-links a.active { color: var(--white); background: none; }

/* ── Version toggle ── */
.nav-version-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 100px;
  padding: 3px;
  margin: 0 12px;
}
.nav-version-btn {
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--gray2);
  cursor: pointer;
  font-family: var(--font);
  transition: all 0.15s;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.nav-version-btn.active {
  background: var(--accent);
  color: #fff;
}

/* ── CTA (Start Training) — the nav-cta class is on the Link in Navbar.jsx,
   we target it via the last link in nav-links or by adding class in JSX.
   Using attribute selector as fallback: ── */
.nav-links a[href="/training"].active,
.nav-cta {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--white);
  color: var(--bg);
  padding: 9px 22px;
  border-radius: 100px;
  transition: background 0.2s;
  margin-left: auto;
}

/* ── Landing page variant (more transparent) ── */
/* Landing.jsx adds .page-landing to document.body on mount and removes on unmount */
.page-landing .nav { background: rgba(6,6,6,0.55); }

/* ── Hamburger ── */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--white);
  padding: 6px;
  cursor: pointer;
  margin-left: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.hamburger:hover { background: rgba(255,255,255,0.06); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .nav { border-radius: 0; }
  .nav-inner { padding: 0 20px; }
  .hamburger { display: block; }
  .nav-links {
    display: none;
    position: absolute;
    top: 66px; left: 0; right: 0;
    background: rgba(6,6,6,0.97);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 16px 20px;
    gap: 4px;
    margin-left: 0;
  }
  .nav-links.open { display: flex; }
  .nav-links a {
    padding: 10px 0;
    border-radius: 0;
    border-bottom: 1px solid var(--border);
  }
  .nav-links a:last-child { border-bottom: none; }
}
```

- [ ] **Step 2: Verify in browser**

Open any page. Nav should be: full-width dark bar, not a floating pill. Logo uppercase monospace, links grey, no rose dot.

Compare to mockup nav at `http://localhost:50573/files/homepage-v4a.html`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.css
git commit -m "style: redesign navbar — full-width dark fixed bar, removes pill shape"
```

---

## Task 5: Rewrite Landing page

**Files:**
- Modify: `src/pages/Landing.jsx` (full rewrite of JSX structure)
- Modify: `src/pages/Landing.css` (full rewrite)

Reference mockup: `homepage-v4a.html`

- [ ] **Step 1: Rewrite `src/pages/Landing.css`**

```css
/* ═══════════════════════════════════════════════════════════════
   IQLab — Landing Page v5
   Dark theme. No light backgrounds. Image masks via CSS.
   ═══════════════════════════════════════════════════════════════ */

/* ─── HERO ─────────────────────────────────────────────────── */
.lnd-hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--bg);
}
.lnd-hero-bg { position: absolute; inset: 0; background: var(--bg); }

.lnd-hero-img {
  position: absolute;
  right: 0;
  top: 50%; transform: translateY(-50%);
  width: 52%; height: 92%;
  background: url('/pic5.jpg') center/cover no-repeat;
  mask-image: radial-gradient(ellipse 55% 65% at 60% 50%, black 28%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 55% 65% at 60% 50%, black 28%, transparent 70%);
  filter: brightness(0.75) saturate(1.15);
}

.lnd-hero-content {
  position: relative;
  z-index: 2;
  max-width: 860px;
  padding: 0 32px;
}

.lnd-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.35); margin-bottom: 32px;
}
.lnd-eyebrow-line { width: 28px; height: 1px; background: rgba(255,255,255,0.2); }

.lnd-headline {
  font-size: clamp(38px, 5.5vw, 72px);
  font-weight: 800; line-height: 1.05; letter-spacing: -0.03em;
  color: var(--white); margin-bottom: 44px;
}
.lnd-headline .dim { display: block; color: rgba(255,255,255,0.22); }

.lnd-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.lnd-scroll-hint {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2;
}
.lnd-scroll-line {
  width: 1px; height: 44px;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2));
  animation: scrollLine 2.5s ease-in-out infinite;
}
.lnd-scroll-text { font-size: 9px; letter-spacing: 0.22em; color: rgba(255,255,255,0.2); text-transform: uppercase; }

/* ─── STATS BAR ─────────────────────────────────────────────── */
.lnd-stats { background: var(--bg3); border-top: none; border-bottom: 1px solid var(--border); position: relative; }
.lnd-stats::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
}
.lnd-stats-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 56px;
  display: grid; grid-template-columns: repeat(4,1fr);
}
.lnd-stat-block {
  padding: 36px 0; text-align: center;
  border-right: 1px solid var(--border);
}
.lnd-stat-block:last-child { border-right: none; }
.lnd-stat-num { font-size: 40px; font-weight: 900; font-family: var(--mono); color: var(--white); letter-spacing: -0.04em; line-height: 1; }
.lnd-stat-lbl { font-size: 10px; color: var(--gray3); margin-top: 5px; letter-spacing: 0.1em; text-transform: uppercase; }

/* ─── MARQUEE ─────────────────────────────────────────────── */
.lnd-marquee-wrap { overflow: hidden; border-bottom: 1px solid var(--border); padding: 16px 0; background: var(--bg2); }
.lnd-marquee-track { display: flex; gap: 52px; width: max-content; animation: marquee 30s linear infinite; }
.lnd-mq-item {
  font-size: 10px; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray3);
  display: flex; align-items: center; gap: 12px; white-space: nowrap;
}
.lnd-mq-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gray3); }

/* ─── SECTION BASE ───────────────────────────────────────── */
.lnd-section { padding: 112px 56px; }
.lnd-s-inner { max-width: 1200px; margin: 0 auto; }
.lnd-eye { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
.lnd-h2 { font-size: clamp(32px, 4vw, 54px); font-weight: 800; letter-spacing: -0.03em; color: var(--white); line-height: 1.05; margin-bottom: 20px; }
.lnd-h2 .muted { color: var(--gray3); }
.lnd-sub { font-size: 15px; color: var(--gray2); line-height: 1.75; font-weight: 300; max-width: 460px; }

/* ─── SPLIT LAYOUT ──────────────────────────────────────── */
.lnd-split { display: grid; grid-template-columns: 1fr 1fr; min-height: 520px; }
.lnd-split-img { position: relative; overflow: hidden; background: #050505; }
.lnd-split-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0.75); }
.lnd-split-img .lnd-img-fade {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 50%, var(--bg3) 100%),
              linear-gradient(180deg, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%);
}
.lnd-split-content {
  padding: 64px 56px;
  display: flex; flex-direction: column; justify-content: center; gap: 24px;
  border-left: 1px solid var(--border); background: var(--bg2);
}
.lnd-split-content.left { border-left: none; border-right: 1px solid var(--border); background: var(--bg3); }

/* Feature list */
.lnd-feat-list { display: flex; flex-direction: column; gap: 20px; margin-top: 8px; }
.lnd-feat-item { display: flex; gap: 16px; }
.lnd-feat-num { font-family: var(--mono); font-size: 10px; color: var(--accent); margin-top: 3px; flex-shrink: 0; }
.lnd-feat-item h4 { font-size: 14px; font-weight: 700; color: var(--white); margin-bottom: 4px; }
.lnd-feat-item p { font-size: 12px; color: var(--gray2); line-height: 1.65; font-weight: 300; }

/* ─── BENTO ─────────────────────────────────────────────── */
.lnd-bento {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border); margin-top: 56px;
}
.lnd-b { background: var(--bg3); padding: 36px; position: relative; overflow: hidden; transition: background 0.2s; }
.lnd-b:hover { background: var(--bg4); }
.lnd-b.w2 { grid-column: span 2; }
.lnd-b-num { font-family: var(--mono); font-size: 10px; color: var(--gray3); letter-spacing: 0.1em; margin-bottom: 18px; }
.lnd-b-title { font-size: 17px; font-weight: 700; color: var(--white); margin-bottom: 10px; }
.lnd-b-desc { font-size: 13px; color: var(--gray2); line-height: 1.7; font-weight: 300; }
.lnd-b-tag {
  display: inline-block; margin-top: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--accent); border: 1px solid rgba(59,130,246,0.22);
  padding: 4px 10px; border-radius: 2px;
}

/* Mini bars in bento card 01 */
.lnd-mini-bars { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
.lnd-mb-row { display: flex; align-items: center; gap: 12px; }
.lnd-mb-lbl { font-size: 11px; color: var(--gray3); width: 120px; flex-shrink: 0; }
.lnd-mb-track { flex: 1; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; }
.lnd-mb-fill { height: 100%; background: var(--accent); border-radius: 1px; width: 0; transition: width 1s cubic-bezier(0.16,1,0.3,1); }
.lnd-mb-val { font-family: var(--mono); font-size: 10px; color: var(--gray2); width: 28px; text-align: right; }
.lnd-live-label {
  font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--green); display: flex; align-items: center; gap: 7px; margin-bottom: 16px;
}
.lnd-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulseDot 2s ease-in-out infinite; }

/* ─── GAMES GRID ────────────────────────────────────────── */
.lnd-games-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
.lnd-games-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 1px; background: var(--border); border: 1px solid var(--border);
}
.lnd-g-card { background: var(--bg3); padding: 26px 22px 34px; cursor: pointer; transition: background 0.15s; position: relative; }
.lnd-g-card:hover { background: var(--bg4); }
.lnd-g-card:hover .lnd-g-arr { color: var(--accent); transform: translate(2px,-2px); }
.lnd-g-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
.lnd-g-name { font-size: 14px; font-weight: 700; color: var(--white); margin-bottom: 6px; }
.lnd-g-desc { font-size: 11px; color: var(--gray2); line-height: 1.6; font-weight: 300; }
.lnd-g-arr { position: absolute; bottom: 20px; right: 20px; font-size: 14px; color: var(--gray3); transition: all 0.15s; }

/* ─── COMPACT SPLIT — Every Domain ──────────────────────── */
.lnd-split-compact { display: grid; grid-template-columns: 1fr 1fr; min-height: 320px; }
.lnd-split-compact .lnd-split-content { padding: 44px 48px; }
.lnd-split-compact .lnd-h2 { font-size: clamp(26px, 3vw, 40px); }
.lnd-split-compact .lnd-sub { font-size: 14px; }

/* ─── IQ SECTION ────────────────────────────────────────── */
.lnd-iq-wrap { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); min-height: 360px; }
.lnd-iq-img {
  position: relative; overflow: hidden;
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  border-right: 1px solid var(--border);
}
.lnd-iq-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0.88); }
.lnd-iq-content { padding: 52px 56px; background: var(--bg2); display: flex; flex-direction: column; justify-content: center; gap: 22px; }
.lnd-iq-kpis {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 1px; background: var(--border); border: 1px solid var(--border); margin-top: 4px;
}
.lnd-iq-kpi { background: var(--bg2); padding: 18px 14px; }
.lnd-iq-kpi-v { font-size: 26px; font-weight: 900; font-family: var(--mono); color: var(--white); }
.lnd-iq-kpi-v.blue { color: var(--accent); }
.lnd-iq-kpi-l { font-size: 9px; color: var(--gray3); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3px; }
.lnd-iq-content .lnd-h2 { font-size: clamp(26px, 3vw, 40px); }
.lnd-iq-content .lnd-sub { font-size: 14px; }

/* ─── CTA ────────────────────────────────────────────────── */
.lnd-cta {
  padding: 140px 56px; text-align: center;
  border-top: 1px solid var(--border);
  position: relative; overflow: hidden;
  background: var(--bg);
}
.lnd-cta-glow {
  position: absolute; width: 700px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.07), transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
}
.lnd-cta-inner { position: relative; z-index: 2; }
.lnd-cta-eye { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; }
.lnd-cta-h { font-size: clamp(44px, 6vw, 84px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.95; color: var(--white); margin-bottom: 48px; }
.lnd-cta-h .dim { color: var(--gray3); display: block; }
.lnd-cta-acts { display: flex; gap: 12px; justify-content: center; }
```

- [ ] **Step 2: Rewrite `src/pages/Landing.jsx`**

Replace the entire file. Keep all React Router `<Link>` usage, keep `useEffect` + `IntersectionObserver` for scroll animations, keep count-up animation for IQ KPIs.

```jsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const observerRef = useRef(null);

  // Add .page-landing to body so Navbar.css can apply the 55% opacity variant
  useEffect(() => {
    document.body.classList.add('page-landing');
    return () => document.body.classList.remove('page-landing');
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          observerRef.current.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => observerRef.current.observe(el));

    // Animated bar fills
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.lnd-mb-fill[data-w]').forEach((el, i) => {
            setTimeout(() => { el.style.width = el.dataset.w + '%'; }, i * 120);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.lnd-mini-bars').forEach(el => barObserver.observe(el));

    // Count-up for IQ KPIs
    function animateCount(el) {
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

    return () => {
      observerRef.current?.disconnect();
      barObserver.disconnect();
      countObserver.disconnect();
    };
  }, []);

  const marqueeItems = ['Number Series','Matrix Puzzle','Dual N-Back','Speed Math','Ravens Matrices','Schulte Tables','Stroop Test','Mental Rotation','Chimp Test','Algo Thinking','Marathon Mode','vs Bot'];

  return (
    <div>
      {/* HERO */}
      <section className="lnd-hero">
        <div className="lnd-hero-bg" />
        <div className="lnd-hero-img" />
        <div className="lnd-hero-content">
          <div className="lnd-eyebrow">
            <div className="lnd-eyebrow-line" />
            Sharpen Your Mind. Every Day.
            <div className="lnd-eyebrow-line" />
          </div>
          <h1 className="lnd-headline">
            Train Your Mind.
            <span className="dim">Measure Everything.</span>
          </h1>
          <div className="lnd-actions">
            <Link to="/training" className="btn-fill">Start Training <span>→</span></Link>
            <Link to="/iq-test" className="btn-glass">Take IQ Test ↗</Link>
          </div>
        </div>
        <div className="lnd-scroll-hint">
          <div className="lnd-scroll-line" />
          <span className="lnd-scroll-text">Scroll</span>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="lnd-stats">
        <div className="lnd-stats-inner">
          <div className="lnd-stat-block fade-up"><div className="lnd-stat-num">17</div><div className="lnd-stat-lbl">Exercises</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.1s'}}><div className="lnd-stat-num">6</div><div className="lnd-stat-lbl">Cognitive Domains</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.2s'}}><div className="lnd-stat-num">5 min</div><div className="lnd-stat-lbl">Per Session</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.3s'}}><div className="lnd-stat-num">Free</div><div className="lnd-stat-lbl">Always</div></div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="lnd-marquee-wrap">
        <div className="lnd-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="lnd-mq-item">{item}<span className="lnd-mq-dot"/></span>
          ))}
        </div>
      </div>

      {/* WHY IQLAB */}
      <div>
        <div className="lnd-split">
          <div className="lnd-split-img">
            <img src="/pic6.jpg" alt="Neural" />
            <div className="lnd-img-fade" />
          </div>
          <div className="lnd-split-content">
            <div className="lnd-eye fade-up">Why IQLab</div>
            <h2 className="lnd-h2 fade-up" style={{transitionDelay:'0.1s'}}>Your brain is<br/><span className="muted">trainable.</span></h2>
            <p className="lnd-sub fade-up" style={{transitionDelay:'0.2s'}}>Cognitive performance is not fixed. Research proves measurable gains in memory, speed, and logic with consistent practice.</p>
            <div className="lnd-feat-list">
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.3s'}}><span className="lnd-feat-num">01</span><div><h4>Working Memory +30%</h4><p>Measurable improvement within 8 weeks — Journal of Cognitive Enhancement, 2021</p></div></div>
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.4s'}}><span className="lnd-feat-num">02</span><div><h4>Fluid Intelligence</h4><p>Dual N-Back training increases fluid intelligence in healthy adults. — PNAS, 2008</p></div></div>
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.5s'}}><span className="lnd-feat-num">03</span><div><h4>Long-term Protection</h4><p>Mental fitness protects against cognitive decline long-term. — Neurology, 2019</p></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT YOU GET — BENTO */}
      <section className="lnd-section" style={{background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
        <div className="lnd-s-inner">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
            <div><div className="lnd-eye">What you get</div><h2 className="lnd-h2">Everything you need<br/><span className="muted">to level up.</span></h2></div>
            <p className="lnd-sub" style={{textAlign:'right'}}>Structured training with results you can actually measure.</p>
          </div>
          <div className="lnd-bento">
            <div className="lnd-b w2">
              <div className="lnd-b-num">01 — Performance Tracking</div>
              <div className="lnd-b-title">Your progress, measured in real time</div>
              <div className="lnd-b-desc">Every session logged. See exactly where you stand across memory, logic, speed, and focus.</div>
              <div className="lnd-live-label"><span className="lnd-live-dot"/>Live Session Data</div>
              <div className="lnd-mini-bars">
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">Working Memory</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="78"/></div><span className="lnd-mb-val">78%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">Processing Speed</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="62"/></div><span className="lnd-mb-val">62%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">Logic</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="85"/></div><span className="lnd-mb-val">85%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">Focus</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="71"/></div><span className="lnd-mb-val">71%</span></div>
              </div>
            </div>
            <div className="lnd-b"><div className="lnd-b-num">02 — IQ Assessment</div><div className="lnd-b-title">Know your baseline</div><div className="lnd-b-desc">15 questions across logic, math, and pattern recognition. Instant estimated IQ score.</div><Link to="/iq-test" className="lnd-b-tag">Take IQ Test →</Link></div>
            <div className="lnd-b"><div className="lnd-b-num">03 — Marathon Mode</div><div className="lnd-b-title">Continuous training</div><div className="lnd-b-desc">Multiple exercises in sequence with custom time modes and difficulty levels.</div><Link to="/training" className="lnd-b-tag">Try Marathon →</Link></div>
            <div className="lnd-b"><div className="lnd-b-num">04 — vs Bot</div><div className="lnd-b-title">Your ELO is on the line</div><div className="lnd-b-desc">Compete against AI and climb the leaderboard. 1v1 matches coming soon.</div><span className="lnd-b-tag">Coming: 1v1 →</span></div>
            <div className="lnd-b w2"><div className="lnd-b-num">05 — Free Forever</div><div className="lnd-b-title">No paywalls. No subscriptions.</div><div className="lnd-b-desc">Every exercise, feature, and statistic — fully free. Cognitive training for everyone.</div><span className="lnd-b-tag" style={{color:'var(--white)',borderColor:'rgba(255,255,255,0.14)'}}>100% Free</span></div>
          </div>
        </div>
      </section>

      {/* EXERCISES */}
      <section className="lnd-section" style={{background:'var(--bg)',borderTop:'1px solid var(--border)'}}>
        <div className="lnd-s-inner">
          <div className="lnd-games-head">
            <div><div className="lnd-eye">Exercises</div><h2 className="lnd-h2">Start training now.</h2></div>
            <Link to="/training" className="btn-glass">View all 17 →</Link>
          </div>
          <div className="lnd-games-grid">
            {[
              {cat:'Logic',name:'Number Series',desc:'Identify patterns in number sequences'},
              {cat:'IQ',name:'Matrix Puzzle',desc:'Solve visual analogies and patterns'},
              {cat:'Memory',name:'Dual N-Back',desc:'The gold standard for working memory'},
              {cat:'Math',name:'Speed Math',desc:'Push your arithmetic reaction speed'},
              {cat:'Focus',name:'Schulte Tables',desc:'Train peripheral vision and attention'},
              {cat:'IQ',name:'Ravens Matrices',desc:'Abstract reasoning, fluid intelligence'},
              {cat:'Memory',name:'Chimp Test',desc:'Beat the chimp at visual memory'},
              {cat:'Logic',name:'Syllogisms',desc:'Master logical deduction'},
            ].map(g => (
              <Link key={g.name} to="/training" className="lnd-g-card">
                <div className="lnd-g-cat">{g.cat}</div>
                <div className="lnd-g-name">{g.name}</div>
                <div className="lnd-g-desc">{g.desc}</div>
                <span className="lnd-g-arr">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EVERY DOMAIN */}
      <div>
        <div className="lnd-split-compact">
          <div className="lnd-split-content left">
            <div className="lnd-eye fade-up">17 Modules</div>
            <h2 className="lnd-h2 fade-up" style={{transitionDelay:'0.1s'}}>Every domain.<br/><span className="muted">One platform.</span></h2>
            <p className="lnd-sub fade-up" style={{transitionDelay:'0.2s'}}>From number series to neural pattern recognition — every cognitive domain that matters.</p>
          </div>
          <div className="lnd-split-img">
            <img src="/neuro-picture.jpg" alt="Neural connections" style={{objectPosition:'center top'}} />
          </div>
        </div>
      </div>

      {/* IQ TEST */}
      <div className="lnd-iq-wrap">
        <div className="lnd-iq-img">
          <img src="/pic2.jpg" alt="Brain IQ" />
        </div>
        <div className="lnd-iq-content">
          <div className="lnd-eye">IQ Test</div>
          <h2 className="lnd-h2">Find out where<br/><span className="muted">you stand.</span></h2>
          <p className="lnd-sub">15 questions. Logic, math, pattern recognition. Instant results and breakdown.</p>
          <div className="lnd-iq-kpis">
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v blue" data-count="127">0</div><div className="lnd-iq-kpi-l">IQ Score</div></div>
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v" data-count="84" data-suffix="%">0%</div><div className="lnd-iq-kpi-l">Logic</div></div>
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v" data-count="76" data-suffix="%">0%</div><div className="lnd-iq-kpi-l">Patterns</div></div>
          </div>
          <Link to="/iq-test" className="btn-fill" style={{alignSelf:'flex-start',marginTop:'8px'}}>Take the IQ Test →</Link>
        </div>
      </div>

      {/* CTA */}
      <section className="lnd-cta">
        <div className="lnd-cta-glow" />
        <div className="lnd-cta-inner">
          <div className="lnd-cta-eye">Your potential is untapped.</div>
          <div className="lnd-cta-h">Prove it.<span className="dim">Start now.</span></div>
          <div className="lnd-cta-acts">
            <Link to="/training" className="btn-fill">Start Training →</Link>
            <Link to="/iq-test" className="btn-glass">Take IQ Test</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. The landing page should match `homepage-v4a.html` at `http://localhost:50573/files/homepage-v4a.html`:
- Dark background, brain image on right fading into black
- Stats bar, marquee, split sections, bento grid, game cards
- Scroll down — bars animate in, IQ KPIs count up

- [ ] **Step 4: Commit**

```bash
git add src/pages/Landing.jsx src/pages/Landing.css
git commit -m "feat: redesign Landing page — dark hero, brain image, bento grid, scroll animations"
```

---

## Task 6: Rewrite Dashboard

**Files:**
- Modify: `src/pages/Dashboard.jsx` (targeted JSX edits only)
- Modify: `src/pages/Dashboard.css` (full rewrite)

Reference mockup: `dashboard-v1.html`

- [ ] **Step 1: Rewrite `src/pages/Dashboard.css`**

```css
/* ═══════════════════════════════════════════════════════════════
   IQLab — Dashboard v5
   Dark theme. Bento layout. No emojis.
   ═══════════════════════════════════════════════════════════════ */

.db-page { padding-top: 66px; }
.db-inner { max-width: 1200px; margin: 0 auto; padding: 48px 56px 80px; }

/* Header */
.db-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
.db-header-left h1 { font-size: clamp(24px,2.5vw,36px); font-weight: 800; letter-spacing: -0.03em; }
.db-header-sub { font-size: 12px; color: var(--gray2); margin-top: 4px; font-weight: 300; }
.db-header-cta {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; padding: 12px 24px; border-radius: 100px;
  background: var(--white); color: var(--bg); text-decoration: none;
}

/* Bento row helpers */
.db-row { display: grid; gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 1px; }
.db-row-4 { grid-template-columns: repeat(4,1fr); }
.db-row-3 { grid-template-columns: 2fr 1.2fr 1fr; }
.db-row-2 { grid-template-columns: 1fr 1fr; }
.db-full { border: 1px solid var(--border); margin-bottom: 1px; }

/* Card */
.db-card { background: var(--bg3); padding: 28px; }
.db-card-title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 14px;
  display: flex; align-items: center; gap: 7px;
}
.db-card-title svg { stroke: var(--accent); }

/* ── KPI Strip ── */
.db-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 1px; }
.db-kpi { background: var(--bg3); padding: 28px; }
.db-kpi-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray3); margin-bottom: 8px; }
.db-kpi-value { font-family: var(--mono); font-size: 34px; font-weight: 900; color: var(--white); letter-spacing: -0.04em; line-height: 1; }
.db-kpi-value.accent { color: var(--accent); }
.db-kpi-sub { font-size: 11px; color: var(--gray4); margin-top: 6px; }

/* ── Row 2 (IQ + Streak + Condition) ── */
.db-row2 { display: grid; grid-template-columns: 2fr 1.2fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 1px; }
.db-row2-iq { background: var(--bg3); padding: 28px; }
.db-row2-streak { background: var(--bg3); padding: 28px; }
.db-row2-checkin { background: var(--bg3); padding: 28px; }

/* IQ Gauge + potential bars */
.db-iq-gauge-row { display: flex; align-items: center; gap: 20px; }
.db-potential-bars { display: flex; flex-direction: column; gap: 11px; margin-top: 4px; flex: 1; }
.db-potential-row { display: flex; align-items: center; gap: 10px; }
.db-potential-label { font-size: 11px; color: var(--gray3); width: 68px; flex-shrink: 0; }
.db-potential-track { flex: 1; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; }
.db-potential-fill { height: 100%; background: var(--accent); border-radius: 1px; }
.db-potential-pct { font-family: var(--mono); font-size: 10px; color: var(--gray4); width: 28px; text-align: right; }
.db-potential-summary { font-size: 10px; color: var(--gray4); margin-top: 8px; }

/* Streak calendar */
.db-streak-big-row { display: flex; align-items: baseline; gap: 8px; margin: 8px 0; }
.db-streak-big { font-family: var(--mono); font-size: 42px; font-weight: 900; letter-spacing: -0.04em; }
.db-streak-label { font-size: 12px; color: var(--gray4); }
.db-streak-cal { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin: 12px 0; }
.db-streak-dot { height: 10px; border-radius: 2px; background: rgba(255,255,255,0.05); }
.db-streak-dot--active { background: var(--accent); opacity: 0.85; }
.db-streak-total { font-size: 11px; color: var(--gray4); }

/* Condition check-in */
.db-checkin-group { margin-bottom: 16px; }
.db-checkin-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
label.db-checkin-lbl { font-size: 12px; color: var(--gray2); }
.db-checkin-val { font-family: var(--mono); font-size: 12px; color: var(--accent); }
.db-slider {
  width: 100%; -webkit-appearance: none; height: 2px;
  background: rgba(255,255,255,0.07); border-radius: 1px; outline: none; cursor: pointer;
}
.db-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); cursor: pointer; }
.db-checkin-summary { font-size: 11px; color: var(--gray4); line-height: 1.6; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }

/* ── Performance chart (Row 3) ── */
.db-row3 { border: 1px solid var(--border); margin-bottom: 1px; }
.db-chart-card { background: var(--bg3); padding: 28px 32px; }
.db-chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.db-chart-sub { font-size: 11px; color: var(--gray4); margin-top: 4px; }
.db-stamina-block { text-align: right; }
.db-stamina-label { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray3); margin-bottom: 6px; }
.db-stamina-bar-wrap { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.db-stamina-bar-track { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; min-width: 80px; }
.db-stamina-bar-fill { height: 100%; background: var(--accent); border-radius: 1px; }
.db-stamina-pct { font-family: var(--mono); font-size: 10px; color: var(--gray4); }
.db-stamina-note { font-size: 10px; color: var(--gray3); margin-top: 4px; }
.db-chart-wrap { overflow: hidden; }

/* ── Heatmap (Row 4 left) ── */
.db-heatmap-grid { display: grid; grid-template-columns: repeat(24,1fr); gap: 3px; margin-top: 12px; }
.db-hm-cell { height: 28px; border-radius: 2px; cursor: default; }
.db-hm-hours { display: grid; grid-template-columns: repeat(24,1fr); gap: 3px; margin-top: 3px; }
.db-hm-hour { font-size: 8px; color: var(--gray3); text-align: center; }

/* ── Recent sessions (Row 4 right) ── */
.db-session-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.db-session-item { background: var(--bg3); padding: 14px 20px; display: flex; align-items: center; gap: 14px; cursor: default; transition: background 0.15s; }
.db-session-item:hover { background: var(--bg4); }
.db-session-icon {
  width: 30px; height: 30px; border-radius: 4px; flex-shrink: 0;
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12);
  display: flex; align-items: center; justify-content: center;
}
.db-session-icon svg { width: 13px; height: 13px; stroke: var(--accent); fill: none; stroke-width: 1.5; stroke-linecap: round; }
.db-session-name { font-size: 12px; font-weight: 600; color: var(--white); }
.db-session-cat { font-size: 9px; color: var(--gray3); margin-top: 1px; text-transform: uppercase; letter-spacing: 0.1em; }
.db-session-score { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent); margin-left: auto; }
.db-session-time { font-size: 10px; color: var(--gray3); margin-left: 14px; }

/* ── Exercise scores (Row 5 left) ── */
.db-ex-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.db-ex-row { display: flex; align-items: center; gap: 10px; }
.db-ex-lbl { font-size: 11px; color: var(--gray4); width: 118px; flex-shrink: 0; }
.db-ex-track { flex: 1; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; }
.db-ex-fill { height: 100%; background: rgba(59,130,246,0.4); border-radius: 1px; }
.db-ex-val { font-family: var(--mono); font-size: 10px; color: var(--gray4); width: 24px; text-align: right; }

/* ── Leaderboard (Row 5 right) ── */
.db-lb-header { padding: 24px 22px 14px; display: flex; justify-content: space-between; align-items: center; }
.db-lb-rank-badge { font-family: var(--mono); font-size: 10px; color: var(--accent); }
.db-lb-table { width: 100%; border-collapse: collapse; }
.db-lb-table th { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray3); padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.db-lb-table td { font-size: 12px; color: var(--white); padding: 11px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); font-family: var(--mono); }
.db-lb-table tr:last-child td { border-bottom: none; }
.db-lb-table tr.db-lb-me td { background: rgba(59,130,246,0.06); color: var(--accent); }
.db-lb-table tr:hover:not(.db-lb-me) td { background: rgba(255,255,255,0.02); }
.db-lb-rank-dim { color: var(--gray3); }
.db-lb-rank-bright { color: var(--white); font-weight: 700; }
.db-lb-ch-up { color: rgba(255,255,255,0.28); font-size: 10px; }
.db-lb-ch-dn { color: rgba(255,255,255,0.18); font-size: 10px; }
.db-lb-ch-flat { color: var(--gray3); font-size: 10px; }
```

- [ ] **Step 2: Edit `src/pages/Dashboard.jsx` — fix IQ gauge, remove emoji, fix KPI colors**

Find and make the following targeted changes:

**2a. Fix the IQ Gauge SVG** — replace the `IQ_GAUGE` component:

```jsx
const IQ_GAUGE = ({ iq }) => {
  const pct = Math.min(1, iq / 160);
  // 270° arc: start 135°, end 45° (clockwise). cx=100, cy=95, r=72
  // Start point (135°): cos=-0.707, sin=0.707 → (49.1, 145.9)
  // End point (45°):    cos=0.707,  sin=0.707 → (150.9, 145.9)
  const cx = 100, cy = 95, r = 72;
  const startAngle = 135 * Math.PI / 180;
  const fillAngleDeg = 135 + 270 * pct;
  const fillAngle = fillAngleDeg * Math.PI / 180;
  const fx = cx + r * Math.cos(fillAngle);
  const fy = cy + r * Math.sin(fillAngle);
  const largeArc = 270 * pct > 180 ? 1 : 0;
  return (
    <svg viewBox="0 0 200 160" width="180" height="144">
      <path d="M 49.1,145.9 A 72,72 0 1 1 150.9,145.9"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" strokeLinecap="round"/>
      <path d={`M 49.1,145.9 A 72,72 0 ${largeArc} 1 ${fx.toFixed(1)},${fy.toFixed(1)}`}
        fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round"/>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--white)"
        fontSize="34" fontWeight="900" fontFamily="var(--mono)">{iq}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--gray3)"
        fontSize="9" letterSpacing="2.5" fontFamily="var(--font)">IQ SCORE</text>
    </svg>
  );
};
```

**2b. Fix KPI strip** — find the `db-kpi-grid` JSX block and update `className` on the KPI values:
- ELO value: add `className="db-kpi-value accent"`
- Accuracy value: add `className="db-kpi-value accent"`
- Activity (streak) value: `className="db-kpi-value"` (no color, no emoji — remove any `🔥`)
- Points value: `className="db-kpi-value"` (no color)

**2c. Remove streak emoji** — find any `🔥` in Dashboard.jsx and delete it.

**2d. Leaderboard Δ column** — find the leaderboard rows and replace `style={{color:'var(--green)'}}` or similar color styles with:
- Up: `className="db-lb-ch-up"`
- Down: `className="db-lb-ch-dn"`
- Flat: `className="db-lb-ch-flat"`

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/dashboard`. Compare to `http://localhost:50573/files/dashboard-v1.html`:
- IQ gauge arc draws correctly at 70% fill
- No emoji on streak
- Accuracy and ELO both in blue (not green)
- Leaderboard Δ column in muted white

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx src/pages/Dashboard.css
git commit -m "feat: redesign Dashboard — dark bento layout, fixed IQ gauge, blue KPIs"
```

---

## Task 7: Rewrite Training page styles

**Files:**
- Modify: `src/pages/Training.css` (full rewrite)
- Note: `Training.jsx` logic is NOT changed. Only CSS class names are updated where the new CSS uses different class names than the old.

Reference mockup: `training-v1.html`

- [ ] **Step 1: Rewrite `src/pages/Training.css`**

```css
/* ═══════════════════════════════════════════════════════════════
   IQLab — Training Page v5
   Dark theme. Two-column layout: sidebar + game grid.
   ═══════════════════════════════════════════════════════════════ */

.training-page { padding-top: 66px; min-height: 100vh; }
.tr-inner { max-width: 100%; }

/* Two-column layout */
.tr-layout { display: grid; grid-template-columns: 244px 1fr; min-height: calc(100vh - 66px); }

/* Header */
.tr-header { padding: 36px 40px 0; max-width: calc(100% - 244px); margin-left: 244px; }
.tr-header h2 { font-size: clamp(22px,2.2vw,32px); font-weight: 800; letter-spacing: -0.03em; }
.tr-header-sub { font-size: 12px; color: var(--gray2); font-weight: 300; margin-top: 2px; }

/* ── SIDEBAR ── */
.tr-sidebar {
  background: var(--bg2); border-right: 1px solid var(--border);
  padding: 32px 22px; position: sticky; top: 66px;
  height: calc(100vh - 66px); overflow-y: auto;
}
.tr-sidebar-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray3); margin-bottom: 10px; }
.tr-sidebar-divider { height: 1px; background: var(--border); margin: 22px 0; }
.tr-sidebar-section { margin-bottom: 24px; }

/* Quick play buttons */
.tr-sidebar-mode-btn {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 12px; background: var(--bg3); border: 1px solid var(--border);
  color: var(--white); font-size: 12px; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s, background 0.15s; text-align: left; margin-bottom: 6px;
}
.tr-sidebar-mode-btn:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); background: var(--bg4); }
.tr-sidebar-mode-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tr-sidebar-modes { display: flex; flex-direction: column; gap: 0; }
.tr-sidebar-mode-icon {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12); border-radius: 4px; flex-shrink: 0;
}
.tr-soon-tag { margin-left: auto; font-size: 8px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray3); border: 1px solid var(--gray3); padding: 2px 6px; border-radius: 2px; }

/* Session row (Sets + Time) */
.tr-sidebar-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tr-sidebar-field-label { font-size: 12px; color: var(--gray2); }
.tr-sidebar-select {
  font-family: var(--mono); font-size: 11px; color: var(--white);
  background: var(--bg3); border: 1px solid var(--border);
  padding: 5px 8px; cursor: pointer; outline: none;
  -webkit-appearance: none; border-radius: 2px;
}
.tr-sidebar-select--full {
  width: 100%; font-family: var(--font); font-size: 12px; color: var(--white);
  background: var(--bg3); border: 1px solid var(--border);
  padding: 8px 10px; cursor: pointer; outline: none;
  -webkit-appearance: none; border-radius: 2px; margin-top: 4px;
}

/* Timed / Zen toggle */
.tr-sidebar-toggle-row { display: flex; gap: 6px; margin-top: 8px; }
.tr-sidebar-toggle {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; font-weight: 600; padding: 8px 10px;
  background: var(--bg3); border: 1px solid var(--border); cursor: pointer;
  color: var(--gray2); font-family: var(--font); transition: all 0.15s; border-radius: 2px;
}
.tr-sidebar-toggle.active { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.35); color: var(--accent); }

/* Difficulty pills */
.tr-sidebar-section .diff-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }

/* ── MAIN AREA ── */
.tr-main { padding: 36px 40px 60px; }

/* Category tabs */
.tr-cat-tabs { display: flex; gap: 6px; margin: 24px 0 0; flex-wrap: wrap; }
.tr-cat-tab {
  font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 100px;
  border: 1px solid var(--border); background: transparent; color: var(--gray2);
  cursor: pointer; font-family: var(--font); transition: all 0.15s;
}
.tr-cat-tab.active { background: var(--white); color: var(--bg); border-color: var(--white); }
.tr-cat-tab:hover:not(.active) { border-color: rgba(255,255,255,0.2); color: var(--white); }

/* Section labels */
.tr-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray3); margin: 28px 0 14px; }
.tr-empty { font-size: 13px; color: var(--gray2); padding: 40px 0; }

/* Game grid */
.tr-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.tr-card { background: var(--bg3); padding: 20px 18px 32px; cursor: pointer; transition: background 0.15s; position: relative; }
.tr-card:hover { background: var(--bg4); }

/* Card top row */
.tr-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.tr-card-icon {
  width: 32px; height: 32px; border-radius: 5px; flex-shrink: 0;
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12);
  display: flex; align-items: center; justify-content: center;
}
.tr-card-icon svg { display: block; }

/* High-score chip */
.train-hs-chip {
  display: flex; align-items: center; gap: 4px;
  font-family: var(--mono); font-size: 10px; color: var(--orange);
  background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2);
  padding: 3px 7px; border-radius: 2px; white-space: nowrap;
}

/* Card text */
.tr-card-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; color: var(--accent); text-transform: uppercase; margin-bottom: 5px; }
.tr-card-title { font-size: 13px; font-weight: 700; color: var(--white); margin-bottom: 5px; }
.tr-card-desc { font-size: 11px; color: var(--gray2); line-height: 1.55; font-weight: 300; }

/* ── GAME IMMERSIVE (active game) ── */
.game-immersive { display: flex; flex-direction: column; min-height: calc(100vh - 66px); }
.session-bar {
  padding: 12px 40px; display: flex; align-items: center; gap: 12px;
  background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.session-bar-info { display: flex; gap: 10px; align-items: center; margin-left: auto; }
.session-sets-pill, .session-timer-pill {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; font-family: var(--mono);
  padding: 5px 12px; border-radius: 100px;
  background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: var(--accent);
}
.session-timer-pill.warn { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.2); color: var(--orange); }
.session-timer-pill.danger { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: var(--red); }
.game-frame-large { flex: 1; display: flex; flex-direction: column; padding: 32px 40px; }
```

- [ ] **Step 2: Fix difficulty pills container in `src/pages/Training.jsx`**

The difficulty pills in the current JSX use an inline `style={{...}}` on the wrapper `div`, which means the `.diff-pills` CSS rule cannot apply. Replace the inline-style wrapper with a class:

Find this block (around line 347):
```jsx
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
  {['Easy', 'Medium', 'Hard', 'Really Hard'].map(d => {
```

Replace with:
```jsx
<div className="diff-pills">
  {['Easy', 'Medium', 'Hard', 'Really Hard'].map(d => {
```

Also remove the inline `style={{...}}` from each pill button — the button styling will be handled by the CSS rule:
```css
.tr-sidebar-section .diff-pills button { ... }
```

Add this CSS to `Training.css` (append after `.diff-pills`):
```css
.tr-sidebar-section .diff-pills button {
  padding: 4px 10px; border-radius: 999px; font-size: 12px;
  background: var(--bg3); color: var(--gray2);
  border: 1px solid var(--border);
  cursor: pointer; font-family: var(--font);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.tr-sidebar-section .diff-pills button.active {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
```

Note: the `active` class on each pill button is set by `Training.jsx` via `difficulty === val`. No logic change — only replacing inline styles with a className.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/training`. Compare to `http://localhost:50573/files/training-v1.html`:
- Dark sidebar on left with all settings visible
- Category filter tabs at top of main area
- Two game grid sections (Available + Advanced)
- High-score chips on game cards
- Difficulty pills (Easy/Medium/Hard/Really Hard) styled correctly

- [ ] **Step 4: Commit**

```bash
git add src/pages/Training.jsx src/pages/Training.css
git commit -m "feat: redesign Training page — dark sidebar layout, game grid, category tabs"
```

---

## Task 8: Rewrite IQ Test page styles

**Files:**
- Modify: `src/pages/IQTest.css` (full rewrite)
- Minor edits to `src/pages/IQTest.jsx` for CSS class names (intro/test/result structure)

Reference mockup: `iqtest-v1.html`

- [ ] **Step 1: Rewrite `src/pages/IQTest.css`**

```css
/* ═══════════════════════════════════════════════════════════════
   IQLab — IQ Test Page v5
   Dark theme. Three phases: intro / test / result.
   ═══════════════════════════════════════════════════════════════ */

/* ─── INTRO ─────────────────────────────────────────────── */
.iq-intro {
  min-height: calc(100vh - 66px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 40px 32px;
  position: relative;
}
.iq-intro-glow {
  position: absolute; width: 600px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
}
.iq-intro-inner { position: relative; z-index: 2; max-width: 600px; }
.iq-intro-eye { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; }
.iq-intro-title { font-size: clamp(44px,6vw,72px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 20px; }
.iq-intro-title .dim { display: block; color: var(--gray3); }
.iq-intro-desc { font-size: 15px; color: var(--gray2); line-height: 1.75; font-weight: 300; margin-bottom: 16px; }
.iq-intro-meta { display: flex; gap: 28px; justify-content: center; margin-bottom: 44px; flex-wrap: wrap; }
.iq-intro-stat-v { font-family: var(--mono); font-size: 28px; font-weight: 900; color: var(--white); }
.iq-intro-stat-l { font-size: 10px; color: var(--gray3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
.iq-intro-btns { display: flex; gap: 12px; justify-content: center; }

/* ─── TEST PHASE ─────────────────────────────────────────── */
.iq-test-wrap {
  min-height: calc(100vh - 66px);
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 32px 60px;
}
.iq-test-inner { width: 100%; max-width: 680px; }

/* Progress bar */
.iq-progress { margin-bottom: 40px; }
.iq-progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.iq-progress-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); }
.iq-progress-num { font-family: var(--mono); font-size: 11px; color: var(--gray3); }
.iq-progress-track { height: 2px; background: rgba(255,255,255,0.06); border-radius: 1px; }
.iq-progress-fill { height: 100%; background: var(--accent); border-radius: 1px; transition: width 0.4s ease; }

/* Question card */
.iq-q-card { background: var(--bg3); border: 1px solid var(--border); padding: 44px; margin-bottom: 20px; }
.iq-q-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray3); margin-bottom: 20px; }
.iq-q-text { font-size: 20px; font-weight: 700; line-height: 1.4; letter-spacing: -0.01em; }
.iq-q-seq { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--accent); letter-spacing: 0.08em; margin-top: 16px; }

/* Answer buttons */
.iq-answers { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.iq-ans-btn {
  background: var(--bg3); border: 1px solid var(--border);
  padding: 16px 20px; cursor: pointer; text-align: left;
  display: flex; align-items: center; gap: 14px;
  transition: background 0.15s, border-color 0.15s;
}
.iq-ans-btn:hover:not(:disabled) { background: var(--bg4); border-color: rgba(255,255,255,0.15); }
.iq-ans-btn.correct { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); }
.iq-ans-btn.wrong { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); }
.iq-ans-btn.selected { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.4); }
.iq-ans-letter { font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--gray3); width: 20px; flex-shrink: 0; }
.iq-ans-text { font-size: 14px; font-weight: 600; color: var(--white); }

/* Explanation */
.iq-explanation { background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15); padding: 16px 20px; margin-top: 8px; }
.iq-expl-label { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
.iq-expl-text { font-size: 13px; color: var(--gray2); line-height: 1.65; font-weight: 300; }

/* ─── RESULT ─────────────────────────────────────────────── */
.iq-result-wrap {
  min-height: calc(100vh - 66px);
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 32px 80px; position: relative;
}
.iq-result-glow {
  position: absolute; width: 700px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%);
  top: 40%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
}
.iq-result-inner { width: 100%; max-width: 720px; position: relative; z-index: 2; }
.iq-result-header { text-align: center; margin-bottom: 48px; }
.iq-result-eye { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
.iq-result-num { font-family: var(--mono); font-size: clamp(72px,12vw,120px); font-weight: 900; letter-spacing: -0.06em; color: var(--white); line-height: 1; }
.iq-result-num-lbl { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray3); margin-top: 8px; }
.iq-result-desc { font-size: 16px; color: var(--gray2); margin-top: 16px; font-weight: 300; max-width: 400px; margin-left: auto; margin-right: auto; }

/* Score KPI strip */
.iq-result-kpis { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 1px; }
.iq-result-kpi { background: var(--bg3); padding: 20px; text-align: center; }
.iq-result-kpi-v { font-family: var(--mono); font-size: 28px; font-weight: 900; letter-spacing: -0.04em; }
.iq-result-kpi-v.accent { color: var(--accent); }
.iq-result-kpi-v.green { color: var(--green); }
.iq-result-kpi-l { font-size: 9px; color: var(--gray3); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }

/* Breakdown + range grid */
.iq-result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.iq-result-card { background: var(--bg3); padding: 28px; }
.iq-result-card-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray3); margin-bottom: 12px; }
.iq-result-card-title { font-size: 15px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; }
.iq-result-bars { display: flex; flex-direction: column; gap: 13px; }
.iq-result-bar-row { display: flex; align-items: center; gap: 10px; }
.iq-result-bar-lbl { font-size: 11px; color: var(--gray3); width: 90px; flex-shrink: 0; }
.iq-result-bar-track { flex: 1; height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; }
.iq-result-bar-fill { height: 100%; border-radius: 1px; transition: width 1s cubic-bezier(0.16,1,0.3,1); }
.iq-result-bar-fill.blue { background: var(--accent); }
.iq-result-bar-fill.green { background: var(--green); }
.iq-result-bar-fill.purple { background: var(--purple); }
.iq-result-bar-val { font-family: var(--mono); font-size: 10px; color: var(--gray4); width: 28px; text-align: right; }

.iq-result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }

/* ─── IQ RANGE REFERENCE PANEL ─────────────────────────── */
.iq-range-panel { margin-top: 1px; background: var(--bg3); border: 1px solid var(--border); padding: 28px; border-top: none; }
.iq-range-panel-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray3); margin-bottom: 16px; }
.iq-range-rows { display: flex; flex-direction: column; gap: 0; }
.iq-range-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 12px; color: var(--gray2); transition: background 0.15s;
}
.iq-range-row:last-child { border-bottom: none; }
.iq-range-row.current { background: rgba(59,130,246,0.07); color: var(--white); border-left: 2px solid var(--accent); }
.iq-range-score { font-family: var(--mono); font-size: 11px; color: var(--gray3); width: 60px; flex-shrink: 0; }
.iq-range-label { flex: 1; }
```

- [ ] **Step 2: Update `src/pages/IQTest.jsx` — class names and count-up animation**

The current IQTest.jsx uses old class names that differ from the new CSS. Make the following targeted changes (logic unchanged):

**2a. Intro phase wrapper** — the outer structure uses `className="container"` then `className="iq-intro"`. Update the `iq-intro` div to use the new layout class:
```jsx
// existing:
<div className="container" style={{ paddingTop: 90 }}>
  <div className="iq-intro">
// change to:
<div className="iq-intro">
  <div className="iq-intro-glow" />
  <div className="iq-intro-inner">
```
(Add matching closing `</div>` for `iq-intro-inner` before the closing `iq-intro` div.)

**2b. Result phase class names** — the result phase uses old class names. Update only `className` attributes (not logic):

| Old `className` | New `className` |
|---|---|
| `iq-result` | `iq-result-wrap` |
| `big-score` | `iq-result-num` |
| `score-label` | `iq-result-num-lbl` |
| `score-desc` | `iq-result-desc` |
| `iq-breakdown` | `iq-result-bars` |
| `iq-bd` | `iq-result-bar-row` |
| `bd-val` | `iq-result-bar-val` |
| `bd-lbl` | `iq-result-bar-lbl` |

**2c. Result count-up animation** — add a `useRef` and `useEffect` at the **top level of the `IQTest` component function**, alongside the existing hooks (`useState`, etc.) — NOT inside any conditional block. React's Rules of Hooks require all hooks to be unconditional; the guard inside the effect (`if (phase !== 'result' || !result) return;`) handles the conditional logic safely.

```jsx
// Add at the TOP of the IQTest component (alongside existing useState hooks):
const iqNumRef = useRef(null);
useEffect(() => {
  if (phase !== 'result' || !result) return;
  const el = iqNumRef.current;
  if (!el) return;
  const target = result.iq;
  const duration = 1600;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOut(p) * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}, [phase, result]);
```

Then in the result phase JSX, add `ref={iqNumRef}` to the `iq-result-num` element and initialize to `0`:
```jsx
<div className="iq-result-num" ref={iqNumRef}>0</div>
```
(Remove `{result.iq}` — the animation fills in the number.)

**2d. IQ range reference panel** — add after the `iq-result-grid` closing div, inside `iq-result-inner`:

```jsx
<div className="iq-range-panel">
  <div className="iq-range-panel-lbl">IQ Reference Range</div>
  <div className="iq-range-rows">
    {[
      { range: '130+', label: 'Very Superior' },
      { range: '120–129', label: 'Superior' },
      { range: '110–119', label: 'High Average' },
      { range: '90–109', label: 'Average' },
      { range: '80–89', label: 'Low Average' },
      { range: '<80', label: 'Below Average' },
    ].map(tier => {
      const n = result.iq;
      const isCurrent =
        (tier.range === '130+' && n >= 130) ||
        (tier.range === '120–129' && n >= 120 && n < 130) ||
        (tier.range === '110–119' && n >= 110 && n < 120) ||
        (tier.range === '90–109' && n >= 90 && n < 110) ||
        (tier.range === '80–89' && n >= 80 && n < 90) ||
        (tier.range === '<80' && n < 80);
      return (
        <div key={tier.range} className={`iq-range-row${isCurrent ? ' current' : ''}`}>
          <span className="iq-range-score">{tier.range}</span>
          <span className="iq-range-label">{tier.label}</span>
        </div>
      );
    })}
  </div>
</div>
```

**2e. Question card wrapper** — the test phase uses `className="game-frame"`. Add `iq-q-card` to the question card inner div, and use `iq-ans-btn` for answer buttons. Keep the existing `correct`/`wrong` conditional classes — they already match the new CSS.

Also make sure `iq-progress-fill` style sets `width` dynamically: `style={{ width: \`${((qi) / questions.length) * 100}%\` }}`.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/iq-test`. Check:
- Intro: dark background, large "IQ Test / How sharp are you?" heading, 3 stats, two buttons
- Click Start Test → question card with blue progress bar, 4 answer options in 2×2 grid, explanation on wrong answer
- Complete test → result with large IQ number that counts up from 0 over 1.6s, bar breakdown, IQ range reference panel highlighting user's tier

Compare to `http://localhost:50573/files/iqtest-v1.html`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/IQTest.jsx src/pages/IQTest.css
git commit -m "feat: redesign IQ Test page — dark phases, count-up result, category breakdown bars, IQ range panel"
```

---

## Task 9: Final cross-page check and cleanup

- [ ] **Step 1: Check all 4 pages load without console errors**

Visit: `/`, `/dashboard`, `/training`, `/iq-test`

Check browser DevTools console — no React errors, no missing CSS variable warnings, no 404s.

- [ ] **Step 2: Check images load**

On the Landing page: hero brain image, pic6 split, neuro-picture split, pic2 IQ section all display correctly (no broken image icons).

- [ ] **Step 3: Check V2 pages are unaffected**

Visit `/v2`, `/v2/dashboard`, `/v2/training`. They should look exactly as before (V2 CSS is separate).

- [ ] **Step 4: Check nav version toggle**

Click V1 / V2 toggle in navbar — should switch between routes correctly. The toggle styling uses `.nav-version-btn.active` with `var(--accent)` = blue now.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup — verify all pages, V2 unaffected"
```

---

## Quick Reference

| Page | Route | Mockup URL |
|------|-------|-----------|
| Landing | `/` | `http://localhost:50573/files/homepage-v4a.html` |
| Dashboard | `/dashboard` | `http://localhost:50573/files/dashboard-v1.html` |
| Training | `/training` | `http://localhost:50573/files/training-v1.html` |
| IQ Test | `/iq-test` | `http://localhost:50573/files/iqtest-v1.html` |
| Dev server | `http://localhost:5173` | — |
