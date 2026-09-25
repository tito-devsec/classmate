import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { DICTIONARIES, LANGUAGES, type Lang } from "@/i18n/translations";

const SRC = path.resolve(__dirname, "..");

/** Every translate call and key-table reference in the app's own source. */
function usedKeys(): Map<string, string> {
  const found = new Map<string, string>();

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      // Specs quote example keys in their own assertions — scan shipped source only.
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) continue;

      const source = fs.readFileSync(full, "utf8");
      for (const match of source.matchAll(/\bt\(\s*"([a-zA-Z0-9._-]+)"/g)) {
        found.set(match[1], path.relative(SRC, full));
      }
      // Key tables (`{ key: "nav.ranking", … }`) are resolved through `t` at render time.
      for (const match of source.matchAll(/key:\s*"([a-zA-Z0-9._-]+)"/g)) {
        if (match[1].includes(".")) found.set(match[1], path.relative(SRC, full));
      }
    }
  };

  walk(SRC);
  return found;
}

describe("translations", () => {
  it("defines every key the app asks for", () => {
    const swahili = DICTIONARIES.sw;
    const missing = [...usedKeys()]
      .filter(([key]) => !(key in swahili))
      .map(([key, file]) => `${key} (${file})`);

    expect(missing).toEqual([]);
  });

  it("translates every key into both languages", () => {
    const keys = Object.keys(DICTIONARIES.sw);

    for (const lang of LANGUAGES.map((entry) => entry.code as Lang)) {
      const gaps = keys.filter((key) => !DICTIONARIES[lang][key as keyof typeof DICTIONARIES.sw]);
      expect(gaps, `${lang} is missing: ${gaps.join(", ")}`).toEqual([]);
    }
  });

  it("keeps the same placeholders in both languages", () => {
    const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

    for (const key of Object.keys(DICTIONARIES.sw) as (keyof typeof DICTIONARIES.sw)[]) {
      expect(placeholders(DICTIONARIES.en[key]), `placeholders differ for "${key}"`).toEqual(
        placeholders(DICTIONARIES.sw[key]),
      );
    }
  });
});
