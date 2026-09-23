/**
 * HTTP client for the Classmate Node API (Phase 1 contract).
 *
 * `VITE_API_URL` is the collection's `base_url` — it already includes `/api`:
 *   - unset (dev default) → `/api/...`, which Vite proxies to `API_PROXY_TARGET`
 *     (see vite.config.ts), so the browser never makes a cross-origin call.
 *   - `https://api.example.com/api` → straight to the VPS. That web origin must be listed in
 *     the API's `CORS_ORIGIN`.
 */
const RAW_BASE = (import.meta.env.VITE_API_URL ?? "/api").trim();

/** Base URL with any trailing slash removed. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export class ApiError extends Error {
  readonly status: number;
  /** Field-level validation messages, when the API sends them. */
  readonly details?: Record<string, string>;
  /** True when the request never reached the API (offline, DNS, CORS, timeout). */
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.isNetworkError = status === 0;
  }
}

/**
 * A failure the caller may safely answer from bundled seed data: the API was unreachable,
 * broke, or does not implement that route yet.
 */
export const isRecoverable = (error: unknown) =>
  error instanceof ApiError && (error.isNetworkError || error.status >= 500 || error.status === 404);

export type AuthRole = "user" | "school" | "admin";

const TOKEN_KEYS: Record<AuthRole, string> = {
  user: "classmate.token.user",
  school: "classmate.token.school",
  admin: "classmate.token.admin",
};

/** Bearer tokens issued by `/users/login`, `/schools/login` and `/admin/login`. */
export const tokens = {
  get(role: AuthRole): string {
    try {
      return localStorage.getItem(TOKEN_KEYS[role]) ?? "";
    } catch {
      return "";
    }
  },
  set(role: AuthRole, token: string) {
    try {
      localStorage.setItem(TOKEN_KEYS[role], token);
    } catch {
      /* private mode — the session simply does not persist across reloads */
    }
  },
  clear(role: AuthRole) {
    try {
      localStorage.removeItem(TOKEN_KEYS[role]);
    } catch {
      /* ignore */
    }
  },
};

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Attaches the stored bearer token for this role. */
  auth?: AuthRole;
  /** Explicit bearer token, used during login flows before anything is stored. */
  token?: string;
}

function withQuery(path: string, query?: RequestOptions["query"]) {
  if (!query) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Pulls the payload out of whatever envelope the backend uses.
 * Phase 1 answers `{ success, data }`; plain arrays and `{ schools }` / `{ result }`
 * variants are accepted so a backend tweak does not blank the site.
 */
export function unwrap<T>(payload: unknown): T {
  if (payload === null || typeof payload !== "object") return payload as T;
  const record = payload as Record<string, unknown>;
  for (const key of ["data", "result", "results", "schools", "items", "applications"]) {
    if (record[key] !== undefined) return record[key] as T;
  }
  return payload as T;
}

/** Pagination metadata, wherever the backend chooses to put it. */
export function readMeta(payload: unknown): { page: number; limit: number; total: number; totalPages: number } | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, never>;
  const meta = (record.meta ?? record.pagination ?? record) as Record<string, number>;
  if (meta && (meta.total !== undefined || meta.totalPages !== undefined)) {
    const limit = Number(meta.limit ?? meta.perPage ?? 20);
    const total = Number(meta.total ?? 0);
    return {
      page: Number(meta.page ?? 1),
      limit,
      total,
      totalPages: Number(meta.totalPages ?? Math.max(Math.ceil(total / Math.max(limit, 1)), 1)),
    };
  }
  return null;
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, timeoutMs = 15_000, auth, token } = options;

  const bearer = token || (auth ? tokens.get(auth) : "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(apiUrl(withQuery(path, query)), {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error && error.name === "AbortError"
        ? "Ombi limechukua muda mrefu. Angalia mtandao wako."
        : "Imeshindikana kuwasiliana na seva.",
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const record = (payload ?? {}) as Record<string, unknown>;
    throw new ApiError(
      (record.message as string) || (record.error as string) || `Ombi limeshindwa (${response.status})`,
      response.status,
      (record.details as Record<string, string>) || (record.errors as Record<string, string>) || undefined,
    );
  }

  return payload as T;
}

/** GET that returns the unwrapped payload. */
export const apiGet = async <T>(path: string, options: RequestOptions = {}): Promise<T> =>
  unwrap<T>(await apiFetch(path, options));
