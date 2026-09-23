import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface RankingBannerProps {
  year: number;
  schoolCount: number;
}

/** Editorial block announcing the yearly ranking — the site's signature piece of content. */
export function RankingBanner({ year, schoolCount }: RankingBannerProps) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1320px] px-4 text-center sm:px-6">
        <p className="eyebrow">Orodha ya Classmate</p>

        <h2 className="display-xl mt-4 text-foreground">
          Shule {schoolCount} Bora
          <br className="hidden sm:block" /> Tanzania {year}
        </h2>

        <p className="mx-auto mt-6 max-w-[620px] text-[1.0625rem] leading-relaxed text-muted-foreground">
          Tunapanga shule kwa kutumia matokeo ya mitihani ya taifa, ada halisi, mazingira ya
          kujifunzia na maoni ya wazazi. Hakuna shule inayolipia nafasi — vigezo ni vilevile kwa
          kila shule.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <span className="text-[1.0625rem] text-muted-foreground">Taarifa zaidi</span>
          <Link
            to="/shule?sort=results"
            className="group flex items-center gap-2 text-[1.0625rem] font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Nenda kwenye orodha
          </Link>
        </div>
      </div>
    </section>
  );
}
