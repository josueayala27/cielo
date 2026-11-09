import type { TicketPriority, TicketStatus } from '@cielo/contracts'
import { Badge } from '@/components/ui'
import { PRIORITY_META, STATUS_META } from '../presentation'

/** Ticket status pill (Open / In progress / Resolved). */
export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, tone } = STATUS_META[status]
  return <Badge tone={tone}>{label}</Badge>
}

/** Ticket priority pill (Low / Medium / High). */
export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, tone } = PRIORITY_META[priority]
  return <Badge tone={tone}>{label}</Badge>
}
