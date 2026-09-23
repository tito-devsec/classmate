import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));

/** server/ */
export const SERVER_ROOT = path.resolve(here, "..");
/** repository root — holds the shared `data/` dataset used by API and web app. */
export const REPO_ROOT = path.resolve(SERVER_ROOT, "..");

dotenv.config({ path: path.join(SERVER_ROOT, ".env") });

const int = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  env: process.env.NODE_ENV || "development",
  /** Matches the Postman collection's base_url (http://localhost:5000/api). */
  port: int(process.env.PORT, 5000),
  /** Every route is mounted under this prefix. */
  apiPrefix: process.env.API_PREFIX || "/api",

  /** Shared dataset shipped with the repo (data/schools.json, data/colleges.json). */
  dataDir: process.env.DATA_DIR || path.join(REPO_ROOT, "data"),
  /** Writable directory for runtime state (accounts, applications). */
  stateDir: process.env.STATE_DIR || path.join(SERVER_ROOT, "data"),

  /** Comma separated list of allowed browser origins. */
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:8080,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** Seed administrator for the mock admin console. */
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@classmate.tz",
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!@",
  },

  ai: {
    /** Any OpenAI-compatible chat-completions provider. */
    baseUrl: (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    enabled: Boolean(process.env.AI_API_KEY),
  },
};
