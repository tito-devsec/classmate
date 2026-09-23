import { Link } from "react-router-dom";

interface BrandMarkProps {
  /** Renders the wordmark on a dark surface. */
  inverted?: boolean;
  className?: string;
}

/**
 * Classmate wordmark: a crimson tile holding a stylised open book, the name, and the
 * years-of-service chip that sits under it in the header.
 */
export function BrandMark({ inverted = false, className = "" }: BrandMarkProps) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`} aria-label="Classmate — nyumbani">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary shadow-[0_6px_14px_-6px_hsl(var(--primary))]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
          <path
            d="M3 5.4c2.7-.9 5.2-.9 7.6.2.3.1.5.4.5.7v12c0 .6-.6 1-1.1.7-2.2-1-4.5-1-7-.2V5.4Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M21 5.4c-2.7-.9-5.2-.9-7.6.2-.3.1-.5.4-.5.7v12c0 .6.6 1 1.1.7 2.2-1 4.5-1 7-.2V5.4Z"
            fill="white"
            fillOpacity="0.72"
          />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.0625rem] font-extrabold tracking-[-0.02em] ${
            inverted ? "text-background" : "text-foreground"
          }`}
        >
          Classmate
        </span>
        <span className="mt-1 flex items-center gap-1">
          <span className="rounded-[3px] bg-primary/12 px-1 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
            Tanzania
          </span>
          <span className={`text-[9px] font-medium ${inverted ? "text-background/60" : "text-muted-foreground"}`}>
            Shule &amp; Vyuo
          </span>
        </span>
      </span>
    </Link>
  );
}
