import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const columns = [
  {
    title: "Kwa wazazi",
    links: [
      { label: "Tafuta shule", to: "/shule" },
      { label: "Linganisha shule", to: "/linganisha" },
      { label: "Omba nafasi", to: "/omba-nafasi" },
      { label: "Dashibodi yangu", to: "/dashboard/me" },
    ],
  },
  {
    title: "Kwa shule",
    links: [
      { label: "Sajili shule yako", to: "/kwa-shule" },
      { label: "Dashibodi ya shule", to: "/dashboard/school" },
      { label: "Matangazo", to: "/kwa-shule" },
    ],
  },
  {
    title: "Classmate",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Orodha ya shule bora", to: "/shule?sort=results" },
      { label: "Vyuo", to: "/shule?tab=vyuo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <BrandMark />
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">
              Tunaunganisha wazazi na shule bora za sekondari na vyuo Tanzania — kwa taarifa
              wazi za ada, matokeo na mazingira.
            </p>

            <div className="mt-5 flex flex-col gap-2 text-[0.9375rem] text-muted-foreground">
              <a href="tel:+255673240151" className="flex items-center gap-2 transition hover:text-primary">
                <Phone className="h-4 w-4" /> +255 673 240 151
              </a>
              <a href="mailto:habari@classmate.co.tz" className="flex items-center gap-2 transition hover:text-primary">
                <Mail className="h-4 w-4" /> habari@classmate.co.tz
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Dar es Salaam, Tanzania
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title}>
              <h3 className="font-display text-[0.9375rem] font-bold text-foreground">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.9375rem] text-muted-foreground transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-[13px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Classmate. Haki zote zimehifadhiwa.</p>
          <p>
            Imetengenezwa na{" "}
            <span className="font-semibold text-foreground">tito-devsec</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
