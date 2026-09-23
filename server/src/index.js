import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[classmate-api] ${config.env} listening on http://localhost:${config.port}`);
  console.log(`[classmate-api] CORS origins: ${config.corsOrigins.join(", ") || "(none)"}`);
  console.log(`[classmate-api] advisor: ${config.ai.enabled ? config.ai.model : "disabled"}`);
});

const shutdown = (signal) => () => {
  console.log(`[classmate-api] ${signal} received, closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
