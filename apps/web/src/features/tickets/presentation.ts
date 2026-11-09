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
