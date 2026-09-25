import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

const suggestions: { key: TranslationKey; to: string }[] = [
  { key: "nav.find", to: "/shule" },
  { key: "nav.compare", to: "/linganisha" },
  { key: "auth.signUp", to: "/jisajili" },
  { key: "nav.apply", to: "/omba-nafasi" },
];

const NotFound = () => {
  const location = useLocation();
  const t = useT();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${t("notFound.heading")} — Classmate`} description={t("notFound.body")} path={location.pathname} />
      <Navbar />

      <section className="wrap py-24 text-center sm:py-32">
        <p className="text-[76px] font-bold leading-none text-primary sm:text-[110px]">404</p>
        <h1 className="display-lg mt-4 text-foreground">{t("notFound.heading")}</h1>
        <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.6] text-foreground">{t("notFound.body")}</p>

        <Link
          to="/"
          className="mt-9 inline-flex h-[56px] items-center gap-2 rounded-full bg-primary px-8 text-[16px] font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {t("notFound.home")}
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {suggestions.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className="rounded-md border border-[#cfcfcf] bg-card px-4 py-2.5 text-[15px] text-foreground transition hover:border-primary hover:text-primary"
            >
              {t(entry.key)}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NotFound;
