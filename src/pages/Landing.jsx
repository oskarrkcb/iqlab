import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import './Landing.css';

export default function Landing() {
  const { t } = useLang();
  const lnd = t.landing;
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
            {lnd.eyebrow}
            <div className="lnd-eyebrow-line" />
          </div>
          <h1 className="lnd-headline">
            {lnd.headline1}
            <span className="dim">{lnd.headline2}</span>
          </h1>
          <div className="lnd-actions">
            <Link to="/training" className="btn-fill">{lnd.ctaTrain} <span>→</span></Link>
            <Link to="/iq-test" className="btn-glass">{lnd.ctaIQ} ↗</Link>
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
          <div className="lnd-stat-block fade-up"><div className="lnd-stat-num">17</div><div className="lnd-stat-lbl">{lnd.statsExLabel}</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.1s'}}><div className="lnd-stat-num">6</div><div className="lnd-stat-lbl">{lnd.statsDomsLabel}</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.2s'}}><div className="lnd-stat-num">5 min</div><div className="lnd-stat-lbl">{lnd.statsMinLabel}</div></div>
          <div className="lnd-stat-block fade-up" style={{transitionDelay:'0.3s'}}><div className="lnd-stat-num">{lnd.statsFreeVal}</div><div className="lnd-stat-lbl">{lnd.statsFreeLabel}</div></div>
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
            <img src="/nasa-brain.jpg" alt="Neural" />
            <div className="lnd-img-fade" />
          </div>
          <div className="lnd-split-content">
            <div className="lnd-eye fade-up">{lnd.whyTag}</div>
            <h2 className="lnd-h2 fade-up" style={{transitionDelay:'0.1s'}}>{lnd.whyHeadline1}<br/><span className="muted">{lnd.whyHeadline2}</span></h2>
            <p className="lnd-sub fade-up" style={{transitionDelay:'0.2s'}}>{lnd.whyDesc}</p>
            <div className="lnd-feat-list">
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.3s'}}><span className="lnd-feat-num">01</span><div><h4>{lnd.feat1Title}</h4><p>{lnd.feat1Desc}</p></div></div>
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.4s'}}><span className="lnd-feat-num">02</span><div><h4>{lnd.feat2Title}</h4><p>{lnd.feat2Desc}</p></div></div>
              <div className="lnd-feat-item fade-up" style={{transitionDelay:'0.5s'}}><span className="lnd-feat-num">03</span><div><h4>{lnd.feat3Title}</h4><p>{lnd.feat3Desc}</p></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT YOU GET — BENTO */}
      <section className="lnd-section" style={{background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
        <div className="lnd-s-inner">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
            <div><div className="lnd-eye">{lnd.bentoTag}</div><h2 className="lnd-h2">{lnd.bentoHeadline1}<br/><span className="muted">{lnd.bentoHeadline2}</span></h2></div>
            <p className="lnd-sub" style={{textAlign:'right'}}>{lnd.bentoDesc}</p>
          </div>
          <div className="lnd-bento">
            <div className="lnd-b w2">
              <div className="lnd-b-num">01 — {lnd.bento1Tag}</div>
              <div className="lnd-b-title">{lnd.bento1Title}</div>
              <div className="lnd-b-desc">{lnd.bento1Desc}</div>
              <div className="lnd-live-label"><span className="lnd-live-dot"/>Live Session Data</div>
              <div className="lnd-mini-bars">
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">{lnd.mbMem}</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="78"/></div><span className="lnd-mb-val">78%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">{lnd.mbSpeed}</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="62"/></div><span className="lnd-mb-val">62%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">{lnd.mbLogic}</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="85"/></div><span className="lnd-mb-val">85%</span></div>
                <div className="lnd-mb-row"><span className="lnd-mb-lbl">{lnd.mbFocus}</span><div className="lnd-mb-track"><div className="lnd-mb-fill" data-w="71"/></div><span className="lnd-mb-val">71%</span></div>
              </div>
            </div>
            <div className="lnd-b"><div className="lnd-b-num">02 — {lnd.bento2Tag}</div><div className="lnd-b-title">{lnd.bento2Title}</div><div className="lnd-b-desc">{lnd.bento2Desc}</div><Link to="/iq-test" className="lnd-b-tag">{lnd.ctaIQ} →</Link></div>
            <div className="lnd-b"><div className="lnd-b-num">03 — {lnd.bento3Tag}</div><div className="lnd-b-title">{lnd.bento3Title}</div><div className="lnd-b-desc">{lnd.bento3Desc}</div><Link to="/training" className="lnd-b-tag">{lnd.bento3Cta} →</Link></div>
            <div className="lnd-b"><div className="lnd-b-num">04 — vs Bot</div><div className="lnd-b-title">{lnd.bento4Title}</div><div className="lnd-b-desc">{lnd.bento4Desc}</div><span className="lnd-b-tag">Coming: 1v1 →</span></div>
            <div className="lnd-b w2"><div className="lnd-b-num">05 — {lnd.bento5Tag}</div><div className="lnd-b-title">{lnd.bento5Title}</div><div className="lnd-b-desc">{lnd.bento5Desc}</div><span className="lnd-b-tag" style={{color:'var(--white)',borderColor:'rgba(255,255,255,0.14)'}}>100% Free</span></div>
          </div>
        </div>
      </section>

      {/* EXERCISES */}
      <section className="lnd-section" style={{background:'var(--bg)',borderTop:'1px solid var(--border)'}}>
        <div className="lnd-s-inner">
          <div className="lnd-games-head">
            <div><div className="lnd-eye">{lnd.gamesTag}</div><h2 className="lnd-h2">{lnd.gamesHeadline}</h2></div>
            <Link to="/training" className="btn-glass">{lnd.gamesViewAll} →</Link>
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
            <div className="lnd-eye fade-up">{lnd.modulesTag}</div>
            <h2 className="lnd-h2 fade-up" style={{transitionDelay:'0.1s'}}>{lnd.modulesHeadline1}<br/><span className="muted">{lnd.modulesHeadline2}</span></h2>
            <p className="lnd-sub fade-up" style={{transitionDelay:'0.2s'}}>{lnd.modulesDesc}</p>
          </div>
          <div className="lnd-split-img">
            <img src="/gemini-domain.png" alt="Neural connections" style={{objectPosition:'center top'}} />
          </div>
        </div>
      </div>

      {/* IQ TEST */}
      <div className="lnd-iq-wrap">
        <div className="lnd-iq-img">
          <img src="/resource-iq.jpg" alt="Brain IQ" />
        </div>
        <div className="lnd-iq-content">
          <div className="lnd-eye">{lnd.iqTag}</div>
          <h2 className="lnd-h2">{lnd.iqHeadline1}<br/><span className="muted">{lnd.iqHeadline2}</span></h2>
          <p className="lnd-sub">{lnd.iqDesc}</p>
          <div className="lnd-iq-kpis">
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v blue" data-count="127">0</div><div className="lnd-iq-kpi-l">IQ Score</div></div>
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v" data-count="84" data-suffix="%">0%</div><div className="lnd-iq-kpi-l">Logic</div></div>
            <div className="lnd-iq-kpi"><div className="lnd-iq-kpi-v" data-count="76" data-suffix="%">0%</div><div className="lnd-iq-kpi-l">Patterns</div></div>
          </div>
          <Link to="/iq-test" className="btn-fill" style={{alignSelf:'flex-start',marginTop:'8px'}}>{lnd.ctaIQ} →</Link>
        </div>
      </div>

      {/* CTA */}
      <section className="lnd-cta">
        <div className="lnd-cta-glow" />
        <div className="lnd-cta-inner">
          <div className="lnd-cta-eye">{lnd.ctaEye}</div>
          <div className="lnd-cta-h">{lnd.ctaHeadline1}<span className="dim">{lnd.ctaHeadline2}</span></div>
          <div className="lnd-cta-acts">
            <Link to="/training" className="btn-fill">{lnd.ctaTrain} →</Link>
            <Link to="/iq-test" className="btn-glass">{lnd.ctaIQ}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
