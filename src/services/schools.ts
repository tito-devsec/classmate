import { apiFetch, isRecoverable, readMeta, unwrap } from "@/lib/api";
import { normalizeCollege, normalizeSchool, toApiBoard, toApiHandle, toApiLevel } from "@/lib/normalize";
import {
  colleges as seedColleges,
  schools as seedSchools,
  type College,
  type School,
} from "@/data/schools";

export interface SchoolQuery {
  q?: string;
  region?: string;
  level?: "O-Level" | "A-Level";
  gender?: "Boys" | "Girls" | "Mixed";
  boarding?: "Boarding" | "Day";
  minFee?: number;
  maxFee?: number;
  sort?: "rating" | "results" | "fee-asc" | "fee-desc" | "name";
  page?: number;
  limit?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  /** True when the API was unreachable and bundled data answered instead. */
  offline: boolean;
}

export interface RankingRail {
  id: string;
  title: string;
  subtitle: string;
  schools: School[];
}

export interface RegionFacet {
  name: string;
  schoolCount: number;
}

let warned = false;
const warnOnce = (error: unknown) => {
  if (warned) return;
  warned = true;
  console.warn("[classmate] API unreachable — showing the bundled catalogue.", error);
};

/** The same filtering the API applies, run over bundled data when it is offline. */
function filterSeed(query: SchoolQuery): School[] {
  const { q, region, level, gender, boarding, minFee, maxFee, sort = "rating" } = query;
  let rows = seedSchools.slice();

  if (q) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (school) =>
        school.name.toLowerCase().includes(needle) ||
        school.location.toLowerCase().includes(needle) ||
        school.region.toLowerCase().includes(needle) ||
        school.programs.some((program) => program.toLowerCase().includes(needle)),
    );
  }
  if (region) rows = rows.filter((school) => school.region === region);
  if (level) rows = rows.filter((school) => school.levels.includes(level));
  if (gender) rows = rows.filter((school) => school.gender === gender);
  if (boarding) rows = rows.filter((school) => school.boardingDay === boarding || school.boardingDay === "Both");
  if (minFee) rows = rows.filter((school) => school.tuitionMax >= minFee);
  if (maxFee) rows = rows.filter((school) => school.tuitionMin <= maxFee);

  const sorters: Record<string, (a: School, b: School) => number> = {
    rating: (a, b) => b.rating - a.rating,
    results: (a, b) => b.performance.divisionI - a.performance.divisionI,
    "fee-asc": (a, b) => a.tuitionMin - b.tuitionMin,
    "fee-desc": (a, b) => b.tuitionMax - a.tuitionMax,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return rows.sort(sorters[sort] ?? sorters.rating);
}

/** GET /schools/list */
export async function fetchSchools(query: SchoolQuery = {}): Promise<Page<School>> {
  try {
    const payload = await apiFetch("/schools/list", {
      query: {
        category: "SECONDARY",
        q: query.q,
        region: query.region,
        level: toApiLevel(query.level),
        handle: toApiHandle(query.gender),
        isBoard: toApiBoard(query.boarding),
        minFee: query.minFee,
        maxFee: query.maxFee,
        sort: query.sort,
        page: query.page ?? 1,
        limit: query.limit ?? 24,
      },
    });

    const rows = unwrap<Record<string, unknown>[]>(payload) ?? [];
    const meta = readMeta(payload);
    const items = rows.map(normalizeSchool);

    return {
      items,
      total: meta?.total ?? items.length,
      page: meta?.page ?? 1,
      totalPages: meta?.totalPages ?? 1,
      offline: false,
    };
  } catch (error) {
    if (!isRecoverable(error)) throw error;
    warnOnce(error);
    const rows = filterSeed(query);
    return { items: rows, total: rows.length, page: 1, totalPages: 1, offline: true };
  }
}

/** GET /schools/:id */
export async function fetchSchool(id: string): Promise<School | null> {
  const seeded = () => seedSchools.find((school) => school.id === id) ?? null;

  try {
    const payload = await apiFetch(`/schools/${encodeURIComponent(id)}`);
    const row = unwrap<Record<string, unknown>>(payload);
    return row ? normalizeSchool(row) : seeded();
  } catch (error) {
    if (isRecoverable(error)) warnOnce(error);
    return seeded();
  }
}

