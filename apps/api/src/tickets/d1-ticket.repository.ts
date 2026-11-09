import type { Ticket, TicketPriority, TicketStatus, UpdateTicket } from '@cielo/contracts'
import type { TicketListOptions, TicketListResult, TicketRepository } from './ticket.repository'

/** Row shape of the `tickets` table (snake_case columns). */
interface TicketRow {
  id: string
  title: string
  description: string
  customer_name: string
  customer_email: string
  priority: TicketPriority
  status: TicketStatus
  position: number
  created_at: string
  updated_at: string
}

/** Maps API field names to column names for partial updates. Only these fields are writable. */
const COLUMN_BY_FIELD = {
  title: 'title',
  description: 'description',
  customerName: 'customer_name',
  customerEmail: 'customer_email',
  priority: 'priority',
  status: 'status',
  position: 'position',
  updatedAt: 'updated_at',
} as const satisfies Record<keyof UpdateTicket | 'updatedAt', keyof TicketRow>

/** ORDER BY clause per sort option; `id` breaks ties so pages never overlap. Never built from input. */
const ORDER_BY: Record<TicketListOptions['sort'], string> = {
  'createdAt:desc': 'created_at DESC, id DESC',
  'createdAt:asc': 'created_at ASC, id ASC',
  'position:asc': 'position ASC, id ASC',
}

/** Converts a database row to the API shape. */
function toTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    priority: row.priority,
    status: row.status,
    position: Number(row.position),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Escapes `%`, `_` and `\` so user input is matched literally inside a LIKE pattern. */
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

/**
 * Builds the WHERE clause shared by the page query and the count query.
 * All values are bound parameters; no user input is concatenated into SQL.
 */
function buildWhere({ search, status, priority }: TicketListOptions): { sql: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (search) {
    // SQLite LIKE is case-insensitive for ASCII; lower() also covers accented input.
    clauses.push("(lower(title) LIKE lower(?) ESCAPE '\\' OR lower(customer_name) LIKE lower(?) ESCAPE '\\')")
    const pattern = likePattern(search)
    params.push(pattern, pattern)
  }
  if (status) {
    clauses.push('status = ?')
    params.push(status)
  }
  if (priority) {
    clauses.push('priority = ?')
    params.push(priority)
  }

  return { sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

/** {@link TicketRepository} backed by Cloudflare D1 (SQLite). */
export class D1TicketRepository implements TicketRepository {
  constructor(private readonly db: D1Database) {}

  async list(options: TicketListOptions): Promise<TicketListResult> {
    const where = buildWhere(options)
    const offset = (options.page - 1) * options.limit

    // Both statements run in one round trip.
    const [page, count] = await this.db.batch([
      this.db
        .prepare(`SELECT * FROM tickets ${where.sql} ORDER BY ${ORDER_BY[options.sort]} LIMIT ? OFFSET ?`)
        .bind(...where.params, options.limit, offset),
      this.db.prepare(`SELECT COUNT(*) AS total FROM tickets ${where.sql}`).bind(...where.params),
    ])

    const rows = (page?.results ?? []) as TicketRow[]
    const total = Number((count?.results?.[0] as { total?: number } | undefined)?.total ?? 0)
    return { items: rows.map(toTicket), total }
  }

  async findById(id: string): Promise<Ticket | null> {
    const row = await this.db.prepare('SELECT * FROM tickets WHERE id = ?').bind(id).first<TicketRow>()
    return row ? toTicket(row) : null
  }

  async insert(ticket: Ticket): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO tickets (id, title, description, customer_name, customer_email, priority, status, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.customerName,
        ticket.customerEmail,
        ticket.priority,
        ticket.status,
        ticket.position,
        ticket.createdAt,
        ticket.updatedAt,
      )
      .run()
  }

  async update(id: string, changes: UpdateTicket & { updatedAt: string }): Promise<Ticket | null> {
    const entries = (Object.keys(COLUMN_BY_FIELD) as (keyof typeof COLUMN_BY_FIELD)[]).filter(
      (field) => changes[field] !== undefined,
    )
    const assignments = entries.map((field) => `${COLUMN_BY_FIELD[field]} = ?`).join(', ')
    const values = entries.map((field) => changes[field])

    const row = await this.db
      .prepare(`UPDATE tickets SET ${assignments} WHERE id = ? RETURNING *`)
      .bind(...values, id)
      .first<TicketRow>()
    return row ? toTicket(row) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM tickets WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }

  async countByStatus(): Promise<Partial<Record<TicketStatus, number>>> {
    const { results } = await this.db
      .prepare('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status')
      .all<{ status: TicketStatus; count: number }>()
    return Object.fromEntries(results.map(({ status, count }) => [status, Number(count)]))
  }
}
