import { useEffect, useState } from "react";
import { tokens } from "@/lib/api";
import type { UserProfile } from "@/services/auth";

/**
 * Parent session shown in the header. The bearer token lives in `tokens` (src/lib/api.ts);
 * this keeps the display profile beside it and broadcasts changes to every mounted header.
 */
const PROFILE_KEY = "classmate.profile.user";
const EVENT = "classmate:session";

export function readProfile(): UserProfile | null {
  if (!tokens.get("user")) return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function startSession(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function endSession() {
  tokens.clear("user");
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSession(): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(() => readProfile());

  useEffect(() => {
    const sync = () => setProfile(readProfile());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return profile;
}
