import { Router } from "express";
import { asyncRoute, badRequest, notFound, unauthorized } from "../lib/http.js";
import { hashPassword, issueToken, requireAuth, verifyPassword } from "../lib/auth.js";
import { createStore } from "../lib/store.js";
import {
  getRankings,
  getRegions,
  getSchoolById,
  paginate,
  querySchools,
  toApiSchool,
} from "../lib/dataset.js";

export const schoolsRouter = Router();

/** Schools that registered through the platform (pending review until an admin approves). */
export const schoolAccounts = createStore("school-accounts");

const publicSchool = ({ password, ...school }) => school;

/* ---------------------------------------------------------------- school onboarding ------ */

/** POST /api/schools/register */
schoolsRouter.post(
  "/register",
  asyncRoute((req, res) => {
    const body = req.body || {};
    const errors = {};
    const required = ["name", "ownerName", "location", "region", "level", "category", "phone", "email", "password"];

    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") errors[field] = "Inahitajika";
    }
    if (body.password && String(body.password).length < 8) {
      errors.password = "Nenosiri liwe na herufi 8 au zaidi";
    }
    if (Object.keys(errors).length > 0) throw badRequest("Taarifa hazijakamilika", errors);

    const email = String(body.email).trim().toLowerCase();
    if (schoolAccounts.list().some((school) => school.email === email)) {
      throw badRequest("Shule hii tayari imesajiliwa", { email: "Tayari imetumika" });
    }

    const school = schoolAccounts.insert({
      name: String(body.name).trim(),
      ownerName: String(body.ownerName).trim(),
      ownerTitle: body.ownerTitle ?? null,
      location: String(body.location).trim(),
      region: String(body.region).trim(),
      level: String(body.level).toUpperCase(),
      category: String(body.category).toUpperCase(),
      isBoard: Number(body.isBoard ?? 0),
      handle: String(body.handle || "MIXED").toUpperCase(),
      feeRange: body.feeRange ?? null,
      phone: String(body.phone).replace(/[\s-]/g, ""),
      email,
      capacity: body.capacity ? Number(body.capacity) : null,
      programOffered: body.programOffered ?? null,
      // 2 = awaiting admin review, 1 = approved, 5 = rejected.
      status: 2,
      password: hashPassword(String(body.password)),
    });

    res.status(201).json({
      success: true,
      data: { school: publicSchool(school), token: issueToken("school", school.id) },
    });
  }),
);

/** POST /api/schools/login */
schoolsRouter.post(
  "/login",
  asyncRoute((req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const school = schoolAccounts.list().find((row) => row.email === email);

    if (!school || !verifyPassword(String(req.body?.password || ""), school.password)) {
      throw unauthorized("Barua pepe au nenosiri si sahihi");
    }

    res.json({
      success: true,
      data: { school: publicSchool(school), token: issueToken("school", school.id) },
    });
  }),
);

/** GET /api/schools/profile/my-profile */
schoolsRouter.get(
  "/profile/my-profile",
  requireAuth("school"),
  asyncRoute((req, res) => {
    const school = schoolAccounts.find(req.auth.subjectId);
    if (!school) throw notFound("Shule haipatikani");
    res.json({ success: true, data: publicSchool(school) });
  }),
);

/* ------------------------------------------------------------------- public catalogue ---- */

/** GET /api/schools/list — `category, level, region, page, limit` plus web-app facets. */
schoolsRouter.get(
  "/list",
  asyncRoute((req, res) => {
    const { data, meta } = paginate(querySchools(req.query), {
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json({ success: true, data, meta });
  }),
);

/** GET /api/schools/rankings — curated rails for the home page. */
schoolsRouter.get(
  "/rankings",
  asyncRoute((req, res) => {
    res.json({ success: true, data: getRankings() });
  }),
);

/** GET /api/schools/regions — region facets with counts. */
schoolsRouter.get(
  "/regions",
  asyncRoute((req, res) => {
    res.json({ success: true, data: getRegions() });
  }),
);

/** GET /api/schools/:id */
schoolsRouter.get(
  "/:id",
  asyncRoute((req, res) => {
    const seeded = getSchoolById(req.params.id);
    if (seeded) {
      res.json({ success: true, data: toApiSchool(seeded) });
      return;
    }
    const registered = schoolAccounts.find(req.params.id);
    if (!registered) throw notFound(`Hakuna shule yenye kitambulisho "${req.params.id}"`);
    res.json({ success: true, data: publicSchool(registered) });
  }),
);
