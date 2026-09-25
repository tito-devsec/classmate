import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Twelve-point burst behind the "recommended" label. */
export function Starburst({ className = "h-4 w-4", ...props }: IconProps) {
  const points = Array.from({ length: 24 }, (_, index) => {
    const radius = index % 2 === 0 ? 11 : 7;
    const angle = (index * 15 - 90) * (Math.PI / 180);
    return `${(12 + radius * Math.cos(angle)).toFixed(2)},${(12 + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <polygon points={points} fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="#fff" fillOpacity="0.9" />
    </svg>
  );
}

/** Money bag with a coin — the fee glyph on every card. */
export function MoneyBag({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor" {...props}>
      <path d="M9.2 2.5h5.6c.5 0 .8.5.6.9l-1.3 2.4h-4.2L8.6 3.4c-.2-.4.1-.9.6-.9Z" />
      <path d="M8.9 7.2h6.2c3.3 2.2 5.4 5.4 5.4 8.6 0 3.6-3 5.7-8.5 5.7S3.5 19.4 3.5 15.8c0-3.2 2.1-6.4 5.4-8.6Z" />
      <path
        d="M12 10.2a.7.7 0 0 1 .7.7v.5c1 .1 1.8.6 2 1.5a.7.7 0 0 1-1.4.3c-.1-.3-.5-.5-1.2-.5-.8 0-1.2.3-1.2.7 0 .3.2.5 1.4.8 1.5.3 2.5.8 2.5 2.1 0 1-.8 1.7-2.1 1.9v.5a.7.7 0 0 1-1.4 0v-.5c-1.1-.2-1.9-.8-2.1-1.7a.7.7 0 0 1 1.4-.3c.1.4.6.7 1.4.7.9 0 1.4-.3 1.4-.7 0-.4-.3-.6-1.5-.9-1.4-.3-2.4-.8-2.4-2 0-1 .8-1.7 2-1.9v-.5a.7.7 0 0 1 .5-.7Z"
        fill="#fff"
        fillOpacity="0.92"
      />
    </svg>
  );
}

/** Venus / Mars / both — the "who studies here" glyph. */
export function GenderIcon({ gender, className = "h-4 w-4" }: { gender: "Boys" | "Girls" | "Mixed"; className?: string }) {
  if (gender === "Girls") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8.5" r="5.5" />
        <path d="M12 14v8M8.5 18.5h7" />
      </svg>
    );
  }
  if (gender === "Boys") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5.5" />
        <path d="M14 10l6-6M15 4h5v5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="14" r="4.5" />
      <path d="M9 18.5v3M7 21.5h4M12.3 10.7l5.2-5.2M14 5.5h3.5V9" />
    </svg>
  );
}

/** Tanzania flag, drawn to the 2:3 standard, rounded like a photo thumbnail. */
export function FlagTZ({ className = "h-[30px] w-[44px]", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 36 24" className={`${className} rounded-[3px] shadow-sm`} aria-label="Tanzania" role="img" {...props}>
      <path d="M0 0h36v24H0z" fill="#1EB53A" />
      <path d="M0 24 36 0v24z" fill="#00A3DD" />
      <path d="M0 24 36 0v4.2L6.3 24z M0 19.8 29.7 0H36L0 24z" fill="#FCD116" />
      <path d="M0 21.6 32.4 0H36v2.4L3.6 24H0z" fill="#000" />
    </svg>
  );
}

/** United States flag — 13 stripes and a starred canton, drawn to the 10:19 ratio. */
export function FlagUS({ className = "h-[30px] w-[44px]", ...props }: IconProps) {
  const stars: { x: number; y: number }[] = [];
  // Nine rows alternating six and five stars, as on the flag.
  for (let row = 0; row < 9; row += 1) {
    const count = row % 2 === 0 ? 6 : 5;
    const offset = row % 2 === 0 ? 0 : 1.2;
    for (let column = 0; column < count; column += 1) {
      stars.push({ x: 1.6 + offset + column * 2.4, y: 1.4 + row * 1.4 });
    }
  }

  return (
    <svg viewBox="0 0 38 24" className={`${className} rounded-[3px] shadow-sm`} aria-label="United States" role="img" {...props}>
      <rect width="38" height="24" fill="#fff" />
      {Array.from({ length: 7 }).map((_, index) => (
        <rect key={index} y={index * 3.69} width="38" height="1.85" fill="#B22234" />
      ))}
      <rect width="16" height="12.92" fill="#3C3B6E" />
      {stars.map((star, index) => (
        <circle key={index} cx={star.x} cy={star.y} r="0.5" fill="#fff" />
      ))}
    </svg>
  );
}

/** Gold "new" ribbon that floats over the Ranking link. */
export function NewBadge({ label = "MPYA", className = "" }: { label?: string; className?: string }) {
  const points = Array.from({ length: 24 }, (_, index) => {
    const radius = index % 2 === 0 ? 20 : 16;
    const angle = (index * 15 - 90) * (Math.PI / 180);
    return `${(20 + radius * Math.cos(angle)).toFixed(2)},${(20 + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

  return (
    <span className={`relative inline-flex h-8 w-8 items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full text-gold drop-shadow-sm">
        <polygon points={points} fill="currentColor" />
      </svg>
      <span className="relative text-[8px] font-bold leading-none text-white">{label}</span>
    </span>
  );
}

/** Five-point star, drawn around a centre point — the "delighted" eyes. */
function starPath(cx: number, cy: number, radius: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const r = index % 2 === 0 ? radius : radius * 0.45;
    const angle = (index * 36 - 90) * (Math.PI / 180);
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

const heartPath = (cx: number, cy: number, s: number) =>
  `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy - s * 0.2} ${cx - s * 0.7},${cy - s * 1.5} ${cx},${cy - s * 0.5} ` +
  `C${cx + s * 0.7},${cy - s * 1.5} ${cx + s * 1.4},${cy - s * 0.2} ${cx},${cy + s * 0.9} Z`;

/**
 * Mood face for the 1–5 satisfaction question: one outlined circle, with the brows, eyes and
 * mouth swapped per level so the row reads as a single scale from cross to delighted.
 */
export function RatingFace({ level, className = "h-14 w-14" }: { level: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const stroke = { stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, fill: "none" };

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21" {...stroke} />

      {/* Eyes */}
      {level === 1 && (
        <g {...stroke}>
          <path d="M13 17 L21 21 M35 17 L27 21" />
          <path d="M15 24 L20 24 M28 24 L33 24" />
        </g>
      )}
      {(level === 2 || level === 3) && (
        <g fill="currentColor" stroke="none">
          <circle cx="17" cy="21" r="2.2" />
          <circle cx="31" cy="21" r="2.2" />
        </g>
      )}
      {level === 4 && (
        <g fill="currentColor" stroke="none">
          <polygon points={starPath(17, 21, 4.4)} />
          <polygon points={starPath(31, 21, 4.4)} />
        </g>
      )}
      {level === 5 && (
        <g fill="currentColor" stroke="none">
          <path d={heartPath(17, 21, 3.6)} />
          <path d={heartPath(31, 21, 3.6)} />
        </g>
      )}

      {/* Mouth */}
      {level === 1 && <path d="M16 34 Q24 27 32 34" {...stroke} />}
      {level === 2 && <path d="M16 33 Q24 27 32 33" {...stroke} />}
      {level === 3 && <path d="M16 29 Q24 34 32 29" {...stroke} />}
      {level === 4 && <path d="M14 28 Q24 38 34 28" {...stroke} />}
      {level === 5 && <path d="M13 28 Q24 40 35 28 Z" fill="currentColor" stroke="none" />}
    </svg>
  );
}

/** Location pin (filled) matching the money bag weight. */
export function PinIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor" {...props}>
      <path d="M12 2.2c-4 0-7.2 3.1-7.2 7 0 5.3 6.3 12 6.6 12.3a.8.8 0 0 0 1.2 0c.3-.3 6.6-7 6.6-12.3 0-3.9-3.2-7-7.2-7Zm0 9.8a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6Z" />
    </svg>
  );
}
