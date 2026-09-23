import type { School } from "@/data/schools";

/**
 * Classmate grade — the letter badge shown on every school card.
 *
 * Derived, never hand-assigned: 60% national-exam results (Division I share), 40% the parent
 * rating. Two schools with the same numbers always get the same letter, and the rule can be
 * explained to a school that asks why it sits where it does.
 */
export function gradeScore(school: School): number {
  return school.performance.divisionI * 0.6 + (school.rating / 5) * 100 * 0.4;
}

export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-";

export function gradeFor(school: School): Grade {
  const score = gradeScore(school);
  if (score >= 85) return "A+";
  if (score >= 75) return "A";
  if (score >= 68) return "A-";
  if (score >= 60) return "B+";
  if (score >= 52) return "B";
  return "B-";
}

/** The badge shown on the strongest schools in any rail. */
export const isRecommended = (school: School) => gradeScore(school) >= 75;

/** Short fee label used on cards: "TZS 1.5M – 2.2M". */
export function feeRange(min: number, max: number): string {
  const m = (value: number) => `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return min === max ? `TZS ${m(min)}` : `TZS ${m(min)} – ${m(max)}`;
}
