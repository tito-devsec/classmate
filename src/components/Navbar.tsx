import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Menu, Search, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { AuthDialog } from "@/components/AuthDialog";
import { FlagTZ, FlagUS, NewBadge } from "@/components/icons";
import { endSession, useSession } from "@/lib/session";
import { useI18n, LANGUAGES, type Lang } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

interface NavbarProps {
  /**
   * `solid` — white sticky bar (every page).
   * `overlay` — transparent, sits over the profile hero; links collapse into the menu.
   */
  variant?: "solid" | "overlay";
}

const navLinks: { key: TranslationKey; path: string; isNew?: boolean }[] = [
  { key: "nav.ranking", path: "/shule?sort=results", isNew: true },
  { key: "nav.find", path: "/shule" },
  { key: "nav.compare", path: "/linganisha" },
  { key: "nav.blog", path: "/blog" },
];

const menuLinks: { key: TranslationKey; path: string; isNew?: boolean }[] = [
  ...navLinks,
  { key: "nav.colleges", path: "/shule?tab=colleges" },
  { key: "nav.abroad", path: "/shule?tab=study-abroad" },
  { key: "nav.apply", path: "/omba-nafasi" },
  { key: "nav.forSchools", path: "/kwa-shule" },
  { key: "nav.myDashboard", path: "/dashboard/me" },
  { key: "nav.schoolDashboard", path: "/dashboard/school" },
];

/** Each language shows the flag of the country it is spoken in. */
const FLAGS: Record<Lang, (props: { className?: string }) => JSX.Element> = {
  sw: FlagTZ,
  en: FlagUS,
};

