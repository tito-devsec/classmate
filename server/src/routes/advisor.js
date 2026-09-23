import { Router } from "express";
import { Readable } from "node:stream";
import { config } from "../config.js";
import { asyncRoute, badRequest } from "../lib/http.js";
import { streamCompletion } from "../services/advisor.js";

export const advisorRouter = Router();

const ROLES = new Set(["user", "assistant"]);

/** GET /api/advisor/status — lets the UI hide the assistant when no provider is configured. */
advisorRouter.get("/status", (req, res) => {
  res.json({ data: { enabled: config.ai.enabled, model: config.ai.enabled ? config.ai.model : null } });
});

/**
 * POST /api/advisor/chat — streams the assistant reply as server-sent events.
 * Body: { messages: [{ role, content }], mode?, schoolContext? }
 */
advisorRouter.post(
  "/chat",
  asyncRoute(async (req, res) => {
    const { messages, mode, schoolContext } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      throw badRequest("messages inahitajika");
    }
    const clean = messages
      .filter((message) => message && ROLES.has(message.role) && typeof message.content === "string")
      .slice(-20)
      .map((message) => ({ role: message.role, content: message.content.slice(0, 4000) }));

    if (clean.length === 0) throw badRequest("messages si sahihi");

    if (!config.ai.enabled) {
      res.status(503).json({
        error:
          "Mshauri wa AI hajawashwa kwa sasa. Jaza fomu ya 'Omba Nafasi' na timu ya Classmate itakupigia simu.",
      });
      return;
    }

    const controller = new AbortController();
    req.on("close", () => controller.abort());

    const upstream = await streamCompletion({
      messages: clean,
      mode,
      schoolContext,
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 502;
      const detail = await upstream.text().catch(() => "");
      console.error("[advisor] provider error", upstream.status, detail.slice(0, 500));
      res.status(status).json({
        error:
          status === 429
            ? "Kuna msongamano kwa sasa. Tafadhali jaribu tena baada ya dakika chache."
            : "Mshauri hapatikani kwa sasa. Jaribu tena baadaye.",
      });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    Readable.fromWeb(upstream.body).pipe(res);
  }),
);
