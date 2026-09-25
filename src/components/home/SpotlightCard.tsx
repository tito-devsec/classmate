import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import type { School } from "@/data/schools";
import { feeRange, gradeFor } from "@/lib/grading";
import { FlagTZ, MoneyBag, PinIcon, Starburst } from "@/components/icons";
import { useT } from "@/i18n";

interface SpotlightCardProps {
  school: School;
}

/** Full-width feature card: one school, its grade, rating, fees and location over photography. */
export function SpotlightCard({ school }: SpotlightCardProps) {
  const t = useT();
  const stars = Math.round(school.rating);

  return (
    <section className="pb-16 pt-6">
      <div className="wrap">
        <Link to={`/shule/${school.id}`} className="group relative block overflow-hidden rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <div className="relative h-[420px] sm:h-[530px]">
            <img
              src={school.image}
              alt={school.name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
            />
            <div className="photo-scrim absolute inset-0" />

            <span className="absolute left-0 top-0 flex items-center gap-2 rounded-br-2xl bg-card py-4 pl-7 pr-7 text-[18px] font-semibold text-foreground">
              <Starburst className="h-5 w-5 text-teal" />
              {t("card.recommended")}
            </span>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 px-6 pb-8 sm:px-12 sm:pb-12 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h3 className="flex flex-wrap items-center gap-4 text-[2.25rem] font-bold leading-[1.1] text-white sm:text-[3.375rem]">
                  {school.name}
                  <FlagTZ className="h-[36px] w-[54px]" />
                </h3>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[16px] font-bold text-primary-foreground">
                    {gradeFor(school)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-5 w-5 ${index < stars ? "fill-white text-white" : "text-white/40"}`} />
                    ))}
                    <span className="ml-1.5 text-[18px] font-semibold text-white">{school.rating.toFixed(1)}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[18px] text-white">
                <span className="flex items-center gap-2.5">
                  <MoneyBag className="h-6 w-6" />
                  {feeRange(school.tuitionMin, school.tuitionMax)}
                </span>
                <span className="flex items-center gap-2.5">
                  <PinIcon className="h-6 w-6" />
                  {school.region}, TZ
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-[20px]">
          <span className="text-foreground">{t("spotlight.more")}</span>
          <Link
            to={`/shule/${school.id}`}
            className="group flex items-center gap-2 font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            {t("spotlight.goTo", { name: school.name })}
          </Link>
        </div>
      </div>
    </section>
  );
}
