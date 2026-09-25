import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { College } from "@/data/schools";
import { feeRange } from "@/lib/grading";
import { FlagTZ, MoneyBag, PinIcon, Starburst } from "@/components/icons";
import { useT } from "@/i18n";

interface CollegeCardProps {
  college: College;
}

/** Colleges carry a rating rather than exam results, so the disc shows a rating-derived letter. */
const letterFor = (rating: number) => (rating >= 4.5 ? "A" : rating >= 4.2 ? "A-" : rating >= 4 ? "B+" : "B");

export function CollegeCard({ college }: CollegeCardProps) {
  const t = useT();

  return (
    <article className="tile card-hover group relative w-full">
      <Link to={`/chuo/${college.id}`} className="block" aria-label={college.name}>
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={college.image}
            alt={college.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {college.rating >= 4.3 && (
            <span className="absolute left-0 top-0 flex items-center gap-2 rounded-br-2xl bg-card py-4 pl-6 pr-6 text-[16px] font-semibold text-foreground">
              <Starburst className="h-[18px] w-[18px] text-teal" />
              {t("card.recommended")}
            </span>
          )}
        </div>
      </Link>

      <div className="px-6 pt-7">
        <p className="flex items-center gap-2 text-[15px] text-foreground">
          <Building2 className="h-[17px] w-[17px]" strokeWidth={2} />
          {college.category === "Institute" ? t("card.institute") : t("card.college")} · {college.programs.slice(0, 2).join(", ")}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 pb-6">
          <Link to={`/chuo/${college.id}`} className="min-w-0">
            <h3 className="truncate text-[22px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {college.name}
            </h3>
          </Link>
          <FlagTZ className="h-[30px] w-[44px] shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-[#ededed]">
        <div className="flex flex-col items-center gap-1.5 py-4 text-foreground">
          <MoneyBag className="h-[22px] w-[22px]" />
          <span className="text-[15px]">{feeRange(college.tuitionMin, college.tuitionMax)}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 border-l border-[#ededed] py-4 text-foreground">
          <PinIcon className="h-[22px] w-[22px]" />
          <span className="text-[15px]">{college.region}, TZ</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#ededed] px-6 py-4">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground">
          {letterFor(college.rating)}
        </span>
        <Link
          to={`/chuo/${college.id}`}
          aria-label={t("card.open", { name: college.name })}
          className="text-foreground transition hover:text-primary"
        >
          <ArrowRight className="h-6 w-6" strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
