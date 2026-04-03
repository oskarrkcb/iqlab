import { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('apexmind-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLang = () => {
    const next = lang === 'en' ? 'de' : 'en';
    setLang(next);
    try { localStorage.setItem('apexmind-lang', next); } catch {}
  };

  const setLanguage = (l) => {
    setLang(l);
    try { localStorage.setItem('apexmind-lang', l); } catch {}
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
