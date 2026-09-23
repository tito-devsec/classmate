import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const read = (file) => JSON.parse(fs.readFileSync(path.join(config.dataDir, file), "utf8"));

let cache = null;

/** Loads the shared dataset once per process — re-read on every call in development. */
export function dataset() {
  if (cache && config.env !== "development") return cache;
  cache = {
    schools: read("schools.json"),
    colleges: read("colleges.json"),
  };
  return cache;
}

/* ------------------------------------------------------------------------------------------
 * Wire format
 *
 * The platform API speaks the Phase 1 vocabulary: `schID`, `level: "O-LEVEL"`,
 * `category: "SECONDARY"`, `isBoard: 1`, `handle: "MIXED"`, `feeRange: "500000-800000"`.
 * The seed dataset is authored in the friendlier shape the web app renders, so every read
 * projects through here — one place to keep both sides honest.
 * ---------------------------------------------------------------------------------------- */

const HANDLE = { Boys: "BOYS", Girls: "GIRLS", Mixed: "MIXED" };
const IS_BOARD = { Boarding: 1, Day: 0, Both: 2 };

const levelCode = (levels) => {
  if (levels.includes("O-Level") && levels.includes("A-Level")) return "BOTH";
  return levels.includes("A-Level") ? "A-LEVEL" : "O-LEVEL";
};

export function toApiSchool(school) {
  return {
    schID: school.id,
    id: school.id,
    name: school.name,
    location: school.location,
    region: school.region,
    level: levelCode(school.levels),
    category: "SECONDARY",
    isBoard: IS_BOARD[school.boardingDay] ?? 0,
    handle: HANDLE[school.gender] ?? "MIXED",
    feeRange: `${school.tuitionMin}-${school.tuitionMax}`,
    phone: school.phone,
    email: school.email,
    capacity: null,
    programOffered: school.programs.join(", "),
    status: 1,
    // Richer profile fields the web app renders when the API provides them.
    image: school.image,
    rating: school.rating,
    description: school.description,
    facilities: school.facilities,
    performance: school.performance,
    feesStructure: school.feesStructure,
  };
}

export function toApiCollege(college) {
  return {
    schID: college.id,
    id: college.id,
    name: college.name,
    location: college.location,
    region: college.region,
    level: "COLLEGE",
    category: college.category === "Institute" ? "INSTITUTE" : "COLLEGE",
    isBoard: 0,
    handle: "MIXED",
    feeRange: `${college.tuitionMin}-${college.tuitionMax}`,
    phone: college.phone,
    email: college.email,
    capacity: null,
    programOffered: college.programs.join(", "),
    status: 1,
    image: college.image,
    rating: college.rating,
    description: college.description,
    facilities: college.facilities,
  };
}

export const getSchools = () => dataset().schools;
export const getColleges = () => dataset().colleges;

export const getSchoolById = (id) =>
  getSchools().find((school) => String(school.id) === String(id)) || null;
export const getCollegeById = (id) =>
  getColleges().find((college) => String(college.id) === String(id)) || null;

/** Distinct regions with a school count, ordered by how many schools they hold. */
export function getRegions() {
  const counts = new Map();
  for (const school of getSchools()) counts.set(school.region, (counts.get(school.region) || 0) + 1);
  for (const college of getColleges()) if (!counts.has(college.region)) counts.set(college.region, 0);

  return [...counts.entries()]
    .map(([name, schoolCount]) => ({ name, schoolCount }))
    .sort((a, b) => b.schoolCount - a.schoolCount || a.name.localeCompare(b.name));
}

const matches = (haystack, needle) => String(haystack).toLowerCase().includes(needle);

/**
 * Filters + sorts schools. Accepts the collection's query vocabulary
 * (`category`, `level`, `region`, `page`, `limit`) plus the extra facets the web app sends.
 */
