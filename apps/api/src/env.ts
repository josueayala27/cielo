import type { TicketService } from './tickets/ticket.service'

/** Cloudflare bindings declared in wrangler.jsonc. */
export interface Bindings {
  DB: D1Database
  /** Comma-separated list of browser origins allowed by CORS. */
  CORS_ORIGINS?: string
}

/** Per-request values set by middleware. */
export interface Variables {
  tickets: TicketService
}

/** Hono environment shared by every router. */
export interface AppEnv {
  Bindings: Bindings
  Variables: Variables
}
