import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SchoolCard } from "@/components/SchoolCard";
import { SectionHeading } from "@/components/home/SectionHeading";
import type { School } from "@/data/schools";

interface RankingRailProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  schools: School[];
  action?: { label: string; to: string };
}

/** A horizontally scrolling shelf of ranked schools, with arrows once it overflows. */
export function RankingRail({ eyebrow, title, subtitle, schools, action }: RankingRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 8);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8);
  };

  useEffect(() => {
    sync();
    const rail = railRef.current;
    if (!rail) return undefined;
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [schools.length]);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.min(rail.clientWidth * 0.8, 680), behavior: "smooth" });
  };

  if (schools.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} action={action} />

        <div className="relative mt-7">
          <div ref={railRef} onScroll={sync} className="rail">
            {schools.map((school, index) => (
              <div key={school.id} className="relative">
                {/* Rank chip — the rail is an ordering, so say which position this is. */}
                <span className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background shadow-md">
                  {index + 1}
                </span>
                <SchoolCard school={school} variant="rail" />
              </div>
            ))}
          </div>

          {!atStart && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Rudi nyuma"
              className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-lg transition hover:border-primary hover:text-primary md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {!atEnd && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Endelea mbele"
              className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-lg transition hover:border-primary hover:text-primary md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
