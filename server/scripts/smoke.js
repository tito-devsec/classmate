/**
 * Contract smoke test — checks the Phase 1 endpoints the web app depends on.
 *
 *   node scripts/smoke.js                            # boots the local API on a free port
 *   node scripts/smoke.js http://host:5000/api       # checks a deployed VPS instance
 *
 * Exits non-zero on the first failing expectation.
 */
import { createApp } from "../src/app.js";
import { config } from "../src/config.js";

const target = process.argv[2]?.replace(/\/+$/, "");
let server;
let base = target;

if (!base) {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://localhost:${server.address().port}${config.apiPrefix}`;
}

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function check(name, run) {
  try {
    await run();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
}

const get = async (path, init) => {
  const response = await fetch(`${base}${path}`, init);
  return { response, body: await response.json().catch(() => null) };
};

const send = (path, method, payload, token) =>
  get(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

/** Every endpoint answers `{ data }` (optionally wrapped in `success`). */
const rows = (body) => body?.data ?? body?.schools ?? body?.result ?? body;

await check("health", async () => {
  const { response, body } = await get("/health");
  assert(response.status === 200, `status ${response.status}`);
  assert(rows(body)?.status === "ok", "status !== ok");
});

await check("schools list", async () => {
  const { response, body } = await get("/schools/list?limit=5");
  assert(response.status === 200, `status ${response.status}`);
  const data = rows(body);
  assert(Array.isArray(data) && data.length > 0, "no schools returned");
  for (const field of ["schID", "name", "region", "level", "handle", "feeRange"]) {
    assert(field in data[0], `school.${field} missing`);
  }
});

await check("schools list filters", async () => {
  const { body } = await get("/schools/list?region=Dar%20es%20Salaam&level=O-LEVEL&page=1&limit=20");
  const data = rows(body);
  assert(
    data.every((school) => school.region === "Dar es Salaam"),
    "region filter leaked rows",
  );
});

await check("school detail", async () => {
  const { body } = await get("/schools/list?limit=1");
  const [first] = rows(body);
  const { response, body: detail } = await get(`/schools/${encodeURIComponent(first.schID)}`);
  assert(response.status === 200, `status ${response.status}`);
  assert(String(rows(detail).schID) === String(first.schID), "wrong school returned");
});

await check("unknown school 404", async () => {
  const { response } = await get("/schools/does-not-exist-xyz");
  assert(response.status === 404, `expected 404, got ${response.status}`);
});

await check("lead validation rejects junk", async () => {
  const { response, body } = await send("/leads/submit", "POST", {
    parentName: "A",
    phone: "123",
    applicationLevel: "",
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assert(body?.details || body?.errors, "no field-level errors returned");
});

// The remaining checks mutate state, so they only run against the local mock.
if (!target) {
  const email = `smoke-${Date.now()}@example.com`;
  let userToken = "";

  await check("user register + login + profile", async () => {
    const registered = await send("/users/register", "POST", {
      fname: "Smoke",
      lname: "Test",
      email,
      phone: "0712345678",
      password: "SecurePass123!",
    });
    assert(registered.response.status === 201, `register status ${registered.response.status}`);

    const loggedIn = await send("/users/login", "POST", { email, password: "SecurePass123!" });
    userToken = rows(loggedIn.body)?.token;
    assert(userToken, "no token issued");

    const profile = await get("/users/profile", { headers: { Authorization: `Bearer ${userToken}` } });
    assert(rows(profile.body)?.email === email, "profile did not round-trip");
  });

  await check("lead submit + my-applications", async () => {
    const submitted = await send(
      "/leads/submit",
      "POST",
      {
        parentName: "Jane Doe",
        phone: "+255712345678",
        applicationLevel: "FORM_ONE",
        isBoarding: 1,
        studentGender: "FEMALE",
        targetBudget: "800000",
        studentLocation: "Dar es Salaam",
      },
      userToken,
    );
    assert(submitted.response.status === 201, `submit status ${submitted.response.status}`);

    const mine = await get("/leads/my-applications?page=1&limit=10", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(rows(mine.body).length === 1, "application not linked to the signed-in parent");
  });

  await check("admin login + stats + application update", async () => {
    const login = await send("/admin/login", "POST", {
      email: config.admin.email,
      password: config.admin.password,
    });
    const adminToken = rows(login.body)?.token;
    assert(adminToken, "no admin token");

    const stats = await get("/admin/dashboard/stats", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(typeof rows(stats.body)?.applications?.total === "number", "stats missing counts");

    const list = await get("/admin/applications?page=1&limit=20", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const [application] = rows(list.body);
    assert(application, "no applications listed");

    const updated = await send(
      `/admin/applications/${application.id}`,
      "PUT",
      { status: 3, recommendedSchools: ["christon"] },
      adminToken,
    );
    assert(rows(updated.body)?.status === 3, "status not updated");
  });

  await check("admin endpoints reject anonymous callers", async () => {
    const { response } = await get("/admin/dashboard/stats");
    assert(response.status === 401, `expected 401, got ${response.status}`);
  });
}

server?.close();

let failed = 0;
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}${result.ok ? "" : ` — ${result.error}`}`);
  if (!result.ok) failed += 1;
}
console.log(`\n${results.length - failed}/${results.length} checks passed against ${base}`);
process.exit(failed === 0 ? 0 : 1);
