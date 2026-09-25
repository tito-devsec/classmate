import { useEffect, useState } from "react";

/**
 * Compare shortlist shared between the profile page's "+ Linganisha" action, the floating
 * counter and the compare page. Kept in localStorage so it survives navigation and reloads.
 */
const KEY = "classmate.compare";
const EVENT = "classmate:compare";
export const COMPARE_LIMIT = 3;

export function getCompareIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(String).slice(0, COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, COMPARE_LIMIT)));
  } catch {
    /* private mode — the shortlist lives for this page only */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function toggleCompare(id: string): { ids: string[]; added: boolean; full: boolean } {
  const ids = getCompareIds();
  if (ids.includes(id)) {
    const next = ids.filter((entry) => entry !== id);
    write(next);
    return { ids: next, added: false, full: false };
  }
  if (ids.length >= COMPARE_LIMIT) return { ids, added: false, full: true };
  const next = [...ids, id];
  write(next);
  return { ids: next, added: true, full: false };
}

export function setCompareIds(ids: string[]) {
  write([...new Set(ids)]);
}

/** Re-renders whenever the shortlist changes, in this tab or another. */
export function useCompareIds(): string[] {
  const [ids, setIds] = useState<string[]>(() => getCompareIds());

  useEffect(() => {
    const sync = () => setIds(getCompareIds());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}
