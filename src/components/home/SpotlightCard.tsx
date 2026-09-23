import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Wallet } from "lucide-react";
import type { School } from "@/data/schools";
import { feeRange, gradeFor } from "@/lib/grading";

interface SpotlightCardProps {
  school: School;
}

/** Full-bleed feature card: one school, its grade, rating, fees and location over photography. */
export function SpotlightCard({ school }: SpotlightCardProps) {
  const grade = gradeFor(school);
  const stars = Math.round(school.rating);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <Link
          to={`/shule/${school.id}`}
          className="group relative block overflow-hidden rounded-[24px] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.6)]"
        >
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <img
              src={school.image}
              alt={school.name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="photo-scrim absolute inset-0" />

            <span className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Shule ya wiki
            </span>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-8 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h3 className="font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.5rem] md:text-[3rem]">
                  {school.name}
                  <span className="ml-2 align-middle text-xl sm:text-2xl">🇹🇿</span>
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {grade}
                  </span>
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < stars ? "fill-white text-white" : "text-white/35"}`}
                      />
                    ))}
                    <span className="ml-1.5 text-sm font-semibold text-white">{school.rating.toFixed(1)}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/90">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  {feeRange(school.tuitionMin, school.tuitionMax)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {school.location}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="text-[1.0625rem] text-muted-foreground">Taarifa zaidi</span>
          <Link
            to={`/shule/${school.id}`}
            className="group flex items-center gap-2 text-[1.0625rem] font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Nenda {school.name}
          </Link>
        </div>
      </div>
    </section>
  );
}
