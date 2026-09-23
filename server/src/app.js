import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./lib/http.js";
import { usersRouter } from "./routes/users.js";
import { schoolsRouter } from "./routes/schools.js";
import { collegesRouter } from "./routes/colleges.js";
import { leadsRouter } from "./routes/leads.js";
import { adminRouter } from "./routes/admin.js";
import { advisorRouter } from "./routes/advisor.js";

export function createApp() {
  const app = express();

  // Behind nginx/Caddy on the VPS — trust the proxy so req.ip and protocol are right.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin requests and server-to-server calls arrive without an Origin header.
        if (!origin || config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "256kb" }));

  const api = express.Router();

  api.get("/health", (req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        env: config.env,
        uptime: Math.round(process.uptime()),
        advisor: config.ai.enabled ? "enabled" : "disabled",
        time: new Date().toISOString(),
      },
    });
  });

  api.use("/users", usersRouter);
  api.use("/schools", schoolsRouter);
  api.use("/colleges", collegesRouter);
  api.use("/leads", leadsRouter);
  api.use("/admin", adminRouter);
  api.use("/advisor", advisorRouter);

  app.use(config.apiPrefix, api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
