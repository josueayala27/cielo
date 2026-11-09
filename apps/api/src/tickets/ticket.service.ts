import {
  TICKET_STATUSES,
  type CreateTicket,
  type ListTicketsQuery,
  type Ticket,
  type TicketPage,
  type TicketStats,
  type UpdateTicket,
} from '@cielo/contracts'
import { NotFoundError } from '../lib/errors'
import type { TicketRepository } from './ticket.repository'

/** Injectable sources of time and identity, so tests are deterministic. */
export interface Clock {
  now(): Date
}
export type IdGenerator = () => string

const systemClock: Clock = { now: () => new Date() }

/**
 * Ticket use cases. Input is already validated by the route layer; this class owns the
 * business rules (ids, timestamps, 404s, pagination math) and talks to storage through
 * the {@link TicketRepository} port only.
 */
export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly clock: Clock = systemClock,
    private readonly generateId: IdGenerator = () => crypto.randomUUID(),
  ) {}

  /** Lists tickets with filters, sort and pagination. `totalPages` is at least 1 for empty results. */
  async list(query: ListTicketsQuery): Promise<TicketPage> {
    const { items, total } = await this.repository.list(query)
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    }
  }

  /** @throws {NotFoundError} when the ticket does not exist. */
  async get(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id)
    if (!ticket) throw ticketNotFound(id)
    return ticket
  }

  /**
   * Creates a ticket with a generated id and matching `createdAt`/`updatedAt`. Its board
   * position is the negative creation time, so newer tickets sit above older ones.
   */
  async create(input: CreateTicket): Promise<Ticket> {
    const now = this.clock.now()
    const iso = now.toISOString()
    const ticket: Ticket = { ...input, id: this.generateId(), position: -now.getTime(), createdAt: iso, updatedAt: iso }
    await this.repository.insert(ticket)
    return ticket
  }

  /**
   * Applies a partial update and bumps `updatedAt`.
   * @throws {NotFoundError} when the ticket does not exist.
   */
  async update(id: string, changes: UpdateTicket): Promise<Ticket> {
    const updated = await this.repository.update(id, { ...changes, updatedAt: this.clock.now().toISOString() })
    if (!updated) throw ticketNotFound(id)
    return updated
  }

  /** @throws {NotFoundError} when the ticket does not exist. */
  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id)
    if (!deleted) throw ticketNotFound(id)
  }

  /** Counts per status from persisted data; every status is present, even at zero. */
  async stats(): Promise<TicketStats> {
    const counts = await this.repository.countByStatus()
    const byStatus = Object.fromEntries(TICKET_STATUSES.map((status) => [status, counts[status] ?? 0])) as TicketStats['byStatus']
    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0)
    return { total, byStatus }
  }
}

function ticketNotFound(id: string): NotFoundError {
  return new NotFoundError(`Ticket ${id} not found`)
}
