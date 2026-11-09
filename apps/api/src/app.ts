import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { AppEnv, Bindings } from './env'
import { handleError, handleNotFound } from './lib/errors'
import { statsRoutes } from './stats/stats.routes'
import { D1TicketRepository } from './tickets/d1-ticket.repository'
import type { TicketRepository } from './tickets/ticket.repository'
import { ticketRoutes } from './tickets/ticket.routes'
import { TicketService } from './tickets/ticket.service'

/** Origins always allowed, so `next dev` can call `wrangler dev` without extra config. */
const LOCAL_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

/** Composition root options. Tests swap the repository for an in-memory fake. */
export interface AppOptions {
  createRepository?: (env: Bindings) => TicketRepository
}

/**
 * Builds the Hono app: middleware, the ticket service per request, routes and error handlers.
 *
 * @param options - Dependency overrides; defaults to the D1 repository.
 */
export function createApp({ createRepository = (env) => new D1TicketRepository(env.DB) }: AppOptions = {}) {
  const app = new Hono<AppEnv>()

  app.use('*', secureHeaders())
  app.use(
    '/api/*',
    cors({
      origin: (origin, c) => {
        const allowed = [...LOCAL_ORIGINS, ...(c.env.CORS_ORIGINS ?? '').split(',').map((o) => o.trim())]
        return allowed.includes(origin) ? origin : null
      },
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      maxAge: 86_400,
    }),
  )
  app.use('/api/*', async (c, next) => {
    c.set('tickets', new TicketService(createRepository(c.env)))
    await next()
  })

  app.get('/', (c) => c.json({ name: 'cielo-api', status: 'ok' }))
  app.route('/api/tickets', ticketRoutes)
  app.route('/api/stats', statsRoutes)

  app.notFound(handleNotFound)
  app.onError(handleError)
  return app
}
