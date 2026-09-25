import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useT } from "@/i18n";

interface RankingBannerProps {
  year: number;
}

/** Announces the yearly ranking — the site's signature piece of content. */
export function RankingBanner({ year }: RankingBannerProps) {
  const t = useT();

  return (
    <section className="py-14">
      <div className="wrap text-center">
        <p className="eyebrow">{t("ranking.eyebrow")}</p>

        <h2 className="display-xl mt-6 text-foreground">{t("ranking.title", { year })}</h2>

        <p className="mx-auto mt-7 max-w-[560px] text-[16px] leading-[1.6] text-foreground">
          {t("ranking.bodyA")} <strong className="font-semibold">{t("ranking.bodyStrong")}</strong>
          <br className="hidden sm:block" /> {t("ranking.bodyB")}
          <br className="hidden sm:block" /> {t("ranking.bodyC")}
        </p>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[20px]">
          <span className="text-foreground">{t("ranking.more")}</span>
          <Link
            to="/shule?sort=results"
            className="group flex items-center gap-2 font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            {t("ranking.goToList")}
          </Link>
        </div>
      </div>
    </section>
  );
}
