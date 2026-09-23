import { apiFetch, tokens, unwrap, type AuthRole } from "@/lib/api";

export interface UserProfile {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
}

export interface SchoolProfile {
  id: string;
  name: string;
  ownerName: string;
  ownerTitle?: string | null;
  location: string;
  region: string;
  level: string;
  category: string;
  isBoard: number;
  handle: string;
  feeRange?: string | null;
  phone: string;
  email: string;
  capacity?: number | null;
  programOffered?: string | null;
  /** 1 approved · 2 awaiting review · 5 rejected */
  status?: number;
}

interface Session<T> {
  token: string;
  profile: T;
}

/** Login responses vary in nesting; pull the token and the account out of either shape. */
function readSession<T>(payload: unknown, key: "user" | "school" | "admin"): Session<T> {
  const data = unwrap<Record<string, unknown>>(payload) ?? {};
  const token = String(data.token ?? data.accessToken ?? "");
  const profile = (data[key] ?? data.profile ?? data) as T;
  return { token, profile };
}

const remember = (role: AuthRole, token: string) => {
  if (token) tokens.set(role, token);
};

/* --------------------------------------------------------------------------- parents ---- */

export interface RegisterUserInput {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
}

/** POST /users/register */
export async function registerUser(input: RegisterUserInput): Promise<Session<UserProfile>> {
  const session = readSession<UserProfile>(
    await apiFetch("/users/register", { method: "POST", body: input }),
    "user",
  );
  remember("user", session.token);
  return session;
}

/** POST /users/login */
export async function loginUser(email: string, password: string): Promise<Session<UserProfile>> {
  const session = readSession<UserProfile>(
    await apiFetch("/users/login", { method: "POST", body: { email, password } }),
    "user",
  );
  remember("user", session.token);
  return session;
}

/** GET /users/profile */
export const fetchUserProfile = async (): Promise<UserProfile> =>
  unwrap<UserProfile>(await apiFetch("/users/profile", { auth: "user" }));

/* --------------------------------------------------------------------------- schools ---- */

export interface RegisterSchoolInput {
  name: string;
  ownerName: string;
  ownerTitle?: string;
  location: string;
  region: string;
  level: string;
  category: string;
  isBoard: number;
  handle: string;
  feeRange: string;
  phone: string;
  email: string;
  capacity?: number;
  programOffered?: string;
  password: string;
}

/** POST /schools/register */
export async function registerSchool(input: RegisterSchoolInput): Promise<Session<SchoolProfile>> {
  const session = readSession<SchoolProfile>(
    await apiFetch("/schools/register", { method: "POST", body: input }),
    "school",
  );
  remember("school", session.token);
  return session;
}

/** POST /schools/login */
export async function loginSchool(email: string, password: string): Promise<Session<SchoolProfile>> {
  const session = readSession<SchoolProfile>(
    await apiFetch("/schools/login", { method: "POST", body: { email, password } }),
    "school",
  );
  remember("school", session.token);
  return session;
}

/** GET /schools/profile/my-profile */
export const fetchSchoolProfile = async (): Promise<SchoolProfile> =>
  unwrap<SchoolProfile>(await apiFetch("/schools/profile/my-profile", { auth: "school" }));

/* ----------------------------------------------------------------------------- admin ---- */

/** POST /admin/login */
export async function loginAdmin(email: string, password: string): Promise<Session<{ email: string }>> {
  const session = readSession<{ email: string }>(
    await apiFetch("/admin/login", { method: "POST", body: { email, password } }),
    "admin",
  );
  remember("admin", session.token);
  return session;
}

export const isSignedIn = (role: AuthRole) => Boolean(tokens.get(role));
export const signOut = (role: AuthRole) => tokens.clear(role);
