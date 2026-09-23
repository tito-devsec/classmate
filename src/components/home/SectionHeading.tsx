import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  /** Small label above the title, e.g. "Kwa aina ya shule". */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
}

export function SectionHeading({ eyebrow, title, subtitle, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display-lg mt-2 text-foreground">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-[0.9375rem] text-muted-foreground">{subtitle}</p>}
      </div>

      {action && (
        <Link
          to={action.to}
          className="group flex shrink-0 items-center gap-2 text-[0.9375rem] font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
