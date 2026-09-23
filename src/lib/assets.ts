import school1 from "@/assets/school-1.jpg";
import school2 from "@/assets/school-2.jpg";
import school3 from "@/assets/school-3.jpg";
import school4 from "@/assets/school-4.jpg";
import school5 from "@/assets/school-5.jpg";
import school6 from "@/assets/school-6.jpg";
import collegeCbe from "@/assets/college-cbe.jpg";
import collegeIfm from "@/assets/college-ifm.jpg";
import collegeDit from "@/assets/college-dit.jpg";
import collegeNit from "@/assets/college-nit.jpg";
import collegeTia from "@/assets/college-tia.jpg";
import collegeVeta from "@/assets/college-veta.jpg";
import collegeTibs from "@/assets/college-tibs.jpg";

/**
 * The API stores an asset slug (`school-1`) rather than a binary, so photography stays in the
 * web bundle where Vite can hash and optimise it. Absolute URLs pass through untouched, which
 * is what school-uploaded photos will look like once the backend serves them.
 */
const IMAGES: Record<string, string> = {
  "school-1": school1,
  "school-2": school2,
  "school-3": school3,
  "school-4": school4,
  "school-5": school5,
  "school-6": school6,
  "college-cbe": collegeCbe,
  "college-ifm": collegeIfm,
  "college-dit": collegeDit,
  "college-nit": collegeNit,
  "college-tia": collegeTia,
  "college-veta": collegeVeta,
  "college-tibs": collegeTibs,
};

const PLACEHOLDER = "/placeholder.svg";

export function assetFor(slug?: string | null): string {
  if (!slug) return PLACEHOLDER;
  if (/^(https?:)?\/\//.test(slug) || slug.startsWith("/")) return slug;
  return IMAGES[slug] ?? PLACEHOLDER;
}
