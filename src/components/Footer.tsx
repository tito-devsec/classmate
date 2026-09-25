import { Link } from "react-router-dom";
import { BrandBadge } from "@/components/BrandMark";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

type FooterLink = { key: TranslationKey; to: string; vars?: Record<string, string> };

const columns: FooterLink[][] = [
  [
    { key: "footer.boarding", to: "/shule?boarding=Boarding" },
    { key: "footer.day", to: "/shule?boarding=Day" },
    { key: "footer.alevel", to: "/shule?level=A-Level" },
    { key: "footer.colleges", to: "/shule?tab=colleges" },
  ],
  [
    { key: "footer.schoolsIn", to: "/shule?region=Dar%20es%20Salaam", vars: { region: "Dar es Salaam" } },
    { key: "footer.schoolsIn", to: "/shule?region=Pwani", vars: { region: "Pwani" } },
    { key: "footer.schoolsIn", to: "/shule?region=Arusha", vars: { region: "Arusha" } },
    { key: "footer.schoolsIn", to: "/shule?region=Mwanza", vars: { region: "Mwanza" } },
    { key: "footer.schoolsIn", to: "/shule?region=Kilimanjaro", vars: { region: "Kilimanjaro" } },
  ],
  [
    { key: "footer.about.link", to: "/blog" },
    { key: "footer.faq", to: "/#maswali" },
    { key: "footer.forSchools", to: "/kwa-shule" },
    { key: "footer.terms", to: "/blog" },
    { key: "footer.privacy", to: "/blog" },
    { key: "footer.consultants", to: "/omba-nafasi" },
    { key: "footer.contact", to: "/omba-nafasi" },
  ],
];

const social = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 12 2Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true" fill="currentColor">
        <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.8 12 4.8 12 4.8s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8ZM9.8 15.1V8.9l5.7 3.1-5.7 3.1Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true" fill="currentColor">
        <path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8 19H5V9.5h3V19ZM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5ZM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.7 13 12.7 14.3V19h-3V9.5h2.9v1.3a3.2 3.2 0 0 1 2.9-1.6c3 0 3.6 2 3.6 4.6V19Z" />
      </svg>
    ),
  },
];

export function Footer() {
  const t = useT();

  return (
    <footer className="bg-footer">
      <div className="wrap pb-10 pt-14">
        <BrandBadge className="h-[52px] w-[52px]" />

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <p className="text-[15px] font-semibold text-foreground">Classmate</p>
            <p className="mt-2 max-w-[380px] text-[15px] leading-[1.65] text-foreground">{t("footer.about")}</p>
          </div>

          {columns.map((column, index) => (
            <nav key={index} aria-label={t("footer.links", { n: index + 1 })}>
              <ul className="space-y-[14px] md:pt-7">
                {column.map((link) => (
                  <li key={link.key + (link.vars?.region ?? "")}>
                    <Link to={link.to} className="text-[15px] text-foreground transition hover:text-primary">
                      {t(link.key, link.vars)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-dashed border-[#9a9a9a] pt-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-foreground">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
            <div className="flex items-center gap-4">
              <span className="text-[15px] text-foreground">{t("footer.social")}</span>
              {social.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={entry.label}
                  className="text-foreground transition hover:text-primary"
                >
                  {entry.icon}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground">
            {t("footer.builtBy")} <span className="font-semibold text-foreground">tito-devsec</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
