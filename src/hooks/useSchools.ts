import { useQuery } from "@tanstack/react-query";
import {
  fetchCollege,
  fetchColleges,
  fetchRankings,
  fetchRegions,
  fetchSchool,
  fetchSchools,
  type SchoolQuery,
} from "@/services/schools";

/** Query keys are exported so mutations elsewhere can invalidate precisely. */
export const schoolKeys = {
  all: ["schools"] as const,
  list: (query: SchoolQuery) => ["schools", "list", query] as const,
  detail: (id: string) => ["schools", "detail", id] as const,
  rankings: ["schools", "rankings"] as const,
  regions: ["schools", "regions"] as const,
  colleges: (query: { q?: string; region?: string }) => ["colleges", "list", query] as const,
  college: (id: string) => ["colleges", "detail", id] as const,
};

const FIVE_MINUTES = 5 * 60 * 1000;

export const useSchools = (query: SchoolQuery = {}) =>
  useQuery({
    queryKey: schoolKeys.list(query),
    queryFn: () => fetchSchools(query),
    staleTime: FIVE_MINUTES,
  });

export const useSchool = (id?: string) =>
  useQuery({
    queryKey: schoolKeys.detail(id ?? ""),
    queryFn: () => fetchSchool(id as string),
    enabled: Boolean(id),
    staleTime: FIVE_MINUTES,
  });

export const useRankings = () =>
  useQuery({
    queryKey: schoolKeys.rankings,
    queryFn: fetchRankings,
    staleTime: FIVE_MINUTES,
  });

export const useRegions = () =>
  useQuery({
    queryKey: schoolKeys.regions,
    queryFn: fetchRegions,
    staleTime: FIVE_MINUTES,
  });

export const useColleges = (query: { q?: string; region?: string } = {}) =>
  useQuery({
    queryKey: schoolKeys.colleges(query),
    queryFn: () => fetchColleges(query),
    staleTime: FIVE_MINUTES,
  });

export const useCollege = (id?: string) =>
  useQuery({
    queryKey: schoolKeys.college(id ?? ""),
    queryFn: () => fetchCollege(id as string),
    enabled: Boolean(id),
    staleTime: FIVE_MINUTES,
  });
