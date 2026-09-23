import { apiFetch, readMeta, unwrap } from "@/lib/api";
import type { Application } from "@/services/applications";
import type { SchoolProfile } from "@/services/auth";

export interface DashboardStats {
  applications: {
    total: number;
    submitted: number;
    reviewing: number;
    recommended: number;
    enrolled: number;
    declined: number;
  };
  schools: {
    listed: number;
    registrations: number;
    pending: number;
    approved: number;
  };
}

/** GET /admin/dashboard/stats */
export const fetchDashboardStats = async (): Promise<DashboardStats> =>
  unwrap<DashboardStats>(await apiFetch("/admin/dashboard/stats", { auth: "admin" }));

/** GET /admin/applications?status&page&limit */
export async function fetchApplications(params: { status?: number; page?: number; limit?: number } = {}) {
  const payload = await apiFetch("/admin/applications", {
    query: { status: params.status, page: params.page ?? 1, limit: params.limit ?? 20 },
    auth: "admin",
  });
  const items = unwrap<Application[]>(payload) ?? [];
  const meta = readMeta(payload);
  return { items, total: meta?.total ?? items.length, page: meta?.page ?? 1, totalPages: meta?.totalPages ?? 1 };
}

/** GET /admin/applications/:id */
export const fetchApplicationDetails = async (id: string): Promise<Application> =>
  unwrap<Application>(await apiFetch(`/admin/applications/${encodeURIComponent(id)}`, { auth: "admin" }));

/** PUT /admin/applications/:id */
export const updateApplication = async (
  id: string,
  patch: { status?: number; recommendedSchools?: (string | number)[] },
): Promise<Application> =>
  unwrap<Application>(
    await apiFetch(`/admin/applications/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: patch,
      auth: "admin",
    }),
  );

/** GET /admin/schools/registrations?status&page&limit */
export async function fetchSchoolRegistrations(params: { status?: number; page?: number; limit?: number } = {}) {
  const payload = await apiFetch("/admin/schools/registrations", {
    query: { status: params.status, page: params.page ?? 1, limit: params.limit ?? 20 },
    auth: "admin",
  });
  const items = unwrap<SchoolProfile[]>(payload) ?? [];
  const meta = readMeta(payload);
  return { items, total: meta?.total ?? items.length, page: meta?.page ?? 1, totalPages: meta?.totalPages ?? 1 };
}

/** GET /admin/schools/:id */
export const fetchSchoolRegistration = async (id: string): Promise<SchoolProfile> =>
  unwrap<SchoolProfile>(await apiFetch(`/admin/schools/${encodeURIComponent(id)}`, { auth: "admin" }));

/** PUT /admin/schools/:id/approve */
export const reviewSchoolRegistration = async (
  id: string,
  approve: boolean,
  reason?: string,
): Promise<SchoolProfile> =>
  unwrap<SchoolProfile>(
    await apiFetch(`/admin/schools/${encodeURIComponent(id)}/approve`, {
      method: "PUT",
      body: { approve, reason },
      auth: "admin",
    }),
  );