export function Navbar({ variant = "solid" }: NavbarProps) {
  const overlay = variant === "overlay";
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [query, setQuery] = useState("");
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const { lang, setLang, t } = useI18n();

  const ActiveFlag = FLAGS[lang];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) setLangOpen(false);
      if (!userRef.current?.contains(event.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/shule?q=${encodeURIComponent(query.trim())}` : "/shule");
  };

  const ink = overlay ? "text-white" : "text-foreground";

  const languageMenu = (
    <div ref={langRef} className="relative">
      <button
        type="button"
        onClick={() => setLangOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t("nav.chooseLanguage")}
        className={`flex h-9 items-center gap-1.5 rounded-md border px-2 transition ${
          overlay ? "border-white/80 text-white hover:bg-white/10" : "border-[#c9c9c9] hover:border-foreground/40"
        }`}
      >
        <ActiveFlag className="h-[17px] w-[26px]" />
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {langOpen && (
        <div className="absolute right-0 top-11 z-50 w-[252px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
          <p className="border-b border-border px-4 py-3 text-[15px] font-semibold text-foreground">
            {t("nav.chooseLanguage")}
          </p>
          <ul role="listbox" className="py-1">
            {LANGUAGES.map((entry) => {
              const Flag = FLAGS[entry.code];
              const active = entry.code === lang;
              return (
                <li key={entry.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLang(entry.code);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-[15px] transition hover:bg-muted ${
                      active ? "font-semibold text-primary" : "text-foreground"
                    }`}
                  >
                    <Flag className="h-[20px] w-[30px]" />
                    <span className="flex-1 text-left">{entry.label}</span>
                    {active && <Check className="h-4 w-4" strokeWidth={2.5} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const account = session ? (
    <div ref={userRef} className="relative">
      <button
        type="button"
        onClick={() => setUserOpen((value) => !value)}
        className={`flex items-center gap-1 text-[16px] font-semibold ${ink}`}
        aria-haspopup="menu"
        aria-expanded={userOpen}
      >
        {session.fname}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {userOpen && (
        <div role="menu" className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-xl">
          <Link to="/dashboard/me" role="menuitem" className="block px-4 py-2.5 text-[15px] text-foreground hover:bg-muted">
            {t("nav.myDashboard")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              endSession();
              setUserOpen(false);
            }}
            className="block w-full px-4 py-2.5 text-left text-[15px] text-foreground hover:bg-muted"
          >
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  ) : (
    <button type="button" onClick={() => setAuthOpen(true)} className={`text-[16px] font-semibold ${ink} hover:text-primary`}>
      {t("nav.login")}
    </button>
  );

  return (
    <>
      <header
        className={
          overlay
            ? "absolute inset-x-0 top-0 z-40"
            : "sticky top-0 z-40 bg-card shadow-[0_1px_0_0_hsl(0_0%_90%),0_2px_10px_rgba(0,0,0,0.04)]"
        }
      >
        <div className="wrap flex h-[72px] items-center gap-4">
          {overlay ? <BrandMark variant="mark" /> : <BrandMark />}

          {/* Header search — the quickest route into the catalogue from any page. */}
          <form onSubmit={submit} className={`relative hidden md:block ${overlay ? "ml-4" : "ml-6"}`}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              aria-label={t("nav.searchLabel")}
              className={`h-[46px] w-[262px] rounded-full pl-4 pr-12 text-[15px] outline-none transition ${
                overlay
                  ? "border border-white/85 bg-transparent text-white placeholder:text-white/90 focus:bg-white/10"
                  : "bg-[#f1f1f1] text-foreground placeholder:text-muted-foreground focus:bg-[#ebebeb]"
              }`}
            />
            <button
              type="submit"
              aria-label={t("nav.search")}
              className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full ${
                overlay
                  ? "right-3 h-8 w-8 text-white"
                  : "right-1.5 h-[34px] w-[34px] bg-[#cfcfcf] text-white transition hover:bg-[#bdbdbd]"
              }`}
            >
              <Search className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </form>

          {!overlay && (
            <nav className="ml-auto hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => {
                const active = location.pathname + location.search === link.path;
                return (
                  <Link
                    key={link.key}
                    to={link.path}
                    className={`relative text-[16px] font-semibold transition-colors hover:text-primary ${
                      active ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.isNew && <NewBadge label={t("nav.new")} className="absolute -left-6 -top-5" />}
                    {t(link.key)}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className={`flex items-center gap-3 ${overlay ? "ml-auto" : "ml-auto lg:ml-7"}`}>
            {languageMenu}

            {!overlay && (
              <>
                <span className="hidden text-muted-foreground lg:inline" aria-hidden="true">
                  ·
                </span>
                <span className="hidden lg:block">{account}</span>
              </>
            )}

            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-md ${overlay ? "text-white" : "lg:hidden"}`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
            >
              {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" strokeWidth={2.25} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="site-menu" className="border-t border-border bg-card shadow-xl">
            <div className="wrap py-3">
              <form onSubmit={submit} className="relative mb-2 md:hidden">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("nav.searchPlaceholder")}
                  aria-label={t("nav.searchLabel")}
                  className="h-[46px] w-full rounded-full bg-[#f1f1f1] pl-4 pr-12 text-[15px] outline-none"
                />
                <button
                  type="submit"
                  aria-label={t("nav.search")}
                  className="absolute right-1.5 top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-[#cfcfcf] text-white"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </form>

              <div className="grid sm:grid-cols-2">
                {menuLinks.map((link) => (
                  <Link
                    key={link.key}
                    to={link.path}
                    className="flex items-center gap-2 border-b border-border/70 py-3 text-[16px] font-semibold text-foreground hover:text-primary"
                  >
                    {t(link.key)}
                    {link.isNew && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">{t("nav.new")}</span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 py-3">
                {session ? (
                  <>
                    <span className="text-[15px] font-semibold text-foreground">
                      {session.fname} {session.lname}
                    </span>
                    <button type="button" onClick={endSession} className="text-[15px] font-semibold text-primary">
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="rounded-full bg-primary px-6 py-2.5 text-[15px] font-semibold text-primary-foreground"
                  >
                    {t("nav.loginRegister")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
