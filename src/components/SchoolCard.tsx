import { Check, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { School } from "@/data/schools";
import { feeRange, gradeFor, isRecommended } from "@/lib/grading";

interface SchoolCardProps {
  school: School;
  onCompare?: (school: School) => void;
  isComparing?: boolean;
  /** Fixed width inside a horizontal rail; fluid inside a grid. */
  variant?: "grid" | "rail";
}

const boardingLabel: Record<School["boardingDay"], string> = {
  Boarding: "Bweni",
  Day: "Kutwa",
  Both: "Bweni / Kutwa",
};

const genderLabel: Record<School["gender"], string> = {
  Boys: "Wavulana",
  Girls: "Wasichana",
  Mixed: "Mchanganyiko",
};

export function SchoolCard({ school, onCompare, isComparing, variant = "grid" }: SchoolCardProps) {
  const grade = gradeFor(school);
  const recommended = isRecommended(school);

  return (
    <article
      className={`card-hover group relative overflow-hidden rounded-[20px] bg-card shadow-[0_2px_14px_-8px_rgba(0,0,0,0.25)] ${
        variant === "rail" ? "w-[288px] shrink-0 sm:w-[320px]" : "w-full"
      }`}
    >
      <Link to={`/shule/${school.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden">
          <img
            src={school.image}
            alt={school.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />

          {recommended && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </span>
              Inapendekezwa
            </span>
          )}

          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground shadow-md">
            {grade}
          </span>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3">
            <span className="flex flex-wrap gap-1">
              {school.levels.map((level) => (
                <span
                  key={level}
                  className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
                >
                  {level}
                </span>
              ))}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/shule/${school.id}`}>
          <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {school.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2 text-[13px] text-muted-foreground">
          {school.rating > 0 && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {school.rating.toFixed(1)}
            </span>
          )}
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{school.location}</span>
          </span>
        </div>

        <dl className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/75">
            {boardingLabel[school.boardingDay]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/75">
            {genderLabel[school.gender]}
          </span>
          {school.performance.divisionI > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              Div I · {school.performance.divisionI}%
            </span>
          )}
        </dl>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Ada kwa mwaka</p>
            <p className="truncate font-display text-[0.9375rem] font-bold text-foreground">
              {feeRange(school.tuitionMin, school.tuitionMax)}
            </p>
          </div>

          {onCompare ? (
            <button
              type="button"
              onClick={() => onCompare(school)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                isComparing
                  ? "bg-foreground text-background"
                  : "border border-foreground/15 text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {isComparing ? "Imechaguliwa" : "Linganisha"}
            </button>
          ) : (
            <Link
              to={`/shule/${school.id}`}
              className="shrink-0 rounded-full border border-foreground/15 px-4 py-2 text-[13px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              Angalia
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
