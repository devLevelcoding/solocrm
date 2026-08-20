# Solo CRM

Type 1 (Pure SassFactory) from the [mini-CRM catalog](../../sassdesk/project.html) — `#19`.
The floor: `Client`, `Proposal`, `Contract`, `Invoice`, `Task`. No multi-tenant, no HR, no franchise ops.

## Lineage

Forked from `F:\SassFactory\crm3-micro`:

- `clients.controller.ts`, `proposals.controller.ts` — ported from `apps/crm-svc/src/app.module.ts`
- `contracts.controller.ts`, `invoices.controller.ts` — ported from `apps/finance-svc/src/app.module.ts`
- `tasks.controller.ts` — **not** ported. `apps/ops-svc`'s `Task`/`AgencyTask`/`TaskGroup` are franchise shop-assignment machinery (recurrence, brand, zone, multi-shop rollout) — exactly the multi-tenant complexity Solo CRM excludes. Written fresh instead: a plain task list, optionally linked to a client.

What changed from the source:

- `@MessagePattern` (Redis microservice transport) → plain `@Get`/`@Post`/`@Patch`/`@Delete` HTTP routes. Handler bodies are untouched Prisma calls.
- Dropped `tenantId`/`companyId`/`shopId` multi-tenant columns, the `SalesforceModule` fire-and-forget hooks, and `Proposal`'s real-estate-only sub-tables (`ProposalOwner`/`Space`/`Rent`/`Competitor`) — those belong to Listing CRM (`#03`), not the base.
- No `@crm3/shared` dependency — that's a private workspace package tied to the crm3-micro monorepo; this is a standalone repo.
- SQLite for local dev; Turso (remote libsql) in production — see **Deploying to Vercel** below. Same pattern `F:\shop-products\nextjs-shop-main` already uses on this account.

## Run it locally

```
npm install
npm run prisma:migrate
npm run dev
```

API listens on `:3300` — `/clients`, `/proposals`, `/contracts`, `/invoices`, `/tasks`.

## Deploying to Vercel

The first deploy crashed (`FUNCTION_INVOCATION_FAILED`) because a bare NestJS app (`app.listen(port)`, local SQLite file) doesn't fit Vercel's serverless model — read-only filesystem, and functions need a request-handler export, not a long-running listener. Fixed by:

- `api/index.ts` — wraps the Nest app with `serverless-http` and caches it across warm invocations, so Vercel has an actual handler to call.
- `vercel.json` — rewrites every path to that one function (Nest still does its own internal routing once the request arrives).
- `src/prisma.service.ts` — swaps in the `@prisma/adapter-libsql` driver when `TURSO_DATABASE_URL` is set; falls back to the plain local client otherwise. No native query-engine binary needed in the serverless bundle either way.

**Before it'll actually work**, two things only you can do (need your Turso/Vercel accounts):

1. Create a Turso DB and push this schema to it:
   ```
   turso db create solocrm
   turso db show solocrm --url            # -> TURSO_DATABASE_URL
   turso db tokens create solocrm         # -> TURSO_AUTH_TOKEN
   TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." npm run turso:push-schema
   ```
2. In the Vercel project → Settings → Environment Variables, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to those same values, then redeploy.

Whenever the schema changes: run `prisma migrate dev` locally as usual (creates a new file under `prisma/migrations/`), then re-run `npm run turso:push-schema` to replay it against Turso — Prisma Migrate's CLI can't target `libsql://` URLs directly, which is why that script exists instead of `prisma migrate deploy`.

**Live**: API at `https://solocrm-amber.vercel.app` (backend project `solocrm`), UI at `https://solocrm-ui.vercel.app` (separate Vercel project, `solocrm-ui`, rooted at `frontend/`). Two projects instead of one because the backend is a NestJS serverless function and the frontend is a static Vite build — simplest to let Vercel build each with its own framework preset rather than hand-rolling a single project that serves both. The UI talks to the API via `VITE_API_BASE`, set as an env var on the `solocrm-ui` project (falls back to `http://localhost:3300` for local dev, see `frontend/src/api.ts`).

**Known-fixed bug**: this deploy crashed every request for a while with `LibsqlError: URL_INVALID: The URL 'undefined' is not in a valid format`. Cause: `@prisma/adapter-libsql` v6's `PrismaLibSQL` is an adapter *factory* — it wants the raw `{url, authToken}` config and builds its own libsql client internally, it does not take a pre-built client instance. `prisma.service.ts` now passes the config directly instead of pre-building a client with `@libsql/client`'s `createClient()` first.
