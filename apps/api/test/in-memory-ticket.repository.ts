import type { Ticket, TicketStatus, UpdateTicket } from '@cielo/contracts'
import type { TicketListOptions, TicketListResult, TicketRepository } from '../src/tickets/ticket.repository'

/**
 * Test double for {@link TicketRepository} that mirrors the D1 adapter's semantics
 * (case-insensitive search on title/customer, AND-combined filters, createdAt/position + id ordering).
 */
export class InMemoryTicketRepository implements TicketRepository {
  private readonly rows = new Map<string, Ticket>()

  constructor(seed: Ticket[] = []) {
    for (const ticket of seed) this.rows.set(ticket.id, { ...ticket })
  }

  async list({ search, status, priority, sort, page, limit }: TicketListOptions): Promise<TicketListResult> {
    const term = search?.toLowerCase()
    const compare = (a: Ticket, b: Ticket) =>
      sort === 'position:asc'
        ? a.position - b.position || a.id.localeCompare(b.id)
        : (sort === 'createdAt:asc' ? 1 : -1) * (a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    const matches = [...this.rows.values()]
      .filter((t) => !term || t.title.toLowerCase().includes(term) || t.customerName.toLowerCase().includes(term))
      .filter((t) => !status || t.status === status)
      .filter((t) => !priority || t.priority === priority)
      .sort(compare)
    const start = (page - 1) * limit
    return { items: matches.slice(start, start + limit), total: matches.length }
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.rows.get(id) ?? null
  }

  async insert(ticket: Ticket): Promise<void> {
    this.rows.set(ticket.id, { ...ticket })
  }

  async update(id: string, changes: UpdateTicket & { updatedAt: string }): Promise<Ticket | null> {
    const current = this.rows.get(id)
    if (!current) return null
    const defined = Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== undefined))
    const next = { ...current, ...defined }
    this.rows.set(id, next)
    return next
  }

  async delete(id: string): Promise<boolean> {
    return this.rows.delete(id)
  }

  async countByStatus(): Promise<Partial<Record<TicketStatus, number>>> {
    const counts: Partial<Record<TicketStatus, number>> = {}
    for (const { status } of this.rows.values()) counts[status] = (counts[status] ?? 0) + 1
    return counts
  }
}
