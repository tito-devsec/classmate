import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { createStore } from "./store.js";
import { unauthorized } from "./http.js";

/**
 * Development-only authentication.
 *
 * Tokens are opaque random strings kept in a file-backed session table — enough to exercise the
 * real API's `Authorization: Bearer …` flow locally. Production runs the VPS service, which
 * issues real JWTs; nothing here is meant to guard anything on the public internet.
 */
const sessions = createStore("sessions");

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== "string" || !stored.includes(":")) return false;
  const [salt, key] = stored.split(":");
  const expected = Buffer.from(key, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** @param {"user"|"school"|"admin"} kind */
export function issueToken(kind, subjectId, extra = {}) {
  const token = randomBytes(24).toString("hex");
  sessions.insert({ id: token, kind, subjectId, ...extra });
  return token;
}

export function readToken(req) {
  const header = req.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/** Express middleware factory: `requireAuth("admin")`. */
export const requireAuth = (kind) => (req, res, next) => {
  const token = readToken(req);
  const session = token ? sessions.find(token) : null;

  if (!session || (kind && session.kind !== kind)) {
    next(unauthorized("Tafadhali ingia tena."));
    return;
  }
  req.auth = { kind: session.kind, subjectId: session.subjectId };
  next();
};

export const seedAdmin = () => ({ email: config.admin.email, password: config.admin.password });
