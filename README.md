# SupportDesk · Cielo

Web app to register and manage customer support tickets: a dashboard with live counts, a
Kanban board with drag and drop, a filterable and paginated list, and create/edit/detail
views that open as drawers.

| | URL |
|---|---|
| Web | https://cielo.josueayala.me |
| API | https://api.cielo.josueayala.me |

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, TanStack Query, React Hook Form |
| Styles | Panda CSS with the Cielo design-system preset (`apps/web/src/design-system`), Radix Dialog, dnd-kit, lucide icons |
| Backend | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite), SQL migrations |
| Validation | Zod schemas shared by the API and the web app (`packages/contracts`) |
| Hosting | Cloudflare Workers (web through OpenNext) |
| Tests | Vitest |

## Repository layout

```
apps/
  api/                 Hono REST API (Worker)
    migrations/        D1 migrations (SQL)
    seed/              Deterministic seed generator + seed.sql
    src/
      app.ts           Composition root: middleware, DI, routes, error handlers
      lib/             JSON errors, Zod request validation
      tickets/         Routes → service → repository port → D1 adapter
      stats/           GET /api/stats
    test/              HTTP tests against an in-memory repository
  web/                 Next.js app (OpenNext on Workers)
    src/
      app/             Routes; @drawer = parallel slot with intercepting routes
      components/ui    Design-system components (Button, Field, Dialog, Drawer, …)
      design-system/   Panda preset: tokens, semantic colours, text styles
      features/tickets API client, queries, views, list, board
packages/
  contracts/           Zod schemas + shared types (ticket, query, errors)
```

## Getting started

Requirements: Node 20+, pnpm 10.

```bash
pnpm install

# Database (local D1 under apps/api/.wrangler)
pnpm db:migrate:local
pnpm db:seed:local          # 30 deterministic tickets

# Run (two terminals)
pnpm dev:api                # http://localhost:8787
pnpm dev:web                # http://localhost:3000
```

### Environment variables

| App | Variable | Default | Purpose |
|---|---|---|---|
| web | `NEXT_PUBLIC_API_URL` | `http://localhost:8787` | API base URL. Copy `apps/web/.env.example` to `.env.local` to change it. `.env.production` points to the deployed API (public, not a secret). |
| api | `CORS_ORIGINS` | `https://cielo.josueayala.me` | Comma-separated allowed origins (in `wrangler.jsonc`). `localhost:3000` is always allowed. |

No secrets are needed: the API has no authentication (per the spec) and D1 is a binding.

### Migrations and seed

```bash
pnpm --filter @cielo/api db:migrate:local    # or db:migrate:remote
pnpm --filter @cielo/api db:seed:local       # or db:seed:remote
node apps/api/seed/generate-seed.mjs         # regenerate seed.sql
```

The seed uses fixed ids (`seed-0001`…), dates and positions, so every environment starts
from the same data. Re-running it replaces only the seed rows.

### Tests

```bash
pnpm test        # all packages
pnpm typecheck
```

- `packages/contracts`: validation rules (lengths, email, enums, query defaults, bounds).
- `apps/api`: HTTP tests through `app.request()` with an in-memory repository: create,
  422 with per-field issues, 400 on malformed JSON, list order and pagination metadata,
  combined filters and sort, 404 on every verb, partial update, reorder, delete + stats, CORS.
- `apps/web`: board ordering math (fractional positions, column grouping).

### Deploy

```bash
pnpm --filter @cielo/api db:migrate:remote
pnpm deploy:api      # wrangler deploy → api.cielo.josueayala.me
pnpm deploy:web      # opennextjs-cloudflare build + deploy → cielo.josueayala.me
```

## API

| Method | Path | Success | Notes |
|---|---|---|---|
| GET | `/api/tickets` | 200 | `search`, `status`, `priority`, `page`, `limit` (1–100, default 10), `sort` (`createdAt:desc` default, `createdAt:asc`, `position:asc`) |
| GET | `/api/tickets/:id` | 200 | 404 if missing |
| POST | `/api/tickets` | 201 + `Location` | `status` defaults to `open` |
| PATCH | `/api/tickets/:id` | 200 | Any subset of fields (+ `position`), at least one; unknown fields rejected |
| DELETE | `/api/tickets/:id` | 204 | 404 if missing |
| GET | `/api/stats` | 200 | `{ total, byStatus: { open, in_progress, resolved } }` |

