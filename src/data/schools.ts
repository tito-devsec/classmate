import schoolsJson from "@data/schools.json";
import collegesJson from "@data/colleges.json";
import { assetFor } from "@/lib/assets";

export interface SchoolPerformance {
  divisionI: number;
  divisionII: number;
  divisionIII: number;
  divisionIV: number;
  division0: number;
}

export interface FeesStructure {
  boarding?: number;
  day?: number;
  otherContributions: number;
}

export interface School {
  id: string;
  name: string;
  location: string;
  region: string;
  tuitionMin: number;
  tuitionMax: number;
  boardingDay: "Boarding" | "Day" | "Both";
  levels: ("O-Level" | "A-Level")[];
  gender: "Boys" | "Girls" | "Mixed";
  description: string;
  facilities: string[];
  programs: string[];
  phone: string;
  email: string;
  image: string;
  rating: number;
  performance: SchoolPerformance;
  feesStructure: FeesStructure;
}

export interface College {
  id: string;
  name: string;
  location: string;
  region: string;
  tuitionMin: number;
  tuitionMax: number;
  type: "Private";
  category: "Institute" | "College";
  programs: string[];
  description: string;
  facilities: string[];
  phone: string;
  email: string;
  image: string;
  rating: number;
}

/** Shape stored in data/*.json and served by the API — `image` is an asset slug. */
export type SchoolRecord = Omit<School, "image"> & { image: string };
export type CollegeRecord = Omit<College, "image"> & { image: string };

/** Resolves the API's asset slug to a bundled image. */
export const hydrateSchool = (record: SchoolRecord): School => ({
  ...record,
  image: assetFor(record.image),
});

export const hydrateCollege = (record: CollegeRecord): College => ({
  ...record,
  image: assetFor(record.image),
});

/**
 * Bundled copy of the dataset the API serves from `data/`.
 *
 * It is the offline fallback: if the backend is unreachable the site still renders real
 * schools instead of an empty state. Live data always wins when the API answers.
 */
export const schools: School[] = (schoolsJson as unknown as SchoolRecord[]).map(hydrateSchool);
export const colleges: College[] = (collegesJson as unknown as CollegeRecord[]).map(hydrateCollege);

export const regions: string[] = [...new Set(schools.map((school) => school.region))];

export function formatTZS(amount: number): string {
  return new Intl.NumberFormat("sw-TZ").format(amount) + " TZS";
}
