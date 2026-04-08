# IQLab Frontend Redesign — Design Spec
**Date:** 2026-03-21
**Status:** Approved by user
**Mockups:** `.superpowers/brainstorm/3302-1774109716/`

---

## 1. Design Language

### Palette
Replace the current light-grey/rose system entirely.

| Token | Value | Usage |
|-------|-------|-------|
| `--black` | `#060606` | page background |
| `--dark` | `#0e0e0e` | section backgrounds, sidebar |
| `--dark2` | `#141414` | cards, bento cells |
| `--dark3` | `#1c1c1c` | hover states |
| `--border` | `rgba(255,255,255,0.07)` | all dividers and grid gaps |
| `--white` | `#ffffff` | primary text |
| `--gray2` | `#888888` | secondary text |
| `--gray3` | `#3a3a3a` | tertiary text, labels |
| `--gray4` | `#555555` | muted text (global token, used in Dashboard/Training/Landing) |
| `--blue` | `#3b82f6` | accent (replaces rose) |
| `--green` | `#22c55e` | positive indicators only |
| `--orange` | `#f97316` | high-score chips (global token, Training + future) |
| `--purple` | `#a78bfa` | IQ Test result pattern bar, Training special mode cards |
| `--red` | `#ef4444` | IQ Test wrong-answer highlight |
| `--mono` | `'JetBrains Mono', monospace` | keep as-is |
| `--font` | `'Inter', system-ui, sans-serif` | replace 'Outfit' |

### Typography
- Replace `Outfit` with `Inter` as the display/body font
- Keep `JetBrains Mono` for all numeric stats, IQ scores, ELO, timestamps
- Add Google Fonts import: `Inter:wght@300;400;500;600;700;800;900`

### Spacing & Shape
- Remove all `border-radius` ≥ 14px from layout containers — use sharp or near-sharp edges (2–4px max for cards)
- Buttons: pill shape (`border-radius: 100px`) only on CTAs and pill filters
- Bento grids: `gap: 1px; background: var(--border)` — the 1px gap IS the border
- No box-shadows on cards; depth is handled by background color difference only
- Section transitions: gradient overlays (`linear-gradient` to `var(--black)`) instead of hard borders between sections on the landing page

---

## 2. Shared Components

### Navbar (`src/components/Navbar.jsx` + `Navbar.css`)
- `position: fixed; height: 66px`
- `background: rgba(6,6,6,0.55); backdrop-filter: blur(20px)` on Landing page (hero beneath is dark, nav can be more transparent)
- `background: rgba(6,6,6,0.75); backdrop-filter: blur(20px)` on Dashboard, Training, IQ Test
- `border-bottom: 1px solid var(--border)`
- Logo: uppercase, `letter-spacing: 0.2em`, 13px, weight 800
- Links: 13px, `var(--gray2)`, active = `var(--white)`
- CTA button: pill shape, white fill, black text

### Scroll Animations
- All elements with class `fade-up` start at `opacity:0; transform:translateY(32px)`
- `IntersectionObserver` with `threshold: 0.12` adds `.visible` class → `opacity:1; transform:none`
- Stagger via `transition-delay` on siblings
- **Cleanup:** call `observer.disconnect()` in `useEffect` cleanup function on component unmount to prevent memory leaks in the SPA

### Buttons
- `.btn-fill`: `border-radius:100px; background:var(--white); color:var(--black); padding:14px 30px`
- `.btn-glass`: `border-radius:100px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); backdrop-filter:blur(8px)`

---

## 3. Page Specs

### 3.1 Landing Page (`src/pages/Landing.jsx` + `Landing.css`)

**Hero section**
- Full viewport height, dark background
- Brain image (`/neuro picture.jpg` → replaced with `pic5.jpg`) positioned absolutely: `right:0; width:52%; height:92%`
- Image uses `background: url(...) center/cover` with CSS mask: `radial-gradient(ellipse 55% 65% at 60% 50%, black 28%, transparent 70%)`
- Filter: `brightness(0.75) saturate(1.15)`
- Text content centered over image: eyebrow "Sharpen Your Mind. Every Day." + headline "Train Your Mind. / Measure Everything." + two CTA buttons
- `overflow-x: hidden` on both `html` and `body` to prevent grey side gaps

