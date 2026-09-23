# Classmate API

Node.js + Express REST API for the Classmate web app. It is the reference implementation of
the contract the web app expects — run it locally, or point the web app at the same contract
served from your VPS.

Maintained by **tito-devsec**.

## Run it

```bash
cd server
cp .env.example .env
npm install
npm run dev          # http://localhost:4000
```

Verify the contract at any time (locally, or against the VPS):

```bash
npm run smoke
node scripts/smoke.js https://api.your-domain.com
```

## Endpoints

| Method | Path                     | Notes                                                              |
| ------ | ------------------------ | ------------------------------------------------------------------ |
| GET    | `/api/health`            | Liveness + whether the advisor is configured                        |
| GET    | `/api/schools`           | `q, region, level, gender, boarding, minFee, maxFee, sort, page, limit` |
| GET    | `/api/schools/rankings`  | Curated ranking rails for the home page                             |
| GET    | `/api/schools/regions`   | Region facets with school counts                                    |
| GET    | `/api/schools/:id`       | One school                                                          |
| GET    | `/api/colleges`          | `q, region, category, page, limit`                                  |
| GET    | `/api/colleges/:id`      | One college                                                         |
| POST   | `/api/leads`             | Parent enquiry; validates name + Tanzanian phone                    |
| GET    | `/api/leads`             | Admin only — `Authorization: Bearer $ADMIN_TOKEN`                   |
| PATCH  | `/api/leads/:id`         | Admin only — advances tracking status                               |
| GET    | `/api/advisor/status`    | Whether the AI advisor is switched on                               |
| POST   | `/api/advisor/chat`      | Streams the reply as server-sent events                             |

### Response envelope

Lists return `{ data: [...], meta: { page, limit, total, totalPages } }`, single items return
`{ data: {...} }`, failures return `{ error: string, details?: Record<string, string> }`.
The web app's API client (`src/lib/api.ts`) depends on exactly this shape.

## Data

`data/schools.json` and `data/colleges.json` at the repository root are shared by the API and
the web app, so both sides stay in sync. `image` holds an asset slug (`school-1`, `college-cbe`)
which the web app resolves against its bundled images — the API never serves binaries.

Runtime state (submitted leads) is written to `server/data/leads.json`. `src/lib/store.js` is the
only module that touches storage, so moving to Postgres or Mongo means re-implementing
`list/find/insert/update` there and nothing else.

## Deploying to a VPS

```bash
# on the VPS
git clone <repo> /srv/classmate && cd /srv/classmate/server
npm ci --omit=dev
cp .env.example .env    # set CORS_ORIGIN to the web origin, set ADMIN_TOKEN
pm2 start src/index.js --name classmate-api --update-env
pm2 save
```

Put nginx in front and terminate TLS there:

```nginx
location /api/ {
    proxy_pass         http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;

    # Server-sent events for /api/advisor/chat
    proxy_buffering    off;
    proxy_cache        off;
    proxy_read_timeout 300s;
}
```

Then build the web app with `VITE_API_URL=https://your-domain.com` (or the bare API host) and
add that origin to `CORS_ORIGIN`.

> `proxy_buffering off` matters: without it nginx holds the advisor's SSE stream until the
> response completes and replies arrive in one lump instead of token by token.
