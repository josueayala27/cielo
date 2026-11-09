import type { ApiErrorBody, Ticket, TicketPage, TicketStats } from '@cielo/contracts'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import type { Bindings } from '../src/env'
import { InMemoryTicketRepository } from './in-memory-ticket.repository'

const env = { DB: {} as D1Database, CORS_ORIGINS: 'https://cielo.josueayala.me' } satisfies Bindings

const validTicket = {
  title: 'Printer is offline',
  description: 'The office printer shows offline on every laptop since this morning.',
  customerName: 'Ana Torres',
  customerEmail: 'Ana@Example.com',
  priority: 'high',
}

/** Builds a seeded ticket created `minutes` after a fixed base date. */
function seedTicket(id: string, minutes: number, overrides: Partial<Ticket> = {}): Ticket {
  const at = new Date(Date.UTC(2026, 0, 1) + minutes * 60_000).toISOString()
  return { ...validTicket, priority: 'low', status: 'open', id, customerEmail: 'a@b.co', createdAt: at, updatedAt: at, ...overrides } as Ticket
}

let app: ReturnType<typeof createApp>

/** Sends a request to the app with the test bindings. */
function call(path: string, init?: RequestInit) {
  return app.request(path, init, env)
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

beforeEach(() => {
  const repository = new InMemoryTicketRepository([
    seedTicket('t1', 1, { title: 'Login broken', customerName: 'Carlos Ruiz', status: 'open', priority: 'high' }),
    seedTicket('t2', 2, { title: 'Invoice wrong', customerName: 'María Gómez', status: 'resolved', priority: 'low' }),
    seedTicket('t3', 3, { title: 'Slow dashboard', customerName: 'Carlos Ruiz', status: 'in_progress', priority: 'high' }),
  ])
  app = createApp({ createRepository: () => repository })
})

describe('POST /api/tickets', () => {
  it('creates a ticket with generated fields and default status', async () => {
    const res = await call('/api/tickets', json('POST', validTicket))
    expect(res.status).toBe(201)
    const ticket = (await res.json()) as Ticket
    expect(ticket).toMatchObject({ ...validTicket, customerEmail: 'ana@example.com', status: 'open' })
    expect(ticket.id).toBeTruthy()
    expect(ticket.createdAt).toBe(ticket.updatedAt)
    expect(res.headers.get('Location')).toBe(`/api/tickets/${ticket.id}`)
  })

  it('rejects invalid input with 422 and one issue per field', async () => {
    const res = await call('/api/tickets', json('POST', { title: 'abc', customerEmail: 'nope', priority: 'urgent' }))
    expect(res.status).toBe(422)
    const body = (await res.json()) as ApiErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    const fields = body.error.issues?.map((issue) => issue.field)
    expect(fields).toEqual(expect.arrayContaining(['title', 'description', 'customerName', 'customerEmail', 'priority']))
  })

  it('rejects malformed JSON with 400', async () => {
    const res = await call('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' })
    expect(res.status).toBe(400)
    expect(((await res.json()) as ApiErrorBody).error.code).toBe('BAD_REQUEST')
  })
})

describe('GET /api/tickets', () => {
  it('returns newest first with pagination metadata', async () => {
    const res = await call('/api/tickets?limit=2')
    const page = (await res.json()) as TicketPage
    expect(page.items.map((t) => t.id)).toEqual(['t3', 't2'])
    expect(page).toMatchObject({ total: 3, page: 1, limit: 2, totalPages: 2 })
  })

  it('combines search, status and priority filters and supports ascending sort', async () => {
    const res = await call('/api/tickets?search=carlos&priority=high&sort=createdAt:asc')
    const page = (await res.json()) as TicketPage
    expect(page.items.map((t) => t.id)).toEqual(['t1', 't3'])

    const filtered = (await (await call('/api/tickets?search=carlos&status=open')).json()) as TicketPage
    expect(filtered.items.map((t) => t.id)).toEqual(['t1'])
  })

  it('rejects an unknown status filter', async () => {
    const res = await call('/api/tickets?status=closed')
    expect(res.status).toBe(422)
  })
})

describe('GET/PATCH/DELETE /api/tickets/:id', () => {
  it('returns 404 JSON for a missing ticket on every verb', async () => {
    for (const init of [undefined, json('PATCH', { status: 'resolved' }), { method: 'DELETE' }]) {
      const res = await call('/api/tickets/missing', init)
      expect(res.status).toBe(404)
      expect(((await res.json()) as ApiErrorBody).error.code).toBe('NOT_FOUND')
    }
  })

  it('updates only the provided fields and bumps updatedAt', async () => {
    const res = await call('/api/tickets/t1', json('PATCH', { status: 'resolved' }))
    expect(res.status).toBe(200)
    const ticket = (await res.json()) as Ticket
    expect(ticket).toMatchObject({ id: 't1', status: 'resolved', title: 'Login broken' })
    expect(ticket.updatedAt > ticket.createdAt).toBe(true)
  })

  it('rejects an empty or unknown-field patch', async () => {
    expect((await call('/api/tickets/t1', json('PATCH', {}))).status).toBe(422)
    expect((await call('/api/tickets/t1', json('PATCH', { id: 'hijack' }))).status).toBe(422)
  })

  it('deletes a ticket and stats reflect the change', async () => {
    expect((await call('/api/tickets/t1', { method: 'DELETE' })).status).toBe(204)
    expect((await call('/api/tickets/t1')).status).toBe(404)
    const stats = (await (await call('/api/stats')).json()) as TicketStats
    expect(stats).toEqual({ total: 2, byStatus: { open: 0, in_progress: 1, resolved: 1 } })
  })
})

describe('cross-cutting', () => {
  it('returns JSON 404 for unknown routes', async () => {
    const res = await call('/api/nope')
    expect(res.status).toBe(404)
    expect(((await res.json()) as ApiErrorBody).error.code).toBe('NOT_FOUND')
  })

  it('allows the configured web origin via CORS', async () => {
    const res = await call('/api/stats', { headers: { Origin: 'https://cielo.josueayala.me' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://cielo.josueayala.me')
    const denied = await call('/api/stats', { headers: { Origin: 'https://evil.example' } })
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
