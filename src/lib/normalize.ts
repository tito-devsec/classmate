import { assetFor } from "@/lib/assets";
import type { College, School, SchoolPerformance } from "@/data/schools";

/**
 * Translates the platform API's Phase 1 vocabulary into the shape the UI renders.
 *
 * The API speaks `schID`, `level: "O-LEVEL"`, `handle: "MIXED"`, `isBoard: 1`,
 * `feeRange: "500000-800000"`. Older or richer records (an explicit `levels` array, a
 * `performance` block) pass through untouched, so the same function handles the live API and
 * the bundled dataset.
 */
type Raw = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  value === null || value === undefined ? fallback : String(value);

const num = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

/** "500000-800000" → [500000, 800000]. Single values become an equal min/max. */
export function parseFeeRange(value: unknown): [number, number] {
  const text = str(value).replace(/[^\d\-–]/g, "");
  if (!text) return [0, 0];
  const [min, max] = text.split(/[-–]/).map((part) => num(part, 0));
  return [min || 0, max || min || 0];
}

function levelsFrom(raw: Raw): School["levels"] {
  if (Array.isArray(raw.levels) && raw.levels.length > 0) return raw.levels as School["levels"];
  const code = str(raw.level).toUpperCase().replace(/[\s_]/g, "-");
  if (code === "BOTH" || code === "O-LEVEL-A-LEVEL") return ["O-Level", "A-Level"];
  if (code === "A-LEVEL" || code === "ALEVEL") return ["A-Level"];
  return ["O-Level"];
}

function genderFrom(raw: Raw): School["gender"] {
  const code = str(raw.handle ?? raw.gender).toUpperCase();
  if (code.startsWith("BOY") || code === "MALE") return "Boys";
  if (code.startsWith("GIRL") || code === "FEMALE") return "Girls";
  return "Mixed";
}

function boardingFrom(raw: Raw): School["boardingDay"] {
  if (typeof raw.boardingDay === "string") return raw.boardingDay as School["boardingDay"];
  const code = num(raw.isBoard, 0);
  if (code === 2) return "Both";
  return code === 1 ? "Boarding" : "Day";
}

const EMPTY_PERFORMANCE: SchoolPerformance = {
  divisionI: 0,
  divisionII: 0,
  divisionIII: 0,
  divisionIV: 0,
  division0: 0,
};

/** Photos rotate deterministically so API rows without imagery still render a full card. */
const STOCK = ["school-1", "school-2", "school-3", "school-4", "school-5", "school-6"];
function stockFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return STOCK[hash % STOCK.length];
}

export function normalizeSchool(raw: Raw): School {
  const id = str(raw.schID ?? raw.id ?? raw.schoolId ?? raw._id);
  const [feeMin, feeMax] = parseFeeRange(raw.feeRange);

  return {
    id,
    name: str(raw.name, "Shule"),
    location: str(raw.location),
    region: str(raw.region),
    tuitionMin: num(raw.tuitionMin, feeMin),
    tuitionMax: num(raw.tuitionMax, feeMax || feeMin),
    boardingDay: boardingFrom(raw),
    levels: levelsFrom(raw),
    gender: genderFrom(raw),
    description: str(raw.description ?? raw.about),
    facilities: list(raw.facilities),
    programs: list(raw.programs ?? raw.programOffered),
    phone: str(raw.phone),
    email: str(raw.email),
    image: assetFor(str(raw.image ?? raw.logo ?? raw.banner) || stockFor(id)),
    rating: num(raw.rating, 0),
    performance: (raw.performance as SchoolPerformance) ?? EMPTY_PERFORMANCE,
    feesStructure: (raw.feesStructure as School["feesStructure"]) ?? { otherContributions: 0 },
  };
}

export function normalizeCollege(raw: Raw): College {
  const id = str(raw.schID ?? raw.id ?? raw._id);
  const [feeMin, feeMax] = parseFeeRange(raw.feeRange);

  return {
    id,
    name: str(raw.name, "Chuo"),
    location: str(raw.location),
    region: str(raw.region),
    tuitionMin: num(raw.tuitionMin, feeMin),
    tuitionMax: num(raw.tuitionMax, feeMax || feeMin),
    type: "Private",
    category: str(raw.category).toUpperCase() === "INSTITUTE" ? "Institute" : "College",
    programs: list(raw.programs ?? raw.programOffered),
    description: str(raw.description ?? raw.about),
    facilities: list(raw.facilities),
    phone: str(raw.phone),
    email: str(raw.email),
    image: assetFor(str(raw.image ?? raw.logo) || stockFor(id)),
    rating: num(raw.rating, 0),
  };
}

/** UI value → the API's query vocabulary. */
export const toApiLevel = (level?: string) =>
  level === "A-Level" ? "A-LEVEL" : level === "O-Level" ? "O-LEVEL" : undefined;

export const toApiHandle = (gender?: string) =>
  gender === "Boys" ? "BOYS" : gender === "Girls" ? "GIRLS" : gender === "Mixed" ? "MIXED" : undefined;

export const toApiBoard = (boarding?: string) =>
  boarding === "Boarding" ? 1 : boarding === "Day" ? 0 : undefined;
