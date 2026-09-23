import { Router } from "express";
import { asyncRoute, badRequest, notFound } from "../lib/http.js";
import { readToken, requireAuth } from "../lib/auth.js";
import { createStore } from "../lib/store.js";
import { paginate } from "../lib/dataset.js";

export const leadsRouter = Router();

/** Parent applications / recommendation requests. */
export const applications = createStore("applications");

/** Application lifecycle — the numeric `status` the admin endpoints filter on. */
export const STATUS = {
  SUBMITTED: 1,
  REVIEWING: 2,
  RECOMMENDED: 3,
  ENROLLED: 4,
  DECLINED: 5,
};

const PHONE = /^(\+?255|0)[67]\d{8}$/;
const sessions = createStore("sessions");

function validate(body = {}) {
  const errors = {};
  const text = (value) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value));

  const parentName = text(body.parentName);
  const phone = text(body.phone).replace(/[\s-]/g, "");

  if (parentName.length < 2) errors.parentName = "Jina la mzazi linahitajika";
  if (!PHONE.test(phone)) errors.phone = "Namba ya simu si sahihi (mfano: 0712345678)";
  if (!text(body.applicationLevel)) errors.applicationLevel = "Chagua kiwango cha masomo";

  if (Object.keys(errors).length > 0) throw badRequest("Taarifa hazijakamilika", errors);

  return {
    parentName,
    phone,
    email: text(body.email) || null,
    applicationLevel: text(body.applicationLevel).toUpperCase(),
    isBoarding: Number(body.isBoarding ?? 0),
    studentGender: text(body.studentGender).toUpperCase() || null,
    targetBudget: text(body.targetBudget) || null,
    studentLocation: text(body.studentLocation) || null,
    schoolLocation: text(body.schoolLocation) || null,
    religion: text(body.religion) || null,
    beginYear: body.beginYear ? Number(body.beginYear) : null,
    currentEducationLevel: text(body.currentEducationLevel) || null,
    collegeType: text(body.collegeType) || null,
    course: text(body.course) || null,
    comment: text(body.comment) || null,
    schID: body.schID ?? null,
  };
}

/**
 * POST /api/leads/submit
 * Works signed in or not — a signed-in parent's application shows up in `my-applications`.
 */
leadsRouter.post(
  "/submit",
  asyncRoute((req, res) => {
    const token = readToken(req);
    const session = token ? sessions.find(token) : null;

    const application = applications.insert({
      ...validate(req.body),
      userId: session?.kind === "user" ? session.subjectId : null,
      status: STATUS.SUBMITTED,
      recommendedSchools: [],
      source: req.body?.source || "web",
    });

    res.status(201).json({ success: true, data: application });
  }),
);

/** GET /api/leads/my-applications?page&limit */
leadsRouter.get(
  "/my-applications",
  requireAuth("user"),
  asyncRoute((req, res) => {
    const mine = applications.list().filter((row) => row.userId === req.auth.subjectId);
    const { data, meta } = paginate(mine, { page: req.query.page, limit: req.query.limit });
    res.json({ success: true, data, meta });
  }),
);

/** GET /api/leads/:id */
leadsRouter.get(
  "/:id",
  requireAuth("user"),
  asyncRoute((req, res) => {
    const application = applications.find(req.params.id);
    if (!application || application.userId !== req.auth.subjectId) throw notFound("Ombi halipatikani");
    res.json({ success: true, data: application });
  }),
);