The list responds with `{ items, total, page, limit, totalPages }`. Every error has the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "issues": [{ "field": "title", "message": "Title must be at least 5 characters" }] } }
```

Codes: `400 BAD_REQUEST` (malformed JSON), `404 NOT_FOUND`, `422 VALIDATION_ERROR`, `500 INTERNAL_ERROR` (logged, details hidden).

## Design decisions

- **One schema, two sides.** `packages/contracts` holds the Zod schemas. The API validates
  requests with them and the form validates with the same rules, so messages and limits never
  drift. Inputs are trimmed before length checks; emails are lowercased.
- **Layered API.** Routes only validate and pick status codes; `TicketService` owns the rules
  (ids, timestamps, 404s, pagination math); storage sits behind a `TicketRepository` port. The
  D1 adapter is swapped for an in-memory fake in tests through `createApp({ createRepository })`.
  Clock and id generator are injectable.
- **SQL safety.** All values are bound parameters; `ORDER BY` comes from a fixed map;
  `LIKE` wildcards in the search are escaped. List and count run in one `db.batch()` round trip.
- **Stats from data.** `GET /api/stats` is a `GROUP BY` over persisted rows; the web app
  invalidates every ticket query after a write, so counts update right away.
- **Manual board order.** A `position` column with fractional ranking: a moved card gets the
  midpoint between its new neighbours, so a reorder is a single `PATCH { status, position }`.
  New tickets get `-createdAt(ms)` and therefore appear on top.
- **URL as state.** View, search, filters, sort and page live in the query string, so a
  filtered view can be shared, refreshed and restored with Back.
- **Drawers as routes.** Detail, create and edit open as drawers through Next.js parallel +
  intercepting routes (`app/@drawer/(.)tickets/…`). A direct visit or refresh renders the full
  page from `app/tickets/…`. One view component, two frames (`ViewFrame`).
- **Optimistic board.** Drag previews and in-flight moves are kept as local placements on top
  of the server data and dropped once the lists have refetched; a failed save snaps back with
  a toast. Arrow buttons offer a keyboard/touch alternative and animate with View Transitions.
- **UI states.** Skeletons reuse the real markup and take their height from the text style, so
  nothing jumps on load. Empty states distinguish "no tickets" from "no matches". Network
  failures (`status 0`) show an offline message with retry; 4xx are not retried.
- **Accessibility.** Labelled fields with `aria-describedby` errors, focus moves to the first
  invalid field, Radix handles dialog focus traps, the board announces drag operations,
  icon-only buttons have labels, AA contrast in both themes.

## Status

**Done**
- All endpoints of the contract, with validation, consistent JSON errors and 404s.
- Dashboard counts, list with search, combinable filters, sort and pagination.
- Create/edit with visible validation, detail, delete with confirmation, toasts after saving.
- Responsive layout (board scrolls by column on phones), loading/empty/error states, dark and light themes.
- Extras: Kanban board with drag and drop and manual ordering, drawers, shareable URLs.
- Reproducible seed, 33 automated tests, deployment to Cloudflare.

**Not done / trade-offs**
- No authentication (out of scope per the spec).
- No end-to-end browser tests; UI flows were checked manually in Chrome (desktop and phone width).
- Board columns load 20 cards at a time; positions are computed from the loaded cards, so
  dropping at the end of a partially loaded column ranks the card after the last loaded one.
- Fractional positions lose precision after very many moves between the same two cards; a
  periodic rebalance would fix it and is not implemented.
- Concurrent edits are last-write-wins (no `updatedAt` precondition).

## Use of AI

Built with **Claude Code** (Claude Opus 5.5) as a pair programmer.

- **What it did:** scaffolding of the monorepo, API layers, D1 migrations and seed, Zod
  contracts, React components, the board and drawer patterns, tests, this README, and the
  Cloudflare setup (D1 database and deployment through the Cloudflare MCP and Wrangler).
- **Direction and review (mine):** stack and hosting choices, the design system to reuse,
  UX iterations (Kanban as default view, drawers, reordering, palette, skeleton fixes after
  reviewing them in the browser).
- **Verification:** type checks and the automated tests on every step; the API was exercised
  with `curl` against a local D1; the UI was driven in Chrome (Chrome DevTools MCP) to check
  validation, create/edit/delete, drawers and drag-and-drop results against the API.
