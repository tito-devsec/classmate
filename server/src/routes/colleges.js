import { Router } from "express";
import { asyncRoute, notFound } from "../lib/http.js";
import { getCollegeById, getColleges, paginate, toApiCollege } from "../lib/dataset.js";

export const collegesRouter = Router();

/**
 * Colleges are not part of the Phase 1 platform API yet; the web app falls back to its
 * bundled catalogue when these routes are missing. They live here so local development
 * exercises the same code path the backend will serve later.
 */

/** GET /api/colleges — optional `q`, `region`, `category` filters. */
collegesRouter.get(
  "/",
  asyncRoute((req, res) => {
    const { q, region, category } = req.query;
    let rows = getColleges().slice();

    if (q) {
      const needle = String(q).toLowerCase();
      rows = rows.filter(
        (college) =>
          college.name.toLowerCase().includes(needle) ||
          college.location.toLowerCase().includes(needle) ||
          college.programs.some((program) => program.toLowerCase().includes(needle)),
      );
    }
    if (region) rows = rows.filter((college) => college.region === region);
    if (category) rows = rows.filter((college) => college.category === category);

    rows.sort((a, b) => b.rating - a.rating);
    const { data, meta } = paginate(rows.map(toApiCollege), { page: req.query.page, limit: req.query.limit });
    res.json({ success: true, data, meta });
  }),
);

/** GET /api/colleges/:id */
collegesRouter.get(
  "/:id",
  asyncRoute((req, res) => {
    const college = getCollegeById(req.params.id);
    if (!college) throw notFound(`Hakuna chuo chenye kitambulisho "${req.params.id}"`);
    res.json({ success: true, data: toApiCollege(college) });
  }),
);