export function querySchools(query = {}) {
  const { q, search, category, level, region, handle, gender, isBoard, boarding, minFee, maxFee, sort = "rating" } = query;

  const isCollegeCategory = category && ["COLLEGE", "INSTITUTE"].includes(String(category).toUpperCase());
  let rows = (isCollegeCategory ? getColleges().map(toApiCollege) : getSchools().map(toApiSchool)).slice();

  const needle = String(q || search || "").trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (school) =>
        matches(school.name, needle) ||
        matches(school.location, needle) ||
        matches(school.region, needle) ||
        matches(school.programOffered, needle),
    );
  }
  if (category && !isCollegeCategory) {
    rows = rows.filter((school) => school.category === String(category).toUpperCase());
  }
  if (level) {
    const wanted = String(level).toUpperCase();
    rows = rows.filter((school) => school.level === wanted || school.level === "BOTH");
  }
  if (region) rows = rows.filter((school) => school.region === region);

  const wantedHandle = handle || gender;
  if (wantedHandle) {
    const code = HANDLE[wantedHandle] ?? String(wantedHandle).toUpperCase();
    rows = rows.filter((school) => school.handle === code);
  }

  const wantedBoard = isBoard ?? (boarding ? IS_BOARD[boarding] : undefined);
  if (wantedBoard !== undefined && wantedBoard !== "") {
    rows = rows.filter((school) => school.isBoard === Number(wantedBoard) || school.isBoard === 2);
  }

  const fee = (school) => school.feeRange.split("-").map(Number);
  if (minFee) rows = rows.filter((school) => fee(school)[1] >= Number(minFee));
  if (maxFee) rows = rows.filter((school) => fee(school)[0] <= Number(maxFee));

  const sorters = {
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    results: (a, b) => (b.performance?.divisionI ?? 0) - (a.performance?.divisionI ?? 0),
    "fee-asc": (a, b) => fee(a)[0] - fee(b)[0],
    "fee-desc": (a, b) => fee(b)[1] - fee(a)[1],
    name: (a, b) => a.name.localeCompare(b.name),
  };
  rows.sort(sorters[sort] || sorters.rating);

  return rows;
}

/** Paginates any array into the envelope every list endpoint returns. */
export function paginate(rows, { page = 1, limit = 20 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const totalPages = Math.max(Math.ceil(rows.length / safeLimit), 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (safePage - 1) * safeLimit;
  return {
    data: rows.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: rows.length, totalPages },
  };
}

/**
 * Curated ranking rails powering the home page.
 * Each rail is a stable, explainable ordering — never a random sample.
 */
export function getRankings() {
  const schools = getSchools();
  const byScore = (a, b) => b.performance.divisionI - a.performance.divisionI || b.rating - a.rating;

  const rail = (id, title, subtitle, rows) => ({
    id,
    title,
    subtitle,
    schools: rows.slice().sort(byScore).slice(0, 8).map((school) => school.id),
  });

  return [
    rail("top-overall", "Shule 10 Bora", "Zilizopimwa kwa matokeo, ada na mazingira", schools),
    rail("top-girls", "Shule Bora za Wasichana", "Wasichana pekee — O-Level na A-Level", schools.filter((s) => s.gender === "Girls")),
    rail("top-boys", "Shule Bora za Wavulana", "Wavulana pekee — nidhamu na matokeo", schools.filter((s) => s.gender === "Boys")),
    rail("top-boarding", "Shule Bora za Bweni", "Boarding kwa mikoa yote", schools.filter((s) => s.boardingDay !== "Day")),
    rail("top-day", "Shule Bora za Kutwa", "Day schools karibu na nyumbani", schools.filter((s) => s.boardingDay !== "Boarding")),
    rail("top-value", "Ada Nafuu, Matokeo Bora", "Chini ya TZS 2.5M kwa mwaka", schools.filter((s) => s.tuitionMin <= 2_500_000)),
  ].filter((entry) => entry.schools.length > 0);
}