**Stats bar** (below hero)
- 4-column grid: 17 Exercises · 6 Cognitive Domains · 5 min Per Session · Free Always
- Monospace numbers, small uppercase labels

**Marquee**
- Scrolling list of all game names, infinite loop animation (`translateX -50%`)
- Speed: `30s linear infinite`

**Why IQLab — split section**
- Left: `pic6.jpg` with `object-fit:cover` and right-edge gradient fade
- Right: headline + 3 feature items with `01/02/03` monospace numbering

**What You Get — bento grid**
- 3-column bento, `gap:1px`, 5 cards
- Card 01 (spans 2 cols): performance bars with animated fills (`data-w` attributes, width animates from 0 on scroll) + "Live Session Data" pulse dot
- Cards 02–05: IQ Assessment, Marathon Mode, vs Bot, Free Forever

**Exercises section**
- 4-column game card grid, 8 cards shown

**Every Domain / 17 Modules — compact split**
- `min-height: 320px`; text left, `neuro-picture.jpg` right
- Font size reduced: `clamp(26px, 3vw, 40px)`

**IQ Test section — compact**
- `min-height: 360px`; image left (`pic2.jpg`), stats right
- 3 KPI boxes with count-up animation (`data-count` + JS `IntersectionObserver`)

**CTA section**
- Large centered headline "Prove it. / Start now." with subtle blue radial glow

### 3.2 Dashboard (`src/pages/Dashboard.jsx` + `Dashboard.css`)

**Layout:** Full-width page, `max-width: 1200px` centered, `padding: 48px 56px`

**Row 1 — 4 KPIs** (equal columns)
- ELO Rating (blue), Accuracy (blue — not green), Activity streak (white), Total Points (white)

**Row 2 — 3 columns** (`2fr 1.2fr 1fr`)
- Left (2fr): IQ gauge SVG + 3 potential bars (Logic/Math/Memory)
  - Gauge: 270° arc, `cx=100 cy=95 r=72`, start angle 135°, fill proportional to `iq/160`
  - No emoji anywhere
- Middle: 35-day streak calendar (5×7 dot grid, blue = active day)
- Right: Today's Condition — sleep/stress sliders (range inputs), derived condition text

**Row 3 — Full width**
- 12-week performance bar chart (SVG or CSS bars)
- Brain Stamina bar (top-right of card)

**Row 4 — 2 columns**
- Left: Hourly heatmap (24 cells, blue opacity mapped to performance)
- Right: Last 5 sessions list with game icon, name, category, score, time

**Row 5 — 2 columns**
- Left: Per-exercise high score bars (orange star chip + horizontal bar)
- Right: Global leaderboard table — rank, player, country, ELO, Δ column (muted white arrows, no color)

### 3.3 Training (`src/pages/Training.jsx` + `Training.css`)

**Layout:** `grid-template-columns: 244px 1fr`

**Sidebar** (sticky, full height)
- *Quick Play*: Marathon button, vs Bot button, 1v1 Match button (disabled + "Soon" tag)
- *Session*: Sets dropdown (1×/3×/5×/10×), Time limit dropdown (30s/1m/90s/2m/5m/10m/15m), Timed/Zen toggle
- *Difficulty*: pill buttons — Easy / Medium / Hard / Really Hard
- *Series Type*: `<select>` — Mixed / Fibonacci / Exponential / Primes / Alternating Ops / √ & Exponents
- *Help*: `<select>` — No help / Show hint / Step by step / Show answer

**Main area**
- Category tabs: All / Math / Logic / Memory / Speed / IQ / Focus
- Section "Available" (8 basic games): Number Series, Odd One Out, Matrix Puzzle, Estimation, Operator Puzzle, Game 24, Speed Math, Number Memory
- Section "Advanced" (8 games): Dual N-Back, Ravens Matrices, Schulte Tables, Stroop Test, Mental Rotation, Syllogisms, Chimp Test, Algo Thinking
- Section "Special Modes": Marathon Mode, vs Bot (2-col wide cards)
- Each game card: icon (SVG), high-score chip (orange star), category label, name, description, `↗` arrow