/** GET /schools/rankings — rails of school ids, hydrated against the live catalogue. */
export async function fetchRankings(): Promise<RankingRail[]> {
  try {
    const payload = await apiFetch("/schools/rankings");
    const rails = unwrap<{ id: string; title: string; subtitle: string; schools: string[] }[]>(payload);
    if (!Array.isArray(rails) || rails.length === 0) return seedRankings();

    const { items } = await fetchSchools({ limit: 100 });
    const byId = new Map(seedSchools.map((school) => [school.id, school]));
    for (const school of items) byId.set(school.id, school);

    return rails
      .map((rail) => ({
        ...rail,
        schools: rail.schools
          .map((id) => byId.get(String(id)))
          .filter((school): school is School => Boolean(school)),
      }))
      .filter((rail) => rail.schools.length > 0);
  } catch (error) {
    if (!isRecoverable(error)) throw error;
    warnOnce(error);
    return seedRankings();
  }
}

/** Built from whatever catalogue is available, so the home page never renders empty rails. */
function railsFrom(rows: School[]): RankingRail[] {
  const byScore = (a: School, b: School) =>
    b.performance.divisionI - a.performance.divisionI || b.rating - a.rating;

  const rail = (id: string, title: string, subtitle: string, source: School[]): RankingRail => ({
    id,
    title,
    subtitle,
    schools: source.slice().sort(byScore).slice(0, 8),
  });

  return [
    rail("top-overall", "Shule 10 Bora", "Zilizopimwa kwa matokeo, ada na mazingira", rows),
    rail("top-girls", "Shule Bora za Wasichana", "Wasichana pekee — O-Level na A-Level", rows.filter((s) => s.gender === "Girls")),
    rail("top-boys", "Shule Bora za Wavulana", "Wavulana pekee — nidhamu na matokeo", rows.filter((s) => s.gender === "Boys")),
    rail("top-boarding", "Shule Bora za Bweni", "Boarding kwa mikoa yote", rows.filter((s) => s.boardingDay !== "Day")),
    rail("top-day", "Shule Bora za Kutwa", "Day schools karibu na nyumbani", rows.filter((s) => s.boardingDay !== "Boarding")),
    rail("top-value", "Ada Nafuu, Matokeo Bora", "Chini ya TZS 2.5M kwa mwaka", rows.filter((s) => s.tuitionMin <= 2_500_000)),
  ].filter((rail) => rail.schools.length >= 2);
}

const seedRankings = () => railsFrom(seedSchools);

/** GET /schools/regions, with a client-side count as the fallback. */
export async function fetchRegions(): Promise<RegionFacet[]> {
  const fromRows = (rows: School[]) => {
    const counts = new Map<string, number>();
    for (const school of rows) counts.set(school.region, (counts.get(school.region) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, schoolCount]) => ({ name, schoolCount }))
      .sort((a, b) => b.schoolCount - a.schoolCount);
  };

  try {
    const payload = await apiFetch("/schools/regions");
    const rows = unwrap<RegionFacet[]>(payload);
    if (Array.isArray(rows) && rows.length > 0) return rows;

    const { items } = await fetchSchools({ limit: 100 });
    return fromRows(items);
  } catch (error) {
    if (!isRecoverable(error)) throw error;
    warnOnce(error);
    return fromRows(seedSchools);
  }
}

/** Colleges are not in the Phase 1 API yet — the bundled catalogue answers until they are. */
export async function fetchColleges(query: { q?: string; region?: string } = {}): Promise<College[]> {
  try {
    const payload = await apiFetch("/colleges", { query });
    const rows = unwrap<Record<string, unknown>[]>(payload);
    if (Array.isArray(rows) && rows.length > 0) return rows.map(normalizeCollege);
    return seedColleges;
  } catch {
    return seedColleges;
  }
}

export async function fetchCollege(id: string): Promise<College | null> {
  try {
    const payload = await apiFetch(`/colleges/${encodeURIComponent(id)}`);
    const row = unwrap<Record<string, unknown>>(payload);
    return row ? normalizeCollege(row) : (seedColleges.find((college) => college.id === id) ?? null);
  } catch {
    return seedColleges.find((college) => college.id === id) ?? null;
  }
}
