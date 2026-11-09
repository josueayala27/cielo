import { z } from 'zod'
import { ticketPrioritySchema, ticketSortSchema, ticketStatusSchema, type Ticket, type TicketStatus } from './ticket'

/** Default and maximum page sizes for the listing endpoint. */
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

/** Empty query-string values (`?status=`) count as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional())

/**
 * Query string of `GET /api/tickets`.
 * Numbers arrive as strings and are coerced; `search` matches title or customer name.
 */
export const listTicketsQuerySchema = z.object({
  search: optional(z.string().trim().max(100, { error: 'Search must be at most 100 characters' })),
  status: optional(ticketStatusSchema),
  priority: optional(ticketPrioritySchema),
  page: optional(z.coerce.number().int().min(1, { error: 'Page must be 1 or greater' })).transform((v) => v ?? 1),
  limit: optional(
    z.coerce
      .number()
      .int()
      .min(1, { error: 'Limit must be 1 or greater' })
      .max(MAX_PAGE_SIZE, { error: `Limit must be at most ${MAX_PAGE_SIZE}` }),
  ).transform((v) => v ?? DEFAULT_PAGE_SIZE),
  sort: optional(ticketSortSchema).transform((v) => v ?? 'createdAt:desc'),
})

export type ListTicketsQuery = z.output<typeof listTicketsQuerySchema>
export type ListTicketsParams = z.input<typeof listTicketsQuerySchema>

/** A page of results. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type TicketPage = Paginated<Ticket>

/** Body of `GET /api/stats`. */
export interface TicketStats {
  total: number
  byStatus: Record<TicketStatus, number>
}
