import { useState, useCallback, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

// "{n} perce" + { n: 5 } → "5 perce"
export function fmt(template: string, vars: Record<string, string | number>) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

// BCP 47 locale for dates/numbers in the given UI language.
export function localeFor(lang: string) {
  return lang === 'en' ? 'en-GB' : 'hu-HU';
}

// Language of the running app (App keeps <html lang> in sync with the user's preference).
export function currentLang(): Language {
  return (typeof document !== 'undefined' && document.documentElement.lang === 'en') ? 'en' : 'hu';
}

export function useI18n(initialLanguage: Language = 'hu') {
  const [lang, setLang] = useState<Language>(initialLanguage);

  const t = useCallback((path: string) => {
    const keys = path.split('.');
    let current = translations[lang] || translations['hu'];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to Hungarian
        let fallback = translations['hu'];
        for (const fKey of keys) {
          if (fallback[fKey] === undefined) return path;
          fallback = fallback[fKey];
        }
        return fallback;
      }
      current = current[key];
    }
    return current;
  }, [lang]);

  return { t, lang, setLang };
}
