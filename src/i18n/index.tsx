import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANG, DICTIONARIES, LANGUAGES, type Lang, type TranslationKey } from "@/i18n/translations";

export { LANGUAGES, type Lang, type TranslationKey };

const STORAGE_KEY = "classmate.language";

/** `{name}` placeholders are filled from `vars`. */
type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const isLang = (value: unknown): value is Lang => LANGUAGES.some((entry) => entry.code === value);

function readStored(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* private mode — fall through to the default */
  }
  return DEFAULT_LANG;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStored());

  // Keep <html lang> honest for screen readers and translation tools.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Another tab switching language should switch this one too.
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isLang(event.newValue)) setLangState(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice lasts for this page only */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      const dictionary = DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANG];
      // Fall back to Swahili, then to the key itself, so a missing string is never blank.
      const template = dictionary[key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key;
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        vars[name] === undefined ? match : String(vars[name]),
      );
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>");
  return context;
}

/** Shorthand for components that only need the translate function. */
export const useT = () => useI18n().t;
