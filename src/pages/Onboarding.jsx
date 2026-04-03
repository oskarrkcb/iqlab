import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import './Onboarding.css';

const Icon = ({ type }) => {
  const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'briefcase': return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    case 'clipboard': return <svg {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><rect x="4" y="4" width="16" height="18" rx="2"/><path d="M10 12h4"/><path d="M10 16h4"/></svg>;
    case 'brain': return <svg {...p}><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7.5L12 20l3-3.5c2-2 4-4.5 4-7.5a7 7 0 0 0-7-7z"/><path d="M12 2v18"/></svg>;
    case 'zap': return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'flame': return <svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.5-2.5 1.5-3.5l1 1z"/></svg>;
    case 'scale': return <svg {...p}><path d="M12 3v18"/><path d="M3 7l9-4 9 4"/><path d="M3 7v4c0 2 3 4 3 4"/><path d="M21 7v4c0 2-3 4-3 4"/></svg>;
    case 'target': return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'box': return <svg {...p}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
    case 'hash': return <svg {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
    case 'puzzle': return <svg {...p}><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925-.228-.606-.637-1.076-1.18-1.076-.543 0-.952.47-1.18 1.076-.166.445-.498.855-.968.925a.98.98 0 0 1-.837-.276l-1.611-1.611A2.41 2.41 0 0 1 11.4 12c0-.617.236-1.234.706-1.704L13.674 8.728a.98.98 0 0 0 .289-.878c-.07-.47-.48-.802-.925-.968C12.432 6.654 12 6.245 12 5.702c0-.543.432-.952 1.038-1.18.445-.166.855-.498.925-.968a.98.98 0 0 0-.276-.837L12.076 1.106a2.41 2.41 0 0 0-3.408 0L1.106 8.668a2.41 2.41 0 0 0 0 3.408l7.562 7.562a2.41 2.41 0 0 0 3.408 0l7.562-7.562a2.41 2.41 0 0 0 0-3.408l-.076-.076"/></svg>;
    case 'headphones': return <svg {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
  }
};


export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const { t } = useLang();

  const STEPS = [
    {
      question: t.onboarding.q1,
      options: [
        { label: t.onboarding.q1o1, icon: 'briefcase', desc: t.onboarding.q1o1d },
        { label: t.onboarding.q1o2, icon: 'clipboard', desc: t.onboarding.q1o2d },
        { label: t.onboarding.q1o3, icon: 'brain', desc: t.onboarding.q1o3d },
        { label: t.onboarding.q1o4, icon: 'zap', desc: t.onboarding.q1o4d },
      ],
    },
    {
      question: t.onboarding.q2,
      options: [
        { label: t.onboarding.q2o1, icon: 'flame', desc: t.onboarding.q2o1d },
        { label: t.onboarding.q2o2, icon: 'scale', desc: t.onboarding.q2o2d },
        { label: t.onboarding.q2o3, icon: 'target', desc: t.onboarding.q2o3d },
      ],
    },
    {
      question: t.onboarding.q3,
      options: [
        { label: t.onboarding.q3o1, icon: 'box', desc: t.onboarding.q3o1d },
        { label: t.onboarding.q3o2, icon: 'hash', desc: t.onboarding.q3o2d },
        { label: t.onboarding.q3o3, icon: 'puzzle', desc: t.onboarding.q3o3d },
        { label: t.onboarding.q3o4, icon: 'headphones', desc: t.onboarding.q3o4d },
      ],
    },
  ];

  const current = STEPS[step];

  const selectOption = (label) => {
    const newAnswers = { ...answers, [step]: label };
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 400);
    } else {
      console.log('Onboarding complete:', newAnswers);
      setTimeout(() => navigate('/dashboard'), 600);
    }
  };

  return (
    <div className="page-enter onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <div className="logo-icon">I</div>
            IQLab
          </div>
          <div className="onboarding-progress">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`ob-dot${i < step ? ' done' : i === step ? ' current' : ''}`}
              />
            ))}
          </div>
          <p className="onboarding-step">{t.onboarding.step} {step + 1} {t.onboarding.of} {STEPS.length}</p>
        </div>

        <h2 className="onboarding-question">{current.question}</h2>

        <div className="onboarding-options">
          {current.options.map((opt) => (
            <button
              key={opt.label}
              className={`ob-option${answers[step] === opt.label ? ' selected' : ''}`}
              onClick={() => selectOption(opt.label)}
            >
              <span className="ob-option-icon">
                <Icon type={opt.icon} />
              </span>
              <div className="ob-option-text">
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </div>
              <div className="ob-option-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {step > 0 && (
          <button className="btn btn-ghost btn-sm ob-back" onClick={() => setStep(step - 1)}>
            {t.onboarding.back}
          </button>
        )}
      </div>
    </div>
  );
}
