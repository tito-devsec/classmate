import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const navLinks = [
  { label: "Ranking", path: "/shule?sort=results", badge: "MPYA" },
  { label: "Tafuta shule", path: "/shule" },
  { label: "Linganisha", path: "/linganisha" },
  { label: "Vyuo", path: "/shule?tab=vyuo" },
  { label: "Blog", path: "/blog" },
];

const accountLinks = [
  { label: "Dashibodi yangu", path: "/dashboard/me" },
  { label: "Dashibodi ya shule", path: "/dashboard/school" },
  { label: "Kwa shule", path: "/kwa-shule" },
];

const languages = [
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const LANGUAGE_KEY = "classmate.language";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState(languages[0]);
  const [query, setQuery] = useState("");
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      const match = languages.find((entry) => entry.code === saved);
      if (match) setLanguage(match);
    } catch {
      /* private mode — keep the default */
    }
  }, []);

  useEffect(() => {
    if (!langOpen) return undefined;
    const close = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [langOpen]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/shule?q=${encodeURIComponent(query.trim())}` : "/shule");
  };

  const pickLanguage = (entry: (typeof languages)[number]) => {
    setLanguage(entry);
    setLangOpen(false);
    try {
      localStorage.setItem(LANGUAGE_KEY, entry.code);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6">
        <BrandMark />

        {/* Header search — the quickest route into the catalogue from any page. */}
        <form onSubmit={submit} className="relative hidden min-w-0 flex-1 md:block lg:max-w-[280px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tafuta shule au mkoa…"
            aria-label="Tafuta shule"
            className="h-11 w-full rounded-full bg-muted px-4 pr-11 text-sm text-foreground outline-none ring-primary/25 transition placeholder:text-muted-foreground focus:bg-card focus:ring-2"
          />
          <button
            type="submit"
            aria-label="Tafuta"
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const active = location.pathname + location.search === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`relative text-[0.9375rem] font-medium transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -right-8 -top-2.5 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-primary-foreground">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {/* Language */}
          <div ref={langRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangOpen((value) => !value)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm transition hover:border-foreground/25"
            >
              <span className="text-base leading-none">{language.flag}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-12 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
              >
                {languages.map((entry) => (
                  <li key={entry.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={entry.code === language.code}
                      onClick={() => pickLanguage(entry)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-muted ${
                        entry.code === language.code ? "font-semibold text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="text-base leading-none">{entry.flag}</span>
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="hidden h-5 w-px bg-border lg:block" />

          <Link
            to="/omba-nafasi"
            className="hidden h-10 items-center rounded-full px-3 text-[0.9375rem] font-semibold text-foreground transition hover:text-primary lg:flex"
          >
            Ingia
          </Link>

          <Link
            to="/omba-nafasi"
            className="hidden h-10 items-center rounded-full bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary/90 sm:flex"
          >
            Omba nafasi
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Funga menyu" : "Fungua menyu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-card px-4 pb-5 pt-2 lg:hidden">
          <form onSubmit={submit} className="relative mb-3 md:hidden">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tafuta shule au mkoa…"
              aria-label="Tafuta shule"
              className="h-11 w-full rounded-full bg-muted px-4 pr-11 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Tafuta"
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {[...navLinks, ...accountLinks].map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="flex items-center justify-between border-b border-border/60 py-3 text-[0.9375rem] font-medium text-foreground last:border-0"
            >
              {link.label}
              {"badge" in link && link.badge && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <Link
            to="/omba-nafasi"
            className="mt-4 flex h-11 items-center justify-center rounded-full bg-primary text-[0.9375rem] font-semibold text-primary-foreground"
          >
            Omba nafasi
          </Link>
        </div>
      )}
    </header>
  );
}
