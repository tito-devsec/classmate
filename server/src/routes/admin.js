import { Router } from "express";
import { config } from "../config.js";
import { asyncRoute, badRequest, notFound, unauthorized } from "../lib/http.js";
import { issueToken, requireAuth } from "../lib/auth.js";
import { applications, STATUS } from "./leads.js";
import { schoolAccounts } from "./schools.js";
import { getSchools, paginate } from "../lib/dataset.js";

export const adminRouter = Router();

const publicSchool = ({ password, ...school }) => school;

/** POST /api/admin/login */
adminRouter.post(
  "/login",
  asyncRoute((req, res) => {
    const { email, password } = req.body || {};
    const ok =
      String(email || "").trim().toLowerCase() === config.admin.email.toLowerCase() &&
      String(password || "") === config.admin.password;

    if (!ok) throw unauthorized("Barua pepe au nenosiri si sahihi");

    res.json({
      success: true,
      data: { admin: { email: config.admin.email }, token: issueToken("admin", config.admin.email) },
    });
  }),
);

adminRouter.use(requireAuth("admin"));

/** GET /api/admin/dashboard/stats */
adminRouter.get(
  "/dashboard/stats",
  asyncRoute((req, res) => {
    const rows = applications.list();
    const registrations = schoolAccounts.list();

    res.json({
      success: true,
      data: {
        applications: {
          total: rows.length,
          submitted: rows.filter((row) => row.status === STATUS.SUBMITTED).length,
          reviewing: rows.filter((row) => row.status === STATUS.REVIEWING).length,
          recommended: rows.filter((row) => row.status === STATUS.RECOMMENDED).length,
          enrolled: rows.filter((row) => row.status === STATUS.ENROLLED).length,
          declined: rows.filter((row) => row.status === STATUS.DECLINED).length,
        },
        schools: {
          listed: getSchools().length,
          registrations: registrations.length,
          pending: registrations.filter((school) => school.status === 2).length,
          approved: registrations.filter((school) => school.status === 1).length,
        },
      },
    });
  }),
);

/** GET /api/admin/applications?status&page&limit */
adminRouter.get(
  "/applications",
  asyncRoute((req, res) => {
    let rows = applications.list();
    if (req.query.status) rows = rows.filter((row) => row.status === Number(req.query.status));

    const { data, meta } = paginate(rows, { page: req.query.page, limit: req.query.limit });
    res.json({ success: true, data, meta });
  }),
);

/** GET /api/admin/applications/:id */
adminRouter.get(
  "/applications/:id",
  asyncRoute((req, res) => {
    const application = applications.find(req.params.id);
    if (!application) throw notFound("Ombi halipatikani");
    res.json({ success: true, data: application });
  }),
);

/** PUT /api/admin/applications/:id — `{ status, recommendedSchools }` */
adminRouter.put(
  "/applications/:id",
  asyncRoute((req, res) => {
    const { status, recommendedSchools } = req.body || {};

    if (status !== undefined && !Object.values(STATUS).includes(Number(status))) {
      throw badRequest(`status lazima iwe moja ya: ${Object.values(STATUS).join(", ")}`);
    }

    const updated = applications.update(req.params.id, {
      ...(status !== undefined ? { status: Number(status) } : {}),
      ...(Array.isArray(recommendedSchools) ? { recommendedSchools } : {}),
    });
    if (!updated) throw notFound("Ombi halipatikani");

    res.json({ success: true, data: updated });
  }),
);

/** GET /api/admin/schools/registrations?status&page&limit */
adminRouter.get(
  "/schools/registrations",
  asyncRoute((req, res) => {
    let rows = schoolAccounts.list().map(publicSchool);
    if (req.query.status) rows = rows.filter((school) => school.status === Number(req.query.status));

    const { data, meta } = paginate(rows, { page: req.query.page, limit: req.query.limit });
    res.json({ success: true, data, meta });
  }),
);

/** GET /api/admin/schools/:id */
adminRouter.get(
  "/schools/:id",
  asyncRoute((req, res) => {
    const school = schoolAccounts.find(req.params.id);
    if (!school) throw notFound("Usajili wa shule haupatikani");
    res.json({ success: true, data: publicSchool(school) });
  }),
);

/** PUT /api/admin/schools/:id/approve — `{ approve, reason }` */
adminRouter.put(
  "/schools/:id/approve",
  asyncRoute((req, res) => {
    const { approve, reason } = req.body || {};
    const updated = schoolAccounts.update(req.params.id, {
      status: approve === false ? 5 : 1,
      reviewReason: reason ?? null,
      reviewedAt: new Date().toISOString(),
    });
    if (!updated) throw notFound("Usajili wa shule haupatikani");
    res.json({ success: true, data: publicSchool(updated) });
  }),
);
