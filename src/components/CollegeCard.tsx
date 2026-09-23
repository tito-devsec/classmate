import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { College } from "@/data/schools";
import { feeRange } from "@/lib/grading";

interface CollegeCardProps {
  college: College;
}

export function CollegeCard({ college }: CollegeCardProps) {
  return (
    <article className="card-hover group overflow-hidden rounded-[20px] bg-card shadow-[0_2px_14px_-8px_rgba(0,0,0,0.25)]">
      <Link to={`/chuo/${college.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden">
          <img
            src={college.image}
            alt={college.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
            {college.category === "Institute" ? "Taasisi" : "Chuo"}
          </span>
          {college.rating > 0 && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {college.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/chuo/${college.id}`}>
          <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {college.name}
          </h3>
        </Link>

        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{college.location}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {college.programs.slice(0, 3).map((program) => (
            <span key={program} className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/75">
              {program}
            </span>
          ))}
          {college.programs.length > 3 && (
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/75">
              +{college.programs.length - 3}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Ada kwa mwaka</p>
            <p className="truncate font-display text-[0.9375rem] font-bold text-foreground">
              {feeRange(college.tuitionMin, college.tuitionMax)}
            </p>
          </div>
          <Link
            to={`/chuo/${college.id}`}
            className="shrink-0 rounded-full border border-foreground/15 px-4 py-2 text-[13px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Maelezo
          </Link>
        </div>
      </div>
    </article>
  );
}
