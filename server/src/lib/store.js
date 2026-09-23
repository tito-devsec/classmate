import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";

/**
 * File-backed collection store.
 *
 * Deliberately tiny: it keeps the API dependency-free for local development while
 * isolating every write behind one seam. Swapping in Postgres/Mongo later means
 * re-implementing `list` / `insert` / `update` and nothing else.
 */
export function createStore(name, seed = []) {
  const file = path.join(config.stateDir, `${name}.json`);

  const ensure = () => {
    fs.mkdirSync(config.stateDir, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed, null, 2));
  };

  const readAll = () => {
    ensure();
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return [];
    }
  };

  const writeAll = (rows) => {
    ensure();
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
    return rows;
  };

  return {
    list() {
      return readAll();
    },
    find(id) {
      return readAll().find((row) => row.id === id) || null;
    },
    insert(record) {
      const rows = readAll();
      const row = { id: randomUUID(), createdAt: new Date().toISOString(), ...record };
      writeAll([row, ...rows]);
      return row;
    },
    update(id, patch) {
      const rows = readAll();
      let updated = null;
      const next = rows.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...patch, updatedAt: new Date().toISOString() };
        return updated;
      });
      if (updated) writeAll(next);
      return updated;
    },
  };
}
