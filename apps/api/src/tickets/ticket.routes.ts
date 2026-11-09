import { createTicketSchema, listTicketsQuerySchema, updateTicketSchema } from '@cielo/contracts'
import { Hono } from 'hono'
import type { AppEnv } from '../env'
import { validateJson, validateQuery } from '../lib/validate'

/**
 * `/api/tickets` routes. Handlers stay thin: validate, call the service, pick the status code.
 *
 * | Method | Path   | Success                |
 * |--------|--------|------------------------|
 * | GET    | /      | 200 paginated list     |
 * | GET    | /:id   | 200 ticket             |
 * | POST   | /      | 201 ticket + Location  |
 * | PATCH  | /:id   | 200 ticket             |
 * | DELETE | /:id   | 204                    |
 */
export const ticketRoutes = new Hono<AppEnv>()
  .get('/', validateQuery(listTicketsQuerySchema), async (c) => {
    return c.json(await c.var.tickets.list(c.req.valid('query')))
  })
  .get('/:id', async (c) => {
    return c.json(await c.var.tickets.get(c.req.param('id')))
  })
  .post('/', validateJson(createTicketSchema), async (c) => {
    const ticket = await c.var.tickets.create(c.req.valid('json'))
    c.header('Location', `/api/tickets/${ticket.id}`)
    return c.json(ticket, 201)
  })
  .patch('/:id', validateJson(updateTicketSchema), async (c) => {
    return c.json(await c.var.tickets.update(c.req.param('id'), c.req.valid('json')))
  })
  .delete('/:id', async (c) => {
    await c.var.tickets.remove(c.req.param('id'))
    return c.body(null, 204)
  })
