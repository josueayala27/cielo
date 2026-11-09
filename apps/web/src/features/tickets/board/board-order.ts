import type { Ticket, TicketStatus } from '@cielo/contracts'

/** Gap left between a new end-of-column position and its neighbour. */
export const POSITION_STEP = 1024

/** Where a card should sit, as the board sees it before the server confirms. */
export interface Placement {
  status: TicketStatus
  position: number
}

/**
 * Fractional rank for a card placed between `before` and `after` (either may be missing).
 * Only the moved card gets a new value, so a reorder is one PATCH.
 */
export function positionBetween(before: number | undefined, after: number | undefined): number {
  if (before !== undefined && after !== undefined) return (before + after) / 2
  if (after !== undefined) return after - POSITION_STEP
  if (before !== undefined) return before + POSITION_STEP
  return 0
}

/**
 * Position for `id` once it sits at `index` in `column` (the column's ordered tickets).
 * The card itself is ignored when picking neighbours, so the same function serves
 * reorders within a column and moves from another one.
 */
export function positionAt(column: readonly Ticket[], id: string, index: number): number {
  const others = column.filter((ticket) => ticket.id !== id)
  const clamped = Math.max(0, Math.min(index, others.length))
  return positionBetween(others[clamped - 1]?.position, others[clamped]?.position)
}

/**
 * Groups tickets into status columns ordered by position, applying not-yet-saved
 * placements on top of the server data.
 */
export function buildColumns(
  tickets: Iterable<Ticket>,
  placements: ReadonlyMap<string, Placement>,
  statuses: readonly TicketStatus[],
): Record<TicketStatus, Ticket[]> {
  const columns = Object.fromEntries(statuses.map((status) => [status, [] as Ticket[]])) as Record<TicketStatus, Ticket[]>
  for (const ticket of tickets) {
    const placed = placements.get(ticket.id)
    const effective = placed ? { ...ticket, ...placed } : ticket
    columns[effective.status]?.push(effective)
  }
  for (const column of Object.values(columns)) column.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
  return columns
}
