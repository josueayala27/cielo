import type { TicketPriority, TicketStatus } from '@cielo/contracts'
import type { BadgeTone } from '@/components/ui'

/** Human labels and badge tones for each status, in workflow order. */
export const STATUS_META: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  open: { label: 'Open', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
}

/** Human labels and badge tones for each priority. */
export const PRIORITY_META: Record<TicketPriority, { label: string; tone: BadgeTone }> = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'accent' },
  high: { label: 'High', tone: 'danger' },
}

/**
 * Short, human-friendly ticket reference for cards: `SD-` plus the id's last four
 * characters (`seed-0007` → `SD-0007`). Display only; links always use the full id.
 */
export function ticketRef(id: string): string {
  return `SD-${id.slice(-4).toUpperCase()}`
}
