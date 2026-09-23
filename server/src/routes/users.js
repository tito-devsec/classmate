import { Router } from "express";
import { asyncRoute, badRequest, notFound, unauthorized } from "../lib/http.js";
import { hashPassword, issueToken, requireAuth, verifyPassword } from "../lib/auth.js";
import { createStore } from "../lib/store.js";

export const usersRouter = Router();

const users = createStore("users");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^(\+?255|0)[67]\d{8}$/;

const publicUser = ({ password, ...user }) => user;

/** POST /api/users/register */
usersRouter.post(
  "/register",
  asyncRoute((req, res) => {
    const { fname, lname, email, phone, password } = req.body || {};
    const errors = {};

    if (!fname || String(fname).trim().length < 2) errors.fname = "Jina la kwanza linahitajika";
    if (!lname || String(lname).trim().length < 2) errors.lname = "Jina la mwisho linahitajika";
    if (!EMAIL.test(String(email || ""))) errors.email = "Barua pepe si sahihi";
    if (!PHONE.test(String(phone || "").replace(/[\s-]/g, ""))) errors.phone = "Namba ya simu si sahihi";
    if (!password || String(password).length < 8) errors.password = "Nenosiri liwe na herufi 8 au zaidi";

    if (Object.keys(errors).length > 0) throw badRequest("Taarifa hazijakamilika", errors);

    const normalisedEmail = String(email).trim().toLowerCase();
    if (users.list().some((user) => user.email === normalisedEmail)) {
      throw badRequest("Barua pepe hii tayari imesajiliwa", { email: "Tayari imetumika" });
    }

    const user = users.insert({
      fname: String(fname).trim(),
      lname: String(lname).trim(),
      email: normalisedEmail,
      phone: String(phone).replace(/[\s-]/g, ""),
      password: hashPassword(String(password)),
    });

    res.status(201).json({
      success: true,
      data: { user: publicUser(user), token: issueToken("user", user.id) },
    });
  }),
);

/** POST /api/users/login */
usersRouter.post(
  "/login",
  asyncRoute((req, res) => {
    const { email, password } = req.body || {};
    const user = users.list().find((row) => row.email === String(email || "").trim().toLowerCase());

    if (!user || !verifyPassword(String(password || ""), user.password)) {
      throw unauthorized("Barua pepe au nenosiri si sahihi");
    }

    res.json({ success: true, data: { user: publicUser(user), token: issueToken("user", user.id) } });
  }),
);

/** GET /api/users/profile */
usersRouter.get(
  "/profile",
  requireAuth("user"),
  asyncRoute((req, res) => {
    const user = users.find(req.auth.subjectId);
    if (!user) throw notFound("Mtumiaji hapatikani");
    res.json({ success: true, data: publicUser(user) });
  }),
);
