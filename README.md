# Classmate

Classmate helps parents in Tanzania find, compare and apply to secondary schools and colleges —
with real fee ranges, national-exam results and free guidance.

- **Web app:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **API:** Node.js + Express (`server/`), speaking the Phase 1 contract the VPS backend serves
- **Maintainer:** tito-devsec

## Quick start

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:8080
```

The app renders fully without a backend: every screen falls back to the bundled catalogue in
`data/` when the API is unreachable, and the listing page says so instead of showing an empty
state.

To run the bundled API alongside it:

```bash
npm run api:install
npm run api            # http://localhost:5000/api
```

## Connecting to the Node backend

`VITE_API_URL` is the collection's `base_url` — it already includes `/api`.

| Scenario | `.env` | What happens |
| --- | --- | --- |
| Local dev against local API | `VITE_API_URL=` (empty) | Calls go to `/api/*`; Vite proxies them to `API_PROXY_TARGET` (default `http://localhost:5000`) |
| Local dev against the VPS | `VITE_API_URL=` and `API_PROXY_TARGET=https://api.your-domain.com` | Same-origin in the browser, proxied to the VPS — no CORS setup needed |
| Production build | `VITE_API_URL=https://api.your-domain.com/api` | The browser calls the VPS directly; add the web origin to the API's `CORS_ORIGIN` |

Build for production:

```bash
VITE_API_URL=https://api.your-domain.com/api VITE_SITE_URL=https://classmate.co.tz npm run build
```

### Endpoints the app uses

Taken from `Classmate_API_Phase1.postman_collection.json`:

| Area | Endpoint | Used by |
| --- | --- | --- |
| Auth (parent) | `POST /users/register`, `POST /users/login`, `GET /users/profile` | `src/services/auth.ts` |
| Auth (school) | `POST /schools/register`, `POST /schools/login`, `GET /schools/profile/my-profile` | `src/services/auth.ts` |
| Catalogue | `GET /schools/list`, `GET /schools/:id` | `src/services/schools.ts` |
| Applications | `POST /leads/submit`, `GET /leads/my-applications`, `GET /leads/:id` | `src/services/applications.ts` |
| Admin | `POST /admin/login`, `GET /admin/dashboard/stats`, `GET|PUT /admin/applications*`, `GET /admin/schools/registrations`, `PUT /admin/schools/:id/approve` | `src/services/admin.ts` |
| Extras | `GET /schools/rankings`, `GET /schools/regions`, `GET /colleges`, `POST /advisor/chat` | home rails, region facets, advisor |

The extras are not in Phase 1 yet. Each one degrades on its own: a `404` or a network error
falls back to bundled data (rankings, regions, colleges) or hides the feature (advisor). Adding
them to the backend later requires no frontend change.

### How responses are read

`src/lib/api.ts` unwraps `{ data }`, `{ result }`, `{ schools }` or a bare array, and reads
pagination from `meta` or `pagination`. `src/lib/normalize.ts` then translates the API's
vocabulary — `schID`, `level: "O-LEVEL"`, `handle: "MIXED"`, `isBoard: 1`,
`feeRange: "500000-800000"` — into the shape the UI renders. Backend field changes are absorbed
in those two files.

Tokens from the three login endpoints are stored per role (`user`, `school`, `admin`) and sent
as `Authorization: Bearer …`; pass `auth: "user" | "school" | "admin"` to `apiFetch`.

## Project layout

```
data/                 catalogue shared by the web app and the API (schools, colleges)
server/               Node + Express implementation of the Phase 1 contract
src/components/       UI — layout, cards, home sections
src/hooks/            React Query hooks
src/lib/              api client, normalizers, grading, assets
src/pages/            routed screens
src/services/         one module per API area
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server on :8080 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run api` | Start the bundled API on :5000 |
| `npm run api:smoke` | Check the API contract (add a URL to check the VPS) |

## Design

One crimson accent on a warm light-grey canvas, white cards at a 20px radius, Plus Jakarta Sans
for display and Inter for body. Tokens live in `src/index.css`; the type scale (`display-xl`,
`display-lg`, `display-md`, `eyebrow`) and the `rail` / `photo-scrim` helpers are defined there
too, so pages compose rather than restyle.

School grades (`A+` … `B-`) are derived in `src/lib/grading.ts` from 60% national-exam results
and 40% parent rating — the same input always produces the same letter.

## Credits

Built and maintained by **tito-devsec**.
