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
- SQLite instead of Postgres for now, so it runs with zero infra. Swap `datasource db` in `prisma/schema.prisma` to `postgresql` for a real deploy.

## Run it

```
npm install
npm run prisma:migrate
npm run dev
```

API listens on `:3300` — `/clients`, `/proposals`, `/contracts`, `/invoices`, `/tasks`.
