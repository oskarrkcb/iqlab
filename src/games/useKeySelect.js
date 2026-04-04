import { useEffect } from 'react';

/** Press 1–9 to select an answer option (index 0–8). */
export function useKeySelect(handler, optionCount, disabled) {
  useEffect(() => {
    if (disabled) return;
    const onKey = (e) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= optionCount) handler(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, optionCount, disabled]);
}
