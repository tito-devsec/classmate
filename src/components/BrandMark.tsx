import { Link } from "react-router-dom";

interface BrandMarkProps {
  /** `full` = badge + wordmark (header, footer); `mark` = badge only (overlay header). */
  variant?: "full" | "mark";
  /** Renders on photography / dark surfaces. */
  inverted?: boolean;
  className?: string;
}

/** Crimson badge with an open book and a gold "TZ" ribbon. */
export function BrandBadge({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="2" width="40" height="40" rx="9" fill="hsl(352 62% 43%)" />
      <path
        d="M14 13.5c3.4-1.3 6.7-1.3 10 .3v14.4c-3.3-1.6-6.6-1.6-10-.3Z"
        fill="#fff"
      />
      <path
        d="M34 13.5c-3.4-1.3-6.7-1.3-10 .3v14.4c3.3-1.6 6.6-1.6 10-.3Z"
        fill="#fff"
        fillOpacity="0.8"
      />
      <path d="M8 36h32l-3 6H11z" fill="hsl(38 76% 50%)" />
      <path d="M8 36 5 40l4 2z M40 36l3 4-4 2z" fill="hsl(38 76% 40%)" />
      <text
        x="24"
        y="40.6"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="#fff"
        fontFamily="Segoe UI, Open Sans, sans-serif"
      >
        TANZANIA
      </text>
    </svg>
  );
}

export function BrandMark({ variant = "full", inverted = false, className = "" }: BrandMarkProps) {
  if (variant === "mark") {
    return (
      <Link
        to="/"
        aria-label="Classmate — nyumbani"
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 shadow-sm ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M3 5.5c2.5-1 5-1 7.5.2v11c-2.5-1.2-5-1.2-7.5-.2Z" fill="hsl(352 62% 43%)" />
          <path d="M21 5.5c-2.5-1-5-1-7.5.2v11c2.5-1.2 5-1.2 7.5-.2Z" fill="hsl(352 62% 43%)" fillOpacity="0.7" />
        </svg>
      </Link>
    );
  }

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Classmate — nyumbani">
      <BrandBadge className="h-11 w-11 shrink-0" />
      <span className={`text-[21px] font-bold leading-none tracking-[-0.01em] ${inverted ? "text-white" : "text-foreground"}`}>
        Classmate
      </span>
    </Link>
  );
}
