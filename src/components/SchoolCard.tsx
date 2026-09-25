import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { School } from "@/data/schools";
import { feeRange, gradeFor, isRecommended } from "@/lib/grading";
import { FlagTZ, GenderIcon, MoneyBag, PinIcon, Starburst } from "@/components/icons";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

interface SchoolCardProps {
  school: School;
  onCompare?: (school: School) => void;
  isComparing?: boolean;
  /** Fixed width inside a horizontal rail; fluid inside a grid. */
  variant?: "grid" | "rail";
}

const kindKey: Record<School["boardingDay"], TranslationKey> = {
  Boarding: "card.boarding",
  Day: "card.day",
  Both: "card.both",
};

/**
 * Catalogue tile: photo with the "recommended" corner tab, the school line and name, a
 * two-column fee / location strip, then the grade disc and the arrow into the profile.
 */
export function SchoolCard({ school, onCompare, isComparing, variant = "grid" }: SchoolCardProps) {
  const t = useT();
  const grade = gradeFor(school);

  return (
    <article className={`tile card-hover group relative ${variant === "rail" ? "w-[320px] shrink-0 sm:w-[415px]" : "w-full"}`}>
      <Link to={`/shule/${school.id}`} className="block" aria-label={school.name}>
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={school.image}
            alt={school.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {isRecommended(school) && (
            <span className="absolute left-0 top-0 flex items-center gap-2 rounded-br-2xl bg-card py-4 pl-6 pr-6 text-[16px] font-semibold text-foreground">
              <Starburst className="h-[18px] w-[18px] text-teal" />
              {t("card.recommended")}
            </span>
          )}
        </div>
      </Link>

      <div className="px-6 pt-7">
        <p className="flex items-center gap-2 text-[15px] text-foreground">
          <GenderIcon gender={school.gender} className="h-[17px] w-[17px]" />
          {t(kindKey[school.boardingDay])}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 pb-6">
          <Link to={`/shule/${school.id}`} className="min-w-0">
            <h3 className="truncate text-[22px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {school.name}
            </h3>
          </Link>
          <FlagTZ className="h-[30px] w-[44px] shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-[#ededed]">
        <div className="flex flex-col items-center gap-1.5 py-4 text-foreground">
          <MoneyBag className="h-[22px] w-[22px]" />
          <span className="text-[15px]">{feeRange(school.tuitionMin, school.tuitionMax)}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 border-l border-[#ededed] py-4 text-foreground">
          <PinIcon className="h-[22px] w-[22px]" />
          <span className="text-[15px]">{school.region}, TZ</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#ededed] px-6 py-4">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground">
          {grade}
        </span>

        {onCompare ? (
          <button
            type="button"
            onClick={() => onCompare(school)}
            className={`rounded-full px-4 py-1.5 text-[14px] font-semibold transition ${
              isComparing ? "bg-foreground text-background" : "border border-[#cfcfcf] text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {isComparing ? t("card.comparing") : t("card.compare")}
          </button>
        ) : (
          <Link
            to={`/shule/${school.id}`}
            aria-label={t("card.open", { name: school.name })}
            className="text-foreground transition hover:text-primary"
          >
            <ArrowRight className="h-6 w-6" strokeWidth={2} />
          </Link>
        )}
      </div>
    </article>
  );
}
