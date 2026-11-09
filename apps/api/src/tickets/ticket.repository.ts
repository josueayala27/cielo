import type { ListTicketsQuery, Ticket, TicketStatus, UpdateTicket } from '@cielo/contracts'

/** Filters, sort and page window for {@link TicketRepository.list}. */
export type TicketListOptions = ListTicketsQuery

/** A page of rows plus the total count matching the filters. */
export interface TicketListResult {
  items: Ticket[]
  total: number
}

/**
 * Persistence port for tickets. The service depends on this interface only, so the
 * storage (D1 in production, an in-memory fake in tests) can change without touching it.
 */
export interface TicketRepository {
  /** Returns one page of tickets and the total matching the filters. */
  list(options: TicketListOptions): Promise<TicketListResult>
  /** Returns the ticket or `null` when it does not exist. */
  findById(id: string): Promise<Ticket | null>
  /** Inserts a fully built ticket. */
  insert(ticket: Ticket): Promise<void>
  /** Applies `changes` and returns the updated ticket, or `null` when it does not exist. */
  update(id: string, changes: UpdateTicket & { updatedAt: string }): Promise<Ticket | null>
  /** Deletes the ticket; returns `false` when it did not exist. */
  delete(id: string): Promise<boolean>
  /** Counts tickets per status. Statuses with no tickets may be missing. */
  countByStatus(): Promise<Partial<Record<TicketStatus, number>>>
}
