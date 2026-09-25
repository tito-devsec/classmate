import { SchoolCard } from "@/components/SchoolCard";
import { SectionHeading } from "@/components/home/SectionHeading";
import type { School } from "@/data/schools";

interface SchoolGridProps {
  eyebrow?: string;
  title: string;
  schools: School[];
  /** Cards shown — three fills the row on desktop. */
  limit?: number;
  action?: { label: string; to: string };
}

/** One "by school type" block: eyebrow, big title, a row of three tiles. */
export function SchoolGrid({ eyebrow, title, schools, limit = 3, action }: SchoolGridProps) {
  if (schools.length === 0) return null;

  return (
    <section className="py-12">
      <div className="wrap">
        <SectionHeading eyebrow={eyebrow} title={title} action={action} />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.slice(0, limit).map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </div>
    </section>
  );
}