**Game active state**
- Controlled by `activeGame` state within `Training.jsx` (existing pattern — do not change routing)
- When `activeGame !== null`: sidebar is hidden (CSS `display:none` or conditional render), game fills full width — this is a CSS/state toggle inside `Training.jsx`, NOT a new route. Route structure in `App.jsx` is frozen.
- Session bar at top: Back button, Set counter pill (if sets > 1), Timer pill (if timed)
- On unmount or Back press: clear `activeGame`, stop session timer (`clearInterval`)

### 3.4 IQ Test (`src/pages/IQTest.jsx` + `IQTest.css`)

Three phases rendered conditionally:

**Intro phase**
- Full-height centered layout with radial blue glow
- Large heading "IQ Test / How sharp are you?"
- 3 meta stats: 15 Questions · ~5 Minutes · 3 Categories
- Two buttons: Start Test (fill) + View result sample (glass) — in production the second is removed

**Test phase**
- Progress bar (thin, `var(--blue)`)
- Question card: category label, question text, optional sequence display (monospace, blue)
- 2×2 answer grid: each button highlights correct (green tint) / wrong (red tint) / selected (blue tint) on lock
- Explanation block slides in on wrong answer

**Result phase**
- Large count-up IQ number (animated on enter, `1600ms` cubic ease-out)
- 3 KPI chips: Correct, Accuracy %, Time taken
- Category breakdown bars (Logic/Math/Patterns) — animated on mount
- IQ range reference panel (highlight user's tier)
- Actions: Retake / Go to Training / Go to Dashboard

---

## 4. Implementation Approach

### Files to modify
| File | Change |
|------|--------|
| `src/styles/variables.css` | Full rewrite — new dark token set |
| `src/styles/global.css` | Update base `body` bg, font import |
| `src/components/Navbar.jsx` + `Navbar.css` | New glassmorphism nav |
| `src/pages/Landing.jsx` + `Landing.css` | Full redesign matching mockup v4a |
| `src/pages/Dashboard.jsx` + `Dashboard.css` | Restyle matching dashboard-v1 mockup |
| `src/pages/Training.jsx` + `Training.css` | Restyle matching training-v1 mockup |
| `src/pages/IQTest.jsx` + `IQTest.css` | Restyle matching iqtest-v1 mockup |

### Do NOT change
- Game logic (`src/games/`)
- Auth system (`src/context/`, `src/lib/`)
- i18n (`src/i18n/`) — keep all `t.` translation keys working
- Route structure (`src/App.jsx`)
- Stats persistence (`src/stats.js`)
- V2 page variants (leave untouched)

### CSS strategy
- `variables.css`: replace all tokens with dark system
- Per-page CSS files: full rewrite (styles are fully decoupled from logic)
- No CSS framework — keep vanilla CSS
- Animations: `IntersectionObserver` in JSX for scroll-triggered effects; CSS `@keyframes` for loops (marquee, pulse)

### Image assets — rename before implementation
The current filenames in `public/` contain spaces which will cause 404s when referenced in JSX/CSS. **Rename these files first:**

| Current filename | Rename to |
|---|---|
| `public/picture 5.jpg` | `public/pic5.jpg` |
| `public/picture 6.jpg` | `public/pic6.jpg` |
| `public/neuro picture.jpg` | `public/neuro-picture.jpg` |
| `public/picture 2.jpg` | `public/pic2.jpg` |

Usage after rename:
- `pic5.jpg` → hero background (Landing)
- `pic6.jpg` → Why IQLab split (Landing)
- `neuro-picture.jpg` → Every Domain split (Landing)
- `pic2.jpg` → IQ Test section (Landing)
- All images: `object-fit: cover`, no grey borders, CSS mask for edge fades on hero

---

### Files that must NOT be touched
`src/App.jsx`, `src/games/` (all files), `src/context/`, `src/lib/`, `src/i18n/`, `src/stats.js`, `src/pages/DashboardV2.jsx`, `src/pages/DashboardV2.css`, `src/pages/LandingV2.jsx`, `src/pages/LandingV2.css`, `src/pages/TrainingV2.jsx`, `src/pages/TrainingV2.css`, `src/pages/Onboarding.jsx`, `src/pages/Login.jsx`

---

## 5. Out of Scope
- New game logic
- Backend/Supabase changes
- Mobile responsive layout (not requested)
- V2 page variants
- Onboarding / Login pages
