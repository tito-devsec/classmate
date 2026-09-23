import { ApiError, apiFetch, readMeta, tokens, unwrap } from "@/lib/api";

/** `status` values used across the applications API. */
export const APPLICATION_STATUS = {
  SUBMITTED: 1,
  REVIEWING: 2,
  RECOMMENDED: 3,
  ENROLLED: 4,
  DECLINED: 5,
} as const;

export const STATUS_LABEL: Record<number, string> = {
  1: "Imepokelewa",
  2: "Inapitiwa",
  3: "Umependekezewa shule",
  4: "Amejiunga",
  5: "Imesitishwa",
};

export interface ApplicationInput {
  parentName: string;
  phone: string;
  email?: string;
  /** FORM_ONE, FORM_FIVE, COLLEGE … */
  applicationLevel: string;
  isBoarding: number;
  studentGender?: string;
  targetBudget?: string;
  studentLocation?: string;
  schoolLocation?: string;
  religion?: string;
  beginYear?: number;
  currentEducationLevel?: string;
  collegeType?: string;
  course?: string;
  comment?: string;
  /** Set when the parent applied from a specific school profile. */
  schID?: string | number | null;
}

export interface Application extends ApplicationInput {
  id: string;
  createdAt: string;
  status: number;
  recommendedSchools?: (string | number)[];
}

export interface ApplicationResult {
  application: Application;
  /** True when the API was unreachable and the enquiry was queued in this browser. */
  queued: boolean;
}

const QUEUE_KEY = "classmate.pendingApplications";

const readQueue = (): ApplicationInput[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const writeQueue = (rows: ApplicationInput[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(rows));
  } catch {
    /* private mode — nothing to persist to */
  }
};

/**
 * POST /leads/submit
 *
 * Validation errors (400/422) are thrown so the form can show them per field. If the API is
 * unreachable the enquiry is queued locally and retried on the next submit, so a parent on a
 * weak connection never loses what they typed.
 */
export async function submitApplication(input: ApplicationInput): Promise<ApplicationResult> {
  try {
    const payload = await apiFetch("/leads/submit", {
      method: "POST",
      body: input,
      // Attaches the parent's token when signed in, so it shows in "my applications".
      ...(tokens.get("user") ? { auth: "user" as const } : {}),
    });
    void flushQueue();
    return { application: unwrap<Application>(payload), queued: false };
  } catch (error) {
    if (error instanceof ApiError && !error.isNetworkError && error.status < 500) throw error;

    writeQueue([input, ...readQueue()]);
    return {
      application: {
        ...input,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: APPLICATION_STATUS.SUBMITTED,
      },
      queued: true,
    };
  }
}

/** Retries enquiries captured while the API was down. Safe to call repeatedly. */
export async function flushQueue(): Promise<number> {
  const pending = readQueue();
  if (pending.length === 0) return 0;

  const stillPending: ApplicationInput[] = [];
  let sent = 0;

  for (const input of pending) {
    try {
      await apiFetch("/leads/submit", {
        method: "POST",
        body: input,
        ...(tokens.get("user") ? { auth: "user" as const } : {}),
      });
      sent += 1;
    } catch (error) {
      // Keep network failures for the next attempt; drop payloads the API rejects outright.
      if (error instanceof ApiError && !error.isNetworkError && error.status < 500) continue;
      stillPending.push(input);
    }
  }

  writeQueue(stillPending);
  return sent;
}

/** GET /leads/my-applications */
export async function fetchMyApplications(page = 1, limit = 10) {
  const payload = await apiFetch("/leads/my-applications", { query: { page, limit }, auth: "user" });
  const meta = readMeta(payload);
  const items = unwrap<Application[]>(payload) ?? [];
  return { items, total: meta?.total ?? items.length, page: meta?.page ?? page, totalPages: meta?.totalPages ?? 1 };
}

/** GET /leads/:id */
export const fetchApplication = async (id: string): Promise<Application> =>
  unwrap<Application>(await apiFetch(`/leads/${encodeURIComponent(id)}`, { auth: "user" }));

/** Number of enquiries waiting for the connection to come back. */
export const pendingCount = () => readQueue().length;
